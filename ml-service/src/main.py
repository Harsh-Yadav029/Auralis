import asyncio
import base64
import json
import logging
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.config import settings
from src.models.vad_silero import SileroVADDetector
from src.models.asr_whisper import FasterWhisperEngine
from src.models.emotion_wav2vec2 import Wav2Vec2EmotionClassifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("auralis.ml_service")

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances for shared inference
asr_engine = FasterWhisperEngine(model_size=settings.whisper_model, compute_type=settings.compute_type)
emotion_classifier = Wav2Vec2EmotionClassifier()

class ProcessAudioRequest(BaseModel):
    pcm16_base64: str = ""

@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}

@app.post("/api/v1/process-audio")
async def process_audio(request: ProcessAudioRequest):
    if not request.pcm16_base64:
        return {"transcript": "", "emotion": {"primary_label": "neutral", "arousal": 0.5, "valence": 0.0}}
    
    raw_bytes = base64.b64decode(request.pcm16_base64)
    pcm_data = np.frombuffer(raw_bytes, dtype=np.int16)
    
    transcript = await asyncio.to_thread(asr_engine.transcribe_chunk, pcm_data)
    emotion = await asyncio.to_thread(emotion_classifier.predict_emotion, pcm_data)
    
    return {
        "status": "ok",
        "transcript": transcript,
        "emotion": emotion
    }

@app.websocket("/ws/stream")
async def websocket_audio_stream(websocket: WebSocket):
    """
    Real-time bi-directional audio stream:
    Accepts raw 16kHz mono PCM16 bytes.
    Performs frame-by-frame VAD, detects speech boundaries,
    and returns SPEECH_START and TURN_COMPLETE events.
    """
    await websocket.accept()
    logger.info("ML Audio Streaming Client connected")
    
    vad_detector = SileroVADDetector(threshold=settings.vad_threshold, hangover_ms=settings.hangover_ms)
    byte_buffer = bytearray()
    speech_frames = []
    
    FRAME_SAMPLES = 480  # 30ms at 16kHz
    FRAME_BYTES = FRAME_SAMPLES * 2  # 16-bit signed LE PCM (2 bytes/sample)

    try:
        while True:
            message = await websocket.receive()
            
            # Binary frame receiving (raw PCM)
            if "bytes" in message and message["bytes"]:
                byte_buffer.extend(message["bytes"])
                
                # Process full 30ms frames
                while len(byte_buffer) >= FRAME_BYTES:
                    chunk = bytes(byte_buffer[:FRAME_BYTES])
                    del byte_buffer[:FRAME_BYTES]
                    
                    pcm_frame = np.frombuffer(chunk, dtype=np.int16)
                    vad_result = vad_detector.process_frame(pcm_frame)
                    
                    # 1. Instant speech start detection (triggers barge-in at Gateway)
                    if vad_result["event"] == "SPEECH_START":
                        speech_frames = [pcm_frame]
                        await websocket.send_text(json.dumps({
                            "event": "SPEECH_START",
                            "probability": vad_result["probability"]
                        }))
                    
                    elif vad_result["is_speaking"]:
                        speech_frames.append(pcm_frame)
                        
                    # 2. Utterance completion (triggers Whisper ASR & Wav2Vec2 SER)
                    elif vad_result["event"] == "SPEECH_END":
                        if speech_frames:
                            audio_pcm = np.concatenate(speech_frames)
                            speech_frames = []
                            
                            # Ignore micro-blips under 200ms (3200 samples)
                            if len(audio_pcm) >= 3200:
                                await websocket.send_text(json.dumps({"event": "PROCESSING"}))
                                
                                transcript = await asyncio.to_thread(asr_engine.transcribe_chunk, audio_pcm)
                                emotion = await asyncio.to_thread(emotion_classifier.predict_emotion, audio_pcm)
                                
                                await websocket.send_text(json.dumps({
                                    "event": "TURN_COMPLETE",
                                    "transcript": transcript,
                                    "emotion": emotion,
                                    "duration_ms": round(len(audio_pcm) / 16.0, 1)
                                }))
            
            # Text control commands
            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    if payload.get("type") == "RESET":
                        byte_buffer.clear()
                        speech_frames.clear()
                        vad_detector = SileroVADDetector(threshold=settings.vad_threshold, hangover_ms=settings.hangover_ms)
                    elif payload.get("type") == "PING":
                        await websocket.send_text(json.dumps({"type": "PONG"}))
                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        logger.info("ML Audio Streaming Client disconnected")
    except Exception as e:
        logger.error(f"Error in ML Audio Streaming: {e}", exc_info=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8001, reload=True)
