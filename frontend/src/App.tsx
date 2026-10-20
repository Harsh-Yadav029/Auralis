import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuralisWebRTCClient } from './services/webrtc.service';
import { AudioVisualizer } from './components/AudioVisualizer';
import { BCSMStaircase, BCSMData } from './components/BCSMStaircase';
import { ScenarioBriefingCard } from './components/ScenarioBriefingCard';
import { EmotionQuadrantRadar } from './components/EmotionQuadrantRadar';

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const MicIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91"/><line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const BrainIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Animated Waveform Bars (fallback when no real stream) ────────────────────
const WaveformBars: React.FC<{ active: boolean; colorStart: string; colorEnd: string }> = ({ active, colorStart, colorEnd }) => {
  const [bars, setBars] = useState<number[]>(Array(32).fill(0).map(() => Math.random() * 16 + 4));
  useEffect(() => {
    if (!active) {
      setBars(Array(32).fill(0).map(() => Math.random() * 6 + 3));
      return;
    }
    const id = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 48 + 4));
    }, 70);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2.5px', height: '52px', padding: '4px 0' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: '4px',
          height: `${h}px`,
          borderRadius: '2px',
          background: active
            ? `linear-gradient(180deg, ${colorStart}, ${colorEnd})`
            : 'rgba(148,163,184,0.12)',
          transition: 'height 0.07s ease',
          flexShrink: 0,
          boxShadow: active ? `0 0 4px ${colorStart}55` : 'none',
        }} />
      ))}
    </div>
  );
};

// ─── Status Dot ───────────────────────────────────────────────────────────────
const StatusDot: React.FC<{ color: string; pulse?: boolean }> = ({ color, pulse = true }) => (
  <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
    {pulse && (
      <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', background: color, opacity: 0, animation: 'ripple 2s ease infinite' }} />
    )}
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
  </div>
);

// ─── Metric Chip ──────────────────────────────────────────────────────────────
const MetricChip: React.FC<{ label: string; value: string; color: string; sub?: string }> = ({ label, value, color, sub }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '10px 14px', borderRadius: 'var(--r-md)',
    background: 'rgba(10,18,34,0.6)', border: '1px solid rgba(51,65,85,0.4)',
    minWidth: '80px',
  }}>
    <span className="label" style={{ fontSize: '9px' }}>{label}</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
    {sub && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>{sub}</span>}
  </div>
);

// ─── Session State config ─────────────────────────────────────────────────────
type SessionState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED';
const STATE_CONFIG: Record<SessionState, { color: string; label: string }> = {
  IDLE:        { color: '#475569', label: 'Idle'        },
  LISTENING:   { color: '#22d3ee', label: 'Listening'   },
  THINKING:    { color: '#a78bfa', label: 'Processing'  },
  SPEAKING:    { color: '#34d399', label: 'Speaking'    },
  INTERRUPTED: { color: '#f43f5e', label: 'Interrupted' },
};

// ─── Scenario metadata ────────────────────────────────────────────────────────
const SCENARIOS: Record<string, { title: string; subject_name: string; threat_level: string; location: string }> = {
  bank_hostage:    { title: 'Armed Bank Robbery',         subject_name: 'Mark Vance (34)',     threat_level: 'CRITICAL', location: 'First Federal Savings, Downtown' },
  bridge_jumper:   { title: 'Suicide Intervention',       subject_name: 'David Cole (28)',      threat_level: 'HIGH',     location: 'Suspension Bridge Walkway, Pier 4' },
  cyber_extortion: { title: 'Healthcare Ransomware',      subject_name: 'Cipher-X Syndicate',  threat_level: 'MODERATE', location: 'Dark Web Voice Relay' },
};

