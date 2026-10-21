import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { EmotionQuadrantRadar } from '../components/EmotionQuadrantRadar';

export const AnalyticsPage: React.FC = () => {
  const { arousal, valence, emotionLabel, fusionData, isConnected } = useWebRTC();

  const getQuadrantDetails = () => {
    if (arousal >= 0.5 && valence < 0) {
      return {
        name: 'PANIC / RAGE',
        color: '#f87171',
        desc: 'High vocal tension, fast rate of speech, high frequency variability. Critical danger of escalation.',
      };
    }
    if (arousal >= 0.5 && valence >= 0) {
      return {
        name: 'EXCITED / ENGAGED',
        color: '#fbbf24',
        desc: 'Active negotiation interest, responsive to concessions, animated vocal dynamics.',
      };
    }
    if (arousal < 0.5 && valence < 0) {
      return {
        name: 'DEPRESSED / WITHDRAWN',
        color: '#a78bfa',
        desc: 'Monotone pitch, slow response latency, withdrawal symptoms. High suicide or despair risk.',
      };
    }
    return {
      name: 'CALM / COMPLIANT',
      color: '#34d399',
      desc: 'Grounding achieved. Physiological heart rate decelerated, rational problem-solving possible.',
    };
  };

  const quad = getQuadrantDetails();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '20px', background: 'radial-gradient(circle at top right, rgba(167,139,250,0.08), rgba(15,23,42,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-purple">DEEP AFFECTIVE INTELLIGENCE</span>
              {isConnected && <span className="badge badge-cyan">● REAL-TIME TELEMETRY</span>}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Dual-Stream Emotion Fusion & Acoustic Radar
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRIMARY AFFECTIVE STATE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: quad.color }}>{emotionLabel}</div>
            </div>
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
              <div style={{ fontSize: '22px', fontWeight: 800, color: arousal > 0.6 ? '#fb7185' : '#38bdf8' }}>
                {(arousal * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Vocal energy & pitch tremor
              </div>
            </div>
            <div className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>VALENCE (SENTIMENT)</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: valence >= 0 ? '#34d399' : '#f87171' }}>
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
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                ⚡ Dual-Stream Cognitive Dissonance Detector
              </h3>
              {fusionData && (
                <span
                  className="badge"
                  style={{
                    background: fusionData.flag === 'ALIGNED' ? 'rgba(52,211,153,0.15)' : 'rgba(244,63,94,0.15)',
                    color: fusionData.flag === 'ALIGNED' ? '#34d399' : '#fb7185',
                    border: `1px solid ${fusionData.flag === 'ALIGNED' ? '#34d39944' : '#fb718544'}`,
                    fontWeight: 700,
                  }}
                >
                  {fusionData.flag.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              Auralis computes two independent streams: <strong>Semantic Text Sentiment</strong> via Groq LPU and <strong>Acoustic Emotion Waves</strong> via Wav2Vec2. If a speaker calmly claims <em>"Everything is under control"</em> but acoustic tremor indicates extreme arousal, the engine flags <strong>SUPPRESSED PANIC / DECEPTION</strong>.
            </p>

            {fusionData ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: fusionData.flag === 'ALIGNED' ? 'rgba(52,211,153,0.06)' : 'rgba(244,63,94,0.08)',
                  border: `1px solid ${fusionData.flag === 'ALIGNED' ? 'rgba(52,211,153,0.2)' : 'rgba(244,63,94,0.25)'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: fusionData.flag === 'ALIGNED' ? '#34d399' : '#fb7185' }}>
                    TACTICAL RECOMMENDATION
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Incongruence: {(fusionData.incongruence_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
                  {fusionData.tactical_hint}
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(15,25,48,0.5)', color: 'var(--text-muted)', fontSize: '12px' }}>
                No active utterance yet. Speak during a call or use "Simulate Panicked Utterance" to trigger real-time fusion analysis.
              </div>
            )}
          </div>

          {/* Current Affective State Details */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: quad.color, marginBottom: '8px' }}>
              CURRENT ZONE: {quad.name}
            </h4>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              {quad.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
