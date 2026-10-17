import asyncio
import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from aiortc.sdp import candidate_from_sdp

from src.config import settings
from src.services.webrtc_service import CustomOutboundAudioTrack, resample_to_16k
from src.services.state_manager import Orchestrator
from src.services.llm_service import GroqContextEngine
from src.services.tts_service import CartesiaTTSService
from src.services.ml_client import MLAudioClient
from src.services.scoring_service import BCSMScorer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("auralis.gateway")

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_engine = GroqContextEngine()
tts_engine = CartesiaTTSService()
bcsm_scorer = BCSMScorer()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name}

@app.websocket("/ws/signaling")
async def signaling_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebRTC Signaling Client Connected")
    
    pc = RTCPeerConnection()
    outbound_track = CustomOutboundAudioTrack()
    pc.addTrack(outbound_track)

    orchestrator = Orchestrator(outbound_track=outbound_track, websocket=websocket)
    orchestrator.bcsm_scorer = bcsm_scorer

    
    # Establish connection to ML Audio Microservice
    ws_ml_url = settings.ml_service_url.replace("http://", "ws://").replace("https://", "wss://").rstrip("/") + "/ws/stream"
    ml_client = MLAudioClient(ws_url=ws_ml_url)
    ml_client.on_speech_start = lambda: orchestrator.handle_barge_in()
    ml_client.on_turn_complete = lambda text, emo: orchestrator.process_user_turn(text, emo, llm_engine, tts_engine)
    await ml_client.connect()

    inbound_audio_task = None

    @pc.on("datachannel")
    def on_datachannel(channel):
        orchestrator.data_channel = channel

    @pc.on("track")
    def on_track(track):
        nonlocal inbound_audio_task
        if track.kind == "audio":
            logger.info("Microphone audio track received from browser — streaming to ML Engine")
            
            async def process_inbound_audio():
                try:
                    while True:
                        frame = await track.recv()
                        pcm16 = resample_to_16k(frame)
                        if pcm16.size > 0:
                            await ml_client.send_pcm_chunk(pcm16.tobytes())
                except asyncio.CancelledError:
                    pass
                except Exception as e:
                    logger.debug(f"Inbound audio loop finished: {e}")

            inbound_audio_task = asyncio.create_task(process_inbound_audio())

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "offer":
                offer = RTCSessionDescription(sdp=message["sdp"], type=message["type"])
                await pc.setRemoteDescription(offer)
                answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                
                await websocket.send_text(json.dumps({
                    "type": "answer",
                    "sdp": pc.localDescription.sdp
                }))

            elif message["type"] == "candidate":
                candidate_info = message["candidate"]
                cand_str = candidate_info.get("candidate")
                if cand_str:
                    candidate = candidate_from_sdp(cand_str)
                    candidate.sdpMid = candidate_info.get("sdpMid")
                    candidate.sdpMLineIndex = candidate_info.get("sdpMLineIndex")
                    await pc.addIceCandidate(candidate)

            elif message["type"] == "user_turn":
                # Handle direct turn request from testing harness or simulated UI actions
                transcript = message.get("transcript", "")
                emotion = message.get("emotion", {"arousal": 0.85, "valence": -0.7, "primary_label": "panic"})
                await orchestrator.process_user_turn(transcript, emotion, llm_engine, tts_engine)

            elif message["type"] == "barge_in":
                orchestrator.handle_barge_in()

    except WebSocketDisconnect:
        logger.info("Signaling Client Disconnected")
    finally:
        if inbound_audio_task and not inbound_audio_task.done():
            inbound_audio_task.cancel()
        await ml_client.close()
        await pc.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)

