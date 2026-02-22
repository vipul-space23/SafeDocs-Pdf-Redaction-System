# app/api/decrypt.py
import os
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.services import pdf_processing
from app.utils import file_utils

router = APIRouter()

@router.post("/decrypt")
async def decrypt_pdf(file_id: str = Form(...), filename: str = Form(...), password: str = Form(...)):
    """Attempts to decrypt the PDF with the given password."""
    pdf_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{filename}")

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="File not found")

    decrypted_pdf_stream = pdf_processing.decrypt_pdf(pdf_path, password)

    if decrypted_pdf_stream is None:
        return JSONResponse(content={"status": "wrong_password"}, status_code=400)

    # Save the decrypted PDF to a new file
    decrypted_filename = f"{file_id}_decrypted_{filename}"
    decrypted_pdf_path = os.path.join(settings.UPLOAD_DIR, decrypted_filename)

    with open(decrypted_pdf_path, "wb") as decrypted_pdf:
        decrypted_pdf.write(decrypted_pdf_stream.read())

    return JSONResponse(
        content={
            "status": "decrypted",
            "file_id": file_id,
            "filename": filename,
            "file_path": decrypted_pdf_path,
        },
        status_code=200,
    )