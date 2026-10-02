import asyncio
import logging

logger = logging.getLogger("auralis.orchestrator")

class Orchestrator:
    def __init__(self, outbound_track, data_channel=None):
        self.outbound_track = outbound_track
        self.data_channel = data_channel
        self.current_task: asyncio.Task = None
        self.state = "IDLE"

    def handle_barge_in(self):
        """Instant interrupt trigger upon VAD speech detection during AI turn."""
        if self.state in ["THINKING", "SPEAKING"]:
            logger.info("Barge-in detected! Halting generation...")
            if self.current_task and not self.current_task.done():
                self.current_task.cancel()
            
            # Flush outbound WebRTC audio queue
            self.outbound_track.clear()
            self.state = "INTERRUPTED"
            
            # Send control event to frontend
            if self.data_channel and self.data_channel.readyState == "open":
                self.data_channel.send('{"event": "STATE_CHANGE", "state": "INTERRUPTED"}')

    async def process_user_turn(self, transcript: str, emotion_data: dict, llm_engine, tts_engine):
        self.state = "THINKING"
        
        async def turn_pipeline():
            async for clause in llm_engine.stream_deescalation_response(transcript, emotion_data, []):
                self.state = "SPEAKING"
                await tts_engine.stream_speech(clause, emotion_data.get("arousal", 0.5), self.outbound_track.add_pcm_chunk)
            self.state = "IDLE"

        self.current_task = asyncio.create_task(turn_pipeline())
        try:
            await self.current_task
        except asyncio.CancelledError:
            logger.info("Pipeline task cancelled cleanly.")
            self.state = "IDLE"
