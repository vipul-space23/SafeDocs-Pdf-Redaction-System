"""
SafeDoc — API Gateway & Pipeline Orchestrator
=============================================
Split into a two-phase architecture to support Human-in-the-Loop review:
  1. POST /analyze → Runs extraction & detection, returns JSON of found PII
  2. POST /redact  → Accepts approved PII matches, burns them to PDF, returns PDF

Secure File Handling:
  - Files are stored in _temp/ with UUIDs after /analyze.
  - A background AsyncIO loop runs every 5 minutes and cleans any file
    older than 10 minutes (Zero persistence guarantee).
  - Additionally, /redact deletes the specific file immediately upon completion.
"""

import os
import uuid
import shutil
import time
import asyncio
from contextlib import asynccontextmanager
from io import BytesIO
from typing import Optional, List

import fitz  # PyMuPDF
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from core.config import settings

# ── Pipeline stages ────────────────────────────────────────────────────────
from pipeline.document_analyzer    import analyze, DocumentType
from pipeline.ocr_service          import run_ocr, is_tesseract_available
from pipeline.pii_detection_engine import (
    detect_in_page,
    detect_in_ocr,
    LEVEL_PATTERNS,
    PiiMatch
)
from pipeline.redaction_engine     import apply_redactions
from pipeline.document_flattener   import flatten


# ── Background Cleanup Service ───────────────────────────────────────────────
TEMP_DIR = os.path.join(settings.UPLOAD_DIR, "_temp")
os.makedirs(TEMP_DIR, exist_ok=True)
FILE_LIFETIME_SECONDS = 600  # 10 minutes

async def bg_temp_cleanup():
    """Runs forever in the background, cleaning old files from TEMP_DIR."""
    while True:
        try:
            now = time.time()
            deleted_count = 0
            for filename in os.listdir(TEMP_DIR):
                file_path = os.path.join(TEMP_DIR, filename)
                if os.path.isfile(file_path):
                    # Check age
                    if (now - os.path.getmtime(file_path)) > FILE_LIFETIME_SECONDS:
                        os.remove(file_path)
                        deleted_count += 1
            if deleted_count > 0:
                print(f"[Cleanup] Swept {deleted_count} stale file(s) from temp storage.")
        except Exception as e:
            print(f"[Cleanup] Error in background task: {e}")
        
        await asyncio.sleep(300)  # Check every 5 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: trigger cleanup loop
    task = asyncio.create_task(bg_temp_cleanup())
    yield
    # Shutdown
    task.cancel()


# ── App setup ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="Privacy-first document PII redaction pipeline with Manual Review.",
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".png", ".jpg", ".jpeg",
    ".bmp", ".tiff", ".tif",
}

class PasswordRequired(Exception):
    pass


# ── Pydantic Models for Phase 2 ──────────────────────────────────────────────
class PiiMatchModel(BaseModel):
    id: str
    text: str
    label: str
    mask: str
    page_index: int
    bbox: Optional[List[float]] = None
    confidence: float = 0.0

class RedactRequest(BaseModel):
    file_id: str
    original_name: str
    password: Optional[str] = None
    approved_matches: List[PiiMatchModel]


# ── Helpers ──────────────────────────────────────────────────────────────────
def _open_pdf(file_path: str, password: Optional[str]) -> fitz.Document:
    doc = fitz.open(file_path)
    if doc.is_encrypted:
        if password and doc.authenticate(password):
            print("[Stage 0] PDF unlocked with provided password.")
        else:
            doc.close()
            msg = (
                "Incorrect password — please try again."
                if password else
                "This PDF is password-protected. Please provide the password."
            )
            raise PasswordRequired(msg)
    return doc


