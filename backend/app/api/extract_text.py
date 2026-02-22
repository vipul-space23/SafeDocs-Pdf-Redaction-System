# app/api/extract_text.py
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.services import pdf_processing, spacy_pii
from typing import List, Tuple
import traceback  # Import the traceback module

router = APIRouter()


@router.get("/extract-text/{file_id}/{filename}")
async def extract_text(file_id: str, filename: str):
    """
    Extracts PII entities from a PDF file.  Returns only the PII.
    """

    original_pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{filename}")
    decrypted_pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_decrypted_{filename}")

    # Check if decrypted file exists first
    if os.path.exists(decrypted_pdf_path):
        pdf_path = decrypted_pdf_path
    elif os.path.exists(original_pdf_path):
        pdf_path = original_pdf_path
    else:
        raise HTTPException(status_code=404, detail="File not found")


    try:
        text = pdf_processing.extract_text_from_pdf(pdf_path)
        pii_entities = spacy_pii.detect_pii(text)

        # Extract only the text of the PII entities
        pii_text = "\n".join([entity[0] for entity in pii_entities])  # Join with newlines
        return JSONResponse(content={"status": "success", "text": pii_text})
    except Exception as e:
        error_message = f"Error extracting text from PDF: {str(e)}"
        print(error_message)  # Log the error to the console
        traceback.print_exc()  # Print the traceback
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": error_message},
        )