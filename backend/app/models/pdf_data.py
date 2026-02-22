# app/models/pdf_data.py
from pydantic import BaseModel

class PDFData(BaseModel):
    file_id: str
    filename: str
    file_path: str  # Path to the original or decrypted file