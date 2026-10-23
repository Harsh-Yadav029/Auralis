"""Abstract provider interfaces for Auralis (SPEC Section 2).

The Orchestrator strictly imports only these four interfaces:
- STTProvider: Speech-to-Text
- SERProvider: Speech Emotion Recognition
- LLMProvider: Large Language Model Dialogue Engine
- TTSProvider: Text-to-Speech Streaming Synthesis
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, List, Optional

from src.types import AudioFrame, CancelToken, EmotionState


class STTProvider(ABC):
    """Abstract interface for Speech-to-Text engines."""

    @abstractmethod
    async def process_frame(self, frame: AudioFrame) -> Optional[Dict[str, any]]:
        """Processes an incoming 20ms audio frame and returns VAD/partial events."""
        pass

    @abstractmethod
    async def finish_turn(self, language: str = "en") -> str:
        """Finalizes and returns the complete transcribed text for the turn."""
        pass

    @abstractmethod
    def reset(self) -> None:
        """Resets internal audio buffers for the next turn."""
        pass


class SERProvider(ABC):
    """Abstract interface for Speech Emotion Recognition engines."""

    @abstractmethod
    async def update_audio(self, frame: AudioFrame) -> EmotionState:
        """Ingests frame and returns the updated continuous valence/arousal state."""
        pass

    @abstractmethod
    def reset(self) -> None:
        """Clears sliding window context."""
        pass


class LLMProvider(ABC):
    """Abstract interface for dialogue and crisis persona generation."""

    @abstractmethod
    async def stream_response(
        self,
        transcript: str,
        emotion: EmotionState,
        history: List[Dict[str, str]],
        system_prompt: str,
        cancel_token: CancelToken,
        language: str = "en",
    ) -> AsyncGenerator[str, None]:
        """Streams de-escalation response clauses cooperatively respecting CancelToken."""
        pass


class TTSProvider(ABC):
    """Abstract interface for streaming speech synthesis."""

    @abstractmethod
    async def stream_speech(
        self,
        text_clause: str,
        emotion: EmotionState,
        language: str,
        cancel_token: CancelToken,
    ) -> AsyncGenerator[AudioFrame, None]:
        """Yields synthesized 20ms 16kHz PCM AudioFrames respecting CancelToken."""
        pass
