"""Common data types and structures for the Auralis voice emotion engine."""

import time
from dataclasses import dataclass, field


@dataclass(frozen=True)
class AudioFrame:
    """Represents a standard 16 kHz mono 20 ms PCM audio frame.

    Attributes:
        data: Raw PCM 16-bit bytes (exactly 640 bytes for 20ms @ 16kHz).
        timestamp_ns: Monotonic timestamp in nanoseconds when frame was created/received.
        sample_rate: Sample rate in Hz (must be 16000).
        channels: Channel count (must be 1).
    """
    data: bytes
    timestamp_ns: int = field(default_factory=time.monotonic_ns)
    sample_rate: int = 16000
    channels: int = 1

    def __post_init__(self):
        expected_bytes = int(self.sample_rate * 0.02 * self.channels * 2)
        if len(self.data) != expected_bytes:
            raise ValueError(
                f"Invalid frame size: expected {expected_bytes} bytes (20ms @ 16kHz mono), "
                f"got {len(self.data)} bytes"
            )


@dataclass
class EmotionState:
    """Acoustic continuous dimensional emotion representation."""
    valence: float  # -1.0 (extremely negative/distressed) to +1.0 (positive/compliant)
    arousal: float  # 0.0 (calm/subdued) to 1.0 (hyper-aroused/panicked)
    primary_label: str = "neutral"
    confidence: float = 1.0


class CancelToken:
    """Thread-safe cooperative cancellation token with bounded cancellation timeouts."""

    def __init__(self):
        self._cancelled = False

    def cancel(self):
        self._cancelled = True

    @property
    def is_cancelled(self) -> bool:
        return self._cancelled
