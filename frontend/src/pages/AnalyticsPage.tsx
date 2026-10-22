import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { EmotionQuadrantRadar } from '../components/EmotionQuadrantRadar';
import { EmotionOrb } from '../components/EmotionOrb';

export const AnalyticsPage: React.FC = () => {
  const { arousal, valence, emotionLabel, fusionData, isConnected } = useWebRTC();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <EmotionOrb emotion={emotionLabel} arousal={arousal} valence={valence} size={84} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-accent">DEEP AFFECTIVE INTELLIGENCE</span>
                {isConnected && <span className="badge badge-secondary">● REAL-TIME TELEMETRY</span>}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                Dual-Stream Emotion Fusion & Acoustic Radar
              </h1>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRIMARY AFFECTIVE STATE</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>{emotionLabel}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar on Left, Deep Analysis on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '20px' }}>
        {/* Radar View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <EmotionQuadrantRadar arousal={arousal} valence={valence} primaryLabel={emotionLabel} />

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>AROUSAL (INTENSITY)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>
                {(arousal * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Vocal energy & pitch tremor
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>VALENCE (SENTIMENT)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: valence >= 0 ? 'var(--secondary)' : 'var(--danger-text)' }}>
                {valence > 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Acoustic tone positivity
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analysis & Fusion Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Fusion Engine Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                ⚡ Dual-Stream Cognitive Dissonance Detector
              </h2>
              {fusionData && (
                <span
                  className="badge"
                  style={{
                    background: fusionData.flag === 'ALIGNED' ? 'var(--surface-elevated)' : 'var(--danger-bg)',
                    color: fusionData.flag === 'ALIGNED' ? 'var(--secondary)' : 'var(--danger-text)',
                    border: `1px solid ${fusionData.flag === 'ALIGNED' ? 'var(--secondary)' : 'var(--danger-border)'}`,
                    fontWeight: 700,
                  }}
                >
                  {fusionData.flag.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Auralis computes two independent streams: <strong>Semantic Text Sentiment</strong> via Groq LPU and <strong>Acoustic Emotion Waves</strong> via Wav2Vec2. If a speaker calmly claims <em>"Everything is under control"</em> but acoustic tremor indicates extreme arousal, the engine flags <strong>SUPPRESSED PANIC / DECEPTION</strong>.
            </p>

            {fusionData ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: fusionData.flag === 'ALIGNED' ? 'var(--surface-elevated)' : 'var(--danger-bg)',
                  border: `1px solid ${fusionData.flag === 'ALIGNED' ? 'var(--border)' : 'var(--danger-border)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: fusionData.flag === 'ALIGNED' ? 'var(--secondary)' : 'var(--danger-text)' }}>
                    TACTICAL RECOMMENDATION
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Incongruence: {(fusionData.incongruence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
                  {fusionData.tactical_hint}
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px' }}>
                No active utterance yet. Speak during a call or use "Simulate Panicked Utterance" to trigger real-time fusion analysis.
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
              Bhaav Emotion Tint Architecture
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
              The dynamic Orb seamlessly shifts color and motion across 5 core states (Calm: <code>#F0A94B</code>, Stressed: <code>#F2C879</code>, Sad: <code>#7C9CE0</code>, Excited: <code>#F28B6B</code>, Angry: <code>#D9778A</code>) using 600-800ms ease-in-out transitions, automatically respecting prefers-reduced-motion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
