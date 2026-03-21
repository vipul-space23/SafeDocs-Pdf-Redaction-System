import os

class Settings:
    APP_NAME: str = "SafeDoc"
    UPLOAD_DIR: str = "uploads"
    PROCESSED_DIR: str = "processed"
    # AES Key should be 32 bytes for AES-256
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyneeds32byteslong!!") 
    CORS_ORIGINS: list = ["http://localhost:3000"]

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
