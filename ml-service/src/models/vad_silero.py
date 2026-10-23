import logging
import numpy as np

logger = logging.getLogger("auralis.vad")

# Silero VAD v5 requires exactly 512 samples per frame at 16kHz (32ms)
FRAME_SAMPLES = 512
FRAME_BYTES = FRAME_SAMPLES * 2  # int16 LE = 2 bytes/sample


class SileroVADDetector:
    """
    Real Silero VAD v5 loaded via torch.hub.
    Frame size: 512 samples (32ms) at 16kHz.
    Cached after first download to ~/.cache/torch/hub.
    """

    def __init__(self, threshold: float = 0.5, hangover_ms: int = 300):
        self.threshold = threshold
        # hangover in 32ms frames
        self.hangover_frames = max(1, int(hangover_ms / 32))
        self.silence_counter = 0
        self.is_speaking = False
        self._model = None
        self._utils = None
        self._load_model()

    def _load_model(self):
        try:
            import torch

            self._model, self._utils = torch.hub.load(
                repo_or_dir="snakers4/silero-vad",
                model="silero_vad",
                force_reload=False,
                trust_repo=True,
            )
            self._model.eval()
            logger.info("Silero VAD v5 loaded via torch.hub")
        except Exception as exc:
            logger.warning(f"Silero torch.hub load failed, falling back to energy VAD: {exc}")
            self._model = None

    def _energy_fallback(self, frame_pcm16: np.ndarray) -> float:
        """RMS-energy fallback when torch unavailable."""
        rms = float(np.sqrt(np.mean(frame_pcm16.astype(np.float32) ** 2)))
        return min(max((rms - 200.0) / 3000.0, 0.0), 1.0)

    def process_frame(self, frame_pcm16: np.ndarray) -> dict:
        """
        Evaluate a 512-sample (32ms) 16kHz PCM16 frame.
        Returns: {probability, is_speaking, event}
        event is "SPEECH_START" | "SPEECH_END" | None
        """
        if frame_pcm16.size == 0:
            return {"probability": 0.0, "is_speaking": self.is_speaking, "event": None}

        # Pad/truncate to exactly FRAME_SAMPLES
        if frame_pcm16.size < FRAME_SAMPLES:
            frame_pcm16 = np.pad(frame_pcm16, (0, FRAME_SAMPLES - frame_pcm16.size))
        else:
            frame_pcm16 = frame_pcm16[:FRAME_SAMPLES]

        if self._model is not None:
            try:
                import torch

                audio_tensor = torch.from_numpy(
                    frame_pcm16.astype(np.float32) / 32768.0
                ).unsqueeze(0)
                with torch.no_grad():
                    speech_prob = float(self._model(audio_tensor, 16000).item())
            except Exception as exc:
                logger.debug(f"Silero inference error, using energy fallback: {exc}")
                speech_prob = self._energy_fallback(frame_pcm16)
        else:
            speech_prob = self._energy_fallback(frame_pcm16)

        event = None
        if speech_prob >= self.threshold:
            self.silence_counter = 0
            if not self.is_speaking:
                self.is_speaking = True
                event = "SPEECH_START"
        else:
            if self.is_speaking:
                self.silence_counter += 1
                if self.silence_counter >= self.hangover_frames:
                    self.is_speaking = False
                    self.silence_counter = 0
                    event = "SPEECH_END"

        return {
            "probability": round(speech_prob, 4),
            "is_speaking": self.is_speaking,
            "event": event,
        }

    def reset(self):
        """Reset state between sessions."""
        self.is_speaking = False
        self.silence_counter = 0
        if self._model is not None:
            try:
                self._model.reset_states()
            except Exception:
                pass
