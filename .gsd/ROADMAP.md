# ROADMAP.md — Auralis Execution Plan

> **Status**: `IN_PROGRESS`

## Milestones

### Milestone 1: Microservice Foundation & WebRTC Infrastructure [DONE]
- [x] Phase 1.1: Backend WebRTC Gateway (`backend/`) setup with FastAPI, `aiortc`, signaling, and 48kHz->16kHz PCM audio resampler.
- [x] Phase 1.2: ML Microservice (`ml-service/`) setup with Faster-Whisper ASR, Wav2Vec2 Emotion Classifier, and Silero VAD.

### Milestone 2: Context Engine & Streaming Pipeline Integration [DONE]
- [x] Phase 2.1: Groq LLM Context Engine (`llm_service.py`) with dynamic system prompt emotion injection.
- [x] Phase 2.2: Cartesia Sonic Streaming TTS WebSocket client (`tts_service.py`) and WebRTC Outbound track integration.
- [x] Phase 2.3: Async Orchestrator (`state_manager.py`) with sub-150ms full-duplex barge-in cancellation logic.
- [x] Phase 2.4: MLAudioClient WebSocket bridge — backend streams live PCM frames to ml-service /ws/stream in real-time.

### Milestone 3: Frontend Web App & Telemetry HUD [DONE - Core]
- [x] Phase 3.1: React + Vite application (`frontend/`) with real AuralisWebRTCClient service, live mic capture, and WebRTC signaling.
- [x] Phase 3.2: Live Web Audio API AnalyserNode canvas visualizers for mic and AI streams; Emotion Meter; Latency HUD; status notice banner.

### Milestone 4: Advanced Intelligence Layer [DONE]
- [x] Phase 4.1: FBI BCSM tactical scoring engine (Active Listening -> Empathy -> Rapport -> Influence -> Behavioral Change).
- [x] Phase 4.2: Dual-stream emotion fusion (acoustic Arousal vs semantic LLM Valence discrepancy detection).
- [x] Phase 4.3: Emotion-conditioned TTS prosody (cadence and pitch F0 modulation based on trainee arousal).
- [x] Phase 4.4: Multi-scenario incident selector (Hostage / Bridge Jumper / Cyber Extortion).

### Milestone 5: Production Infrastructure & Benchmarking [DONE]
- [x] Phase 5.1: Docker Compose environment, multi-stage GPU Dockerfiles, and Coturn TURN server config.
- [x] Phase 5.2: End-to-end TTFA latency measurement harness and automated test suite.
