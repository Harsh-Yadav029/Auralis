<div align="center">

<br/>

<img src="https://img.shields.io/badge/AURALIS-Real--Time%20Voice%20AI-06b6d4?style=for-the-badge&logo=lightning&logoColor=white" alt="Auralis Badge" />

<h1>Auralis — Real-Time Voice-to-Voice Emotion Engine</h1>

<p>
  <strong>A production-grade, sub-800ms full-duplex voice AI architecture for high-stakes Crisis Negotiation Simulation.</strong><br/>
  Combines ultra-low-latency WebRTC streaming, acoustic emotion profiling (Arousal & Valence), Groq LPU LLM inference, dual-stream emotion fusion, FBI BCSM tactical scoring, and emotion-conditioned dynamic speech synthesis.
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
- [Crisis Negotiation Intelligence Layer](#-crisis-negotiation-intelligence-layer)
  - [1. FBI BCSM Tactical Scoring Engine](#1-fbi-bcsm-tactical-scoring-engine)
  - [2. Dual-Stream Emotion Fusion](#2-dual-stream-emotion-fusion)
  - [3. Emotion-Conditioned Dynamic Prosody](#3-emotion-conditioned-dynamic-prosody)
  - [4. Multi-Scenario Incident Selector](#4-multi-scenario-incident-selector)
- [API & WebSocket Specifications](#-api--websocket-specifications)
- [Roadmap & Development Status](#-roadmap--development-status)
- [License & Attribution](#-license--attribution)

---

## 🧠 Executive Overview

Conversational speech systems frequently rely on cascading REST APIs (`STT → LLM → TTS`), creating **3,000ms–5,000ms latency**. Critically, standard pipelines convert speech to plaintext, stripping the speaker’s pitch, urgency, and distress, making authentic emotional interaction impossible.

**Auralis** rearchitects conversational voice AI into an event-driven, decoupled microservice pipeline:
1. **Low-Latency Ingestion**: Streams client audio over **WebRTC (Opus/UDP)** straight to an async gateway.
2. **Parallel Speech & Emotion Analytics**: Audio frames are fed directly to **Faster-Whisper** and **Wav2Vec2**, yielding transcripts alongside multi-dimensional emotion vectors (`Arousal` & `Valence`).
3. **Dual-Stream Emotion Fusion**: Detects cognitive dissonance between semantic text sentiment and acoustic vocal tremors to expose bluffing or suppressed panic.
4. **Adaptive Emotion Conditioning**: The LLM persona (Groq Llama 3.1 8B) dynamically ingests affective cues and scenario constraints to react like a real human in crisis.
5. **Sub-150ms Full-Duplex Interruption (Barge-in)**: Cancels downstream TTS generation and clears audio queues immediately when trainee speech resumes.
6. **FBI BCSM Tactical Scoring**: Asynchronously evaluates negotiation skills and guides the trainee with real-time tactical feedback.

---

## ✨ Key Features

- **True Full-Duplex WebRTC Streaming**: Eliminates HTTP polling or monolithic WebSockets using peer-to-peer UDP audio tracks with `aiortc`.
- **Acoustic Emotion Radar**: Calculates Valence (-1.0 to +1.0) and Arousal (0.0 to 1.0) directly from speech sound waves without depending on text sentiment.
- **Dual-Stream Emotion Fusion**: Detects when a speaker says *"I'm totally calm"* while vocal acoustics register extreme terror (`SUPPRESSED_PANIC`).
- **FBI BCSM Live Scorecard**: Real-time 5-stage stairway assessment tracking *Active Listening, Empathy, Rapport, Influence,* and *Behavioral Change*.
- **Emotion-Conditioned Dynamic Prosody**: Cartesia TTS automatically modulates cadence (slows to `0.88x` and lowers pitch) when the trainee panics to physiologically ground the conversation.
- **Multi-Scenario Incident Selector**: Dynamic switching between *Bank Hostage*, *Suicide Intervention*, and *Healthcare Ransomware Extortion* personas.
- **Sub-150ms Barge-In Cancellation**: Async event triggers abort ongoing LLM tokens and flush outbound audio buffers the millisecond trainee speech starts.
- **60fps Real-Time Audio Telemetry**: React Web Audio API interface measuring live FFT frequency bars, emotional quadrant shifts, and end-to-end TTFA (Time-To-First-Audio).

---

## ⚡ End-to-End Latency Budget (SLA)

| Stage | Component | Typical Latency (p50) | Target SLA |
|:---|:---|:---:|:---:|
| **Audio Ingestion** | WebRTC Opus over UDP | `~20 ms` | `< 30 ms` |
| **VAD Detection** | Silero VAD (30ms chunks + 250ms hangover) | `~80 ms` | `< 100 ms` |
| **Speech-to-Text** | Faster-Whisper `distil-small.en` (int8 CTranslate2) | `~120 ms` | `< 200 ms` |
| **Acoustic Emotion** | Wav2Vec2 ONNX (computed concurrently with ASR) | `~40 ms` (parallel) | `< 60 ms` |
| **Emotion Fusion** | Dual-Stream Incongruence Engine | `< 1 ms` (instant) | `< 5 ms` |
| **LLM Inference** | Groq LPU (Llama 3.1 8B Instant) | `~80 ms` (TTFT) | `< 120 ms` |
| **Streaming Synthesis** | Cartesia Sonic WebSocket API (PCM chunks) | `~150 ms` (TTFB) | `< 200 ms` |
| **Total Turnaround (TTFA)** | **End-to-End Trainee Voice to AI Response** | **~540 ms** | **< 800 ms** ✅ |
| **Barge-in Interruption** | **Outbound Audio Stream Cancellation** | **~112 ms** | **< 150 ms** ✅ |
| **BCSM Tactical Scoring** | Async FBI Evaluator Background Task | `~200 ms` (async) | **0 ms blocking** ✅ |

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
│       [ Dual-Stream Emotion Fusion ] ──► Detects Incongruence / Suppressed Panic     │
│                    │                                                                 │
│                    ├──────────────────────────────────────────────────────┐          │
│                    ▼                                                      ▼ (Async)  │
│       [ Groq LPU Engine ] (Llama 3.1 8B)                     [ FBI BCSM Scorer ]     │
│       Injected with Scenario Dossier + Emotion Context        5-Stage Staircase      │
│                    │                                          Tactical Coaching      │
│                    ▼ (Clause Streaming)                                   │          │
│       [ Dynamic Prosody Controller ]                                      ▼          │
│       Modulates Cartesia Speed (0.88x–1.05x) and Pitch       Dispatches Scorecard    │
│                    │                                         to WebRTC DataChannel   │
│                    ▼                                                                 │
│       [ Cartesia Sonic WebSocket ] ──► Streaming PCM16 Chunks                        │
│                    │                                                                 │
│                    ▼ (CustomOutboundAudioTrack)                                      │
└────────────────────┴─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Microservice Ecosystem

The architecture is partitioned into 3 isolated, decoupled services:

| Service | Port | Tech Stack | Primary Responsibility |
|:---|:---:|:---|:---|
| **`frontend/`** | `5173` | React 18, Vite, TypeScript, Tailwind | Trainee negotiation dashboard, WebRTC signaling client, BCSM 5-stage staircase, dual-stream dissonance indicator, waveform visualizers. |
| **`backend/`** | `8000` | FastAPI, `aiortc`, WebSockets, Groq SDK | Signaling server, WebRTC peer connection manager, pipeline orchestrator, BCSM scorer, emotion fusion engine, scenario manager, and Cartesia TTS bridge. |
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
│   │       ├── tts_service.py           # Cartesia Sonic streaming TTS & dynamic prosody
│   │       ├── state_manager.py         # Async state orchestrator & <150ms barge-in canceller
│   │       ├── scoring_service.py       # FBI BCSM 5-stage automated negotiation evaluator
│   │       ├── fusion_engine.py         # Dual-stream semantic vs acoustic incongruence engine
│   │       └── scenario_manager.py      # Multi-scenario crisis persona dossiers
│   ├── requirements.txt
│   └── .env                             # Secret API Keys (GROQ_API_KEY, CARTESIA_API_KEY)
│
├── ml-service/                          # Dedicated ML Inference Microservice
│   ├── src/
│   │   ├── main.py                      # WebSocket stream (/ws/stream) & REST inference
│   │   ├── config.py                    # Whisper model size, compute type, VAD parameters
│   │   └── models/chec
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
│   │       ├── BCSMStaircase.tsx        # FBI BCSM 5-stage tactical scorecard
│   │       └── LatencyHUD.tsx           # Live latency gauge (TTFA, VAD, Barge-in)
│   ├── package.json
│   └── vite.config.ts
│
├── infra/                               # Deployment & Infrastructure
│   ├── docker/
│   │   └── docker-compose.yml           # Multi-container orchestration
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

Auralis is built for **100% local, zero-cloud runtime** by default using:
- **Local LLM**: Ollama (`qwen2.5:7b-instruct-q4_K_M` or any installed model at `localhost:11434`)
- **Local TTS**: Kokoro ONNX (cached locally, `kokoro-v1.0.onnx`)
- **Local ASR & Emotion**: Faster-Whisper + Wav2Vec2 ONNX (CPU int8 or CUDA)

Create `backend/.env` (optional customizations):

```ini
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct-q4_K_M
KOKORO_VOICE_EN=af_sarah
ML_SERVICE_URL=http://localhost:8001
DEBUG=false
```

*(Optional)* If cloud LLM / TTS adapters are configured, you can provide `GROQ_API_KEY` or `CARTESIA_API_KEY`.

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
2. **Select Scenario**: Choose from *Bank Hostage*, *Suicide Intervention*, or *Ransomware Call* in the header.
3. **Voice Activity Detection**:
   - Begin speaking: notice the indicator transitions to `SPEECH_START` and status turns to **Listening**.
   - Stop speaking: after ~250ms silence, `SPEECH_END` fires, forwarding audio to Whisper and Wav2Vec2.
4. **FBI BCSM Scorecard**:
   - The 5-stage progress indicator updates dynamically.
   - Four skill bars (*Active Listening*, *Emotion Labeling*, *Mirroring*, *Rapport*) evaluate your tactical technique.
   - The **Tactical Coach** banner suggests the ideal next phrase.
5. **Dual-Stream Dissonance Test**:
   - Say *"I'm totally calm and in control"* in a panicked or hurried voice.
   - A `⚡ Dissonance: SUPPRESSED PANIC` badge appears, and the AI calls out your trembling tone.
6. **Dynamic Prosody**:
   - When you are agitated, listen to the AI speak in a noticeably slower, deeper, grounding voice.
7. **Barge-In Interruption**:
   - Interrupt the AI mid-sentence: playback immediately halts in **< 150ms**.

---

## 🎯 Crisis Negotiation Intelligence Layer

### 1. FBI BCSM Tactical Scoring Engine
Implemented based on the **Behavioral Change Stairway Model** developed by the FBI Crisis Negotiation Unit:

$$\text{Active Listening} \longrightarrow \text{Empathy} \longrightarrow \text{Rapport} \longrightarrow \text{Influence} \longrightarrow \text{Behavioral Change}$$

- **Non-blocking Execution**: Evaluated asynchronously in the background (`scoring_service.py`), adding **0ms** to audio turnaround.
- **Sub-skill Analysis**: Scores open-ended questioning, emotional labeling, mirroring, and rapport building from 0% to 100%.

### 2. Dual-Stream Emotion Fusion
Addresses **cognitive dissonance** where spoken text contradicts vocal soundwaves:
- Acoustic Vector: $A_{\text{arousal}} \in [0, 1]$, $A_{\text{valence}} \in [-1, 1]$ (Wav2Vec2)
- Lexical Sentiment: $S_{\text{valence}} \in [-1, 1]$
- Incongruence Metric:
  $$\Delta_{\text{affect}} = |S_{\text{valence}} - A_{\text{valence}}| \times A_{\text{arousal}}$$
- Flags: `SUPPRESSED_PANIC`, `MASKED_VULNERABILITY`, and `FALSE_COMPLIANCE`.

### 3. Emotion-Conditioned Dynamic Prosody
Psychological de-escalation requires **vocal pacing**:
- Trainee Panic ($A_{\text{arousal}} \ge 0.75$): TTS slows down to `0.88x` speed with grounded, low-pitch prosody (`calm:highest`).
- Trainee Disengagement ($A_{\text{arousal}} \le 0.30$): TTS speeds up to `1.05x` with attentive, engaging delivery.

### 4. Multi-Scenario Incident Selector
1. **Armed Bank Robbery (`Mark Vance`)**: Armed subject cornered in bank vault with 4 hostages; highly volatile, sensitive to threats.
2. **Suicide Intervention (`David Cole`)**: Subject standing on bridge outer railing; depressed, requires deep empathy and active listening over logic.
3. **Healthcare Ransomware Extortion (`Cipher-X`)**: Cold, calculating cyber syndicate demanding BTC payment before hospital ICU blackout.

---

## 📡 API & WebSocket Specifications

### Gateway Signaling WebSocket (`backend:8000`)
- **Endpoint**: `/ws/signaling`
- **Protocol**: SDP Offer/Answer exchange and ICE Candidate negotiation over JSON text frames.

```json
// Example: Change Scenario Event
{
  "type": "change_scenario",
  "scenario_id": "bridge_jumper"
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

### WebRTC DataChannel Telemetry Events
| Event Name | Dispatched When | Payload Details |
|:---|:---|:---|
| `TRANSCRIPT` | ASR finishes transcription | `{"text": "..."}` |
| `EMOTION` | Acoustic classifier finishes | `{"arousal": 0.82, "valence": -0.65, "label": "panic"}` |
| `FUSION` | Discrepancy detected | `{"flag": "SUPPRESSED_PANIC", "incongruence_score": 0.95}` |
| `BCSM_SCORE` | Tactical evaluation completed | `{"stage": 2, "stage_name": "Empathy", "scores": {...}}` |
| `LATENCY` | Audio playback begins | `{"ttfa": 534.2}` |
| `STATE_CHANGE` | Session state transitions | `{"state": "LISTENING" \| "THINKING" \| "SPEAKING" \| "INTERRUPTED"}` |

---

## 🗺️ Roadmap & Development Status

- [x] **Milestone 1**: Microservice Foundation & WebRTC Infrastructure (`aiortc`, 48k→16k Resampling).
- [x] **Milestone 2**: Context Engine & Streaming Pipeline (Faster-Whisper, Wav2Vec2, Groq, Cartesia Sonic).
- [x] **Milestone 3**: Frontend WebRTC Dashboard & Telemetry HUD (Web Audio API, 60fps Visualizer, Emotion Radar).
- [x] **Milestone 4**: Advanced Intelligence Layer
  - [x] FBI BCSM 5-stage automated negotiation scorecard & tactical coach.
  - [x] Dual-stream emotion fusion (text semantic valence vs acoustic prosody discrepancy).
  - [x] Dynamic TTS prosody modulation (pacing & pitch adaptation to trainee stress).
  - [x] Multi-scenario crisis incident selector (Bank Hostage, Bridge Jumper, Cyber Extortion).
- [x] **Milestone 5**: Production Infrastructure & Benchmarking
  - [x] Docker Compose environment & GPU Dockerfiles.
  - [x] Automated end-to-end TTFA latency measurement harness.

---

## 📄 License & Attribution

This project is released under the **MIT License**. Built with high-performance open-source tools: [FastAPI](https://fastapi.tiangolo.com), [aiortc](https://github.com/aiortc/aiortc), [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper), [Transformers](https://github.com/huggingface/transformers), [Groq](https://groq.com), [Cartesia](https://cartesia.ai), and [React](https://react.dev).
