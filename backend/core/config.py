import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SafeDoc"
    UPLOAD_DIR: str = "uploads"
    PROCESSED_DIR: str = "processed"
    # AES Key should be 32 bytes for AES-256
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyneeds32byteslong!!") 
    CORS_ORIGINS: list = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
