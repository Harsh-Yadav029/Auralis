import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ThreeVoiceSphere } from './ThreeVoiceSphere';

export type EmotionState = 'calm' | 'stressed' | 'sad' | 'excited' | 'angry';

interface EmotionOrbProps {
  emotion: string;
  arousal?: number;
  valence?: number;
  sessionState?: string;
  size?: number;
}

export const EmotionOrb: React.FC<EmotionOrbProps> = ({
  emotion,
  arousal = 0.2,
  valence = 0.5,
  sessionState = 'IDLE',
  size = 110,
}) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP badge pop and glow animation when emotion updates
  useEffect(() => {
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0.85, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' }
      );
    }
  }, [emotion]);

  const getLabelAndColor = () => {
    const norm = emotion.toLowerCase();
    if (norm.includes('panic') || norm.includes('angry') || norm.includes('rage')) {
      return { label: 'Volatile / High Alert', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
    }
    if (norm.includes('excited') || norm.includes('engaged')) {
      return { label: 'Engaged / Heightened', color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)' };
    }
    if (norm.includes('stress') || norm.includes('tense') || (arousal > 0.6 && valence < 0)) {
      return { label: 'Stressed / Agitated', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.15)' };
    }
    if (norm.includes('sad') || norm.includes('depress') || (arousal < 0.4 && valence < -0.2)) {
      return { label: 'Subdued / Withdrawn', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)' };
    }
    return { label: 'Grounded / Calm', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const info = getLabelAndColor();

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
      }}
    >
      {/* Three.js 3D Interactive Emotion Shader Mesh */}
      <ThreeVoiceSphere
        emotion={emotion}
        arousal={arousal}
        valence={valence}
        sessionState={sessionState}
        size={size}
      />

      {/* Dynamic Telemetry Badge */}
      <div
        ref={badgeRef}
        className="badge"
        style={{
          fontSize: '10px',
          fontWeight: 800,
          background: info.bg,
          border: `1px solid ${info.color}`,
          color: info.color,
          boxShadow: `0 0 12px ${info.bg}`,
          letterSpacing: '0.06em',
          transition: 'all 0.3s ease',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: info.color,
            boxShadow: `0 0 8px ${info.color}`,
            display: 'inline-block',
          }}
        />
        {info.label}
      </div>
    </div>
  );
};
