import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusLink LAN Instant Communication System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "campuslink_lan_super_secret_jwt_key_2026_x89")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    ADMIN_API_KEY: str = os.getenv("ADMIN_API_KEY", "campuslink-faculty-api-key-9988")
    
    # Directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    
    # Database (Absolute Path)
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'campuslink.db').replace('\\\\', '/')}"

    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
