"""Pydantic-based configuration model reading config.yaml via pathlib."""

from pathlib import Path
from typing import List, Optional

import yaml
from pydantic import BaseModel, Field


class SystemConfig(BaseModel):
    device: str = "cuda"
    vram_limit_mb: int = 3600
    log_level: str = "INFO"
    log_json: bool = True


class AudioConfig(BaseModel):
    sample_rate: int = 16000
    channels: int = 1
    frame_duration_ms: int = 20
    bytes_per_sample: int = 2

    @property
    def frame_size_bytes(self) -> int:
        return int(self.sample_rate * (self.frame_duration_ms / 1000.0) * self.channels * self.bytes_per_sample)


class STTProviderConfig(BaseModel):
    provider: str = "faster_whisper"
    model_size: str = "small"
    compute_type: str = "int8"
    device: str = "cuda"


class SERProviderConfig(BaseModel):
    provider: str = "wav2vec2"
    model_name: str = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim"
    device: str = "cpu"
    ema_alpha: float = 0.3
    window_duration_sec: float = 1.5


class LLMProviderConfig(BaseModel):
    provider: str = "ollama"
    model_name: str = "qwen2.5:7b-instruct-q4_K_M"
    base_url: str = "http://localhost:11434"
    max_tokens: int = 100
    temperature: float = 0.3


class TTSProviderConfig(BaseModel):
    provider: str = "kokoro"
    device: str = "cuda"
    voices: dict = Field(default_factory=lambda: {"en": "af_sarah", "hi": "hi_female"})


class ProvidersConfig(BaseModel):
    stt: STTProviderConfig = Field(default_factory=STTProviderConfig)
    ser: SERProviderConfig = Field(default_factory=SERProviderConfig)
    llm: LLMProviderConfig = Field(default_factory=LLMProviderConfig)
    tts: TTSProviderConfig = Field(default_factory=TTSProviderConfig)


class LanguagesConfig(BaseModel):
    default: str = "en"
    supported: List[str] = Field(default_factory=lambda: ["en", "hi"])


class AuralisConfig(BaseModel):
    system: SystemConfig = Field(default_factory=SystemConfig)
    audio: AudioConfig = Field(default_factory=AudioConfig)
    languages: LanguagesConfig = Field(default_factory=LanguagesConfig)
    providers: ProvidersConfig = Field(default_factory=ProvidersConfig)


def load_config(config_path: Optional[Path] = None) -> AuralisConfig:
    """Loads and validates AuralisConfig from config.yaml using pathlib."""
    if config_path is None:
        # Default to config.yaml at workspace root
        config_path = Path(__file__).resolve().parent.parent / "config.yaml"

    if not config_path.exists():
        # Fall back to default model configuration
        return AuralisConfig()

    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}

    return AuralisConfig(**data)
