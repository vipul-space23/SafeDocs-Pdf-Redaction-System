# app/api/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.utils import file_utils
from app.services import pdf_processing
from app.models.pdf_data import PDFData
import os


router = APIRouter()


@router.post("/upload")
async def upload_pdf(pdf: UploadFile = File(...)):
    """Uploads a PDF file and checks if it's password-protected."""
    try:
        unique_filename = file_utils.generate_unique_filename(pdf.filename)
        pdf_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        # Save the uploaded file
        with open(pdf_path, "wb") as file:
            file.write(await pdf.read())

        is_password_protected = pdf_processing.check_pdf_password(pdf_path)

        file_id = unique_filename.split("_", 1)[0]  # Extract file_id from filename
        original_filename = pdf.filename

        if is_password_protected:
            return JSONResponse(
                content={
                    "status": "password_required",
                    "file_id": file_id,
                    "filename": original_filename,
                },
                status_code=200,
            )
        else:
            return JSONResponse(
                content={
                    "status": "ready_for_processing",
                    "file_id": file_id,
                    "filename": original_filename,
                    "file_path": pdf_path,
                },
                status_code=200,
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))