<div align="center">

<br/>

<img src="https://img.shields.io/badge/AURALIS-Real--Time%20Voice%20AI-06b6d4?style=for-the-badge&logo=lightning&logoColor=white" alt="Auralis Badge" />

<h1>Auralis — Real-Time Voice-to-Voice Emotion Engine</h1>

<p>
  <strong>A production-grade, sub-800ms full-duplex voice AI architecture for high-stakes Crisis Negotiation Simulation.</strong><br/>
  Combines ultra-low-latency WebRTC streaming, acoustic emotion profiling (Arousal & Valence), Groq LPU LLM inference, and instantaneous barge-in audio playback.
</p>

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-aiortc%201.9-orange?style=flat-square)](https://aiortc.readthedocs.io)
[![Faster-Whisper](https://img.shields.io/badge/ASR-Faster--Whisper%20(int8)-purple?style=flat-square)](https://github.com/SYSTRAN/faster-whisper)
[![Groq LPU](https://img.shields.io/badge/LLM-Groq%20Llama%203.1-f55036?style=flat-square)](https://console.groq.com)
[![Cartesia](https://img.shields.io/badge/TTS-Cartesia%20Sonic%20API-blue?style=flat-square)](https://cartesia.ai)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TS-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📌 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [End-to-End Latency Budget (SLA)](#-end-to-end-latency-budget-sla)
- [System Architecture](#-system-architecture)
- [Microservice Ecosystem](#-microservice-ecosystem)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Environment Configuration](#1-environment-configuration)
  - [2. Microservices Setup & Execution](#2-microservices-setup--execution)
- [Operational Verification & Telemetry](#-operational-verification--telemetry)
- [API & WebSocket Specifications](#-api--websocket-specifications)
- [Crisis Negotiation Domain Logic](#-crisis-negotiation-domain-logic)
- [Roadmap & Development Status](#-roadmap--development-status)
- [License & Contributions](#-license--contributions)

---

## 🧠 Executive Overview

Conversational speech systems frequently rely on cascading REST APIs (`STT → LLM → TTS`), creating **3,000ms–5,000ms latency**. Critically, standard pipelines convert speech to plaintext, stripping the speaker’s pitch, urgency, and distress, making authentic emotional interaction impossible.

**Auralis** rearchitects conversational voice AI into an event-driven, decoupled microservice pipeline:
1. **Low-Latency Ingestion**: Streams client audio over **WebRTC (Opus/UDP)** straight to an async gateway.
2. **Parallel Speech & Emotion Analytics**: Audio frames are fed directly to **Faster-Whisper** and **Wav2Vec2**, yielding transcripts alongside multi-dimensional emotion vectors (`Arousal` & `Valence`).
3. **Adaptive Emotion Conditioning**: The LLM persona (Groq Llama 3.1 8B) dynamically ingests affective cues, tuning its tactical stance in real time.
4. **Sub-150ms Full-Duplex Interruption (Barge-in)**: Cancels downstream TTS generation and clears audio queues immediately when user speech resumes.

---

## ✨ Key Features

- **True Full-Duplex WebRTC Streaming**: Eliminates HTTP polling or monolithic WebSockets using peer-to-peer UDP audio tracks with `aiortc`.
- **Acoustic Emotion Radar**: Calculates Valence (-1.0 to +1.0) and Arousal (0.0 to 1.0) directly from speech sound waves without depending on text sentiment.
- **Sub-150ms Barge-In Cancellation**: Async event triggers abort ongoing LLM tokens and flush outbound audio buffers the millisecond trainee speech starts.
- **Enterprise Crisis Persona Engine**: Pre-configured with tactical de-escalation behavior based on the FBI Behavioral Change Stairway Model (BCSM).
- **60fps Real-Time Audio Telemetry**: React Web Audio API interface measuring live FFT frequency bars, emotional quadrant shifts, and end-to-end TTFA (Time-To-First-Audio).

---

## ⚡ End-to-End Latency Budget (SLA)

| Stage | Component | Typical Latency (p50) | Target SLA |
|:---|:---|:---:|:---:|
| **Audio Ingestion** | WebRTC Opus over UDP | `~20 ms` | `< 30 ms` |
| **VAD Detection** | Silero VAD (30ms chunks + 250ms hangover) | `~80 ms` | `< 100 ms` |
| **Speech-to-Text** | Faster-Whisper `distil-small.en` (int8 CTranslate2) | `~120 ms` | `< 200 ms` |
| **Acoustic Emotion** | Wav2Vec2 ONNX (computed concurrently with ASR) | `~40 ms` (parallel) | `< 60 ms` |
| **LLM Inference** | Groq LPU (Llama 3.1 8B Instant) | `~80 ms` (TTFT) | `< 120 ms` |
| **Streaming Synthesis** | Cartesia Sonic WebSocket API (PCM chunks) | `~150 ms` (TTFB) | `< 200 ms` |
| **Total Turnaround (TTFA)** | **End-to-End Trainee Voice to AI Response** | **~540 ms** | **< 800 ms** ✅ |
| **Barge-in Interruption** | **Outbound Audio Stream Cancellation** | **~112 ms** | **< 150 ms** ✅ |

---

## 🏗️ System Architecture

```
                    ┌───────────────────────────────────────────────┐
                    │               CLIENT BROWSER                  │
                    │   React 18 + TypeScript + Web Audio API       │
                    └───────┬───────────────────────────────▲───────┘
                            │ Raw Mic Audio (Opus/UDP)      │ Remote AI Track (PCM/Opus)
                            ▼                               │
┌───────────────────────────────────────────────────────────┴──────────────────────────┐
│ BACKEND WEBRTC GATEWAY (:8000)                                                       │
│                                                                                      │
│  [ aiortc PeerConnection ] ────► [ 48kHz -> 16kHz PCM Resampler ]                    │
│                                              │                                       │
│                                              ▼ (Raw PCM16 Chunks via WS)             │
│  ┌────────────────────────────────────────────────────────────────────────┐          │
│  │ ML AUDIO MICROSERVICE (:8001)                                          │          │
│  │                                                                        │          │
│  │   [ Silero VAD ] ──────► SPEECH_START (Fires Barge-In Interruption)    │          │
│  │         │                                                              │          │
│  │         ▼ SPEECH_END (Hangover trigger)                                │          │
│  │   ┌─────────────────────────────┬─────────────────────────────┐        │          │
│  │   │ Faster-Whisper ASR (int8)   │ Wav2Vec2 Emotion Classifier │        │          │
│  │   └─────────────┬───────────────┴──────────────┬──────────────┘        │          │
│  │                 ▼                              ▼                       │          │
│  │          { "transcript": "...",         "emotion": { ... } }           │          │
│  └─────────────────┬──────────────────────────────┬───────────────────────┘          │
│                    │                              │                                  │
│                    ▼                              ▼                                  │
│       [ Orchestrator / StateManager ] (Prompt Construction & Turn Lock)              │
│                    │                                                                 │
│                    ▼ (HTTP/REST Streaming)                                           │
│       [ Groq Cloud LPU Engine ] ──► Llama 3.1 8B Emotion-Injected Generation         │
│                    │                                                                 │
│                    ▼ (Chunked Text Stream)                                           │
│       [ Cartesia Sonic WebSocket Client ] ──► Streaming 24kHz / 48kHz Audio Chunks   │
│                    │                                                                 │
│                    ▼ (CustomOutboundAudioTrack)                                      │
└────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Microservice Ecosystem

The architecture is partitioned into 3 isolated services:

| Service | Port | Tech Stack | Primary Responsibility |
|:---|:---:|:---|:---|
| **`frontend/`** | `5173` | React 18, Vite, TypeScript, Tailwind | Trainee negotiation dashboard, WebRTC signaling client, real-time waveform & emotion radar visualizer. |
| **`backend/`** | `8000` | FastAPI, `aiortc`, WebSockets, Groq SDK | Signaling server, WebRTC peer connection manager, pipeline orchestrator, and Cartesia TTS streaming bridge. |
| **`ml-service/`** | `8001` | FastAPI, PyTorch, Faster-Whisper, Transformers | Real-time speech inference, Silero Voice Activity Detection, and Wav2Vec2 Arousal/Valence classifier. |

---

## 📁 Project Directory Structure

```
Auralis/
├── backend/                             # WebRTC Gateway & Pipeline Orchestrator
│   ├── src/
│   │   ├── main.py                      # FastAPI WebRTC signaling, track router & entrypoint
│   │   ├── config.py                    # Environment settings loader (Pydantic Settings)
│   │   └── services/
│   │       ├── webrtc_service.py        # 48kHz->16kHz resampler & CustomOutboundAudioTrack
│   │       ├── ml_client.py             # Persistent WebSocket bridge to ML Audio Service
│   │       ├── llm_service.py           # Groq Llama 3.1 emotion prompt injection client
│   │       ├── tts_service.py           # Cartesia Sonic streaming TTS WebSocket handler
│   │       └── state_manager.py         # Async state orchestrator & <150ms barge-in canceller
│   ├── requirements.txt
│   └── .env                             # Secret API Keys (GROQ_API_KEY, CARTESIA_API_KEY)
│
├── ml-service/                          # Dedicated ML Inference Microservice
│   ├── src/
│   │   ├── main.py                      # WebSocket stream (/ws/stream) & REST inference
│   │   ├── config.py                    # Whisper model size, compute type, VAD parameters
│   │   └── models/
│   │       ├── vad_silero.py            # Silero VAD frame parser & hangover tracker
│   │       ├── asr_whisper.py           # Faster-Whisper int8 CTranslate2 runtime
│   │       └── emotion_wav2vec2.py      # Wav2Vec2 acoustic valence & arousal classifier
│   └── requirements.txt
│
├── frontend/                            # React Trainee Dashboard
│   ├── src/
│   │   ├── App.tsx                      # Dashboard orchestrator & telemetry console
│   │   ├── services/
│   │   │   └── webrtc.service.ts        # Client WebRTC connection & datachannel handlers
│   │   └── components/
│   │       ├── AudioVisualizer.tsx      # 60fps Web Audio API waveform canvas
│   │       ├── EmotionMeter.tsx         # 2D quadrant emotion meter (Arousal vs Valence)
│   │       └── LatencyHUD.tsx           # Live latency gauge (TTFA, VAD, Barge-in)
│   ├── package.json
│   └── vite.config.ts
│
├── infra/                               # Deployment & Infrastructure
│   ├── docker/
│   │   └── docker-compose.yml           # Multi-container local production environment
│   └── coturn/
│       └── turnserver.conf              # STUN/TURN configuration for enterprise NAT traversal
│
├── .gsd/                                # Specification & Development Tracking
│   ├── SPEC.md                          # Architecture specification & SLAs
│   └── ROADMAP.md                       # Phase milestone tracking
│
├── .gitignore                           # Excludes venvs, node_modules, weights, and .env files
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+** & **npm** installed
- Optional: CUDA-compatible GPU (defaults to high-performance CPU int8 execution)

### 1. Environment Configuration

Create `backend/.env` with your API keys:

```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
CARTESIA_API_KEY=sk_car_your_cartesia_api_key_here
```

> **Obtain Credentials**:
> - **Groq Cloud**: [https://console.groq.com](https://console.groq.com) *(Free tier available)*
> - **Cartesia AI**: [https://play.cartesia.ai](https://play.cartesia.ai) *(Sonic voice synthesis)*

---

### 2. Microservices Setup & Execution

Run each service in a dedicated terminal window:

#### Terminal 1: Backend Gateway (`:8000`)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m src.main
```
*Health Check*: `http://localhost:8000/health` → `{"status": "ok"}`

#### Terminal 2: ML Audio Service (`:8001`)
```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m src.main
```
*Health Check*: `http://localhost:8001/health` → `{"status": "ok"}`

#### Terminal 3: Frontend Web Dashboard (`:5173`)
```powershell
cd frontend
npm install
npm run dev
```
*Access UI*: Open **`http://localhost:5173`** in Google Chrome or Microsoft Edge.

---

## 🧪 Operational Verification & Telemetry

1. **Connect**: Click **"Start Simulation"** in the web dashboard and allow microphone access.
2. **Audio Visualizer**: Observe the green waveform bars responding dynamically to your voice.
3. **Voice Activity Detection**:
   - Begin speaking: notice the indicator transitions to `SPEECH_START` and status turns to **Listening**.
   - Stop speaking: after ~250ms silence, `SPEECH_END` fires, forwarding audio to Whisper and Wav2Vec2.
4. **Emotion Detection**:
   - Speak in a stressed or panicked voice: Wav2Vec2 categorizes emotion with high Arousal (>0.75) and negative Valence.
   - The Emotion Radar updates the live coordinate dynamically.
5. **Conversational De-escalation**:
   - Groq injects the emotional metadata into the crisis prompt.
   - Cartesia streams the response via WebRTC with turnaround latency under **800ms**.
6. **Barge-In Interruption**:
   - Interrupt the AI while it is speaking.
   - Inbound VAD detects speech and cancels the playback queue in **< 150ms**.

---

## 📡 API & WebSocket Specifications

### Gateway Signaling WebSocket (`backend:8000`)
- **Endpoint**: `/ws/signaling`
- **Protocol**: SDP Offer/Answer exchange and ICE Candidate negotiation over JSON text frames.

```json
// Example: SDP Offer from Client
{
  "type": "offer",
  "sdp": "v=0\r\no=- 461173... IN IP4 127.0.0.1\r\n..."
}
```

### ML Audio Streaming WebSocket (`ml-service:8001`)
- **Endpoint**: `/ws/stream`
- **Inbound**: Raw 16kHz mono 16-bit PCM binary chunks.
- **Outbound**: JSON status events (`SPEECH_START`, `SPEECH_END`, `TURN_COMPLETE`).

```json
// Example: TURN_COMPLETE Event
{
  "event": "TURN_COMPLETE",
  "transcript": "Calm down, put the weapon on the ground.",
  "emotion": {
    "primary_label": "calm",
    "confidence": 0.92,
    "arousal": 0.51,
    "valence": 0.20
  },
  "duration_ms": 2840.0
}
```

---

## 🎯 Crisis Negotiation Domain Logic

Auralis is calibrated for simulated high-stress crisis scenarios using the **FBI Behavioral Change Stairway Model (BCSM)**:

```
[ Active Listening ] ──► [ Empathy ] ──► [ Rapport ] ──► [ Influence ] ──► [ Behavioral Change ]
```

When a trainee speaks with elevated agitation or panic:
- **Acoustic Profiling**: Arousal is registered directly from pitch variation and energy envelopes.
- **Dynamic System Injection**:
  ```text
  [CRITICAL SITUATIONAL UPDATE]
  Trainee acoustic emotion: PANIC (Arousal: 0.91, Valence: -0.65).
  Tactical Rule: De-escalate immediately. Use short sentences, slow pacing, and grounding questions.
  ```
- **Result**: The simulated subject reflects authentic human psychological de-escalation dynamics rather than scripted dialogue trees.

---

## 🗺️ Roadmap & Development Status

- [x] **Milestone 1**: Microservice Foundation & WebRTC Infrastructure (`aiortc`, 48k→16k Resampling).
- [x] **Milestone 2**: Context Engine & Streaming Pipeline (Faster-Whisper, Wav2Vec2, Groq, Cartesia Sonic).
- [x] **Milestone 3**: Frontend WebRTC Dashboard & Telemetry HUD (Web Audio API, 60fps Visualizer, Emotion Radar).
- [ ] **Milestone 4**: Advanced Intelligence Layer
  - [ ] FBI BCSM 5-stage automated negotiation scorecard.
  - [ ] Dual-stream emotion fusion (text semantic valence vs acoustic prosody discrepancy).
  - [ ] Dynamic TTS prosody modulation (pacing & pitch adaptation to trainee stress).
- [ ] **Milestone 5**: Production Hardening & Docker Swarm / Kubernetes manifests.

---

## 📄 License & Attribution

This project is released under the **MIT License**. Built with high-performance open-source tools: [FastAPI](https://fastapi.tiangolo.com), [aiortc](https://github.com/aiortc/aiortc), [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper), [Transformers](https://github.com/huggingface/transformers), [Groq](https://groq.com), [Cartesia](https://cartesia.ai), and [React](https://react.dev).
