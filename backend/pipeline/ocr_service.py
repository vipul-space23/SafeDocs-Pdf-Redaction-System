"""
Stage 2 — OCR Service
======================
Invoked only when the Document Analyzer returns SCANNED_PDF or IMAGE.

Responsibilities:
  - Render each PDF page to a high-resolution image
  - Pass each image to Tesseract OCR
  - Extract word-level tokens with their bounding boxes and confidence scores
  - Return a structured list of OcrWord objects for each page

Output feeds directly into Stage 3 (PII Detection Engine).
"""

from dataclasses import dataclass, field
from typing import List
import io

import fitz  # PyMuPDF


@dataclass
class OcrWord:
    """A single word token produced by Tesseract OCR."""
    text:       str
    confidence: float          # 0.0 – 100.0
    x:          float          # left edge in PDF points
    y:          float          # top edge in PDF points
    width:      float
    height:     float

    @property
    def bbox(self) -> fitz.Rect:
        return fitz.Rect(self.x, self.y, self.x + self.width, self.y + self.height)


@dataclass
class OcrPageResult:
    """OCR output for a single page."""
    page_index: int
    words:      List[OcrWord] = field(default_factory=list)

    @property
    def full_text(self) -> str:
        """Reconstruct plain text from all recognised words."""
        return " ".join(w.text for w in self.words)


def run_ocr(doc: fitz.Document, zoom: float = 2.0) -> List[OcrPageResult]:
    """
    Run Tesseract OCR on every page of *doc*.

    Args:
        doc:  An open PyMuPDF document (possibly a single-page image PDF).
        zoom: Render resolution multiplier. 2.0 ≈ 144 DPI which gives
              Tesseract enough detail without excessive memory use.

    Returns:
        A list of OcrPageResult, one per page.
    """
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError(
            "pytesseract and Pillow must be installed for OCR. "
            "Run: pip install pytesseract Pillow"
        )

    results: List[OcrPageResult] = []

    for page_idx in range(len(doc)):
        page   = doc[page_idx]
        mat    = fitz.Matrix(zoom, zoom)
        pix    = page.get_pixmap(matrix=mat)

        # Convert PyMuPDF pixmap → PIL Image
        img = Image.open(io.BytesIO(pix.tobytes("png")))

        # Ask Tesseract for word-level detail
        raw = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        words: List[OcrWord] = []
        for i in range(len(raw["text"])):
            token = raw["text"][i].strip()
            conf  = float(raw["conf"][i])
            if token and conf > 0:          # skip empty tokens / -1 confidence
                words.append(OcrWord(
                    text=token,
                    confidence=conf,
                    x=raw["left"][i]   / zoom,
                    y=raw["top"][i]    / zoom,
                    width=raw["width"][i]  / zoom,
                    height=raw["height"][i] / zoom,
                ))

        results.append(OcrPageResult(page_index=page_idx, words=words))

    return results


def is_tesseract_available() -> bool:
    """Quick check — True if Tesseract is installed and reachable."""
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        return True
    except Exception:
        return False
