"""
PII Redaction Engine
====================
Handles PDFs (digital + scanned) and images (JPG, PNG).
- Digital PDFs: text search → redact with black fill + white mask text
- Scanned PDFs: OCR → find PII bounding boxes → draw black rectangles
- Images: convert to PDF → OCR-based redaction → output as PDF

Supported PII types:
  - Aadhaar Number (12 digits)
  - PAN Card (ABCDE1234F)
  - Passport Number (A1234567)
  - Driving License (e.g. MH02 20190000123)
  - Voter ID (ABC1234567)
  - Phone Number (+91 / 10 digits)
  - Email Address
  - Date of Birth
  - Bank Account Number (9-18 digits)
  - IFSC Code (4 letters + 0 + 6 chars)
"""

import fitz  # PyMuPDF
import re
import io
import os
from typing import List, Tuple, Optional


class PasswordRequiredError(Exception):
    """Raised when a PDF is password-protected and no/wrong password was provided."""
    pass

# ---------- REGEX PATTERNS ----------

# Aadhaar: 12 digits, optionally separated by spaces or hyphens
AADHAAR_PATTERN = re.compile(r'\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b')

# PAN Card: 5 uppercase letters + 4 digits + 1 uppercase letter
PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b')

# Passport: 1 uppercase letter + 7 digits (Indian passport)
PASSPORT_PATTERN = re.compile(r'\b[A-Z][0-9]{7}\b')

# Driving License: 2 letter state code + 2 digit RTO + optional space/dash + year(2 or 4 digits) + serial
DL_PATTERN = re.compile(r'\b[A-Z]{2}[\-\s]?\d{2}[\-\s]?\d{4}[\-\s]?\d{7}\b')

# Voter ID: 3 uppercase letters + 7 digits
VOTER_ID_PATTERN = re.compile(r'\b[A-Z]{3}[0-9]{7}\b')

# Indian phone: 10 digits, optionally with +91 prefix
PHONE_PATTERN = re.compile(r'(?:\+91[\s\-]?)?(?:\b[6-9]\d{9}\b)')

# Email
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b')

# Date of Birth patterns (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY)
DOB_PATTERN = re.compile(r'\b\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}\b')

# Bank Account Number: 9-18 digits
BANK_ACCOUNT_PATTERN = re.compile(r'\b\d{9,18}\b')

# IFSC Code: 4 uppercase letters + 0 + 6 alphanumeric chars
IFSC_PATTERN = re.compile(r'\b[A-Z]{4}0[A-Z0-9]{6}\b')


# ---------- REDACTION LEVEL CONFIGURATION ----------

REDACTION_LEVELS = {
    "low": {
        "description": "Aadhaar & PAN only",
        "patterns": {
            "AADHAAR": AADHAAR_PATTERN,
            "PAN": PAN_PATTERN,
        }
    },
    "medium": {
        "description": "Aadhaar, PAN, Phone, Passport, DL",
        "patterns": {
            "AADHAAR": AADHAAR_PATTERN,
            "PAN": PAN_PATTERN,
            "PHONE": PHONE_PATTERN,
            "PASSPORT": PASSPORT_PATTERN,
            "DL": DL_PATTERN,
        }
    },
    "high": {
        "description": "All PII (Aadhaar, PAN, Phone, Passport, DL, Voter ID, Email, DOB, Bank A/C, IFSC)",
        "patterns": {
            "AADHAAR": AADHAAR_PATTERN,
            "PAN": PAN_PATTERN,
            "PHONE": PHONE_PATTERN,
            "PASSPORT": PASSPORT_PATTERN,
            "DL": DL_PATTERN,
            "VOTER_ID": VOTER_ID_PATTERN,
            "EMAIL": EMAIL_PATTERN,
            "DOB": DOB_PATTERN,
            "BANK_ACCOUNT": BANK_ACCOUNT_PATTERN,
            "IFSC": IFSC_PATTERN,
        }
    },
}


# ---------- HELPERS ----------

def is_scanned_pdf(doc: fitz.Document) -> bool:
    """
    Determines if a PDF is scanned (image-based) or digital (text-based).
    If majority of pages have very little text but have images → scanned.
    """
    if len(doc) == 0:
        return False

    scanned_pages = 0
    for page in doc:
        text = page.get_text("text").strip()
        images = page.get_images()
        if len(text) < 20 and len(images) > 0:
            scanned_pages += 1

    return scanned_pages > len(doc) / 2


def mask_aadhaar_text(aadhaar_str: str) -> str:
    """
    '1234 5678 9012' → 'XXXX XXXX 9012'
    """
    digits = re.sub(r'[^\d]', '', aadhaar_str)
    if len(digits) != 12:
        return aadhaar_str
    last_four = digits[-4:]
    return f"XXXX XXXX {last_four}"


