from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import shutil
import os
import uuid
from io import BytesIO
from core.config import settings
from core.pii_redactor import redact_pdf, redact_image, REDACTION_LEVELS, PasswordRequiredError

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp directory for processing
TEMP_DIR = os.path.join(settings.UPLOAD_DIR, "_temp")
os.makedirs(TEMP_DIR, exist_ok=True)

# Supported file extensions
PDF_EXTENSIONS = {".pdf"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif"}
SUPPORTED_EXTENSIONS = PDF_EXTENSIONS | IMAGE_EXTENSIONS


@app.post("/redact")
async def redact_document(
    file: UploadFile = File(...),
    redaction_level: str = Form("low"),
    password: str = Form(""),
):
    """
    Upload a document (PDF or image) → Redact PII → Return redacted PDF.

    Supports:
    - PDF files (digital & scanned), including password-protected
    - Images (PNG, JPG, JPEG, BMP, TIFF)

    If a PDF is password-protected, returns 423 status with
    {"error": "password_required", "message": "..."} so the frontend
    can prompt the user for a password and retry.
    """
    # Validate redaction level
    level = redaction_level.lower()
    if level not in REDACTION_LEVELS:
        level = "low"

    # Get file extension
    original_name = file.filename or "document.pdf"
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Supported: PDF, PNG, JPG, JPEG, BMP, TIFF"
        )

    # Save uploaded file to temp
    temp_path = os.path.join(TEMP_DIR, f"{uuid.uuid4()}_{original_name}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run redaction based on file type
        if ext in PDF_EXTENSIONS:
            pdf_password = password if password else None
            redacted_bytes = redact_pdf(temp_path, level, password=pdf_password)
        else:
            # Image → convert to PDF → redact (no password needed)
            redacted_bytes = redact_image(temp_path, level)

        # Build download filename
        name_without_ext = os.path.splitext(original_name)[0]
        download_name = f"{name_without_ext}_redacted.pdf"

        return StreamingResponse(
            BytesIO(redacted_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{download_name}"',
                "X-Redaction-Level": level,
            },
        )

    except PasswordRequiredError as e:
        # Return a special 423 (Locked) status so the frontend can ask for password
        return JSONResponse(
            status_code=423,
            content={
                "error": "password_required",
                "message": str(e),
            },
        )

    except Exception as e:
        print(f"[ERROR] Redaction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Redaction failed: {str(e)}")

    finally:
        # Always clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.get("/redact-info")
def redaction_info():
    """Returns available redaction levels and their descriptions."""
    return {
        level: config["description"]
        for level, config in REDACTION_LEVELS.items()
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
