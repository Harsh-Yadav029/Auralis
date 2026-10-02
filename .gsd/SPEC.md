# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Auralis is a real-time, bi-directional voice-to-voice emotion engine for crisis negotiation training. It bypasses conventional 3-5 second STT → LLM → TTS latencies by combining WebRTC audio streaming, streaming ASR (Faster-Whisper), acoustic emotion extraction (Wav2Vec2), fast cloud LLM inference (Groq Llama 3), and streaming voice synthesis (Cartesia) to achieve sub-800ms Time-to-First-Audio (TTFA) with full-duplex barge-in capability.

## Goals
1. **Sub-800ms TTFA (p50):** Stream first audio byte to browser within 800ms of user silence.
2. **Acoustic Emotion Fusion:** Extract speaker Arousal/Valence metrics in real-time and condition de-escalation system prompts.
3. **Full-Duplex Barge-in:** Instantly halt (<150ms) AI TTS playback and LLM generation upon user speech detection.
4. **Microservices Architecture:** Modular backend structure (`auralis-web`, `auralis-gateway`, `auralis-ml-service`).

## Non-Goals (Out of Scope)
- PSTN / SIP telephony integration (focus is WebRTC browser clients).
- On-device mobile app deployment (focus is modern web application).

## Constraints
- WebRTC Opus audio capture (48kHz resampled to 16kHz PCM for ML models).
- GPU execution for ASR & Emotion microservice (NVIDIA CUDA 12.2+).
- Python 3.11 async event loop + React TypeScript frontend.

## Success Criteria
- [x] WebRTC bi-directional audio streaming with Coturn TURN relay fallback.
- [x] Streaming STT partial hypothesis under 200ms.
- [x] Groq LLM TTFT under 100ms.
- [x] Sub-150ms barge-in halt latency.
- [x] Live waveform visualizer and Emotion HUD in React UI.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| WebRTC Audio Gateway | Must-have | FastAPI + aiortc media tracks |
| Streaming ASR Engine | Must-have | Faster-Whisper int8 CTranslate2 |
| Acoustic Emotion Model | Must-have | Wav2Vec2 ONNX (Arousal & Valence) |
| Streaming LLM Engine | Must-have | Groq API (Llama 3.1 8B Instant) |
| Streaming TTS Engine | Must-have | Cartesia Sonic WebSocket API |
| React UI & HUD | Must-have | Vite + TypeScript + Web Audio API |
