import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Auralis ML Audio Service"
    debug: bool = False

    # Whisper ASR settings
    whisper_model: str = "small"          # multilingual; supports en + hi
    compute_type: str = "int8"
    whisper_device: str = "cuda"          # "cuda" | "cpu"
    whisper_language: str | None = None   # None = auto-detect per utterance

    # Silero VAD settings
    vad_threshold: float = 0.5
    hangover_ms: int = 300

    # Emotion SER settings
    emotion_ema_alpha: float = 0.3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
