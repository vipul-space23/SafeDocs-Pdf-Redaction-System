# app/utils/file_utils.py
import os

def generate_unique_filename(original_filename: str) -> str:
    """Generates a unique filename using UUID."""
    import uuid
    unique_id = str(uuid.uuid4())
    filename, ext = os.path.splitext(original_filename)
    return f"{unique_id}_{filename}{ext}"

def delete_file(file_path: str) -> bool:
    """Deletes a file if it exists.  Returns True if deleted, False if not found."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
        return False

def cleanup_temp_files(upload_dir: str):
    """Clean up files in the temporary directory."""
    if os.path.exists(upload_dir):
        for filename in os.listdir(upload_dir):
            file_path = os.path.join(upload_dir, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")