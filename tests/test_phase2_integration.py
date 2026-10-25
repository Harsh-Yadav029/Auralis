"""
tests/test_phase2_integration.py
Phase 2 End-to-End Integration Tests.
Verifies Ollama generation, Kokoro synthesis, BCSM scoring, and full turn pipeline.
Run: pytest tests/test_phase2_integration.py -v
"""
import asyncio
import numpy as np
import pytest
from tests.helpers import BACKEND_DIR, import_subproject_module


# ---------------------------------------------------------------------------
# Test 1: Ollama generates a non-empty response
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_ollama_stream_generation():
    """OllamaLLMEngine streams non-empty text clauses with active model."""
    try:
        import httpx
        resp = httpx.get("http://localhost:11434/api/tags", timeout=2.0)
        if resp.status_code != 200:
            pytest.skip("Ollama is not running on localhost:11434")
    except Exception:
        pytest.skip("Ollama is not reachable on localhost:11434")

    llm_mod = import_subproject_module(BACKEND_DIR, "src.services.llm_service")
    OllamaLLMEngine = llm_mod.OllamaLLMEngine

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
    tts_mod = import_subproject_module(BACKEND_DIR, "src.services.tts_service")
    KokoroTTSService = tts_mod.KokoroTTSService

    try:
        tts = KokoroTTSService()
    except Exception as exc:
        pytest.skip(f"Kokoro TTS initialization skipped (requires model download or onnxruntime): {exc}")

    if getattr(tts, "_kokoro", None) is None:
        pytest.skip("Kokoro ONNX model not loaded or unavailable")

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
    scoring_mod = import_subproject_module(BACKEND_DIR, "src.services.scoring_service")
    BCSMScorer = scoring_mod.BCSMScorer

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
    try:
        import httpx
        resp = httpx.get("http://localhost:11434/api/tags", timeout=2.0)
        if resp.status_code != 200:
            pytest.skip("Ollama not running on localhost:11434")
    except Exception:
        pytest.skip("Ollama not reachable on localhost:11434")

    llm_mod = import_subproject_module(BACKEND_DIR, "src.services.llm_service")
    tts_mod = import_subproject_module(BACKEND_DIR, "src.services.tts_service")
    webrtc_mod = import_subproject_module(BACKEND_DIR, "src.services.webrtc_service")

    OllamaLLMEngine = llm_mod.OllamaLLMEngine
    KokoroTTSService = tts_mod.KokoroTTSService
    CustomOutboundAudioTrack = webrtc_mod.CustomOutboundAudioTrack

    llm = OllamaLLMEngine()
    try:
        tts = KokoroTTSService()
    except Exception as exc:
        pytest.skip(f"Kokoro TTS unavailable: {exc}")

    if getattr(tts, "_kokoro", None) is None:
        pytest.skip("Kokoro ONNX model not loaded")

    track = CustomOutboundAudioTrack()

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