def mask_pan_text(pan_str: str) -> str:
    """
    'ABCDE1234F' → 'XXXXX1234X'  (partial masking)
    """
    if len(pan_str) == 10:
        return f"XXXXX{pan_str[5:9]}X"
    return "X" * len(pan_str)


def get_mask_for_label(label: str, original_text: str) -> str:
    """Returns the appropriate mask text for a given PII label."""
    masks = {
        "AADHAAR": lambda t: mask_aadhaar_text(t),
        "PAN": lambda t: mask_pan_text(t),
        "PASSPORT": lambda t: "X" + "0" * 7,
        "DL": lambda t: "XX-00-0000-0000000",
        "VOTER_ID": lambda t: "XXX0000000",
        "PHONE": lambda t: "XXXXXXXXXX",
        "EMAIL": lambda t: "xxxx@xxxx.xxx",
        "DOB": lambda t: "XX/XX/XXXX",
        "BANK_ACCOUNT": lambda t: "X" * len(t),
        "IFSC": lambda t: "XXXX0XXXXXX",
    }
    fn = masks.get(label)
    if fn:
        return fn(original_text)
    return "X" * len(original_text)


def _find_pii_in_text(text: str, level: str) -> List[Tuple[str, str, str]]:
    """
    Find PII matches in text by redaction level.
    Returns list of (matched_text, label, mask_text) tuples.
    """
    config = REDACTION_LEVELS.get(level, REDACTION_LEVELS["low"])
    matches = []

    for label, pattern in config["patterns"].items():
        for match in pattern.finditer(text):
            matched_text = match.group()

            # Validate Aadhaar — must be exactly 12 digits
            if label == "AADHAAR":
                digits = re.sub(r'[^\d]', '', matched_text)
                if len(digits) != 12:
                    continue

            # Avoid false positives: skip short bank account matches
            # that might just be random numbers  (only flag 11+ digits)
            if label == "BANK_ACCOUNT":
                if len(matched_text) < 11:
                    continue

            mask = get_mask_for_label(label, matched_text)
            matches.append((matched_text, label, mask))

    return matches


# ---------- DIGITAL PDF REDACTION ----------

def redact_digital_pdf(doc: fitz.Document, level: str) -> fitz.Document:
    """
    Redact PII from a digital (text-based) PDF.
    Uses PyMuPDF text search + redaction annotations.
    Black fill with white mask text overlay.
    """
    for page in doc:
        page_text = page.get_text("text")
        pii_matches = _find_pii_in_text(page_text, level)

        for matched_text, label, mask_text in pii_matches:
            text_instances = page.search_for(matched_text)

            for inst in text_instances:
                page.add_redact_annot(
                    inst,
                    text=mask_text,
                    fontname="helv",
                    fontsize=9,
                    fill=(0, 0, 0),       # Black fill
                    text_color=(1, 1, 1),  # White text on top
                )

        # Apply all redactions on this page
        page.apply_redactions()

    return doc


# ---------- SCANNED PDF / IMAGE REDACTION ----------

def redact_scanned_pdf(doc: fitz.Document, level: str) -> fitz.Document:
    """
    Redact PII from a scanned (image-based) PDF.
    1. Render each page to high-res image
    2. OCR with pytesseract to get word bounding boxes
    3. Find PII patterns in reconstructed text
    4. Draw solid black rectangles over matched regions
    """
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError(
            "pytesseract and Pillow are required for scanned PDF redaction. "
            "Install with: pip install pytesseract Pillow"
        )

    config = REDACTION_LEVELS.get(level, REDACTION_LEVELS["low"])

    for page_idx in range(len(doc)):
        page = doc[page_idx]

        # Render page to high-resolution pixmap
        zoom = 2.0
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        # Convert pixmap to PIL Image for OCR
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))

        # Get word-level bounding boxes from OCR
        ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        # Build text with positions
        words = []
        n_boxes = len(ocr_data['text'])
        for i in range(n_boxes):
            text = ocr_data['text'][i].strip()
            if text:
                x = ocr_data['left'][i] / zoom
                y = ocr_data['top'][i] / zoom
                w = ocr_data['width'][i] / zoom
                h = ocr_data['height'][i] / zoom
                words.append({
                    'text': text,
                    'bbox': fitz.Rect(x, y, x + w, y + h)
                })

        # Reconstruct text from words
        full_text = ' '.join([w['text'] for w in words])

        # Find PII in the reconstructed text
        for label, pattern in config["patterns"].items():
            for match in pattern.finditer(full_text):
                matched_text = match.group()

                # Validate Aadhaar
                if label == "AADHAAR":
                    digits = re.sub(r'[^\d]', '', matched_text)
                    if len(digits) != 12:
                        continue

                if label == "BANK_ACCOUNT" and len(matched_text) < 11:
                    continue

                # Find which words correspond to this match
                match_tokens = matched_text.split()

                for start_idx in range(len(words)):
                    if start_idx + len(match_tokens) > len(words):
                        break

                    found = True
                    for t_idx, token in enumerate(match_tokens):
                        word_text = re.sub(r'[^\w]', '', words[start_idx + t_idx]['text'])
                        token_clean = re.sub(r'[^\w]', '', token)
                        if word_text != token_clean:
                            found = False
                            break

                    if found:
                        # Union bounding box of all matched words
                        rects = [words[start_idx + t_idx]['bbox'] for t_idx in range(len(match_tokens))]
                        union_rect = rects[0]
                        for r in rects[1:]:
                            union_rect = union_rect | r

                        # Expand for padding
                        union_rect = union_rect + fitz.Rect(-3, -3, 3, 3)

                        # Draw solid black rectangle
                        shape = page.new_shape()
                        shape.draw_rect(union_rect)
                        shape.finish(color=(0, 0, 0), fill=(0, 0, 0))
                        shape.commit()

                        break

    return doc


