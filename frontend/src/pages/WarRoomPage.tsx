import React, { useRef, useEffect } from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { SCENARIO_DOSSIERS } from '../components/ScenarioBriefingCard';
import { EmotionOrb } from '../components/EmotionOrb';

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
    arousal,
    valence,
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
      {/* Left Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        
        {/* Incident Summary Card with Emotion Orb */}
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          <EmotionOrb emotion={emotionLabel} arousal={arousal} valence={valence} size={80} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{currentDossier.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentDossier.subject_name}</div>
          </div>
        </div>

        {/* Live Audio Visualizers */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Audio Stream Monitor
            </span>
            {isConnected && (
              <span className="badge badge-accent" style={{ fontSize: '9px' }}>
                FULL DUPLEX
              </span>
            )}
          </div>

          {/* User Mic */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🎙 You (Microphone)</span>
              {sessionState === 'LISTENING' && <span className="badge badge-secondary" style={{ fontSize: '9px' }}>ACTIVE</span>}
            </div>
            {localStream ? (
              <AudioVisualizer stream={localStream} color="var(--accent)" height={44} />
            ) : (
              <div style={{ height: '44px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                {isConnected ? 'Listening...' : 'Connect to stream mic'}
              </div>
            )}
          </div>

          {/* AI Output */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🤖 Suspect Voice Output</span>
              {sessionState === 'SPEAKING' && <span className="badge badge-accent" style={{ fontSize: '9px' }}>SPEAKING</span>}
            </div>
            {remoteStream ? (
              <AudioVisualizer stream={remoteStream} color="var(--secondary)" height={44} />
            ) : (
              <div style={{ height: '44px', background: 'var(--surface-elevated)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                {isConnected ? 'PCM Stream Ready' : 'Awaiting Connection'}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Fusion Card */}
        {fusionData && fusionData.flag !== 'ALIGNED' && (
          <div
            onClick={onGoToAnalytics}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--r-md)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--danger-text)' }}>
                ⚡ {fusionData.flag.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--accent)', textDecoration: 'underline' }}>View Radar →</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--danger-text)', margin: 0, lineHeight: 1.4 }}>
              {fusionData.tactical_hint}
            </p>
          </div>
        )}

        {/* Tactical Actions */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Tactical Triggers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'flex-start', height: '36px', fontSize: '12px' }}
              disabled={!isConnected}
              onClick={simulatePanic}
            >
              🎙 Simulate Panicked Utterance
            </button>
            <button
              className="btn btn-danger btn-block"
              style={{ justifyContent: 'flex-start', height: '36px', fontSize: '12px' }}
              disabled={!isConnected}
              onClick={triggerBargeIn}
            >
              ⚡ Sub-150ms Barge-in Interrupt
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Negotiation Transcript */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Live Negotiation Transcript</span>
            {isConnected ? (
              <span className="badge badge-accent">● Real-Time</span>
            ) : (
              <span className="badge">Offline</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onGoToAnalytics}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              📊 Emotion Radar
            </button>
            <button
              onClick={onGoToScorecard}
              style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
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
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                  {isConnected ? 'Listening for speech...' : 'No active negotiation call'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {isConnected
                    ? 'Speak directly into your microphone to engage the suspect'
                    : 'Click "Connect Call" in the header to activate WebRTC'}
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
                    borderRadius: '8px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: msg.role === 'user' ? 'var(--surface-elevated)' : 'var(--accent)',
                    color: msg.role === 'user' ? 'var(--text)' : 'var(--on-accent)',
                    border: '1px solid var(--border-interactive)',
                    fontSize: '14px',
                  }}
                >
                  {msg.role === 'user' ? '🎙' : '🤖'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: msg.role === 'user' ? 'var(--secondary)' : 'var(--accent)' }}>
                      {msg.role === 'user' ? 'Trainee Negotiator' : currentDossier.subject_name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>{msg.ts}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: 'var(--text)',
                      background: msg.role === 'user' ? 'var(--surface-elevated)' : 'var(--surface)',
                      border: '1px solid var(--border)',
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

          {sessionState === 'THINKING' && (
            <div className="anim-fade-up" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🤖
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--surface-elevated)', borderRadius: '10px', border: '1px solid var(--border)' }}>
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
