import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { AuralisWebRTCClient } from '../services/webrtc.service';
import { BCSMData } from '../components/BCSMStaircase';

export type SessionState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  ts: string;
}

export interface FusionData {
  flag: string;
  incongruence_score: number;
  tactical_hint: string;
}

interface WebRTCContextType {
  isConnected: boolean;
  sessionState: SessionState;
  transcript: string;
  arousal: number;
  valence: number;
  emotionLabel: string;
  ttfa: number;
  messages: ChatMessage[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  statusNotice: string | null;
  bcsmData: BCSMData | null;
  fusionData: FusionData | null;
  scenarioId: string;
  elapsed: number;
  formatTime: (seconds: number) => string;
  startSession: () => Promise<void>;
  stopSession: () => void;
  simulatePanic: () => void;
  triggerBargeIn: () => void;
  setScenarioId: (id: string) => void;
  setStatusNotice: (msg: string | null) => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const WebRTCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [arousal, setArousal] = useState(0.12);
  const [valence, setValence] = useState(0.65);
  const [emotionLabel, setEmotionLabel] = useState('CALM');
  const [ttfa, setTtfa] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [bcsmData, setBcsmData] = useState<BCSMData | null>(null);
  const [fusionData, setFusionData] = useState<FusionData | null>(null);
  const [scenarioId, setScenarioIdState] = useState('bank_hostage');
  const [elapsed, setElapsed] = useState(0);

  const webrtcRef = useRef<AuralisWebRTCClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isConnected) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConnected]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const getTimestamp = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const setScenarioId = useCallback((id: string) => {
    setScenarioIdState(id);
    webrtcRef.current?.selectScenario(id);
    setMessages([]);
    setBcsmData(null);
    setFusionData(null);
  }, []);

  const startSession = async () => {
    try {
      setStatusNotice(null);
      const host = window.location.hostname || 'localhost';
      const client = new AuralisWebRTCClient({
        signalingUrl: `ws://${host}:8000/ws/signaling`,
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        onTranscript: (text: string) => {
          setTranscript(text);
          setMessages((prev) => [...prev, { role: 'user', text, ts: getTimestamp() }]);
        },
        onEmotionUpdate: (a: number, v: number, label: string) => {
          setArousal(a);
          setValence(v);
          setEmotionLabel(label.toUpperCase());
        },
        onStateChange: (state: string) => setSessionState(state as SessionState),
        onLatencyUpdate: (ms: number) => setTtfa(ms),
        onBCSMScore: (data: BCSMData) => setBcsmData(data),
        onFusionUpdate: (data: any) => setFusionData(data),
        onAiText: (text: string) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'ai') {
              return [...prev.slice(0, -1), { role: 'ai', text: `${last.text} ${text}`.trim(), ts: last.ts }];
            }
            return [...prev, { role: 'ai', text, ts: getTimestamp() }];
          });
        },
        onRemoteStream: (stream: MediaStream) => setRemoteStream(stream),
      });

      const micStream = await client.initialize();
      setLocalStream(micStream);
      webrtcRef.current = client;
      setIsConnected(true);
      setSessionState('LISTENING');
    } catch (err: any) {
      setStatusNotice(`Microphone or signaling connection failed: ${err.message || err}`);
    }
  };

  const stopSession = () => {
    webrtcRef.current?.disconnect();
    webrtcRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setSessionState('IDLE');
    setTranscript('');
    setArousal(0.12);
    setValence(0.65);
  };

  const simulatePanic = () => {
    const msg = "Put the gun down! Don't come any closer! I don't know what to do!";
    setTranscript(msg);
    setArousal(0.92);
    setValence(-0.80);
    setEmotionLabel('PANIC');
    setMessages((prev) => [...prev, { role: 'user', text: msg, ts: getTimestamp() }]);
    if (webrtcRef.current) {
      webrtcRef.current.sendTurnRequest(msg, { arousal: 0.92, valence: -0.80, primary_label: 'panic' });
    } else {
      setStatusNotice("Connect first using 'Start Simulation' to activate the WebRTC engine.");
    }
  };

  const triggerBargeIn = () => {
    webrtcRef.current?.triggerBargeIn();
    setSessionState('INTERRUPTED');
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: '[⚡ Barge-in interrupt — AI speech halted in <150ms]', ts: getTimestamp() },
    ]);
    setTimeout(() => setSessionState('LISTENING'), 600);
  };

  return (
    <WebRTCContext.Provider
      value={{
        isConnected,
        sessionState,
        transcript,
        arousal,
        valence,
        emotionLabel,
        ttfa,
        messages,
        localStream,
        remoteStream,
        statusNotice,
        bcsmData,
        fusionData,
        scenarioId,
        elapsed,
        formatTime,
        startSession,
        stopSession,
        simulatePanic,
        triggerBargeIn,
        setScenarioId,
        setStatusNotice,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};
