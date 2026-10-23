"""
tests/test_phase2_integration.py
Phase 2 End-to-End Integration Tests.
Verifies Ollama generation, Kokoro synthesis, BCSM scoring, and full turn pipeline.
Run: pytest tests/test_phase2_integration.py -v
"""
import asyncio
import os
import sys
import numpy as np
import pytest

# Ensure backend and ml-service are in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(BASE_DIR, "backend")
ml_path = os.path.join(BASE_DIR, "ml-service")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
if ml_path not in sys.path:
    sys.path.insert(0, ml_path)


# ---------------------------------------------------------------------------
# Test 1: Ollama generates a non-empty response
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_ollama_stream_generation():
    """OllamaLLMEngine streams non-empty text clauses with active model."""
    from src.services.llm_service import OllamaLLMEngine

    engine = OllamaLLMEngine()
    clauses = []
    emotion = {"arousal": 0.8, "valence": -0.6, "primary_label": "panic"}

    try:
        async for clause in engine.stream_deescalation_response(
            user_transcript="Please put down the weapon, nobody wants anyone to get hurt.",
            emotion_data=emotion,
            history=[],
        ):
            clauses.append(clause)
    except Exception as exc:
        pytest.fail(f"Ollama generation failed: {exc}")

    assert len(clauses) > 0, "Expected at least one clause from Ollama stream"
    full_text = " ".join(clauses).strip()
    assert len(full_text) > 0, "Ollama response text should not be empty"


# ---------------------------------------------------------------------------
# Test 2: Kokoro synthesises non-empty PCM
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_kokoro_synthesis():
    """KokoroTTSService synthesises speech clauses into PCM int16 chunks."""
    from src.services.tts_service import KokoroTTSService

    tts = KokoroTTSService()
    audio_chunks = []

    async def collect_audio(chunk: np.ndarray):
        audio_chunks.append(chunk)

    await tts.stream_speech(
        text_clause="I hear you. Let us talk about this calmly.",
        emotion_arousal=0.6,
        audio_callback=collect_audio,
    )

    assert len(audio_chunks) > 0, "Expected at least one audio chunk"
    total_samples = sum(len(c) for c in audio_chunks)
    assert total_samples > 0, "Total audio samples must be greater than zero"
    for chunk in audio_chunks:
        assert chunk.dtype == np.int16, f"Expected int16 chunk, got {chunk.dtype}"


# ---------------------------------------------------------------------------
# Test 3: BCSM heuristic scorer returns valid structure with no API key
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_bcsm_scorer_structure():
    """BCSMScorer returns a valid stage, scores, and feedback dict without external APIs."""
    from src.services.scoring_service import BCSMScorer

    scorer = BCSMScorer()
    result = await scorer.evaluate_turn(
        trainee_transcript="What happened earlier today? Help me understand how you feel.",
        acoustic_emotion={"arousal": 0.5, "valence": -0.2, "primary_label": "neutral"},
        ai_response="Nobody understands me!",
    )

    assert isinstance(result, dict)
    assert "stage" in result and 1 <= result["stage"] <= 5
    assert "stage_name" in result
    assert "scores" in result
    scores = result["scores"]
    for metric in ["active_listening", "emotional_labeling", "mirroring", "rapport"]:
        assert metric in scores
        assert 0 <= scores[metric] <= 100
    assert "tactical_feedback" in result and len(result["tactical_feedback"]) > 0
    assert "overall_progress" in result and 0.0 <= result["overall_progress"] <= 100.0


# ---------------------------------------------------------------------------
# Test 4: Full turn pipeline: LLM -> TTS produces audio bytes via Mock Outbound
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_full_turn_pipeline():
    """Test full turn end-to-end: LLM generates text and TTS pipes PCM to track."""
    from src.services.llm_service import OllamaLLMEngine
    from src.services.tts_service import KokoroTTSService
    from src.services.webrtc_service import CustomOutboundAudioTrack

    llm = OllamaLLMEngine()
    tts = KokoroTTSService()
    track = CustomOutboundAudioTrack()

    received_frames = []

    async def on_audio_chunk(pcm_chunk):
        await track.add_pcm_chunk(pcm_chunk)

    clauses_received = 0
    async for clause in llm.stream_deescalation_response(
        user_transcript="We have plenty of time. Tell me what you need right now.",
        emotion_data={"arousal": 0.7, "valence": -0.5, "primary_label": "panic"},
        history=[],
    ):
        clauses_received += 1
        await tts.stream_speech(clause, emotion_arousal=0.7, audio_callback=on_audio_chunk)

    assert clauses_received > 0, "LLM must produce at least one clause"

    # Verify that the track has accumulated audio and can yield frames
    frame = await track.recv()
    assert frame is not None
    assert frame.sample_rate == 48000
    assert frame.samples == 960