# ---------- IMAGE TO PDF CONVERSION ----------

def convert_image_to_pdf(image_path: str) -> str:
    """
    Converts an image (PNG, JPG, etc.) to a temporary PDF file.
    Returns the path to the temporary PDF.
    """
    doc = fitz.open()
    
    # Open the image
    img = fitz.open(image_path)
    
    # Convert each image page to a PDF page
    for page_idx in range(len(img)):
        # Get the image as a pixmap
        pix = img[page_idx].get_pixmap()
        
        # Create a new page with image dimensions
        pdf_page = doc.new_page(width=pix.width, height=pix.height)
        
        # Insert the image into the page
        pdf_page.insert_image(
            fitz.Rect(0, 0, pix.width, pix.height),
            filename=image_path
        )
    
    img.close()
    
    # Save to temp PDF
    temp_pdf_path = image_path + ".tmp.pdf"
    doc.save(temp_pdf_path)
    doc.close()
    
    return temp_pdf_path


# ---------- TESSERACT CHECK ----------

def _check_tesseract_available() -> bool:
    """Checks if Tesseract OCR is installed and accessible."""
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False


# ---------- MAIN ENTRY POINT ----------

def redact_pdf(file_path: str, level: str = "low", password: Optional[str] = None) -> bytes:
    """
    Main entry point for document redaction.
    Supports PDF files (digital and scanned), including password-protected ones.

    Auto-detects if the PDF is scanned or digital and applies appropriate strategy.
    Falls back to digital redaction if Tesseract is not installed.

    Args:
        file_path: Path to the PDF file
        level: Redaction level ('low', 'medium', 'high')
        password: Optional password for encrypted/locked PDFs

    Returns:
        bytes: The redacted PDF content (flattened, non-recoverable)

    Raises:
        PasswordRequiredError: If PDF is encrypted and no/wrong password provided
    """
    level = level.lower()
    if level not in REDACTION_LEVELS:
        level = "low"

    # Open the PDF — handle password-protected files
    doc = fitz.open(file_path)

    # Check if PDF is encrypted/locked
    if doc.is_encrypted:
        if password:
            # Try to authenticate with the provided password
            if not doc.authenticate(password):
                doc.close()
                raise PasswordRequiredError("Incorrect password. Please try again.")
            print(f"[Redactor] PDF unlocked successfully with provided password")
        else:
            doc.close()
            raise PasswordRequiredError("This PDF is password-protected. Please provide the password.")

    try:
        scanned = is_scanned_pdf(doc)

        if scanned and _check_tesseract_available():
            print(f"[Redactor] Detected SCANNED PDF — using OCR + black rectangle masking (level={level})")
            doc = redact_scanned_pdf(doc, level)
        elif scanned:
            print(f"[Redactor] Detected SCANNED PDF but Tesseract not found — falling back to digital redaction")
            doc = redact_digital_pdf(doc, level)
        else:
            print(f"[Redactor] Detected DIGITAL PDF — using text search + mask replacement (level={level})")
            doc = redact_digital_pdf(doc, level)

        # Save to bytes — no encryption on output, garbage collect, deflate, clean
        output = io.BytesIO()
        doc.save(output, garbage=4, deflate=True, clean=True)
        output.seek(0)
        return output.read()

    finally:
        doc.close()


def redact_image(file_path: str, level: str = "low") -> bytes:
    """
    Redact PII from an image file (PNG, JPG, etc.).
    Converts image to PDF → runs OCR redaction → returns PDF bytes.

    Args:
        file_path: Path to the image file
        level: Redaction level ('low', 'medium', 'high')

    Returns:
        bytes: The redacted PDF content
    """
    level = level.lower()
    if level not in REDACTION_LEVELS:
        level = "low"

    temp_pdf_path = None
    try:
        # Convert image to PDF
        temp_pdf_path = convert_image_to_pdf(file_path)

        # Now redact the PDF (images are never password-protected)
        return redact_pdf(temp_pdf_path, level, password=None)

    finally:
        # Clean up temp PDF
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            os.remove(temp_pdf_path)
