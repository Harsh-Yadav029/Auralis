"""Deterministic stub implementations of provider interfaces for unit testing."""

import asyncio
from typing import AsyncGenerator, Dict, List, Optional

from src.providers.base import LLMProvider, SERProvider, STTProvider, TTSProvider
from src.types import AudioFrame, CancelToken, EmotionState


class StubSTTProvider(STTProvider):
    """Deterministic STT stub returning configured transcripts."""

    def __init__(self, predetermined_text: str = "Hello, I am ready to negotiate."):
        self.predetermined_text = predetermined_text
        self.frame_count = 0

    async def process_frame(self, frame: AudioFrame) -> Optional[Dict[str, any]]:
        self.frame_count += 1
        # Emit a simulated partial every 10 frames
        if self.frame_count % 10 == 0:
            return {"event": "PARTIAL", "text": "Hello"}
        return None

    async def finish_turn(self, language: str = "en") -> str:
        return self.predetermined_text

    def reset(self) -> None:
        self.frame_count = 0


class StubSERProvider(SERProvider):
    """Deterministic SER stub returning fixed or configurable emotion states."""

    def __init__(self, valence: float = 0.2, arousal: float = 0.5, label: str = "calm"):
        self.state = EmotionState(valence=valence, arousal=arousal, primary_label=label)

    async def update_audio(self, frame: AudioFrame) -> EmotionState:
        return self.state

    def reset(self) -> None:
        pass


class StubLLMProvider(LLMProvider):
    """Deterministic LLM stub streaming word clauses while checking CancelToken."""

    def __init__(self, tokens: Optional[List[str]] = None):
        self.tokens = tokens or ["I hear you.", "Take a deep breath.", "Tell me what you need."]

    async def stream_response(
        self,
        transcript: str,
        emotion: EmotionState,
        history: List[Dict[str, str]],
        system_prompt: str,
        cancel_token: CancelToken,
        language: str = "en",
    ) -> AsyncGenerator[str, None]:
        for token in self.tokens:
            if cancel_token.is_cancelled:
                break
            await asyncio.sleep(0.01)  # Simulate non-blocking async generation
            yield token


class StubTTSProvider(TTSProvider):
    """Deterministic TTS stub yielding valid 20ms 16kHz PCM frames."""

    def __init__(self, frames_per_clause: int = 5):
        self.frames_per_clause = frames_per_clause

    async def stream_speech(
        self,
        text_clause: str,
        emotion: EmotionState,
        language: str,
        cancel_token: CancelToken,
    ) -> AsyncGenerator[AudioFrame, None]:
        # 20ms @ 16kHz mono 16-bit = 640 zero-bytes
        silent_frame_data = b"\x00" * 640
        for _ in range(self.frames_per_clause):
            if cancel_token.is_cancelled:
                break
            await asyncio.sleep(0.02)  # Simulate 20ms pacing
            yield AudioFrame(data=silent_frame_data)
