import React from 'react';
import { Crosshair, Target } from 'lucide-react';

interface EmotionQuadrantRadarProps {
  arousal: number;   // 0.0 to 1.0 (Y-axis)
  valence: number;   // -1.0 to 1.0 (X-axis)
  primaryLabel: string;
}

export const EmotionQuadrantRadar: React.FC<EmotionQuadrantRadarProps> = ({
  arousal,
  valence,
  primaryLabel
}) => {
  // Normalize valence from [-1, 1] to [8%, 92%]
  const posX = Math.max(8, Math.min(92, ((valence + 1) / 2) * 100));
  // Invert arousal from [0, 1] so high arousal sits at top [8%, 92%]
  const posY = Math.max(8, Math.min(92, (1 - arousal) * 100));

  const getQuadrantLabel = () => {
    if (arousal >= 0.5 && valence < 0) return { name: 'PANIC / RAGE', color: 'var(--danger-text)', border: 'var(--danger-border)' };
    if (arousal >= 0.5 && valence >= 0) return { name: 'EXCITED / ENGAGED', color: 'var(--accent)', border: 'var(--border-interactive)' };
    if (arousal < 0.5 && valence < 0) return { name: 'DEPRESSED / WITHDRAWN', color: 'var(--text-muted)', border: 'var(--border)' };
    return { name: 'CALM / COMPLIANT', color: 'var(--emerald)', border: 'var(--emerald)' };
  };

  const quad = getQuadrantLabel();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderRadius: 'var(--r-xl)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Crosshair size={16} color="var(--accent)" />
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--text)', textTransform: 'uppercase' }}>
            2D Circumplex Emotion Radar
          </span>
        </div>
        <span
          className="badge"
          style={{
            borderColor: quad.border,
            color: quad.color,
            fontSize: '11px',
            fontWeight: 800,
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          {primaryLabel.toUpperCase()}
        </span>
      </div>

      {/* 2D XY Coordinate Plane */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '210px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Subtle grid rings */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            border: '1px dashed rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />

        {/* Axes */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Axis Labels */}
        <span style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.04em' }}>
          HIGH AROUSAL (+1.0)
        </span>
        <span style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
          LOW AROUSAL (0.0)
        </span>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 800, color: 'var(--danger-text)', letterSpacing: '0.04em' }}>
          NEG VALENCE (-1.0)
        </span>
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', fontWeight: 800, color: 'var(--emerald)', letterSpacing: '0.04em' }}>
          POS VALENCE (+1.0)
        </span>

        {/* Quadrant corner tags */}
        <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '9px', color: 'var(--danger-text)', fontWeight: 700 }}>PANIC / RAGE</span>
        <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px', color: 'var(--accent)', fontWeight: 700 }}>EXCITED</span>
        <span style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>DEPRESSED</span>
        <span style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '9px', color: 'var(--emerald)', fontWeight: 700 }}>CALM</span>

        {/* Dynamic Coordinate Point */}
        <div
          style={{
            position: 'absolute',
            left: `${posX}%`,
            top: `${posY}%`,
            transform: 'translate(-50%, -50%)',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: quad.color,
            border: '3px solid #090B10',
            boxShadow: `0 0 16px ${quad.color}`,
            transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 10,
          }}
        />
      </div>

      {/* Numerical Vector Indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Valence: <strong style={{ color: 'var(--text)' }}>{valence > 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)}</strong></span>
        <span>Arousal: <strong style={{ color: 'var(--text)' }}>{(arousal * 100).toFixed(0)}%</strong></span>
        <span className="badge" style={{ borderColor: quad.border, color: quad.color }}>
          {quad.name}
        </span>
      </div>
    </div>
  );
};
