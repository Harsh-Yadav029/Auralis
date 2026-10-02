import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate

from backend.src.config import settings
from backend.src.services.webrtc_service import CustomOutboundAudioTrack
from backend.src.services.state_manager import Orchestrator
from backend.src.services.llm_service import GroqContextEngine
from backend.src.services.tts_service import CartesiaTTSService

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

    orchestrator = Orchestrator(outbound_track=outbound_track)

    @pc.on("datachannel")
    def on_datachannel(channel):
        orchestrator.data_channel = channel

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
                candidate = RTCIceCandidate(
                    sdpMid=candidate_info.get("sdpMid"),
                    sdpMLineIndex=candidate_info.get("sdpMLineIndex"),
                    candidate=candidate_info.get("candidate")
                )
                await pc.addIceCandidate(candidate)

            elif message["type"] == "user_turn":
                # Handle sample turn request from client / testing harness
                transcript = message.get("transcript", "")
                emotion = message.get("emotion", {"arousal": 0.85, "valence": -0.7, "primary_label": "panic"})
                await orchestrator.process_user_turn(transcript, emotion, llm_engine, tts_engine)

            elif message["type"] == "barge_in":
                orchestrator.handle_barge_in()

    except WebSocketDisconnect:
        logger.info("Signaling Client Disconnected")
    finally:
        await pc.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.src.main:app", host="0.0.0.0", port=8000, reload=True)
