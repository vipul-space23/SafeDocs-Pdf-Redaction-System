# # app/api/redaction.py
# import os
# from fastapi import APIRouter, Form, HTTPException
# from fastapi.responses import JSONResponse, StreamingResponse
# from app.core.config import settings
# from app.services import pdf_processing, spacy_pii
# from app.utils import file_utils
# from io import BytesIO

# router = APIRouter()


# @router.post("/redact")
# async def redact_pdf(
#     file_id: str = Form(...),
#     filename: str = Form(...),
#     redaction_level: str = Form("medium"),  # Default to medium
# ):
#     """
#     Redacts PII from a PDF file based on the specified redaction level.
#     """
#     pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{filename}")
#     if not os.path.exists(pdf_path):
#         pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_decrypted_{filename}")
#         if not os.path.exists(pdf_path):
#             raise HTTPException(status_code=404, detail="File not found")

#     try:
#         # Extract text from PDF
#         pdf_text = pdf_processing.extract_text_from_pdf(pdf_path)

#         # Detect PII entities
#         pii_entities = spacy_pii.detect_pii(pdf_text)

#         # Filter entities based on redaction level
#         filtered_entities = filter_pii_by_level(pii_entities, redaction_level)

#         # Convert PII entities to redaction coordinates
#         redaction_coordinates = convert_pii_to_coordinates(filtered_entities) # Implement this

#         # Redact the PDF
#         redacted_pdf_stream = pdf_processing.redact_pdf(pdf_path, redaction_coordinates)

#         # Create a filename for the redacted PDF
#         redacted_filename = f"{file_id}_redacted_{filename}"
#         redacted_pdf_path = os.path.join(settings.UPLOAD_DIR, redacted_filename)

#         # Save the redacted PDF to a file
#         with open(redacted_pdf_path, "wb") as redacted_pdf:
#             redacted_pdf.write(redacted_pdf_stream.read())
#             redacted_pdf_stream.seek(0)

#         # Delete original file
#         file_utils.delete_file(pdf_path)

#         # Return the redacted PDF as a streaming response
#         return StreamingResponse(
#             redacted_pdf_stream,
#             media_type="application/pdf",
#             headers={"Content-Disposition": f"attachment;filename={redacted_filename}"},
#         )

#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=500, detail=str(e))


# def filter_pii_by_level(pii_entities: list, redaction_level: str) -> list:
#     """Filters PII entities based on the specified redaction level."""
#     if redaction_level == "low":
#         # Redact only highly sensitive information like SSN, Credit Card Numbers
#         sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN"}
#     elif redaction_level == "medium":
#         # Redact contact information, addresses, and government IDs
#         sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN", "PHONE", "EMAIL", "ADDRESS", "PAN", "PASSPORT"}
#     elif redaction_level == "high":
#         # Redact all detected PII
#         sensitive_labels = {ent[3] for ent in pii_entities}  # All labels
#     else:
#         # Default to medium
#         sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN", "PHONE", "EMAIL", "ADDRESS", "PAN", "PASSPORT"}

#     filtered_entities = [ent for ent in pii_entities if ent[3] in sensitive_labels]
#     return filtered_entities

# def convert_pii_to_coordinates(pii_entities: list) -> list:
#     """
#     Converts PII entities (text spans) to PDF coordinates.
#     This is a placeholder; you'll need to integrate with your PDF processing library
#     (e.g., PDFMiner, ReportLab) to determine the actual coordinates of the text
#     within the PDF.  This is the *hard* part of PDF redaction.
#     """
#     # In a real implementation, you'd need to:
#     # 1. Parse the PDF to get the layout of text elements (words, lines, blocks).
#     # 2. Map the character offsets from spaCy's output to the bounding boxes of those text elements.

#     # For now, we'll just return a placeholder list of rectangles.
#     coordinates = []
#     for entity_text, start_char, end_char, label in pii_entities:
#         # Replace with your coordinate calculation logic
#         coordinates.append({"x1": 10, "y1": 10, "x2": 50, "y2": 20, "label": label, "text": entity_text})  # Placeholder
#     return coordinates
# app/api/redaction.py
import os
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.services import pdf_processing, spacy_pii
from app.utils import file_utils
from io import BytesIO
from typing import List, Tuple
import traceback
import re

