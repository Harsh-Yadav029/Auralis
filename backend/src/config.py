import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "Auralis WebRTC Gateway"
    debug: bool = False
    
    # Cloud API Keys
    groq_api_key: str = Field(default="", env="GROQ_API_KEY")
    cartesia_api_key: str = Field(default="", env="CARTESIA_API_KEY")
    
    # WebRTC Port Ranges
    min_udp_port: int = 50000
    max_udp_port: int = 50050
    
    # ML Service Endpoint
    ml_service_url: str = Field(default="http://localhost:8001", env="ML_SERVICE_URL")
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
