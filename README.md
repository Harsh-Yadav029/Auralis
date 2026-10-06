<div align="center">

<br/>

<img src="https://img.shields.io/badge/AURALIS-Real--Time%20Voice%20AI-06b6d4?style=for-the-badge&logo=lightning&logoColor=white" />

<h1>Auralis — Real-Time Voice-to-Voice Emotion Engine</h1>

<p>A production-grade, sub-800ms voice AI platform for Crisis Negotiation Training.<br/>
Streams microphone audio over WebRTC, extracts acoustic emotion, and speaks back an emotionally-aware de-escalation response before the conversation feels interrupted.</p>

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-aiortc-orange?style=flat-square)](https://aiortc.readthedocs.io)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.1-f55036?style=flat-square)](https://console.groq.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🧠 What is Auralis?

Auralis solves the core flaw in conversational AI: **the standard STT → LLM → TTS pipeline adds 3–5 seconds of latency and completely discards the speaker's emotional tone.**

Instead, Auralis:
1. Streams raw mic audio over **WebRTC (Opus/UDP)**
2. Simultaneously transcribes speech (**Faster-Whisper**) and classifies acoustic emotion (**Wav2Vec2** — Arousal & Valence)
3. Injects the emotional context into a crisis negotiator persona (**Groq Llama 3.1 8B**)
4. Streams the response back as synthesized speech (**Cartesia Sonic**) in byte-chunks
5. Supports **full-duplex barge-in** — if the user speaks mid-response, AI audio halts in **< 150ms**

---

## ⚡ Performance Targets

| Pipeline Stage | Technology | p50 Latency | SLA |
|:---|:---|:---:|:---:|
| Network & Transport | WebRTC Opus / UDP | 20 ms | — |
| Voice Activity Detection | Silero VAD (30ms frames) | 80 ms | — |
| Speech-to-Text | Faster-Whisper int8 | 120 ms | < 200ms |
| Acoustic Emotion | Wav2Vec2 ONNX | 40 ms | — |
| LLM Inference | Groq Llama 3.1 8B | 80 ms | — |
| Streaming TTS | Cartesia Sonic API | 150 ms | — |
| **Total TTFA** | **End-to-End** | **~540 ms** | **< 800ms ✅** |
| **Barge-in Halt** | **Async Cancellation** | **~112 ms** | **< 150ms ✅** |

---

## 🏗️ Architecture

```
[Browser Mic] ──(Opus/UDP WebRTC)──► [WebRTC Gateway :8000]
                                              │
                                    ┌─────────┴──────────┐
                                    │   ML Audio Service  │
                                    │        :8001        │
                                    │  ┌─────────────┐   │
                                    │  │ Silero VAD  │   │
                                    │  │ Faster-     │   │
                                    │  │ Whisper ASR │   │
                                    │  │ Wav2Vec2    │   │
                                    │  │ Emotion     │   │
                                    │  └─────────────┘   │
                                    └─────────┬──────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  Groq API (Cloud)  │
                                    │  Llama 3.1 8B      │
                                    │  + Emotion Prompt  │
                                    └─────────┬──────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  Cartesia Sonic    │
                                    │  Streaming TTS     │
                                    └─────────┬──────────┘
                                              │
[Browser Speaker] ◄──(PCM/WebRTC)────────────┘
```

---

## 📁 Project Structure

```
Auralis/
├── backend/                     # WebRTC Gateway Microservice (FastAPI + aiortc)
│   ├── src/
│   │   ├── main.py              # FastAPI WebSocket signaling server
│   │   ├── config.py            # Pydantic settings & API key loader
│   │   └── services/
│   │       ├── webrtc_service.py  # Custom outbound AudioStreamTrack
│   │       ├── llm_service.py     # Groq Llama 3.1 + emotion prompt injection
│   │       ├── tts_service.py     # Cartesia Sonic WebSocket streaming client
│   │       └── state_manager.py   # Orchestrator & barge-in cancellation
│   └── requirements.txt
│
├── ml-service/                  # ML Audio Microservice (Whisper + Wav2Vec2 + VAD)
│   ├── src/
│   │   ├── main.py              # FastAPI ML service entry point
│   │   └── models/
│   │       ├── vad_silero.py    # Silero VAD 30ms frame detector
│   │       ├── asr_whisper.py   # Faster-Whisper ASR engine
│   │       └── emotion_wav2vec2.py  # Acoustic emotion classifier
│   └── requirements.txt
│
├── frontend/                    # React 18 + Vite + TypeScript Web App
│   ├── src/
│   │   ├── App.tsx              # Crisis Negotiation Simulator Dashboard
│   │   ├── services/
│   │   │   └── webrtc.service.ts  # WebRTC client (getUserMedia, PeerConnection)
│   │   └── components/
│   │       ├── AudioVisualizer.tsx  # 60fps Web Audio API canvas waveform
│   │       ├── EmotionMeter.tsx     # Arousal / Valence 2D meter
│   │       └── LatencyHUD.tsx       # Real-time TTFA & barge-in monitor
│   └── package.json
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml   # Multi-container local dev environment
│   └── coturn/
│       └── turnserver.conf      # Coturn STUN/TURN config for NAT traversal
│
├── .gsd/
│   ├── SPEC.md                  # Finalized project specification
│   └── ROADMAP.md               # 4-milestone execution roadmap
│
├── .gitignore                   # Excludes .env, venv/, node_modules/, model weights
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- NVIDIA GPU with CUDA 12.2+ *(optional — CPU fallback supported)*

### 1. Clone the Repository

```bash
git clone https://github.com/Harsh-Yadav029/Auralis.git
cd Auralis
```

### 2. Configure API Keys

Create `backend/.env`:

```ini
GROQ_API_KEY=your_groq_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here
```

Get your free keys:
- **Groq** → [console.groq.com](https://console.groq.com) (Free — Llama 3.1 8B inference)
- **Cartesia** → [play.cartesia.ai](https://play.cartesia.ai) (Free trial — Sonic streaming TTS)

### 3. Install & Run Each Microservice

**Backend WebRTC Gateway (Terminal 1):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m src.main
# → http://localhost:8000
```

**ML Audio Service (Terminal 2):**
```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m src.main
# → http://localhost:8001
```

**React Frontend (Terminal 3):**
```powershell
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Open the App

Navigate to **`http://localhost:5173`** in Chrome and click **Start Simulation**.

---

## 🧪 Testing the Pipeline

| Test | Action | Expected Result |
|:---|:---|:---|
| Audio Visualizer | Speak into mic after connecting | Waveform bars animate in real-time |
| Panicked Utterance | Click "Simulate Panicked Utterance" | Emotion meter spikes to PANIC, AI streams a calm de-escalation response |
| Streaming TTS | Listen after simulation | Voice plays back within ~540ms |
| Barge-in Interrupt | Click "Trigger Barge-in" while AI speaks | AI audio halts immediately (~112ms) |
| Health Checks | `GET /health` on both services | `{"status":"ok"}` |

---

## 🔑 Key Technical Decisions

| Decision | Choice | Rationale |
|:---|:---|:---|
| LLM Inference | Groq Cloud LPU | Sub-90ms TTFT vs 400-600ms for local quantized models |
| Streaming TTS | Cartesia Sonic | Fastest streaming WebSocket TTS API available |
| ASR Engine | Faster-Whisper int8 | CTranslate2 runtime, 3× faster than OpenAI Whisper |
| Audio Transport | WebRTC over UDP | Bypasses HTTP overhead; enables true full-duplex |
| Emotion Model | Wav2Vec2 ONNX | Runs in parallel with ASR, adds ~40ms overhead only |

---

## 🎯 Use Case: Crisis Negotiation Training

A trainee speaks in a panicked voice into their microphone. Auralis:
- Detects the panic acoustically (Arousal: 92%, Valence: -80%)
- Injects: *"User is in extreme panic/agitation — de-escalate with calm, short sentences"*
- The AI responds in a measured, grounded negotiator voice within 540ms
- If the trainee talks over the AI, the response halts in 112ms — just like a real human conversation

---

## 📄 License

MIT License — built as a portfolio-grade, production-quality demonstration project.

---

<div align="center">
<sub>Built with FastAPI · aiortc · Faster-Whisper · Wav2Vec2 · Groq · Cartesia · React · WebRTC</sub>
</div>
