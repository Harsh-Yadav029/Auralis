"""Unit tests for AudioFrame, CancelToken, and provider contract compliance."""

import pytest

from src.orchestrator.pipeline_stub import OrchestratorPipelineStub
from src.providers.base import LLMProvider, SERProvider, STTProvider, TTSProvider
from src.providers.stubs import StubLLMProvider, StubSERProvider, StubSTTProvider, StubTTSProvider
from src.types import AudioFrame, CancelToken, EmotionState


def test_audio_frame_invariants():
    """AudioFrame must enforce exact 20ms 16kHz mono 16-bit byte length (640 bytes)."""
    valid_bytes = b"\x00" * 640
    frame = AudioFrame(data=valid_bytes)
    assert len(frame.data) == 640
    assert frame.sample_rate == 16000
    assert frame.channels == 1
    assert frame.timestamp_ns > 0

    with pytest.raises(ValueError):
        AudioFrame(data=b"\x00" * 500)  # Invalid frame size


def test_cancel_token():
    """CancelToken state checks."""
    token = CancelToken()
    assert not token.is_cancelled
    token.cancel()
    assert token.is_cancelled


@pytest.mark.asyncio
async def test_provider_contracts_and_orchestrator():
    """Verify that all stubs conform to abstract interfaces and orchestrate cleanly."""
    stt: STTProvider = StubSTTProvider("Hello detective.")
    ser: SERProvider = StubSERProvider(valence=-0.5, arousal=0.8, label="panic")
    llm: LLMProvider = StubLLMProvider(["Don't come near.", "Stay back."])
    tts: TTSProvider = StubTTSProvider(frames_per_clause=3)

    pipeline = OrchestratorPipelineStub(stt=stt, ser=ser, llm=llm, tts=tts)

    # Ingest a frame
    frame = AudioFrame(data=b"\x00" * 640)
    emo = await pipeline.ingest_frame(frame)
    assert isinstance(emo, EmotionState)
    assert emo.arousal == 0.8
    assert emo.primary_label == "panic"

    # Run turn
    out_frames = await pipeline.run_turn(language="en")
    assert len(out_frames) == 6  # 2 clauses * 3 frames
    assert all(isinstance(f, AudioFrame) for f in out_frames)
