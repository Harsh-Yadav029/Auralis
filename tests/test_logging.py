"""Unit tests for structured JSON logging."""

import json
import logging

from src.logging_utils import JSONFormatter


def test_json_formatter_schema():
    formatter = JSONFormatter()
    record = logging.LogRecord(
        name="test_logger",
        level=logging.INFO,
        pathname=__file__,
        lineno=10,
        msg="Test message",
        args=(),
        exc_info=None,
    )
    record.stage = "vad"
    record.stage_duration_ms = 45.2

    output = formatter.format(record)
    parsed = json.loads(output)

    assert parsed["level"] == "INFO"
    assert parsed["message"] == "Test message"
    assert parsed["stage"] == "vad"
    assert parsed["stage_duration_ms"] == 45.2
    assert "mono_ns" in parsed
    assert "iso_time" in parsed
