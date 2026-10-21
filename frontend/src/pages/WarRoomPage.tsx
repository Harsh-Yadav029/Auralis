import React, { useRef, useEffect } from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { SCENARIO_DOSSIERS } from '../components/ScenarioBriefingCard';

interface WarRoomPageProps {
  onGoToAnalytics: () => void;
  onGoToScorecard: () => void;
}

export const WarRoomPage: React.FC<WarRoomPageProps> = ({ onGoToAnalytics, onGoToScorecard }) => {
  const {
    isConnected,
    sessionState,
    messages,
    localStream,
    remoteStream,
    ttfa,
    arousal,
    emotionLabel,
    scenarioId,
    fusionData,
    simulatePanic,
    triggerBargeIn,
    startSession,
  } = useWebRTC();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentDossier = SCENARIO_DOSSIERS[scenarioId] || SCENARIO_DOSSIERS.bank_hostage;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', height: 'calc(100vh - 140px)', minHeight: '560px' }}>
      {/* Left Sidebar: Audio Monitors & Tactical Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        
        {/* Incident Summary Card */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>{currentDossier.avatar_icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{currentDossier.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentDossier.subject_name}</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
            {currentDossier.overview.slice(0, 100)}...
          </div>
        </div>

        {/* Live Audio Visualizers */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span className="label" style={{ fontSize: '11px' }}>Audio Stream Monitor</span>
            {isConnected && (
              <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 6px' }}>
                FULL DUPLEX
              </span>
            )}
          </div>

          {/* User Mic */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🎙 You (Microphone)</span>
              {sessionState === 'LISTENING' && <span className="badge badge-cyan" style={{ fontSize: '9px' }}>ACTIVE</span>}
            </div>
            {localStream ? (
              <AudioVisualizer stream={localStream} color="#22d3ee" height={44} />
            ) : (
              <div style={{ height: '44px', background: 'rgba(15,25,48,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                {isConnected ? 'Listening...' : 'Connect to stream mic'}
              </div>
            )}
          </div>

          {/* AI Suspect Output */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🤖 Suspect Voice Output</span>
              {sessionState === 'SPEAKING' && <span className="badge badge-emerald" style={{ fontSize: '9px' }}>SPEAKING</span>}
            </div>
            {remoteStream ? (
              <AudioVisualizer stream={remoteStream} color="#34d399" height={44} />
            ) : (
              <div style={{ height: '44px', background: 'rgba(15,25,48,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                {isConnected ? 'Cartesia PCM Stream Ready' : 'Awaiting Connection'}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Fusion Quick Card */}
        {fusionData && fusionData.flag !== 'ALIGNED' && (
          <div
            onClick={onGoToAnalytics}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--r-lg)',
              background: 'rgba(244,63,94,0.12)',
              border: '1px solid rgba(244,63,94,0.35)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fb7185' }}>
                ⚡ {fusionData.flag.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '10px', color: '#38bdf8', textDecoration: 'underline' }}>View Radar →</span>
            </div>
            <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
              {fusionData.tactical_hint}
            </p>
          </div>
        )}

        {/* Tactical Injection Buttons */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Tactical Triggers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-amber btn-block"
              style={{ justifyContent: 'flex-start', height: '36px', fontSize: '12px' }}
              disabled={!isConnected}
              onClick={simulatePanic}
            >
              🎙 Simulate Panicked Utterance
            </button>
            <button
              className="btn btn-rose btn-block"
              style={{ justifyContent: 'flex-start', height: '36px', fontSize: '12px' }}
              disabled={!isConnected}
              onClick={triggerBargeIn}
            >
              ⚡ Trigger Sub-150ms Barge-in
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Negotiation Transcript Stream */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {/* Transcript Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10,18,34,0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>Live Negotiation Transcript</span>
            {isConnected ? (
              <span className="badge badge-cyan">● Real-Time</span>
            ) : (
              <span className="badge badge-amber">Offline</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onGoToAnalytics}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              📊 Emotion Radar
            </button>
            <button
              onClick={onGoToScorecard}
              style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              🏅 BCSM Scorecard
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px' }}>🎙</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {isConnected ? 'Listening for speech...' : 'No active negotiation call'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isConnected
                    ? 'Speak directly into your microphone to engage the suspect'
                    : 'Click "Start Simulation" in the header to activate WebRTC'}
                </div>
              </div>
              {!isConnected && (
                <button className="btn btn-primary btn-sm" onClick={startSession} style={{ marginTop: '8px' }}>
                  Connect Now
                </button>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="anim-fade-up" style={{ display: 'flex', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: msg.role === 'user' ? 'rgba(244,63,94,0.15)' : 'rgba(34,211,238,0.15)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(244,63,94,0.3)' : 'rgba(34,211,238,0.3)'}`,
                    fontSize: '14px',
                  }}
                >
                  {msg.role === 'user' ? '🎙' : '🤖'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: msg.role === 'user' ? '#fb7185' : '#22d3ee' }}>
                      {msg.role === 'user' ? 'Trainee Negotiator' : currentDossier.subject_name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>{msg.ts}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: '#cbd5e1',
                      background: msg.role === 'user' ? 'rgba(244,63,94,0.06)' : 'rgba(34,211,238,0.06)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(244,63,94,0.15)' : 'rgba(34,211,238,0.15)'}`,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontStyle: msg.text.startsWith('[') ? 'italic' : 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Thinking state */}
          {sessionState === 'THINKING' && (
            <div className="anim-fade-up" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🤖
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(34,211,238,0.06)', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Suspect formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