def _image_to_pdf(image_path: str) -> fitz.Document:
    img_doc = fitz.open(image_path)
    pdf_doc = fitz.open()
    for pg in img_doc:
        pix      = pg.get_pixmap()
        pdf_page = pdf_doc.new_page(width=pix.width, height=pix.height)
        pdf_page.insert_image(
            fitz.Rect(0, 0, pix.width, pix.height),
            filename=image_path,
        )
    img_doc.close()
    return pdf_doc


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/analyze")
async def analyze_document(
    file:             UploadFile = File(...),
    redaction_level:  str        = Form("low"),
    password:         str        = Form(""),
):
    """
    PHASE 1: Upload & Analyze
    Uploads file, runs OCR & detection. Returns JSON list of PII for manual review.
    """
    level = redaction_level.lower()
    if level not in LEVEL_PATTERNS:
        level = "low"

    original_name = file.filename or "document.pdf"
    ext = os.path.splitext(original_name)[-1].lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    # [Security] Validate File Size (15 MB limit)
    try:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        if size > 15 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 15MB.")
    except HTTPException:
        raise
    except Exception:
        pass # fallback if seeking fails (e.g. some SpooledTemporaryFile edge cases)

    file_id = str(uuid.uuid4())
    temp_filename = f"{file_id}_{original_name}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)

    try:
        # Save to temp
        with open(temp_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        # Pipeline Stage 1
        print(f"\n[Stage 1] Analyzing document type for: {original_name}")
        doc_type = analyze(temp_path)
        
        pdf_password = password.strip() or None
        
        # Open Document (Handles image wrapping & password check)
        if doc_type == DocumentType.IMAGE:
            doc = _image_to_pdf(temp_path)
        else:
            doc = _open_pdf(temp_path, pdf_password)

        all_matches: List[PiiMatch] = []
        
        try:
            # Pipeline Stage 2 & 3
            if doc_type in (DocumentType.SCANNED_PDF, DocumentType.IMAGE):
                if is_tesseract_available():
                    print("[Stage 2] Running OCR service...")
                    ocr_pages = run_ocr(doc)
                    print("[Stage 3] Detecting PII in OCR text...")
                    for ocr_page in ocr_pages:
                        all_matches.extend(detect_in_ocr(ocr_page, level))
                else:
                    print("[Stage 2] Tesseract fallback — checking text layer if any...")
                    for page_idx in range(len(doc)):
                        all_matches.extend(detect_in_page(doc[page_idx], level))
            else:
                print("[Stage 3] Detecting PII in digital text layer...")
                for page_idx in range(len(doc)):
                    all_matches.extend(detect_in_page(doc[page_idx], level))
        
        except Exception as detection_err:
            print(f"[ERROR] Stage 2/3 Detection failed: {detection_err}")
            raise

        # [Feature] Generate Preview PDF with Yellow Highlights
        preview_filename = f"preview_{file_id}.pdf"
        preview_path = os.path.join(TEMP_DIR, preview_filename)
        
        try:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                page_matches = [m for m in all_matches if m.page_index == page_idx]
                for m in page_matches:
                    bboxes = [fitz.Rect(m.bbox)] if m.bbox else page.search_for(m.text)
                    for rect in bboxes:
                        annot = page.add_highlight_annot(rect)
                        annot.set_colors(stroke=(1, 1, 0)) # Yellow
                        annot.update()
            
            doc.save(preview_path, garbage=4, deflate=True)
            print(f"[Preview] Generated highlighted preview at {preview_filename}")
        except Exception as e:
            print(f"[Warning] Failed to generate preview PDF: {e}")
            
        finally:
            # We close doc, but KEEP the origin temp file on disk for Phase 2!
            doc.close()

        print(f"[Phase 1 Complete] Found {len(all_matches)} potential PII hits.")
        
        return {
            "file_id": file_id,
            "original_name": original_name,
            "matches": [
                {
                    "id": m.id,
                    "text": m.text,
                    "label": m.label,
                    "mask": m.mask,
                    "page_index": m.page_index,
                    "bbox": m.bbox,
                    "confidence": getattr(m, 'confidence', 0.0)
                } for m in all_matches
            ]
        }

    except PasswordRequired as exc:
        # Delete file if we can't open it (will ask user repeatedly until correct)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return JSONResponse(
            status_code=423,
            content={"error": "password_required", "message": str(exc)},
        )
    except Exception as exc:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"[ERROR] Analyze failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


from fastapi.responses import FileResponse

@app.get("/preview/{file_id}")
async def get_preview(file_id: str):
    """Serve the highlighted preview PDF for Manual Review."""
    preview_filename = f"preview_{file_id}.pdf"
    preview_path = os.path.join(TEMP_DIR, preview_filename)
    
    if os.path.exists(preview_path):
        return FileResponse(preview_path, media_type="application/pdf")
    raise HTTPException(status_code=404, detail="Preview not found or expired.")


@app.post("/redact")
async def execute_redaction(req: RedactRequest):
    """
    PHASE 2: Redact & Deliver
    Takes the file_id and user's approved list of PII matches.
    Burns redactions to PDF, streams result, and instantly deletes temp file.
    """
    temp_filename = f"{req.file_id}_{req.original_name}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)

    if not os.path.exists(temp_path):
        raise HTTPException(
            status_code=404, 
            detail="Session expired or file not found. Please upload again."
        )

    try:
        # Map frontend Pydantic models back to internal PiiMatch dataclasses
        approved_matches = [
            PiiMatch(
                id=m.id,
                text=m.text,
                label=m.label,
                mask=m.mask,
                page_index=m.page_index,
                bbox=m.bbox,
                confidence=m.confidence
            ) for m in req.approved_matches
        ]

        print(f"\n[Phase 2] Redacting {len(approved_matches)} approved hits on {req.original_name}")

        # Re-open doc
        doc_type = analyze(temp_path)
        if doc_type == DocumentType.IMAGE:
            doc = _image_to_pdf(temp_path)
        else:
            doc = _open_pdf(temp_path, req.password)

        try:
            # Stage 4
            apply_redactions(doc, approved_matches)
            
            # Stage 5
            output_bytes = flatten(doc)
            print("[Stage 5] Flatten complete. Redaction permanent.")

            stem = os.path.splitext(req.original_name)[0]
            
            return StreamingResponse(
                BytesIO(output_bytes),
                media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{stem}_redacted.pdf"'}
            )
        finally:
            doc.close()

    except Exception as exc:
        print(f"[ERROR] Redact failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        # Immediate cleanup overrides background task
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"[Cleanup] Post-processing temp file deleted: {temp_filename}")
        
        # Also cleanup preview
        preview_path = os.path.join(TEMP_DIR, f"preview_{req.file_id}.pdf")
        if os.path.exists(preview_path):
            os.remove(preview_path)
            print(f"[Cleanup] Preview file deleted: preview_{req.file_id}.pdf")


@app.get("/redact-info")
def redaction_info():
    descriptions = {
        "low":    "Aadhaar & PAN only",
        "medium": "Aadhaar, PAN, Phone, Passport, DL",
        "high":   "All PII (Aadhaar, PAN, Phone, Passport, DL, Voter ID, Email, DOB, Bank A/C, IFSC)",
    }
    return {
        level: {
            "description": descriptions[level],
            "types": types,
        }
        for level, types in LEVEL_PATTERNS.items()
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "tesseract": is_tesseract_available(),
    }
