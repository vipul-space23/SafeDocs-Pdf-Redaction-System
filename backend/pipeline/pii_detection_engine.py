"""
Stage 3 — PII Detection Engine
================================
Receives extracted text (from a digital PDF text layer, or from OCR output)
and identifies all Personal Identifiable Information (PII) present.

Detection methods:
  - Pattern Matching  → Structured identifiers via regex (Aadhaar, PAN, …)
  - Named Entity NLP  → Future hook for spaCy NER (names, addresses)

Returns structured PiiMatch objects that carry both the matched text
and the bounding box (if known) so Stage 4 can apply precise redaction.
"""

import re
import uuid
from dataclasses import dataclass, field
from typing import List, Optional, Dict
import fitz  # PyMuPDF — only for the Rect type

from pipeline.ocr_service import OcrPageResult, OcrWord


# ---------------------------------------------------------------------------
# Regex Patterns — 10 PII types
# ---------------------------------------------------------------------------

PATTERNS: Dict[str, re.Pattern] = {
    # 12-digit Aadhaar, optionally grouped with spaces / hyphens
    "AADHAAR":      re.compile(r"\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b"),
    # PAN: ABCDE1234F
    "PAN":          re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"),
    # Indian Passport: A1234567
    "PASSPORT":     re.compile(r"\b[A-Z][0-9]{7}\b"),
    # Driving Licence: MH02 2019 0000123
    "DL":           re.compile(r"\b[A-Z]{2}[\-\s]?\d{2}[\-\s]?\d{4}[\-\s]?\d{7}\b"),
    # Voter ID: ABC1234567
    "VOTER_ID":     re.compile(r"\b[A-Z]{3}[0-9]{7}\b"),
    # Indian mobile: 10 digits starting 6-9, optional +91 prefix
    "PHONE":        re.compile(r"(?:\+91[\s\-]?)?(?:\b[6-9]\d{9}\b)"),
    # Email
    "EMAIL":        re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"),
    # Date of birth — DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    "DOB":          re.compile(r"\b\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}\b"),
    # Bank account number: 9-18 digits (flagged only for 11+)
    "BANK_ACCOUNT": re.compile(r"\b\d{9,18}\b"),
    # IFSC code: ABCD0123456
    "IFSC":         re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b"),
}

# Which patterns are active at each redaction level
LEVEL_PATTERNS: Dict[str, List[str]] = {
    "low":    ["AADHAAR", "PAN"],
    "medium": ["AADHAAR", "PAN", "PHONE", "PASSPORT", "DL"],
    "high":   list(PATTERNS.keys()),   # all 10
}

# Human-readable masks for each type
MASKS: Dict[str, str] = {
    "AADHAAR":      "XXXX XXXX ####",   # last 4 revealed — filled per match
    "PAN":          "XXXXX####X",        # filled per match
    "PASSPORT":     "X0000000",
    "DL":           "XX-00-0000-0000000",
    "VOTER_ID":     "XXX0000000",
    "PHONE":        "XXXXXXXXXX",
    "EMAIL":        "xxxx@xxxx.xxx",
    "DOB":          "XX/XX/XXXX",
    "BANK_ACCOUNT": "XXXXXXXXXXX",
    "IFSC":         "XXXX0XXXXXX",
}


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class PiiMatch:
    """A single detected PII entity, ready for redaction."""
    id:         str                     # unique ID for frontend tracking
    text:       str                     # original matched text
    label:      str                     # PII type key, e.g. "AADHAAR"
    mask:       str                     # replacement / overlay text
    page_index: int = 0
    bbox:       Optional[List[float]] = None   # [x0, y0, x1, y1] for JSON serialization
    confidence: float = 0.0                    # 0.0 - 1.0 confidence score

