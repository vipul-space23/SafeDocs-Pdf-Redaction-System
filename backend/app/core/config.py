# app/core/config.py
import os

class Settings:
    APP_NAME: str = "PDF Redaction API"
    UPLOAD_DIR: str = os.path.abspath("./temp_files/")  # Use absolute path
    CORS_ORIGINS: list = ["*"]  # Adjust in production
    DEBUG: bool = os.environ.get("DEBUG", "True").lower() == "true"

    def __init__(self):
        # Ensure upload directory exists
        if not os.path.exists(self.UPLOAD_DIR):
            os.makedirs(self.UPLOAD_DIR)


settings = Settings()