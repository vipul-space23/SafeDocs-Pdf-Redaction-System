"""
Stage 1 — Document Analyzer
============================
Inspects an uploaded file and determines its type so the pipeline
can choose the correct downstream processing strategy.

Types returned:
  - DIGITAL_PDF  → PDF with an embedded, selectable text layer
  - SCANNED_PDF  → PDF that is essentially an image (no text layer)
  - IMAGE        → A raw image file (PNG, JPG, BMP, TIFF, etc.)
"""

from enum import Enum
import fitz  # PyMuPDF


class DocumentType(str, Enum):
    DIGITAL_PDF = "digital_pdf"
    SCANNED_PDF = "scanned_pdf"
    IMAGE       = "image"


# Extensions recognised as raw images (not PDFs)
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp"}


def analyze(file_path: str) -> DocumentType:
    """
    Inspect the file at `file_path` and return its DocumentType.

    Algorithm:
      1. If the extension is a known image type → IMAGE
      2. Open as PDF.
      3. For each page, check if the text layer has meaningful content.
         A page is considered 'scanned' when it has <20 characters of
         embedded text but contains at least one embedded image object.
      4. If the majority of pages are 'scanned' → SCANNED_PDF
      5. Otherwise → DIGITAL_PDF
    """
    ext = _get_extension(file_path)

    if ext in IMAGE_EXTENSIONS:
        return DocumentType.IMAGE

    doc = fitz.open(file_path)
    try:
        if len(doc) == 0:
            return DocumentType.DIGITAL_PDF

        scanned_count = 0
        for page in doc:
            text   = page.get_text("text").strip()
            images = page.get_images()
            if len(text) < 20 and len(images) > 0:
                scanned_count += 1

        if scanned_count > len(doc) / 2:
            return DocumentType.SCANNED_PDF

        return DocumentType.DIGITAL_PDF

    finally:
        doc.close()


def _get_extension(file_path: str) -> str:
    import os
    _, ext = os.path.splitext(file_path)
    return ext.lower()
