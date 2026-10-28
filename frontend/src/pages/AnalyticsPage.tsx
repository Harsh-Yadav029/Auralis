import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Brain,
  Activity,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { useWebRTC } from '../services/WebRTCContext';
import { EmotionQuadrantRadar } from '../components/EmotionQuadrantRadar';
import { EmotionOrb } from '../components/EmotionOrb';

export const AnalyticsPage: React.FC = () => {
  const { arousal, valence, emotionLabel, fusionData, isConnected } = useWebRTC();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div
      ref={pageRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Page Header Card */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <EmotionOrb emotion={emotionLabel} arousal={arousal} valence={valence} size={100} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-accent" style={{ gap: '6px' }}>
                  <Brain size={12} />
                  DUAL-STREAM EMOTION FUSION
                </span>
                {isConnected && (
                  <span className="badge badge-secondary" style={{ gap: '6px' }}>
                    <Activity size={12} />
                    LIVE ONNX INFERENCE
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
                Acoustic Radar & Cognitive Dissonance Detector
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Simultaneous extraction of pitch/energy tremors (Wav2Vec2) vs lexical intent (Groq LPU)
              </p>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PRIMARY AFFECTIVE STATE
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--accent)',
                letterSpacing: '0.04em',
                marginTop: '4px',
              }}
            >
              {emotionLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar on Left, Deep Affective Analysis on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 440px) 1fr', gap: '24px' }}>
        {/* Radar View Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--r-xl)' }}>
            <EmotionQuadrantRadar arousal={arousal} valence={valence} primaryLabel={emotionLabel} />
          </div>

          {/* Quick Real-Time Vector Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--r-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp size={14} color="var(--accent)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  AROUSAL (INTENSITY)
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>
                {(arousal * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Vocal amplitude, cadence & pitch tremor
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--r-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Activity size={14} color="var(--secondary)" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  VALENCE (SENTIMENT)
                </span>
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: valence >= 0 ? 'var(--emerald)' : 'var(--danger-text)',
                }}
              >
                {valence > 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Emotional positivity / hostility valence
              </div>
            </div>
          </div>
        </div>

        {/* Deep Analysis & Fusion Engine Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Fusion Engine Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--r-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} color="var(--accent)" />
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  Dual-Stream Cognitive Dissonance Detector
                </h2>
              </div>
              {fusionData && (
                <span
                  className="badge"
                  style={{
                    background: fusionData.flag === 'ALIGNED' ? 'rgba(16, 185, 129, 0.15)' : 'var(--danger-bg)',
                    color: fusionData.flag === 'ALIGNED' ? 'var(--emerald)' : 'var(--danger-text)',
                    border: `1px solid ${fusionData.flag === 'ALIGNED' ? 'var(--emerald)' : 'var(--danger-border)'}`,
                    fontWeight: 800,
                    padding: '4px 12px',
                  }}
                >
                  {fusionData.flag.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Standard STT strips acoustic cues. Auralis uses <strong>Dual-Stream Fusion</strong> to evaluate whether spoken text sentiment contradicts acoustic waveform tremors. If a suspect calmly states <em>"I'm completely fine, back off"</em> while their vocal acoustics register extreme terror, the engine identifies <strong>SUPPRESSED PANIC / FALSE COMPLIANCE</strong>.
            </p>

            {fusionData ? (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: fusionData.flag === 'ALIGNED' ? 'rgba(16, 185, 129, 0.08)' : 'var(--danger-bg)',
                  border: `1px solid ${fusionData.flag === 'ALIGNED' ? 'rgba(16, 185, 129, 0.3)' : 'var(--danger-border)'}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: fusionData.flag === 'ALIGNED' ? 'var(--emerald)' : 'var(--danger-text)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    TACTICAL COACHING GUIDANCE
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Incongruence: {(fusionData.incongruence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>
                  {fusionData.tactical_hint}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '20px',
                  borderRadius: '14px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <HelpCircle size={18} color="var(--accent)" />
                <span>
                  No speech turns registered yet. Initiate a call in the War Room or click "Simulate Panicked Utterance" to stream live acoustic vectors.
                </span>
              </div>
            )}
          </div>

          {/* Emotion Space Breakdown */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--r-xl)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} />
              Affective Quadrants (Russell's Circumplex Model)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
              <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <strong style={{ color: '#EF4444', fontSize: '12px' }}>Q1: Panic / Hostility</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>High Arousal, Negative Valence</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(240, 169, 75, 0.08)', borderRadius: '10px', border: '1px solid rgba(240, 169, 75, 0.2)' }}>
                <strong style={{ color: '#F0A94B', fontSize: '12px' }}>Q2: Heightened / Alert</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>High Arousal, Positive Valence</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(96, 165, 250, 0.08)', borderRadius: '10px', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
                <strong style={{ color: '#60A5FA', fontSize: '12px' }}>Q3: Depressed / Withdrawn</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Low Arousal, Negative Valence</div>
              </div>
              <div style={{ padding: '12px 14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <strong style={{ color: '#10B981', fontSize: '12px' }}>Q4: Calm / Cooperative</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Low Arousal, Positive Valence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
