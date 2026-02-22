# app/services/pdf_processing.py
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from PyPDF2.errors import PdfReadError


def check_pdf_password(pdf_path: str) -> bool:
    """Check if the PDF is password-protected."""
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PdfReader(f)
            if pdf_reader.is_encrypted:
                return True
        return False
    except (PdfReadError, FileNotFoundError) as e:
        print(f"Error checking PDF password: {str(e)}")
        return False


def decrypt_pdf(pdf_path: str, password: str) -> BytesIO | None:
    """Decrypts the PDF and returns it as BytesIO, or None if decryption fails."""
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PdfReader(f)
            if pdf_reader.is_encrypted:
                if pdf_reader.decrypt(password) == 0:
                    return None  # Wrong password

                pdf_writer = PdfWriter()
                for page_num in range(len(pdf_reader.pages)):
                    pdf_writer.add_page(pdf_reader.pages[page_num])

                output_stream = BytesIO()
                pdf_writer.write(output_stream)
                output_stream.seek(0)  # Reset the stream to the beginning
                return output_stream
            else:
                with open(pdf_path, 'rb') as f:
                    pdf_data = f.read()
                return BytesIO(pdf_data) # Not encrypted, return the original as BytesIO
    except Exception as e:
        print(f"Error decrypting PDF: {e}")
        return None



def redact_pdf(pdf_path: str, redaction_coordinates: list) -> BytesIO:  # Placeholder function.
    """
    Redacts the PDF based on the provided coordinates.  This is a simplified example.
    Implement your PDF redaction logic here using libraries like PDFMiner, ReportLab, etc.
    This function now *returns* a BytesIO object.
    """
    # Placeholder - replace with your redaction logic
    print(f"Redacting PDF with coordinates: {redaction_coordinates} from {pdf_path}")
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
    return BytesIO(pdf_data)  #Return the original PDF data without any redacting



def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text from a PDF file."""
    text = ""
    try:
        with open(pdf_path, 'rb') as f:
            pdf_reader = PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""