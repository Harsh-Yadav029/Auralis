import React, { useMemo } from 'react';

export type EmotionState = 'calm' | 'stressed' | 'sad' | 'excited' | 'angry';

interface EmotionOrbProps {
  emotion: string; // e.g. "CALM", "PANIC", "DISTRESSED", "EXCITED", "ENGAGED"
  arousal?: number;
  valence?: number;
  size?: number;
}

export const EmotionOrb: React.FC<EmotionOrbProps> = ({
  emotion,
  arousal = 0.2,
  valence = 0.5,
  size = 90,
}) => {
  // Map incoming emotion text/affect to the 5 Bhaav emotion tints:
  // - calm/neutral: #F0A94B
  // - stressed/tense: #F2C879
  // - sad: #7C9CE0
  // - excited: #F28B6B
  // - angry: #D9778A
  const emotionInfo = useMemo((): { key: EmotionState; tint: string; label: string; motionScale: number } => {
    const norm = emotion.toLowerCase();
    if (norm.includes('panic') || norm.includes('angry') || norm.includes('rage')) {
      return { key: 'angry', tint: 'var(--tint-angry)', label: 'Angry / Volatile', motionScale: 1.08 };
    }
    if (norm.includes('excited') || norm.includes('engaged')) {
      return { key: 'excited', tint: 'var(--tint-excited)', label: 'Excited / Engaged', motionScale: 1.05 };
    }
    if (norm.includes('stress') || norm.includes('tense') || (arousal > 0.6 && valence < 0)) {
      return { key: 'stressed', tint: 'var(--tint-stressed)', label: 'Stressed / Tense', motionScale: 1.04 };
    }
    if (norm.includes('sad') || norm.includes('depress') || (arousal < 0.4 && valence < -0.2)) {
      return { key: 'sad', tint: 'var(--tint-sad)', label: 'Sad / Withdrawn', motionScale: 0.95 };
    }
    return { key: 'calm', tint: 'var(--tint-calm)', label: 'Calm / Neutral', motionScale: 1.0 };
  }, [emotion, arousal, valence]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* Orb Element (Tint transitions take 600-800ms ease-in-out, disabled on prefers-reduced-motion) */}
      <div
        className="bhaav-orb"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          ['--orb-tint' as any]: emotionInfo.tint,
          transform: `scale(${emotionInfo.motionScale})`,
        }}
      />
      {/* Rule 3: Color is never the only signal. The emotion chip always carries text, and orb state changes motion */}
      <span
        className="badge"
        style={{
          fontSize: '11px',
          fontWeight: 700,
          background: 'var(--surface)',
          border: '1px solid var(--border-interactive)',
          color: 'var(--text)',
        }}
      >
        {emotionInfo.label}
      </span>
    </div>
  );
};
