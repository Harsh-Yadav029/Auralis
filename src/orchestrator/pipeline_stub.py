"""Orchestrator pipeline wireframe stub accepting only abstract provider types."""

from typing import List

from src.providers.base import LLMProvider, SERProvider, STTProvider, TTSProvider
from src.types import AudioFrame, CancelToken, EmotionState


class OrchestratorPipelineStub:
    """Wireframe coordinator proving that the orchestrator imports only provider interfaces."""

    def __init__(
        self,
        stt: STTProvider,
        ser: SERProvider,
        llm: LLMProvider,
        tts: TTSProvider,
    ):
        self.stt = stt
        self.ser = ser
        self.llm = llm
        self.tts = tts
        self.cancel_token = CancelToken()

    async def ingest_frame(self, frame: AudioFrame) -> EmotionState:
        await self.stt.process_frame(frame)
        emotion = await self.ser.update_audio(frame)
        return emotion

    async def run_turn(self, language: str = "en") -> List[AudioFrame]:
        transcript = await self.stt.finish_turn(language=language)
        emotion = EmotionState(valence=0.0, arousal=0.5, primary_label="neutral")

        outbound_frames: List[AudioFrame] = []
        system_prompt = "You are a crisis negotiator."

        async for clause in self.llm.stream_response(
            transcript, emotion, [], system_prompt, self.cancel_token, language=language
        ):
            if self.cancel_token.is_cancelled:
                break
            async for frame in self.tts.stream_speech(
                clause, emotion, language, self.cancel_token
            ):
                if self.cancel_token.is_cancelled:
                    break
                outbound_frames.append(frame)

        return outbound_frames
