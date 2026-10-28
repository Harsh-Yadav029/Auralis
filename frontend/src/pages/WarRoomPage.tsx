import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  Mic,
  Volume2,
  AlertTriangle,
  Zap,
  PhoneCall,
  Activity,
  Award,
  ChevronRight,
  Radio,
} from 'lucide-react';
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
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const currentDossier = SCENARIO_DOSSIERS[scenarioId] || SCENARIO_DOSSIERS.bank_hostage;

  // Initial column stagger animation with GSAP
  useEffect(() => {
    if (leftColRef.current && rightColRef.current) {
      gsap.from(leftColRef.current, {
        x: -25,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
      gsap.from(rightColRef.current, {
        x: 25,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        delay: 0.1,
      });
    }
  }, []);

  // Animate new incoming transcript messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const messageElements = document.querySelectorAll('.chat-bubble-latest');
    if (messageElements.length > 0) {
      const latest = messageElements[messageElements.length - 1];
      gsap.fromTo(
        latest,
        { opacity: 0, y: 15, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }
  }, [messages]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        gap: '20px',
        height: 'calc(100vh - 170px)',
        minHeight: '620px',
      }}
    >
      {/* Left Sidebar: 3D Holographic AI Avatar & Audio Telemetry */}
      <div
        ref={leftColRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {/* Holographic 3D Interactive Suspect Avatar Card */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '14px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <EmotionOrb
              emotion={emotionLabel}
              arousal={arousal}
              valence={valence}
              sessionState={sessionState}
              size={130}
            />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)', letterSpacing: '0.02em' }}>
              {currentDossier.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600, marginTop: '2px' }}>
              Subject: {currentDossier.subject_name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Threat Assessment: <strong style={{ color: 'var(--danger-text)' }}>{currentDossier.threat_level}</strong>
            </div>
          </div>
        </div>

        {/* Live Duplex FFT Visualizers */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={14} color="var(--accent)" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full-Duplex Audio Radar
              </span>
            </div>
            {isConnected && (
              <span className="badge badge-accent" style={{ fontSize: '9px', padding: '2px 8px' }}>
                LIVE 48kHz
              </span>
            )}
          </div>

          {/* User Mic Ingestion */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mic size={13} color="var(--accent)" />
                Trainee Inbound Mic
              </span>
              {sessionState === 'LISTENING' && (
                <span className="badge badge-secondary" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  RECEIVING
                </span>
              )}
            </div>
            {localStream ? (
              <AudioVisualizer stream={localStream} color="var(--accent)" height={48} />
            ) : (
              <div
                style={{
                  height: '48px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                }}
              >
                {isConnected ? 'Awaiting Audio Packet...' : 'Connect Call to Stream Mic'}
              </div>
            )}
          </div>

          {/* AI Suspect Outbound Synthesis */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={13} color="var(--secondary)" />
                Suspect Synthesized Voice
              </span>
              {sessionState === 'SPEAKING' && (
                <span className="badge badge-accent" style={{ fontSize: '9px', padding: '1px 6px' }}>
                  SYNTHESIZING
                </span>
              )}
            </div>
            {remoteStream ? (
              <AudioVisualizer stream={remoteStream} color="var(--secondary)" height={48} />
            ) : (
              <div
                style={{
                  height: '48px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                }}
              >
                {isConnected ? 'Awaiting Turn Synthesis' : 'Call Standby'}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Dual-Stream Cognitive Dissonance Card */}
        {fusionData && fusionData.flag !== 'ALIGNED' && (
          <div
            onClick={onGoToAnalytics}
            className="glass-panel"
            style={{
              padding: '16px',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              cursor: 'pointer',
              borderRadius: 'var(--r-md)',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                DISSONANCE: {fusionData.flag.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
                Details <ChevronRight size={12} />
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--danger-text)', margin: 0, lineHeight: 1.5 }}>
              {fusionData.tactical_hint}
            </p>
          </div>
        )}

        {/* Quick Tactical Simulator Triggers */}
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tactical Testing Triggers
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-secondary btn-block"
              style={{ justifyContent: 'flex-start', fontSize: '12px', gap: '10px' }}
              disabled={!isConnected}
              onClick={simulatePanic}
            >
              <Activity size={15} color="var(--accent)" />
              <span>Simulate Panicked Utterance</span>
            </button>
            <button
              className="btn btn-danger btn-block"
              style={{ justifyContent: 'flex-start', fontSize: '12px', gap: '10px' }}
              disabled={!isConnected}
              onClick={triggerBargeIn}
            >
              <Zap size={15} color="var(--danger-text)" />
              <span>&lt;150ms Barge-in Interruption</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: High-Tech SaaS Negotiation Console */}
      <div
        ref={rightColRef}
        className="glass-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--r-xl)',
        }}
      >
        {/* Console Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
              Tactical Crisis Communication Stream
            </span>
            {isConnected ? (
              <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                ● Real-Time Full Duplex
              </span>
            ) : (
              <span className="badge" style={{ fontSize: '10px' }}>
                Offline
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onGoToAnalytics}
              className="btn btn-ghost btn-sm"
              style={{ gap: '6px' }}
            >
              <Activity size={13} color="var(--accent)" />
              <span>Affect Radar</span>
            </button>
            <button
              onClick={onGoToScorecard}
              className="btn btn-ghost btn-sm"
              style={{ gap: '6px' }}
            >
              <Award size={13} color="var(--secondary)" />
              <span>FBI Stairway</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'rgba(240, 169, 75, 0.1)',
                  border: '1px solid rgba(240, 169, 75, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(240, 169, 75, 0.15)',
                }}
              >
                <Mic size={28} color="var(--accent)" />
              </div>
              <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  {isConnected ? 'Awaiting First Speech Input' : 'Negotiation Channel Inactive'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {isConnected
                    ? 'Speak naturally into your microphone. Faster-Whisper and Wav2Vec2 will decode your words and emotional tone concurrently.'
                    : 'Click "Connect Call" in the upper right header to initiate peer-to-peer WebRTC signaling and begin the crisis simulation.'}
                </div>
              </div>
              {!isConnected && (
                <button
                  className="btn btn-primary"
                  onClick={startSession}
                  style={{ marginTop: '8px', gap: '8px', padding: '0 24px' }}
                >
                  <PhoneCall size={16} />
                  <span>Connect Crisis Line</span>
                </button>
              )}
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className="chat-bubble-latest"
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {msg.role === 'ai' && (
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--accent-gradient)',
                      color: 'var(--on-accent)',
                      boxShadow: '0 4px 16px var(--accent-glow)',
                    }}
                  >
                    <Radio size={18} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: msg.role === 'user' ? 'var(--secondary)' : 'var(--accent)',
                      }}
                    >
                      {msg.role === 'user' ? 'Trainee Negotiator' : currentDossier.subject_name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                      {msg.ts}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: 'var(--text)',
                      background: msg.role === 'user' ? 'rgba(0, 242, 254, 0.08)' : 'var(--surface-elevated)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(0, 242, 254, 0.25)' : 'var(--border)'}`,
                      padding: '14px 18px',
                      borderRadius: '16px',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      fontStyle: msg.text.startsWith('[') ? 'italic' : 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--secondary-gradient)',
                      color: '#090B10',
                      boxShadow: '0 4px 16px var(--secondary-glow)',
                    }}
                  >
                    <Mic size={18} />
                  </div>
                )}
              </div>
            ))
          )}

          {sessionState === 'THINKING' && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px 18px',
                background: 'rgba(240, 169, 75, 0.08)',
                border: '1px solid rgba(240, 169, 75, 0.2)',
                borderRadius: '14px',
                maxWidth: '300px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 10px var(--accent)',
                }}
              />
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                Suspect synthesizing response...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
