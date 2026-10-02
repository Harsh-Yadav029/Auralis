from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np

from src.config import settings
from src.models.vad_silero import SileroVADDetector
from src.models.asr_whisper import FasterWhisperEngine
from src.models.emotion_wav2vec2 import Wav2Vec2EmotionClassifier

app = FastAPI(title=settings.app_name, debug=settings.debug)

vad_detector = SileroVADDetector(threshold=settings.vad_threshold, hangover_ms=settings.hangover_ms)
asr_engine = FasterWhisperEngine(model_size=settings.whisper_model, compute_type=settings.compute_type)
emotion_classifier = Wav2Vec2EmotionClassifier()

class ProcessAudioRequest(BaseModel):
    pcm16_base64: str = ""

@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
