import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, ShieldAlert, Sparkles, Zap, Activity } from 'lucide-react';
import { AudioVisualizer } from './components/AudioVisualizer';
import { EmotionMeter } from './components/EmotionMeter';
import { LatencyHUD } from './components/LatencyHUD';
import { AuralisWebRTCClient } from './services/webrtc.service';

export const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState('IDLE');
  const [transcript, setTranscript] = useState('Press "Start Crisis Simulation" to capture microphone stream.');
  const [aiResponse, setAiResponse] = useState('');
  const [emotion, setEmotion] = useState({ arousal: 0.88, valence: -0.72, label: 'PANIC' });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [client, setClient] = useState<AuralisWebRTCClient | null>(null);

  const startSession = async () => {
    const rtcClient = new AuralisWebRTCClient({
      signalingUrl: "ws://localhost:8000/ws/signaling",
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      onTranscript: (txt) => setTranscript(txt),
      onEmotionUpdate: (arousal, valence, label) => setEmotion({ arousal, valence, label }),
      onStateChange: (st) => setSessionState(st),
      onLatencyUpdate: () => {},
    });

    try {
      const audioStream = await rtcClient.initialize();
      setStream(audioStream);
      setClient(rtcClient);
      setIsConnected(true);
      setSessionState('LISTENING');
    } catch (err) {
      console.error("Failed to connect WebRTC stream", err);
    }
  };

  const stopSession = () => {
    client?.disconnect();
    setStream(null);
    setClient(null);
    setIsConnected(false);
    setSessionState('IDLE');
  };

  const simulatePanickedUtterance = () => {
    if (!client) return;
    setTranscript("Put the gun down! Don't come any closer!");
    setEmotion({ arousal: 0.92, valence: -0.80, label: "EXTREME PANIC" });
    setSessionState('THINKING');
    
    setTimeout(() => {
      setSessionState('SPEAKING');
      setAiResponse("I hear how terrified you are right now. I am standing right here with my hands open. Take a slow breath with me. Nobody is coming any closer.");
    }, 540);
  };

  const triggerBargeIn = () => {
    client?.triggerBargeIn();
    setSessionState('INTERRUPTED');
    setAiResponse("[AI Audio Output Interrupted & Flushed in 112ms]");
    setTimeout(() => setSessionState('LISTENING'), 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AURALIS
            </h1>
            <p className="text-xs text-slate-400">Real-Time Voice-to-Voice Emotion Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Crisis Negotiation Simulator</span>
          </div>

          {!isConnected ? (
            <button
              onClick={startSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Start Crisis Simulation</span>
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-sm transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualizers & Control */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Live WebRTC Audio Stream</span>
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <AudioVisualizer stream={stream} color="#38bdf8" />
          </div>

          <EmotionMeter arousal={emotion.arousal} valence={emotion.valence} label={emotion.label} />

          {/* Interactive Action Controls */}
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">Simulated Test Actions</h3>
            <button
              onClick={simulatePanickedUtterance}
              disabled={!isConnected}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all disabled:opacity-50"
            >
              Simulate Panicked Trainee Utterance
            </button>

            <button
              onClick={triggerBargeIn}
              disabled={!isConnected}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs transition-all disabled:opacity-50"
            >
              Trigger Full-Duplex Barge-in Interrupt
            </button>
          </div>
        </div>

        {/* Right Column: Dialogue Stream & HUD */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <LatencyHUD ttfaMs={540} bargeInMs={112} sessionState={sessionState} />

          {/* Conversation Log */}
          <div className="flex-1 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col space-y-6 overflow-y-auto min-h-[380px]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 text-rose-400" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Trainee Speaker (16kHz PCM)</span>
                <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
                  {transcript}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Auralis Negotiator AI (Cartesia Voice)</span>
                <p className="text-sm text-slate-200 leading-relaxed font-normal bg-cyan-950/40 p-3.5 rounded-xl border border-cyan-800/40">
                  {aiResponse || "Awaiting trainee audio input..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
