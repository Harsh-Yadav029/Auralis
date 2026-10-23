"""Unit tests for configuration loading and validation."""

from pathlib import Path

from src.config import AuralisConfig, load_config


def test_default_config_loading():
    """Verify that load_config loads valid defaults from workspace config.yaml."""
    cfg = load_config()
    assert isinstance(cfg, AuralisConfig)
    assert cfg.audio.sample_rate == 16000
    assert cfg.audio.frame_duration_ms == 20
    assert cfg.audio.frame_size_bytes == 640
    assert "en" in cfg.languages.supported
    assert "hi" in cfg.languages.supported
    assert cfg.system.vram_limit_mb == 3600


def test_nonexistent_config_fallback(tmp_path: Path):
    """Verify graceful fallback if a non-existent path is passed."""
    cfg = load_config(tmp_path / "does_not_exist.yaml")
    assert isinstance(cfg, AuralisConfig)
    assert cfg.audio.sample_rate == 16000
