import os
import json
import asyncio
import numpy as np
import websockets
from src.config import settings

class CartesiaTTSService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.cartesia_api_key or os.getenv("CARTESIA_API_KEY", "")
        self.ws_url = f"wss://api.cartesia.ai/tts/websocket?api_key={self.api_key}&v=2024-06-10"

    def calculate_prosody(self, emotion_arousal: float) -> dict:
        """
        Dynamically modulates speech pacing based on trainee emotional state.
        When trainee is panicking (high arousal > 0.75), AI speaks slower and deeper
        (speed: 0.88x) to ground and calm the room.
        When trainee is hesitant/disengaged (< 0.3), AI speaks with crisp pacing (1.05x).
        """
        if emotion_arousal >= 0.75:
            # Calming, grounding cadence
            return {"speed": 0.88, "emotion": ["calm:highest"]}
        elif emotion_arousal <= 0.30:
            # Engaging, attentive cadence
            return {"speed": 1.05, "emotion": ["positivity:high"]}
        else:
            return {"speed": 1.00, "emotion": ["neutral"]}

    async def stream_speech(self, text_clause: str, emotion_arousal: float, audio_callback):
        if not self.api_key:
            # Fallback mock audio generation (1 second silent/sine PCM frame) if API key missing in test
            samples = int(16000 * 0.5)
            mock_pcm = (np.sin(2 * np.pi * 440 * np.linspace(0, 0.5, samples)) * 3000).astype(np.int16)
            await audio_callback(mock_pcm)
            return

        prosody = self.calculate_prosody(emotion_arousal)

        async with websockets.connect(self.ws_url) as ws:
            request = {
                "model_id": "sonic-english",
                "transcript": text_clause,
                "voice": {
                    "mode": "id",
                    "id": "a0e17861-1792-4174-a5d6-f62071636709",
                    "__experimental_controls": {
                        "speed": prosody["speed"],
                        "emotion": prosody["emotion"]
                    }
                },
                "output_format": {
                    "container": "raw",
                    "encoding": "pcm_s16le",
                    "sample_rate": 16000
                }
            }
            await ws.send(json.dumps(request))


            while True:
                response = await ws.recv()
                msg = json.loads(response)
                if msg.get("type") == "chunk":
                    raw_bytes = bytes.fromhex(msg["data"])
                    pcm16_array = np.frombuffer(raw_bytes, dtype=np.int16)
                    await audio_callback(pcm16_array)
                elif msg.get("type") == "done":
                    break
