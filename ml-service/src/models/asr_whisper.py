import logging
import numpy as np

logger = logging.getLogger("auralis.asr")


class FasterWhisperEngine:
    """
    Faster-Whisper streaming ASR.
    - Model: 'small' (multilingual — supports English & Hindi)
    - Device: CUDA int8 (falls back to CPU int8 if CUDA unavailable)
    - Lazy-loaded on first transcribe call.
    """

    def __init__(
        self,
        model_size: str = "small",
        compute_type: str = "int8",
        device: str = "cuda",
        language: str | None = None,
    ):
        self.model_size = model_size
        self.compute_type = compute_type
        self.device = device
        self.language = language  # None = auto-detect
        self._model = None

    def _load_model(self):
        if self._model is not None:
            return
        try:
            from faster_whisper import WhisperModel

            logger.info(
                f"Loading Faster-Whisper '{self.model_size}' on {self.device} ({self.compute_type})..."
            )
            self._model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type,
            )
            logger.info("Faster-Whisper model ready")
        except Exception as exc:
            logger.warning(f"Faster-Whisper load failed ({exc}), using stub fallback")
            self._model = "fallback"

    def transcribe_chunk(self, pcm_data: np.ndarray) -> str:
        """
        Transcribe a numpy int16 PCM array at 16kHz.
        Returns the full transcript string.
        """
        self._load_model()

        if self._model == "fallback" or self._model is None:
            return "[ASR unavailable]"

        if pcm_data.size == 0:
            return ""

        audio_float32 = pcm_data.astype(np.float32) / 32768.0

        try:
            segments, info = self._model.transcribe(
                audio_float32,
                beam_size=1,
                language=self.language,
                vad_filter=False,
                condition_on_previous_text=False,
            )
            transcript = " ".join(seg.text.strip() for seg in segments).strip()
            if self.language is None and transcript:
                logger.debug(f"Detected language: {info.language} ({info.language_probability:.2f})")
            return transcript
        except Exception as exc:
            logger.error(f"Whisper transcription error: {exc}")
            return ""
