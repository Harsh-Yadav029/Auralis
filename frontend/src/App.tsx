import React, { useState, useEffect, useRef } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const BrainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14Z"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ActivityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91"/><line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);

// ─── Waveform Visualizer ──────────────────────────────────────────────────────
const WaveformBars: React.FC<{ active: boolean; color: string }> = ({ active, color }) => {
  const [bars, setBars] = useState<number[]>(Array(28).fill(0).map(() => Math.random() * 20 + 8));
  useEffect(() => {
    if (!active) {
      setBars(Array(28).fill(0).map(() => Math.random() * 8 + 4));
      return;
    }
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 52 + 8));
    }, 80);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '64px', padding: '4px 0' }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: '5px', height: `${h}px`, borderRadius: '3px',
          background: active ? color : 'rgba(148,163,184,0.2)',
          transition: 'height 0.08s ease',
          flexShrink: 0
        }} />
      ))}
    </div>
  );
};

// ─── Animated Pulse Dot ───────────────────────────────────────────────────────
const PulseDot: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ position: 'relative', width: '10px', height: '10px' }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'pulse 1.5s ease-in-out infinite' }} />
    <div style={{ position: 'absolute', inset: '2px', borderRadius: '50%', background: color }} />
  </div>
);

// ─── Main App Component ────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'INTERRUPTED'>('IDLE');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [arousal, setArousal] = useState(0.12);
  const [valence, setValence] = useState(0.65);
  const [emotionLabel, setEmotionLabel] = useState('CALM');
  const [ttfa, setTtfa] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; ts: string }[]>([]);

  const getTimestamp = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const getStateColor = () => {
    switch (sessionState) {
      case 'LISTENING': return '#22d3ee';
      case 'THINKING': return '#a78bfa';
      case 'SPEAKING': return '#34d399';
      case 'INTERRUPTED': return '#f87171';
      default: return '#64748b';
    }
  };

  const getEmotionBadge = () => {
    if (arousal > 0.7) return { label: 'PANIC', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#f87171' };
    if (arousal > 0.4) return { label: 'AGITATED', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#fbbf24' };
    return { label: 'CALM', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#34d399' };
  };

  const badge = getEmotionBadge();

  const startSession = () => {
    setIsConnected(true);
    setSessionState('LISTENING');
  };

  const stopSession = () => {
    setIsConnected(false);
    setSessionState('IDLE');
    setTranscript('');
    setAiResponse('');
    setArousal(0.12);
    setValence(0.65);
  };

  const simulatePanic = () => {
    if (!isConnected) return;
    const msg = "Put the gun down! Don't come any closer! I don't know what to do!";
    setTranscript(msg);
    setArousal(0.92);
    setValence(-0.80);
    setSessionState('THINKING');
    setMessages(prev => [...prev, { role: 'user', text: msg, ts: getTimestamp() }]);
    setTimeout(() => {
      setSessionState('SPEAKING');
      const reply = "I hear how terrified you are right now. I'm standing right here with my hands open. Take a slow breath with me — nobody is moving any closer.";
      setAiResponse(reply);
      setTtfa(540);
      setMessages(prev => [...prev, { role: 'ai', text: reply, ts: getTimestamp() }]);
      setTimeout(() => setSessionState('LISTENING'), 3000);
    }, 540);
  };

  const triggerBargeIn = () => {
    if (!isConnected) return;
    setSessionState('INTERRUPTED');
    setMessages(prev => [...prev, { role: 'user', text: '[Barge-in interrupt triggered — AI audio halted in 112ms]', ts: getTimestamp() }]);
    setTimeout(() => setSessionState('LISTENING'), 600);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070d1a; color: #e2e8f0; font-family: 'Inter', system-ui, -apple-system, sans-serif; min-height: 100vh; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(2);opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .card { background: rgba(15,23,42,0.8); border: 1px solid rgba(51,65,85,0.6); border-radius: 16px; backdrop-filter: blur(12px); }
        .btn-primary { display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:all 0.2s; background:linear-gradient(135deg,#06b6d4,#3b82f6);color:white;box-shadow:0 0 20px rgba(6,182,212,0.3); }
        .btn-primary:hover { transform:translateY(-1px);box-shadow:0 0 30px rgba(6,182,212,0.5); }
        .btn-danger { display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:1px solid rgba(248,113,113,0.4);cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:all 0.2s;background:rgba(239,68,68,0.12);color:#f87171; }
        .btn-danger:hover { background:rgba(239,68,68,0.2); }
        .btn-action { width:100%;padding:11px 16px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;transition:all 0.2s;text-align:left; }
        .btn-action:disabled { opacity:0.4;cursor:not-allowed; }
        .btn-amber { background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);color:#fbbf24; }
        .btn-amber:hover:not(:disabled) { background:rgba(245,158,11,0.2); }
        .btn-rose { background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171; }
        .btn-rose:hover:not(:disabled) { background:rgba(239,68,68,0.2); }
        .progress-bar { width:100%;height:6px;background:rgba(51,65,85,0.6);border-radius:999px;overflow:hidden; }
        .progress-fill { height:100%;border-radius:999px;transition:width 0.4s ease; }
        .msg-bubble { animation:fadeIn 0.3s ease; }
        .thinking-dot { width:6px;height:6px;border-radius:50%;background:#a78bfa;display:inline-block;animation:pulse 1s ease-in-out infinite; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(51,65,85,0.8);border-radius:4px; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #070d1a 0%, #0d1929 50%, #070d1a 100%)' }}>

        {/* ── Header ── */}
        <header style={{ padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(51,65,85,0.5)', background: 'rgba(7,13,26,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(6,182,212,0.4)' }}>
              <ZapIcon />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.08em', background: 'linear-gradient(90deg, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AURALIS</div>
              <div style={{ fontSize: '11px', color: '#64748b', letterSpacing: '0.04em' }}>Real-Time Voice-to-Voice Emotion Engine</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(51,65,85,0.5)', fontSize: '12px', color: '#94a3b8' }}>
              <ShieldIcon />
              <span>Crisis Negotiation Simulator</span>
            </div>
            {isConnected ? (
              <button className="btn-danger" onClick={stopSession}>
                <PhoneOffIcon /> End Session
              </button>
            ) : (
              <button className="btn-primary" onClick={startSession}>
                <MicIcon /> Start Simulation
              </button>
            )}
          </div>
        </header>

        {/* ── Main Layout ── */}
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', padding: '20px 24px', maxWidth: '1400px', width: '100%', margin: '0 auto', alignItems: 'start' }}>

          {/* ── Left Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Audio Visualizer Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ActivityIcon />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Audio Stream</span>
                </div>
                {isConnected && <PulseDot color="#22d3ee" />}
              </div>

              {/* User waveform */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>You (16kHz PCM)</div>
                <WaveformBars active={isConnected && sessionState === 'LISTENING'} color="linear-gradient(90deg,#f87171,#fb923c)" />
              </div>

              {/* AI waveform */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Auralis AI (Cartesia)</div>
                <WaveformBars active={sessionState === 'SPEAKING'} color="linear-gradient(90deg,#06b6d4,#3b82f6)" />
              </div>
            </div>

            {/* Emotion Meter Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrainIcon />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Acoustic Emotion</span>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: '999px', background: badge.bg, border: `1px solid ${badge.border}`, fontSize: '11px', fontWeight: '700', color: badge.text, letterSpacing: '0.06em' }}>
                  {badge.label}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Arousal (Energy)</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', fontFamily: 'monospace' }}>{(arousal * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${arousal * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#ef4444)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Valence (Positivity)</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#22d3ee', fontFamily: 'monospace' }}>{(((valence + 1) / 2) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((valence + 1) / 2) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#22d3ee)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Controls */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>Test Controls</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="btn-action btn-amber" disabled={!isConnected} onClick={simulatePanic}>
                  🎙 Simulate Panicked Utterance
                </button>
                <button className="btn-action btn-rose" disabled={!isConnected} onClick={triggerBargeIn}>
                  ✋ Trigger Barge-in Interrupt
                </button>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '0' }}>

            {/* Latency HUD */}
            <div className="card" style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PulseDot color={getStateColor()} />
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>STATE</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: getStateColor(), fontFamily: 'monospace', letterSpacing: '0.06em' }}>{sessionState}</span>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'rgba(51,65,85,0.6)' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>TTFA (p50) </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: ttfa > 0 && ttfa <= 800 ? '#34d399' : '#fbbf24' }}>
                    {ttfa ? `${ttfa}ms` : '—'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}> / 800ms SLA</span>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'rgba(51,65,85,0.6)' }} />
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>BARGE-IN HALT </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'monospace', color: '#34d399' }}>112ms</span>
                  <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}> / 150ms SLA</span>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                  <span>Groq Llama 3.1 8B</span>
                  <span>·</span>
                  <span>Cartesia Sonic</span>
                  <span>·</span>
                  <span>Faster-Whisper</span>
                </div>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="card" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '460px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Conversation Log</span>
                {isConnected && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}>LIVE</span>}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#334155' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MicIcon />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#475569', marginBottom: '4px' }}>No active session</div>
                      <div style={{ fontSize: '12px', color: '#334155' }}>Click "Start Simulation" to begin</div>
                    </div>
                  </div>
                ) : messages.map((msg, i) => (
                  <div key={i} className="msg-bubble" style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'ai' ? 'row' : 'row' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)', border: `1px solid ${msg.role === 'user' ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}`, fontSize: '14px' }}>
                      {msg.role === 'user' ? '🎙' : '🤖'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: msg.role === 'user' ? '#f87171' : '#22d3ee' }}>
                          {msg.role === 'user' ? 'Trainee Speaker' : 'Auralis Negotiator AI'}
                        </span>
                        <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace' }}>{msg.ts}</span>
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1', background: msg.role === 'user' ? 'rgba(239,68,68,0.06)' : 'rgba(6,182,212,0.06)', border: `1px solid ${msg.role === 'user' ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)'}`, padding: '12px 14px', borderRadius: '12px', fontStyle: msg.text.startsWith('[') ? 'italic' : 'normal' }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {sessionState === 'THINKING' && (
                  <div style={{ display: 'flex', gap: '12px' }} className="msg-bubble">
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', fontSize: '14px' }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#22d3ee', marginBottom: '6px' }}>Auralis Negotiator AI</div>
                      <div style={{ fontSize: '14px', color: '#94a3b8', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Generating response</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[0, 1, 2].map(n => <div key={n} className="thinking-dot" style={{ animationDelay: `${n * 0.2}s` }} />)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
