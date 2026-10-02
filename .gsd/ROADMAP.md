# ROADMAP.md — Auralis Execution Plan

> **Status**: `IN_PROGRESS`

## Milestones

### Milestone 1: Microservice Foundation & WebRTC Infrastructure
- [ ] Phase 1.1: Backend WebRTC Gateway (`backend/`) setup with FastAPI, `aiortc`, signaling, and 48kHz->16kHz PCM audio resampler.
- [ ] Phase 1.2: ML Microservice (`ml-service/`) setup with Faster-Whisper ASR, Wav2Vec2 Emotion Classifier, and Silero VAD.

### Milestone 2: Context Engine & Streaming Pipeline Integration
- [ ] Phase 2.1: Groq LLM Context Engine (`llm_service.py`) with dynamic system prompt emotion injection.
- [ ] Phase 2.2: Cartesia Sonic Streaming TTS WebSocket client (`tts_service.py`) and WebRTC Outbound track integration.
- [ ] Phase 2.3: Async Orchestrator (`state_manager.py`) with sub-150ms full-duplex barge-in cancellation logic.

### Milestone 3: Frontend Web App & Telemetry HUD
- [ ] Phase 3.1: React + Vite application (`frontend/`) with WebRTC Client service, Audio Constraints, and Signaling.
- [ ] Phase 3.2: Interactive Waveform Visualizer canvas, 2D Emotion Meter, and Latency HUD components.

### Milestone 4: Production Infrastructure & Benchmarking
- [ ] Phase 4.1: Docker Compose environment, multi-stage GPU Dockerfiles, and Coturn TURN server config.
- [ ] Phase 4.2: Latency measurement harness and automated test suite.
