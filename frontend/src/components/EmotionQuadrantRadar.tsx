import React from 'react';

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
  // Normalize valence from [-1, 1] to [0%, 100%]
  const posX = Math.max(8, Math.min(92, ((valence + 1) / 2) * 100));
  // Invert arousal from [0, 1] so high arousal sits at top [0%, 100%]
  const posY = Math.max(8, Math.min(92, (1 - arousal) * 100));

  const getQuadrantLabel = () => {
    if (arousal >= 0.5 && valence < 0) return { name: 'PANIC / RAGE', color: 'var(--danger-text)', border: 'var(--danger-border)' };
    if (arousal >= 0.5 && valence >= 0) return { name: 'EXCITED / ENGAGED', color: 'var(--accent)', border: 'var(--border-interactive)' };
    if (arousal < 0.5 && valence < 0) return { name: 'DEPRESSED / WITHDRAWN', color: 'var(--text-muted)', border: 'var(--border)' };
    return { name: 'CALM / COMPLIANT', color: 'var(--secondary)', border: 'var(--secondary)' };
  };

  const quad = getQuadrantLabel();

  return (
    <div className="card" style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: quad.color }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            2D Circumplex Emotion Radar
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: quad.color, letterSpacing: '0.04em' }}>
          {primaryLabel.toUpperCase()}
        </span>
      </div>

      {/* 2D XY Coordinate Plane */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        background: 'var(--surface-elevated)',
        borderRadius: '12px',
        border: '1px solid var(--border-interactive)',
        overflow: 'hidden'
      }}>
        {/* Axes */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--border)' }} />

        {/* Labels */}
        <span style={{ position: 'absolute', top: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>
          HIGH AROUSAL (+1.0)
        </span>
        <span style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>
          LOW AROUSAL (0.0)
        </span>
        <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>
          NEG VALENCE (-1.0)
        </span>
        <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)' }}>
          POS VALENCE (+1.0)
        </span>

        {/* Quadrant corner tags */}
        <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '9px', color: 'var(--danger-text)', fontWeight: 600 }}>PANIC / RAGE</span>
        <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '9px', color: 'var(--accent)', fontWeight: 600 }}>EXCITED</span>
        <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>DEPRESSED</span>
        <span style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '9px', color: 'var(--secondary)', fontWeight: 600 }}>CALM</span>

        {/* Dynamic Coordinate Point */}
        <div style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          transform: 'translate(-50%, -50%)',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: quad.color,
          border: '2px solid var(--surface)',
          boxShadow: '0 0 12px var(--orb-glow)',
          transition: 'all 0.3s ease-out',
          zIndex: 10
        }} />
      </div>

      {/* Numerical Indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', paddingTop: '4px' }}>
        <span>Valence: <strong style={{ color: 'var(--text)' }}>{valence.toFixed(2)}</strong></span>
        <span>Arousal: <strong style={{ color: 'var(--text)' }}>{arousal.toFixed(2)}</strong></span>
        <span className="badge" style={{ borderColor: quad.border, color: quad.color }}>
          {quad.name}
        </span>
      </div>
    </div>
  );
};