router = APIRouter()

@router.post("/redact")
async def redact_pdf(
    file_id: str = Form(...),
    filename: str = Form(...),
    redaction_level: str = Form("medium"),  # Default to medium
):
    """
    Redacts PII from a PDF file based on the specified redaction level.
    """
    original_pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{filename}")
    decrypted_pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_decrypted_{filename}")

    if os.path.exists(decrypted_pdf_path):
        pdf_path = decrypted_pdf_path
    elif os.path.exists(original_pdf_path):
        pdf_path = original_pdf_path
    else:
        raise HTTPException(status_code=404, detail="File not found")

    try:
        # Extract text from PDF
        pdf_text = pdf_processing.extract_text_from_pdf(pdf_path)

        # Detect PII entities
        pii_entities = spacy_pii.detect_pii(pdf_text)

        # Filter entities based on redaction level
        filtered_entities = filter_pii_by_level(pii_entities, redaction_level)

        redacted_text = get_redacted_text(pdf_text, redaction_level)


        return JSONResponse(content={"status": "success", "redacted_text": redacted_text})

    except Exception as e:
        error_message = f"Error applying redaction: {str(e)}"
        print(error_message)
        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": error_message},
        )

def filter_pii_by_level(pii_entities: List[Tuple[str, int, int, str]], redaction_level: str) -> List[Tuple[str, int, int, str]]:
    """Filters PII entities based on the specified redaction level."""
    if redaction_level == "low":
        # Redact only highly sensitive information like SSN, Credit Card Numbers
        sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN"}
    elif redaction_level == "medium":
        # Redact contact information, addresses, and government IDs
        sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN", "PHONE", "EMAIL", "ADDRESS", "PAN", "PASSPORT"}
    elif redaction_level == "high":
        # Redact all detected PII
        sensitive_labels = {ent[3] for ent in pii_entities}  # All labels
    else:
        # Default to medium
        sensitive_labels = {"SSN", "CREDIT_CARD", "AADHAAR", "US_SSN", "PHONE", "EMAIL", "ADDRESS", "PAN", "PASSPORT"}

    filtered_entities = [ent for ent in pii_entities if ent[3] in sensitive_labels]
    return filtered_entities


def get_redacted_text(original_text: str, redaction_level: str) -> str:
    """Redacts text based on level (simplified for demo; ideally done server-side)"""
    result = original_text

    if redaction_level == 'low':
        result = replace_all(result, [r'\d{3}-\d{2}-\d{4}',r'\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}'],  '***REDACTED***');  # SSN and Credit Card
    elif redaction_level == 'medium':
        result = replace_all(result, [r'\d{3}-\d{2}-\d{4}',r'\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}', r'\(\d{3}\) \d{3}-\d{4}', r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'], '***REDACTED***');
    else:  # high
        result = replace_all(result, [r'\d{3}-\d{2}-\d{4}',r'\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}', r'\(\d{3}\) \d{3}-\d{4}', r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', r'[A-Z][a-z]+ [A-Z][a-z]+', r'\d+ [A-Za-z]+ Street, [A-Za-z]+, [A-Z]{2} \d{5}'],  '***REDACTED***');
    return result

def replace_all(text, patterns, replacement):
    """Replaces all occurrences of multiple regex patterns in a string."""
    for pattern in patterns:
        text = re.sub(pattern, replacement, text)
    return text


def convert_pii_to_coordinates(pii_entities: list) -> list:
    """
    Converts PII entities (text spans) to PDF coordinates.
    This is a placeholder; you'll need to integrate with your PDF processing library
    (e.g., PDFMiner, ReportLab) to determine the actual coordinates of the text
    within the PDF.  This is the *hard* part of PDF redaction.
    """
    # In a real implementation, you'd need to:
    # 1. Parse the PDF to get the layout of text elements (words, lines, blocks).
    # 2. Map the character offsets from spaCy's output to the bounding boxes of those text elements.

    # For now, we'll just return a placeholder list of rectangles.
    coordinates = []
    for entity_text, start_char, end_char, label in pii_entities:
        # Replace with your coordinate calculation logic
        coordinates.append({"x1": 10, "y1": 10, "x2": 50, "y2": 20, "label": label, "text": entity_text})  # Placeholder
    return coordinates