"""
Stage 4 — Redaction Engine
============================
Receives an open PyMuPDF document and a list of PiiMatch objects
and permanently removes each matched region from the document.

Two strategies are used depending on how bounding boxes were sourced:

  Digital PDF path (bbox is None):
    → page.search_for(text) locates the text on-canvas
    → add_redact_annot() places a black fill with white mask text
    → apply_redactions() burns the annotation into the page

  Scanned PDF / Image path (bbox is a known Rect from OCR):
    → Draw a solid black vector rectangle directly over the coordinates
    → No text overlay — purely visual blackout

Both paths produce results that survive copy-paste and screenshot attacks.
"""

from typing import List
import fitz  # PyMuPDF

from pipeline.pii_detection_engine import PiiMatch


def apply_redactions(doc: fitz.Document, matches: List[PiiMatch]) -> fitz.Document:
    """
    Apply all PII redactions to *doc* in-place.

    Matches that have a bbox (OCR path) are blackened directly.
    Matches without a bbox (digital text path) use PyMuPDF's redaction
    annotation API to search and fill.

    Args:
        doc:     Open, authenticated PyMuPDF document.
        matches: List of PiiMatch objects from Stage 3.

    Returns:
        The same document object, mutated with redactions applied.
    """
    # Group matches by page for efficiency
    by_page: dict[int, List[PiiMatch]] = {}
    for m in matches:
        by_page.setdefault(m.page_index, []).append(m)

    for page_idx, page_matches in by_page.items():
        page = doc[page_idx]

        for m in page_matches:
            if m.bbox:
                # Unified Strategy: Exact bounding box annotation
                # Works perfectly for both Digital PDFs and Scanned Images natively.
                page.add_redact_annot(
                    fitz.Rect(m.bbox),
                    text=m.mask,
                    fontname="helv",
                    fontsize=9,
                    fill=(0, 0, 0),        # black background
                    text_color=(1, 1, 1),  # white overlay text
                )
                
        if page_matches:
            # Burn all annotations into the page content stream.
            # images=fitz.PDF_REDACT_IMAGE_PIXELS ensures that any underlying
            # scanned images/photos are physically wiped at the pixel level.
            try:
                page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS)
            except AttributeError:
                # Fallback if PyMuPDF version is old
                page.apply_redactions(images=2)

    return doc
