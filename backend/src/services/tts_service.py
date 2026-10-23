import asyncio
import logging
import numpy as np

logger = logging.getLogger("auralis.tts")

# kokoro-onnx outputs at 24kHz; gateway resamples to 48kHz for WebRTC
_KOKORO_SAMPLE_RATE = 24000

# HuggingFace repo for Kokoro ONNX model files
_HF_REPO = "hexgrad/Kokoro-82M"
_MODEL_FILE = "kokoro-v1_0.onnx"
_VOICES_FILE = "voices.bin"

# Map internal voice names to kokoro-onnx voice IDs
_VOICE_MAP = {
    "af_sarah": "af_sarah",
    "af_bella": "af_bella",
    "hi_female": "hf_alpha",  # closest Hindi female in kokoro v1
}


class KokoroTTSService:
    """
    Local Kokoro TTS using kokoro-onnx (Python 3.13 compatible).
    Model files are auto-downloaded once from HuggingFace and cached.
    Outputs 24kHz float32 → converted to 16kHz int16 for WebRTC pipeline.
    """

    def __init__(
        self,
        voice_en: str = "af_sarah",
        voice_hi: str = "af_sarah",
        device: str = "cuda",  # kokoro-onnx uses onnxruntime; device hint ignored
        lang: str = "en",
    ):
        self.voice_en = _VOICE_MAP.get(voice_en, voice_en)
        self.voice_hi = _VOICE_MAP.get(voice_hi, "hf_alpha")
        self.lang = lang
        self._kokoro = None
        self._load_model()

    def _download_model_files(self) -> tuple[str, str]:
        """Download kokoro ONNX model + voices from HF Hub (cached after first run)."""
        from huggingface_hub import hf_hub_download

        model_path = hf_hub_download(repo_id=_HF_REPO, filename=_MODEL_FILE)
        voices_path = hf_hub_download(repo_id=_HF_REPO, filename=_VOICES_FILE)
        return model_path, voices_path

    def _load_model(self):
        try:
            from kokoro_onnx import Kokoro

            logger.info("Downloading / loading Kokoro ONNX model (first run may take ~30s)...")
            model_path, voices_path = self._download_model_files()
            self._kokoro = Kokoro(model_path=model_path, voices_path=voices_path)
            logger.info("Kokoro TTS ready (kokoro-onnx)")
        except ImportError:
            logger.warning("kokoro-onnx not installed; TTS will use silence fallback")
            self._kokoro = None
        except Exception as exc:
            logger.warning(f"Kokoro load failed ({exc}); using silence fallback")
            self._kokoro = None

    def _voice_for_lang(self) -> str:
        return self.voice_en if self.lang == "en" else self.voice_hi

    def _lang_code(self) -> str:
        return "en-us" if self.lang == "en" else "hi"

    @staticmethod
    def calculate_prosody(emotion_arousal: float) -> dict:
        """
        Map trainee arousal to AI speech speed.
        High arousal (panicking) → slow calming cadence.
        Low arousal (disengaged) → slightly faster engaging pace.
        """
        if emotion_arousal >= 0.75:
            return {"speed": 0.88}
        elif emotion_arousal <= 0.30:
            return {"speed": 1.05}
        return {"speed": 1.00}

    @staticmethod
    def _resample_to_16k(audio_24k: np.ndarray) -> np.ndarray:
        """Downsample 24kHz float32 → 16kHz int16."""
        ratio = 16000 / _KOKORO_SAMPLE_RATE  # = 2/3
        n_out = int(len(audio_24k) * ratio)
        if n_out <= 0:
            return np.zeros(0, dtype=np.int16)
        x_old = np.linspace(0, 1, len(audio_24k))
        x_new = np.linspace(0, 1, n_out)
        resampled = np.interp(x_new, x_old, audio_24k)
        return (resampled * 32767).clip(-32768, 32767).astype(np.int16)

    async def stream_speech(self, text_clause: str, emotion_arousal: float, audio_callback) -> None:
        """
        Synthesise text_clause and stream PCM int16 chunks to audio_callback.
        Falls back to 0.3s silence if model unavailable.
        """
        if not text_clause.strip():
            return

        if self._kokoro is None:
            samples = int(16000 * 0.3)
            await audio_callback(np.zeros(samples, dtype=np.int16))
            return

        prosody = self.calculate_prosody(emotion_arousal)
        voice = self._voice_for_lang()
        lang = self._lang_code()

        def _synthesize():
            audio, _sr = self._kokoro.create(
                text=text_clause,
                voice=voice,
                speed=prosody["speed"],
                lang=lang,
            )
            return audio

        try:
            audio_float = await asyncio.to_thread(_synthesize)
            pcm16 = self._resample_to_16k(audio_float)
            # Stream in ~20ms chunks (320 samples at 16kHz)
            chunk_size = 320
            for i in range(0, len(pcm16), chunk_size):
                await audio_callback(pcm16[i : i + chunk_size])
        except Exception as exc:
            logger.error(f"Kokoro synthesis error: {exc}")
            await audio_callback(np.zeros(320, dtype=np.int16))
