import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Auralis ML Audio Service"
    debug: bool = False
    
    whisper_model: str = "distil-small.en"
    compute_type: str = "int8"
    vad_threshold: float = 0.6
    hangover_ms: int = 250
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
