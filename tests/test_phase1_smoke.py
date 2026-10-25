"""
tests/test_phase1_smoke.py
Phase 1 acceptance smoke tests — all must pass before Phase 2.
Run: pytest tests/test_phase1_smoke.py -v
"""
import numpy as np
import pytest
from tests.helpers import BACKEND_DIR, ML_SERVICE_DIR, import_subproject_module


# ---------------------------------------------------------------------------
# Test 1: Ollama reachability
# ---------------------------------------------------------------------------
def test_ollama_reachable():
    """Ollama must be serving at localhost:11434."""
    try:
        import httpx

        resp = httpx.get("http://localhost:11434/api/tags", timeout=5.0)
        assert resp.status_code == 200, f"Ollama /api/tags returned {resp.status_code}"
        data = resp.json()
        assert "models" in data, "Ollama response missing 'models' key"
    except httpx.ConnectError:
        pytest.skip("Ollama not running — start with 'ollama serve'")


# ---------------------------------------------------------------------------
# Test 2: Faster-Whisper loads and transcribes zeros
# ---------------------------------------------------------------------------
def test_whisper_transcribes_silence():
    """FasterWhisperEngine must not raise on 320 samples of silence."""
    try:
        mod = import_subproject_module(ML_SERVICE_DIR, "src.models.asr_whisper")
        FasterWhisperEngine = mod.FasterWhisperEngine
    except ImportError as exc:
        pytest.skip(f"ml-service import failed: {exc}")

    engine = FasterWhisperEngine(model_size="tiny", compute_type="int8", device="cpu")
    silence = np.zeros(320, dtype=np.int16)
    result = engine.transcribe_chunk(silence)
    assert isinstance(result, str), f"Expected str, got {type(result)}"


# ---------------------------------------------------------------------------
# Test 3: Silero VAD processes a 512-sample frame
# ---------------------------------------------------------------------------
def test_vad_processes_frame():
    """SileroVADDetector must process a 512-sample frame and return correct keys."""
    mod = import_subproject_module(ML_SERVICE_DIR, "src.models.vad_silero")
    SileroVADDetector = mod.SileroVADDetector
    FRAME_SAMPLES = mod.FRAME_SAMPLES

    assert FRAME_SAMPLES == 512, f"Frame samples must be 512, got {FRAME_SAMPLES}"

    detector = SileroVADDetector(threshold=0.5, hangover_ms=300)
    frame = np.zeros(FRAME_SAMPLES, dtype=np.int16)
    result = detector.process_frame(frame)

    assert "probability" in result
    assert "is_speaking" in result
    assert "event" in result
    assert isinstance(result["probability"], float)
    assert isinstance(result["is_speaking"], bool)


# ---------------------------------------------------------------------------
# Test 4: Emotion classifier returns valid shape
# ---------------------------------------------------------------------------
def test_emotion_returns_valid_dict():
    """Wav2Vec2EmotionClassifier must return all required keys with correct types."""
    mod = import_subproject_module(ML_SERVICE_DIR, "src.models.emotion_wav2vec2")
    Wav2Vec2EmotionClassifier = mod.Wav2Vec2EmotionClassifier

    classifier = Wav2Vec2EmotionClassifier(ema_alpha=0.3)

    # 1.5 seconds of random audio
    pcm = (np.random.randn(24000) * 1000).astype(np.int16)
    result = classifier.predict_emotion(pcm)

    assert "primary_label" in result
    assert "arousal" in result
    assert "valence" in result
    assert "confidence" in result
    assert isinstance(result["primary_label"], str)
    assert 0.0 <= result["arousal"] <= 1.0, f"arousal out of range: {result['arousal']}"
    assert -1.0 <= result["valence"] <= 1.0, f"valence out of range: {result['valence']}"
    assert result["primary_label"] in {"panic", "angry", "sad", "calm", "neutral"}


# ---------------------------------------------------------------------------
# Test 5: OllamaLLMEngine build_system_prompt (no network needed)
# ---------------------------------------------------------------------------
def test_ollama_engine_builds_prompt():
    """OllamaLLMEngine.build_system_prompt must produce a non-empty string."""
    mod = import_subproject_module(BACKEND_DIR, "src.services.llm_service")
    OllamaLLMEngine = mod.OllamaLLMEngine

    engine = OllamaLLMEngine()
    prompt = engine.build_system_prompt(
        emotion_data={"arousal": 0.8, "valence": -0.6, "primary_label": "panic"},
        fusion_data=None,
        scenario=None,
    )
    assert isinstance(prompt, str) and len(prompt) > 20


# ---------------------------------------------------------------------------
# Test 6: KokoroTTSService calculate_prosody (no model needed)
# ---------------------------------------------------------------------------
def test_kokoro_prosody():
    """KokoroTTSService.calculate_prosody must return correct speeds."""
    mod = import_subproject_module(BACKEND_DIR, "src.services.tts_service")
    KokoroTTSService = mod.KokoroTTSService

    assert KokoroTTSService.calculate_prosody(0.9)["speed"] == 0.88
    assert KokoroTTSService.calculate_prosody(0.2)["speed"] == 1.05
    assert KokoroTTSService.calculate_prosody(0.5)["speed"] == 1.00
