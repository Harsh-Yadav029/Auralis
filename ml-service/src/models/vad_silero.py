import numpy as np

class SileroVADDetector:
    def __init__(self, threshold: float = 0.6, hangover_ms: int = 250):
        self.threshold = threshold
        self.hangover_frames = int(hangover_ms / 30)
        self.silence_counter = 0
        self.is_speaking = False

    def process_frame(self, frame_pcm16: np.ndarray) -> dict:
        """Evaluates a 30ms 16kHz PCM audio frame (480 samples)."""
        if frame_pcm16.size == 0:
            return {"probability": 0.0, "is_speaking": self.is_speaking, "event": None}

        # Energy-based VAD estimation for low-overhead framing
        rms = float(np.sqrt(np.mean(frame_pcm16.astype(np.float32) ** 2)))
        speech_prob = min(max((rms - 200.0) / 3000.0, 0.0), 1.0)

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
                    event = "SPEECH_END"

        return {
            "probability": speech_prob,
            "is_speaking": self.is_speaking,
            "event": event
        }
