# app/api/file.py
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from app.core.config import settings
from app.utils import file_utils

router = APIRouter()

@router.get("/file/{file_id}/{filename}")
async def get_file(file_id: str, filename: str):
    """Retrieves the processed PDF file."""
    decrypted_filename = f"{file_id}_decrypted_{filename}"
    decrypted_path = os.path.join(settings.UPLOAD_DIR, decrypted_filename)

    if os.path.exists(decrypted_path):
        return FileResponse(decrypted_path, media_type="application/pdf", filename=filename)

    original_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{filename}")
    if os.path.exists(original_path):
        return FileResponse(original_path, media_type="application/pdf", filename=filename)

    raise HTTPException(status_code=404, detail="File not found")


@router.delete("/file/{file_id}/{filename}")
async def delete_file(file_id: str, filename: str):
    """Deletes temporary files."""
    original_filename = f"{file_id}_{filename}"
    original_path = os.path.join(settings.UPLOAD_DIR, original_filename)
    decrypted_filename = f"{file_id}_decrypted_{filename}"
    decrypted_path = os.path.join(settings.UPLOAD_DIR, decrypted_filename)

    original_deleted = file_utils.delete_file(original_path)
    decrypted_deleted = file_utils.delete_file(decrypted_path)

    if original_deleted or decrypted_deleted:
        return JSONResponse(content={"status": "files_deleted"}, status_code=200)
    else:
        raise HTTPException(status_code=404, detail="No files found to delete")