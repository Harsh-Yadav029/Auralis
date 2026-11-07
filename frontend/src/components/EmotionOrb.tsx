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
  const emotionInfo = useMemo((): { key: EmotionState; tint: string; glow: string; label: string; animSpeed: string } => {
    const norm = emotion.toLowerCase();
    if (norm.includes('panic') || norm.includes('angry') || norm.includes('rage')) {
      return { key: 'angry', tint: 'var(--tint-angry)', glow: 'rgba(217, 119, 138, 0.55)', label: 'Angry / Volatile', animSpeed: '1.6s' };
    }
    if (norm.includes('excited') || norm.includes('engaged')) {
      return { key: 'excited', tint: 'var(--tint-excited)', glow: 'rgba(242, 139, 107, 0.5)', label: 'Excited / Engaged', animSpeed: '2.4s' };
    }
    if (norm.includes('stress') || norm.includes('tense') || (arousal > 0.6 && valence < 0)) {
      return { key: 'stressed', tint: 'var(--tint-stressed)', glow: 'rgba(242, 200, 121, 0.5)', label: 'Stressed / Tense', animSpeed: '2.0s' };
    }
    if (norm.includes('sad') || norm.includes('depress') || (arousal < 0.4 && valence < -0.2)) {
      return { key: 'sad', tint: 'var(--tint-sad)', glow: 'rgba(124, 156, 224, 0.45)', label: 'Sad / Withdrawn', animSpeed: '5.2s' };
    }
    return { key: 'calm', tint: 'var(--tint-calm)', glow: 'rgba(240, 169, 75, 0.45)', label: 'Calm / Neutral', animSpeed: '3.6s' };
  }, [emotion, arousal, valence]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      {/* Dynamic Animated Orb with Ambient Organic Pulse & Radiating Aura */}
      <div className="bhaav-orb-wrapper" style={{ width: `${size}px`, height: `${size}px` }}>
        {/* Radiating atmospheric ripple */}
        <div
          className="bhaav-orb-pulse-ring"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            ['--orb-tint' as any]: emotionInfo.tint,
            animationDuration: emotionInfo.animSpeed,
          }}
        />

        {/* Core Living Orb */}
        <div
          className="bhaav-orb"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            ['--orb-tint' as any]: emotionInfo.tint,
            ['--orb-glow' as any]: emotionInfo.glow,
            animationDuration: emotionInfo.animSpeed,
          }}
        />
      </div>

      {/* Rule 3: Color is never the only signal. The emotion chip always carries text */}
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
