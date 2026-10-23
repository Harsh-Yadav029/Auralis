import asyncio
import json
import logging
from typing import Callable, Optional
import websockets

logger = logging.getLogger("auralis.ml_client")

class MLAudioClient:
    """Client for streaming raw PCM audio frames to the dedicated ML Audio Microservice."""

    def __init__(self, ws_url: str = "ws://localhost:8001/ws/stream"):
        self.ws_url = ws_url
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.receive_task: Optional[asyncio.Task] = None
        self.on_speech_start: Optional[Callable[[], None]] = None
        self.on_turn_complete: Optional[Callable[[str, dict], asyncio.Future]] = None
        self._running = False

    async def connect(self):
        self._running = True
        try:
            self.ws = await websockets.connect(self.ws_url, ping_interval=20, ping_timeout=10)
            self.receive_task = asyncio.create_task(self._listen_loop())
            logger.info(f"Connected to ML Audio Service at {self.ws_url}")
            return True
        except Exception as e:
            logger.warning(f"Could not connect to ML service at {self.ws_url}: {e}. Standalone fallback active.")
            self.ws = None
            return False

    async def _listen_loop(self):
        try:
            while self._running and self.ws:
                msg = await self.ws.recv()
                data = json.loads(msg)
                event = data.get("event")

                if event == "SPEECH_START":
                    if self.on_speech_start:
                        self.on_speech_start()

                elif event == "TURN_COMPLETE":
                    transcript = data.get("transcript", "")
                    emotion = data.get("emotion", {"primary_label": "neutral", "arousal": 0.5, "valence": 0.0})
                    if self.on_turn_complete:
                        asyncio.create_task(self.on_turn_complete(transcript, emotion))

        except websockets.exceptions.ConnectionClosed:
            logger.info("ML Service WebSocket closed.")
        except Exception as e:
            logger.error(f"Error in ML Client listen loop: {e}")

    def is_connected(self) -> bool:
        if not self.ws:
            return False
        if hasattr(self.ws, "state"):
            from websockets.protocol import State
            return self.ws.state == State.OPEN
        return not getattr(self.ws, "closed", True)

    async def send_pcm_chunk(self, pcm_bytes: bytes):
        if self.is_connected():
            try:
                await self.ws.send(pcm_bytes)
            except Exception as e:
                logger.debug(f"Failed to send PCM chunk to ML service: {e}")

    async def close(self):
        self._running = False
        if self.receive_task:
            self.receive_task.cancel()
        if self.ws:
            try:
                await self.ws.close()
            except Exception:
                pass
            finally:
                self.ws = None
