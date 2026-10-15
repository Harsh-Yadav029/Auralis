import asyncio
import json
import logging
import time

logger = logging.getLogger("auralis.orchestrator")

class Orchestrator:
    def __init__(self, outbound_track, data_channel=None, websocket=None):
        self.outbound_track = outbound_track
        self.data_channel = data_channel
        self.websocket = websocket
        self.current_task: asyncio.Task = None
        self.state = "IDLE"

    def emit_event(self, event_name: str, payload: dict = None):
        """Dispatches real-time telemetry events to the frontend via WebRTC DataChannel and WebSocket."""
        data = {"event": event_name}
        if payload:
            data.update(payload)
        msg_str = json.dumps(data)

        # 1. Primary: WebRTC DataChannel
        if self.data_channel and getattr(self.data_channel, "readyState", "") == "open":
            try:
                self.data_channel.send(msg_str)
            except Exception as e:
                logger.debug(f"DataChannel send failed: {e}")

        # 2. Secondary fallback: WebSocket signaling channel
        if self.websocket:
            try:
                asyncio.create_task(self.websocket.send_text(msg_str))
            except Exception as e:
                logger.debug(f"WebSocket send failed: {e}")

    def handle_barge_in(self):
        """Instant interrupt trigger upon VAD speech detection during AI turn."""
        if self.state in ["THINKING", "SPEAKING"]:
            logger.info("Barge-in detected! Halting AI generation in sub-150ms...")
            if self.current_task and not self.current_task.done():
                self.current_task.cancel()
            
            # Flush outbound WebRTC audio queue
            self.outbound_track.clear()
            self.state = "INTERRUPTED"
            self.emit_event("STATE_CHANGE", {"state": "INTERRUPTED"})

    async def process_user_turn(self, transcript: str, emotion_data: dict, llm_engine, tts_engine):
        if not transcript.strip():
            return
            
        self.state = "THINKING"
        self.emit_event("STATE_CHANGE", {"state": "THINKING"})
        self.emit_event("TRANSCRIPT", {"text": transcript})
        self.emit_event("EMOTION", {
            "arousal": emotion_data.get("arousal", 0.5),
            "valence": emotion_data.get("valence", 0.0),
            "label": emotion_data.get("primary_label", "neutral")
        })
        
        t_start = time.perf_counter()
        first_audio_emitted = False

        async def turn_pipeline():
            nonlocal first_audio_emitted
            async for clause in llm_engine.stream_deescalation_response(transcript, emotion_data, []):
                self.emit_event("AI_TEXT", {"text": clause})
                
                async def on_audio_chunk(pcm_chunk):
                    nonlocal first_audio_emitted
                    if not first_audio_emitted:
                        ttfa_ms = (time.perf_counter() - t_start) * 1000
                        logger.info(f"Time-to-First-Audio (TTFA): {ttfa_ms:.1f}ms")
                        self.emit_event("LATENCY", {"ttfa": round(ttfa_ms, 1)})
                        first_audio_emitted = True
                        self.state = "SPEAKING"
                        self.emit_event("STATE_CHANGE", {"state": "SPEAKING"})
                    
                    await self.outbound_track.add_pcm_chunk(pcm_chunk)

                await tts_engine.stream_speech(clause, emotion_data.get("arousal", 0.5), on_audio_chunk)
            
            self.state = "IDLE"
            self.emit_event("STATE_CHANGE", {"state": "IDLE"})

        self.current_task = asyncio.create_task(turn_pipeline())
        try:
            await self.current_task
        except asyncio.CancelledError:
            logger.info("Pipeline task cancelled cleanly due to barge-in.")
            self.state = "IDLE"
            self.emit_event("STATE_CHANGE", {"state": "IDLE"})

