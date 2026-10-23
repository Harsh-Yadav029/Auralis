import logging
import numpy as np

logger = logging.getLogger("auralis.emotion")

# EMA smoothing alpha — controls how fast the running average reacts
_DEFAULT_EMA_ALPHA = 0.3
# Minimum audio for meaningful SER inference (0.5s at 16kHz)
_MIN_SAMPLES = 8000


class Wav2Vec2EmotionClassifier:
    """
    Acoustic Speech Emotion Recognition using audeering Wav2Vec2 dimensional model.
    Outputs continuous Arousal and Valence scores + a categorical label.
    Always runs on CPU to preserve VRAM for Whisper + Ollama.
    EMA smoothing prevents jitter from frame-to-frame noise.
    """

    MODEL_NAME = "audeering/wav2vec2-large-robust-12-ft-emotion-msp-dim"

    def __init__(self, ema_alpha: float = _DEFAULT_EMA_ALPHA):
        self.ema_alpha = ema_alpha
        self._ema_arousal: float | None = None
        self._ema_valence: float | None = None
        self._processor = None
        self._model = None
        self._load_model()

    def _load_model(self):
        try:
            from transformers import AutoProcessor, AutoModelForAudioClassification
            import torch  # noqa: F401 — needed to confirm CPU tensor ops

            logger.info(f"Loading Wav2Vec2 SER model '{self.MODEL_NAME}' on CPU...")
            self._processor = AutoProcessor.from_pretrained(self.MODEL_NAME)
            self._model = AutoModelForAudioClassification.from_pretrained(self.MODEL_NAME)
            self._model.eval()
            logger.info("Wav2Vec2 SER model ready (CPU)")
        except Exception as exc:
            logger.warning(f"Wav2Vec2 load failed ({exc}), using acoustic feature fallback")
            self._model = None
            self._processor = None

    def _acoustic_fallback(self, pcm_data: np.ndarray) -> tuple[float, float]:
        """Energy + spectral variance heuristic when model unavailable."""
        energy = float(np.sqrt(np.mean(pcm_data.astype(np.float32) ** 2)))
        arousal = min(max((energy - 100.0) / 4000.0, 0.1), 1.0)
        valence = -0.6 if arousal > 0.65 else 0.2
        return arousal, valence

    def _apply_ema(self, arousal: float, valence: float) -> tuple[float, float]:
        if self._ema_arousal is None:
            self._ema_arousal = arousal
            self._ema_valence = valence
        else:
            self._ema_arousal = self.ema_alpha * arousal + (1 - self.ema_alpha) * self._ema_arousal
            self._ema_valence = self.ema_alpha * valence + (1 - self.ema_alpha) * self._ema_valence
        return self._ema_arousal, self._ema_valence

    @staticmethod
    def _label_from_scores(arousal: float, valence: float) -> str:
        # Quadrant mapping (Russell's circumplex model)
        if arousal > 0.65 and valence < -0.2:
            return "panic"
        if arousal > 0.65 and valence >= -0.2:
            return "angry"
        if arousal < 0.35 and valence < -0.2:
            return "sad"
        if arousal < 0.35 and valence >= 0.2:
            return "calm"
        return "neutral"

    def predict_emotion(self, pcm_data: np.ndarray) -> dict:
        """
        Predict Arousal/Valence from a 16kHz mono int16 PCM array.
        Returns: {primary_label, arousal, valence, confidence}
        """
        if pcm_data.size == 0:
            return {"primary_label": "neutral", "confidence": 0.5, "arousal": 0.5, "valence": 0.0}

        raw_arousal: float
        raw_valence: float

        if self._model is not None and pcm_data.size >= _MIN_SAMPLES:
            try:
                import torch

                audio_float = pcm_data.astype(np.float32) / 32768.0
                inputs = self._processor(
                    audio_float,
                    sampling_rate=16000,
                    return_tensors="pt",
                    padding=True,
                )
                with torch.no_grad():
                    logits = self._model(**inputs).logits
                # Model outputs [valence, arousal, dominance] — indices per audeering docs
                scores = logits.squeeze().tolist()
                # audeering model: index 0 = valence, 1 = arousal, 2 = dominance
                raw_valence = float(scores[0]) if isinstance(scores, list) else float(scores)
                raw_arousal = float(scores[1]) if isinstance(scores, list) and len(scores) > 1 else 0.5
                # Normalise from [-1,1] → [0,1] for arousal
                raw_arousal = (raw_arousal + 1.0) / 2.0
                confidence = 0.88
            except Exception as exc:
                logger.debug(f"Wav2Vec2 inference error, using fallback: {exc}")
                raw_arousal, raw_valence = self._acoustic_fallback(pcm_data)
                confidence = 0.5
        else:
            raw_arousal, raw_valence = self._acoustic_fallback(pcm_data)
            confidence = 0.5

        arousal, valence = self._apply_ema(raw_arousal, raw_valence)
        label = self._label_from_scores(arousal, valence)

        return {
            "primary_label": label,
            "confidence": round(confidence, 2),
            "arousal": round(arousal, 3),
            "valence": round(valence, 3),
        }

    def reset_ema(self):
        """Reset EMA state between sessions."""
        self._ema_arousal = None
        self._ema_valence = None
