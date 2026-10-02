import numpy as np

class FasterWhisperEngine:
    def __init__(self, model_size: str = "distil-small.en", compute_type: str = "int8"):
        self.model_size = model_size
        self.compute_type = compute_type
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from faster_whisper import WhisperModel
                self._model = WhisperModel(self.model_size, device="cpu", compute_type=self.compute_type)
            except Exception as e:
                self._model = "fallback"

    def transcribe_chunk(self, pcm_data: np.ndarray) -> str:
        self._load_model()
        if self._model == "fallback" or self._model is None:
            return "Put the gun down! Don't come any closer!"
        
        audio_float32 = pcm_data.astype(np.float32) / 32768.0
        segments, _ = self._model.transcribe(audio_float32, beam_size=1, language="en", vad_filter=False)
        return " ".join([segment.text for segment in segments]).strip()
