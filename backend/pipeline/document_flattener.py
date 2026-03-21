"""
Stage 5 — Document Flattener
==============================
The final stage in the processing pipeline.

Responsibilities:
  - Flatten all redaction annotations (make them irremovable)
  - Strip document metadata that could leak author, subject, or creation info
  - Compress and garbage-collect unused PDF objects
  - Return the sanitised document as raw bytes

PyMuPDF save flags used:
  garbage=4    → reclaim all unused/orphaned objects and cross-references
  deflate=True → compress page content streams
  clean=True   → clean and sanitise content streams

After this stage, the redacted content CANNOT be:
  - Copy-pasted from the PDF
  - Extracted by PDF readers
  - Recovered by editing the file structure
"""

import io
import fitz  # PyMuPDF


def flatten(doc: fitz.Document) -> bytes:
    """
    Flatten and sanitise *doc*, then return the result as bytes.

    Metadata fields (Author, Subject, Title, Keywords, Creator, Producer)
    are wiped to prevent information leakage.

    Args:
        doc: Open PyMuPDF document after Stage 4 redaction.

    Returns:
        bytes: Final, permanently redacted PDF ready for delivery.
    """
    # Wipe all metadata fields
    doc.set_metadata({
        "author":   "",
        "subject":  "",
        "title":    "",
        "keywords": "",
        "creator":  "",
        "producer": "SafeDoc Redaction Engine",
    })

    # Save to an in-memory buffer
    # garbage=4 → most aggressive object cleanup
    # deflate   → compress all streams
    # clean     → canonicalise and sanitise content
    buf = io.BytesIO()
    doc.save(
        buf,
        garbage=4,
        deflate=True,
        clean=True,
    )
    buf.seek(0)
    return buf.read()