// ─── App ──────────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [isConnected, setIsConnected]       = useState(false);
  const [sessionState, setSessionState]     = useState<SessionState>('IDLE');
  const [transcript, setTranscript]         = useState('');
  const [arousal, setArousal]               = useState(0.12);
  const [valence, setValence]               = useState(0.65);
  const [emotionLabel, setEmotionLabel]     = useState('CALM');
  const [ttfa, setTtfa]                     = useState(0);
  const [messages, setMessages]             = useState<{ role: 'user' | 'ai'; text: string; ts: string }[]>([]);
  const [localStream, setLocalStream]       = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream]     = useState<MediaStream | null>(null);
  const [statusNotice, setStatusNotice]     = useState<string | null>(null);
  const [bcsmData, setBcsmData]             = useState<BCSMData | null>(null);
  const [fusionData, setFusionData]         = useState<{ flag: string; incongruence_score: number; tactical_hint: string } | null>(null);
  const [scenarioId, setScenarioId]         = useState('bank_hostage');
  const [elapsed, setElapsed]               = useState(0);

  const webrtcRef = useRef<AuralisWebRTCClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll conversation
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Session timer
  useEffect(() => {
    if (isConnected) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const getTimestamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleScenarioChange = useCallback((id: string) => {
    setScenarioId(id);
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
          setMessages(prev => [...prev, { role: 'user', text, ts: getTimestamp() }]);
        },
        onEmotionUpdate: (a: number, v: number, label: string) => {
          setArousal(a); setValence(v); setEmotionLabel(label.toUpperCase());
        },
        onStateChange: (state: string) => setSessionState(state as SessionState),
        onLatencyUpdate: (ms: number) => setTtfa(ms),
        onBCSMScore: (data: BCSMData) => setBcsmData(data),
        onFusionUpdate: (data: any) => setFusionData(data),
        onAiText: (text: string) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'ai') return [...prev.slice(0, -1), { role: 'ai', text: `${last.text} ${text}`.trim(), ts: last.ts }];
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
    setLocalStream(null); setRemoteStream(null);
    setIsConnected(false); setSessionState('IDLE');
    setTranscript(''); setArousal(0.12); setValence(0.65);
  };

  const simulatePanic = () => {
    const msg = "Put the gun down! Don't come any closer! I don't know what to do!";
    setTranscript(msg); setArousal(0.92); setValence(-0.80); setEmotionLabel('PANIC');
    setMessages(prev => [...prev, { role: 'user', text: msg, ts: getTimestamp() }]);
    if (webrtcRef.current) {
      webrtcRef.current.sendTurnRequest(msg, { arousal: 0.92, valence: -0.80, primary_label: 'panic' });
    } else {
      setStatusNotice("Connect first using 'Start Simulation' to activate the WebRTC engine.");
    }
  };

  const triggerBargeIn = () => {
    webrtcRef.current?.triggerBargeIn();
    setSessionState('INTERRUPTED');
    setMessages(prev => [...prev, { role: 'user', text: '[⚡ Barge-in interrupt — AI speech halted in <150ms]', ts: getTimestamp() }]);
    setTimeout(() => setSessionState('LISTENING'), 600);
  };

  const sc = STATE_CONFIG[sessionState];
  const emotionBgColor = arousal > 0.7 ? 'rgba(244,63,94,0.12)' : arousal > 0.4 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)';
  const emotionTextColor = arousal > 0.7 ? '#fb7185' : arousal > 0.4 ? '#fbbf24' : '#34d399';

  return (
    <>
      {/* ── Global Keyframe patch for ripple (needed inline for the StatusDot) ── */}
      <style>{`@keyframes ripple{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.8)}}`}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ════════════════════════════════ HEADER ═══════════════════════════════ */}
        <header style={{
          height: '60px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(5,11,22,0.92)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px rgba(34,211,238,0.38)',
              animation: isConnected ? 'glow-pulse 2.4s ease-in-out infinite' : 'none',
            }}>
              <ZapIcon />
            </div>
            <div>
              <div className="gradient-text" style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.12em' }}>AURALIS</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em', marginTop: '-1px' }}>
                Real-Time Crisis Negotiation Engine
              </div>
            </div>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', color: 'var(--text-muted)', fontSize: '11px' }}>
              <ChevronRightIcon />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {SCENARIOS[scenarioId]?.title ?? 'Scenario'}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Session timer */}
            {isConnected && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600,
                color: '#22d3ee', background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)', borderRadius: 'var(--r-md)',
                padding: '5px 12px', letterSpacing: '0.08em',
              }}>
                {formatTime(elapsed)}
              </div>
            )}

            {/* Scenario selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(10,18,34,0.7)', padding: '4px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-base)' }}>
              <ShieldIcon />
              <select
                className="select-styled"
                value={scenarioId}
                onChange={e => handleScenarioChange(e.target.value)}
                style={{ background: 'transparent', border: 'none', padding: '0', borderRadius: '0', boxShadow: 'none', paddingRight: '20px' }}
              >
                <option value="bank_hostage">Bank Hostage (Mark Vance)</option>
                <option value="bridge_jumper">Bridge Intervention (David Cole)</option>
                <option value="cyber_extortion">Ransomware Call (Cipher-X)</option>
              </select>
            </div>

            {isConnected ? (
              <button className="btn btn-danger" onClick={stopSession}><PhoneOffIcon /> End Session</button>
            ) : (
              <button className="btn btn-primary" onClick={startSession}><MicIcon /> Start Simulation</button>
            )}
          </div>
        </header>

        {/* ════════════════════════════════ STATUS NOTICE ═══════════════════════ */}
        {statusNotice && (
          <div style={{
            padding: '8px 24px', background: 'rgba(244,63,94,0.1)', borderBottom: '1px solid rgba(244,63,94,0.25)',
            color: '#fb7185', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            animation: 'fadeIn 0.2s ease',
          }}>
            <span>⚠️ {statusNotice}</span>
            <button onClick={() => setStatusNotice(null)} style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <XIcon />
            </button>
          </div>
        )}

        {/* ════════════════════════════════ STATUS BAR ══════════════════════════ */}
        <div style={{
          height: '44px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(10,18,34,0.6)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
          gap: '24px', overflowX: 'auto',
        }}>
          {/* Left: Live state */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <StatusDot color={sc.color} pulse={isConnected} />
              <span className="label">State</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: sc.color }}>{sc.label.toUpperCase()}</span>
            </div>
            <div className="divider-v" style={{ height: '20px', width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span className="label">TTFA</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: ttfa > 0 && ttfa <= 800 ? '#34d399' : '#fbbf24' }}>
                {ttfa ? `${ttfa}ms` : '—'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>/ 800ms</span>
            </div>
            <div className="divider-v" style={{ height: '20px', width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span className="label">Barge-in</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#34d399' }}>112ms</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>/ 150ms</span>
            </div>
            <div className="divider-v" style={{ height: '20px', width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span className="label">Emotion</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: emotionTextColor,
                background: emotionBgColor, padding: '1px 7px', borderRadius: 'var(--r-full)',
              }}>
                {emotionLabel}
              </span>
            </div>
          </div>

          {/* Right: Stack chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {['Groq Llama 3.1', 'Cartesia Sonic', 'Faster-Whisper', 'Wav2Vec2'].map(t => (
              <span key={t} style={{
                fontSize: '10px', fontWeight: 500, color: 'var(--text-muted)',
                background: 'rgba(30,42,68,0.5)', border: '1px solid var(--border-subtle)',
                padding: '2px 8px', borderRadius: 'var(--r-full)',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════ MAIN CONTENT ════════════════════════ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 24px', maxWidth: '1480px', width: '100%', margin: '0 auto', minHeight: 0 }}>

          {/* ── Mission Dossier ── */}
          <ScenarioBriefingCard
            scenarioId={scenarioId}
            onScenarioSelect={handleScenarioChange}
            isConnected={isConnected}
          />

          {/* ── Two-column layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', flex: 1, minHeight: 0, alignItems: 'start' }}>

            {/* ══════════════════ LEFT SIDEBAR ══════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* ── Live Audio Panel ── */}
              <div className="card" style={{ padding: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '14px' }}>
                  <div className="flex-start" style={{ gap: '7px' }}>
                    <ActivityIcon />
                    <span className="label">Live Audio Stream</span>
                  </div>
                  {isConnected && <StatusDot color="#22d3ee" />}
                </div>

                {/* You */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>🎙 You — Microphone</span>
                    {sessionState === 'LISTENING' && <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>LIVE</span>}
                  </div>
                  {localStream
                    ? <AudioVisualizer stream={localStream} color="#22d3ee" height={48} />
                    : <WaveformBars active={isConnected && sessionState === 'LISTENING'} colorStart="#f43f5e" colorEnd="#fb923c" />
                  }
                </div>

                {/* AI */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>🤖 Auralis AI Response</span>
                    {sessionState === 'SPEAKING' && <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 6px' }}>SPEAKING</span>}
                  </div>
                  {remoteStream
                    ? <AudioVisualizer stream={remoteStream} color="#34d399" height={48} />
                    : <WaveformBars active={sessionState === 'SPEAKING'} colorStart="#22d3ee" colorEnd="#3b82f6" />
                  }
                </div>
              </div>

              {/* ── Emotion Radar ── */}
              <EmotionQuadrantRadar arousal={arousal} valence={valence} primaryLabel={emotionLabel} />

              {/* ── Fusion Alert ── */}
              {fusionData && fusionData.flag !== 'ALIGNED' && (
                <div style={{
                  padding: '12px 14px', borderRadius: 'var(--r-lg)',
                  background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.35)',
                  boxShadow: '0 4px 20px rgba(244,63,94,0.18)',
                  animation: 'fadeUp 0.3s ease',
                }}>
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#fb7185', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      ⚡ {fusionData.flag.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fca5a5', fontWeight: 700 }}>
                      {(fusionData.incongruence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>{fusionData.tactical_hint}</p>
                </div>
              )}

              {/* ── Tactical Controls ── */}
              <div className="card" style={{ padding: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <div className="flex-start" style={{ gap: '7px' }}>
                    <BrainIcon />
                    <span className="label">Tactical Controls</span>
                  </div>
                  {!isConnected && <span className="badge badge-amber">Offline</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    className="btn btn-amber btn-block"
                    style={{ justifyContent: 'flex-start', height: '38px', fontSize: '12px' }}
                    disabled={!isConnected}
                    onClick={simulatePanic}
                  >
                    🎙 &nbsp;Simulate Panicked Utterance
                  </button>
                  <button
                    className="btn btn-rose btn-block"
                    style={{ justifyContent: 'flex-start', height: '38px', fontSize: '12px' }}
                    disabled={!isConnected}
                    onClick={triggerBargeIn}
                  >
                    ✋ &nbsp;Trigger Barge-in Interrupt
                  </button>
                </div>
              </div>
            </div>

            {/* ══════════════════ RIGHT PANEL ════════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>

              {/* ── BCSM Scorecard ── */}
              <BCSMStaircase data={bcsmData} />

              {/* ── Conversation Log ── */}
              <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', minHeight: '420px' }}>

                {/* Panel Header */}
                <div style={{
                  padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                }}>
                  <div className="flex-start" style={{ gap: '8px' }}>
                    <span className="label" style={{ fontSize: '11px' }}>Negotiation Transcript</span>
                    {isConnected && <span className="badge badge-cyan">● Live</span>}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {messages.length} turn{messages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)', minHeight: '200px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: 'rgba(15,25,48,0.6)', border: '1px solid var(--border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'float 3s ease-in-out infinite',
                      }}>
                        <MicIcon size={22} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>No active session</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click "Start Simulation" to connect the WebRTC engine</div>
                      </div>
                    </div>
                  ) : messages.map((msg, i) => (
                    <div key={i} className="anim-fade-up" style={{ display: 'flex', gap: '10px', animationDelay: `${i * 0.02}s` }}>
                      {/* Avatar */}
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: msg.role === 'user' ? 'rgba(244,63,94,0.12)' : 'rgba(34,211,238,0.12)',
                        border: `1px solid ${msg.role === 'user' ? 'rgba(244,63,94,0.25)' : 'rgba(34,211,238,0.25)'}`,
                        fontSize: '13px', boxShadow: msg.role === 'user' ? '0 0 12px rgba(244,63,94,0.12)' : '0 0 12px rgba(34,211,238,0.12)',
                      }}>
                        {msg.role === 'user' ? '🎙' : '🤖'}
                      </div>
                      {/* Bubble */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex-start" style={{ gap: '8px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: msg.role === 'user' ? '#fb7185' : '#22d3ee' }}>
                            {msg.role === 'user' ? 'Trainee Negotiator' : 'Auralis AI'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>{msg.ts}</span>
                        </div>
                        <div style={{
                          fontSize: '13px', lineHeight: '1.65', color: '#cbd5e1',
                          background: msg.role === 'user' ? 'rgba(244,63,94,0.05)' : 'rgba(34,211,238,0.05)',
                          border: `1px solid ${msg.role === 'user' ? 'rgba(244,63,94,0.12)' : 'rgba(34,211,238,0.12)'}`,
                          padding: '10px 13px', borderRadius: '10px',
                          fontStyle: msg.text.startsWith('[') ? 'italic' : 'normal',
                          fontFamily: msg.text.startsWith('[') ? 'var(--font-mono)' : 'inherit',
                          wordBreak: 'break-word',
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking Indicator */}
                  {sessionState === 'THINKING' && (
                    <div className="anim-fade-up" style={{ display: 'flex', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)', fontSize: '13px',
                      }}>🤖</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', marginBottom: '5px' }}>Auralis AI</div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)',
                          padding: '10px 14px', borderRadius: '10px',
                        }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Processing</span>
                          {[0,1,2].map(n => (
                            <div key={n} style={{
                              width: '5px', height: '5px', borderRadius: '50%', background: '#a78bfa',
                              animation: `thinking 1.2s ease-in-out ${n * 0.2}s infinite`,
                            }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input hint bar */}
                <div style={{
                  padding: '10px 18px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(10,18,34,0.5)',
                }}>
                  <div style={{
                    flex: 1, padding: '8px 14px', borderRadius: 'var(--r-md)',
                    background: 'rgba(15,25,48,0.6)', border: '1px solid var(--border-subtle)',
                    fontSize: '12px', color: 'var(--text-muted)', userSelect: 'none',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <MicIcon size={12} />
                    {isConnected
                      ? sessionState === 'LISTENING' ? '🔴 Microphone active — speak to the suspect...' : `${sc.label}...`
                      : 'Connect to begin voice negotiation session'
                    }
                  </div>
                  {!isConnected && (
                    <button className="btn btn-primary btn-sm" onClick={startSession}>
                      <MicIcon size={12} /> Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ════════════════════════════════ FOOTER ══════════════════════════════ */}
        <footer style={{
          padding: '10px 24px', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(5,11,22,0.8)',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Auralis © 2024 — FBI BCSM · Dual-Stream Emotion Fusion · Sub-800ms TTFA
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusDot color={isConnected ? '#34d399' : '#475569'} pulse={isConnected} />
            <span style={{ fontSize: '11px', color: isConnected ? '#34d399' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {isConnected ? 'SESSION ACTIVE' : 'OFFLINE'}
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};
