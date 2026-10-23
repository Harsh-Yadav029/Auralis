from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Auralis WebRTC Gateway"
    debug: bool = False

    # WebRTC UDP port range (aiortc ICE candidates)
    min_udp_port: int = 50000
    max_udp_port: int = 50050

    # ML Service WebSocket endpoint
    ml_service_url: str = Field(
        default="http://localhost:8001",
        validation_alias=AliasChoices("ML_SERVICE_URL", "ml_service_url"),
    )

    # Ollama local LLM
    ollama_base_url: str = Field(
        default="http://localhost:11434",
        validation_alias=AliasChoices("OLLAMA_BASE_URL", "ollama_base_url"),
    )
    ollama_model: str = Field(
        default="qwen2.5:7b-instruct-q4_K_M",
        validation_alias=AliasChoices("OLLAMA_MODEL", "ollama_model"),
    )

    # Kokoro ONNX local TTS
    kokoro_voice_en: str = Field(
        default="af_sarah",
        validation_alias=AliasChoices("KOKORO_VOICE_EN", "kokoro_voice_en"),
    )
    kokoro_voice_hi: str = Field(
        default="af_sarah",
        validation_alias=AliasChoices("KOKORO_VOICE_HI", "kokoro_voice_hi"),
    )
    kokoro_device: str = Field(
        default="cuda",
        validation_alias=AliasChoices("KOKORO_DEVICE", "kokoro_device"),
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )


settings = Settings()