REGEX_CONFIDENCE = {
    "AADHAAR": 0.99, "PAN": 0.99, "PASSPORT": 0.95, "DL": 0.95, "VOTER_ID": 0.95,
    "PHONE": 0.85, "EMAIL": 0.98, "DOB": 0.60, "BANK_ACCOUNT": 0.80, "IFSC": 0.90
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _mask_for(label: str, text: str) -> str:
    """Generate the display mask for a matched PII value."""
    if label == "AADHAAR":
        digits = re.sub(r"[^\d]", "", text)
        return f"XXXX XXXX {digits[-4:]}" if len(digits) == 12 else "XXXX XXXX XXXX"
    if label == "PAN" and len(text) == 10:
        return f"XXXXX{text[5:9]}X"
    if label == "BANK_ACCOUNT":
        return "X" * len(text)
    return MASKS.get(label, "X" * len(text))


def _active_patterns(level: str) -> Dict[str, re.Pattern]:
    keys = LEVEL_PATTERNS.get(level, LEVEL_PATTERNS["low"])
    return {k: PATTERNS[k] for k in keys}


def _validate(label: str, text: str) -> bool:
    """Post-match validation to filter false positives."""
    if label == "AADHAAR":
        return len(re.sub(r"[^\d]", "", text)) == 12
    if label == "BANK_ACCOUNT":
        return len(text) >= 11       # avoid flagging short numbers
    return True


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_in_page(page: fitz.Page, level: str) -> List[PiiMatch]:
    """
    Run PII detection directly on a PyMuPDF Page object (for digital PDFs).

    Leverages page.search_for() to assign an explicit exact bounding box 
    to EVERY resolved instance on the canvas, ensuring that users can 
    selectively redact identical match strings.
    """
    matches: List[PiiMatch] = []
    text = page.get_text("text")
    seen_rects = set()
    
    for label, pattern in _active_patterns(level).items():
        for m in pattern.finditer(text):
            text_val = m.group()
            if not _validate(label, text_val):
                continue
            
            # Find all physical locations of this string on the page
            rects = page.search_for(text_val)
            for rect in rects:
                # Use a rounded tuple to deduplicate exact overlapping instances
                # (e.g. if regex matched twice against disjoint parts of a sentence)
                r_key = (round(rect.x0, 2), round(rect.y0, 2), round(rect.x1, 2), round(rect.y1, 2))
                if r_key not in seen_rects:
                    seen_rects.add(r_key)
                    matches.append(PiiMatch(
                        id=str(uuid.uuid4()),
                        text=text_val,
                        label=label,
                        mask=_mask_for(label, text_val),
                        page_index=page.number,
                        bbox=[rect.x0, rect.y0, rect.x1, rect.y1],
                        confidence=REGEX_CONFIDENCE.get(label, 0.80)
                    ))
    return matches


def detect_in_ocr(ocr_page: OcrPageResult, level: str) -> List[PiiMatch]:
    """
    Run PII detection on OCR output for a single page.

    Works on the reconstructed full-text string, then maps each match
    back to the word tokens to recover bounding boxes.

    Returns PiiMatch objects with exact bbox coordinates.
    """
    matches: List[PiiMatch] = []
    words   = ocr_page.words
    text    = ocr_page.full_text

    for label, pattern in _active_patterns(level).items():
        for m in pattern.finditer(text):
            text_val = m.group()
            if not _validate(label, text_val):
                continue

            bbox_res = _resolve_bbox_and_conf(text_val, words)
            if bbox_res:
                bbox_rect, ocr_conf = bbox_res
                bbox = [bbox_rect.x0, bbox_rect.y0, bbox_rect.x1, bbox_rect.y1]
                # Tesseract conf is 0-100. Blend by taking minimum to penalize bad OCR
                final_conf = min(REGEX_CONFIDENCE.get(label, 0.80), ocr_conf / 100.0)
            else:
                bbox = None
                final_conf = REGEX_CONFIDENCE.get(label, 0.80)
            
            matches.append(PiiMatch(
                id=str(uuid.uuid4()),
                text=text_val,
                label=label,
                mask=_mask_for(label, text_val),
                page_index=ocr_page.page_index,
                bbox=bbox,
                confidence=round(final_conf, 2)
            ))
    return matches


def _resolve_bbox_and_conf(matched_text: str, words: List[OcrWord]):
    """
    Find the bounding box of `matched_text` within the OCR word list.
    Returns (fitz.Rect, average_ocr_confidence) or None.
    """
    tokens = matched_text.split()
    n      = len(tokens)

    for start in range(len(words) - n + 1):
        # Compare cleaned tokens
        if all(
            re.sub(r"[^\w]", "", words[start + i].text) ==
            re.sub(r"[^\w]", "", tokens[i])
            for i in range(n)
        ):
            # Union of individual word bboxes and average confidence
            rect = words[start].bbox
            conf_sum = words[start].confidence
            for i in range(1, n):
                rect = rect | words[start + i].bbox
                conf_sum += words[start + i].confidence
            
            avg_conf = conf_sum / n if n > 0 else 0
            # Add small padding
            return (rect + fitz.Rect(-2, -2, 2, 2), avg_conf)

    return None   # bbox unknown
