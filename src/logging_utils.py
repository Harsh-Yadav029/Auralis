"""Structured JSON logging with monotonic and ISO timestamps per pipeline stage."""

import json
import logging
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """Formats log records as structured, single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "iso_time": datetime.now(timezone.utc).isoformat(),
            "mono_ns": time.monotonic_ns(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include custom metadata attributes attached to log records
        for key in ["stage", "stage_duration_ms", "ttfa_ms", "vram_mb", "ram_mb", "session_id"]:
            if hasattr(record, key):
                payload[key] = getattr(record, key)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload)


def setup_structured_logger(name: str = "auralis", level: str = "INFO") -> logging.Logger:
    """Configures and returns a structured JSON logger."""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


def log_stage_event(
    logger: logging.Logger,
    stage: str,
    message: str,
    duration_ms: Optional[float] = None,
    **extra: Any
) -> None:
    """Convenience helper to emit an explicit stage timing record."""
    d: Dict[str, Any] = {"stage": stage, **extra}
    if duration_ms is not None:
        d["stage_duration_ms"] = round(duration_ms, 2)
    logger.info(message, extra=d)
