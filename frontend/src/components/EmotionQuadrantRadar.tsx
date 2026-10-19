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
    if (arousal >= 0.5 && valence < 0) return { name: 'PANIC / RAGE', color: '#f87171' };
    if (arousal >= 0.5 && valence >= 0) return { name: 'EXCITED / ENGAGED', color: '#fbbf24' };
    if (arousal < 0.5 && valence < 0) return { name: 'DEPRESSED / WITHDRAWN', color: '#a78bfa' };
    return { name: 'CALM / COMPLIANT', color: '#34d399' };
  };

  const quad = getQuadrantLabel();

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(51, 65, 85, 0.6)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: quad.color, boxShadow: `0 0 8px ${quad.color}` }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
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
        background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Coordinate Center Crosshairs */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(56, 189, 248, 0.2)', borderTop: '1px dashed rgba(56, 189, 248, 0.3)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(56, 189, 248, 0.2)', borderLeft: '1px dashed rgba(56, 189, 248, 0.3)' }} />

        {/* Quadrant Watermark Labels */}
        <div style={{ position: 'absolute', top: '8px', left: '10px', fontSize: '9px', color: 'rgba(248, 113, 113, 0.6)', fontWeight: 600 }}>PANIC / AGITATION</div>
        <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '9px', color: 'rgba(251, 191, 36, 0.6)', fontWeight: 600 }}>ENGAGED / ALERT</div>
        <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '9px', color: 'rgba(167, 139, 250, 0.6)', fontWeight: 600 }}>DEPRESSED / ISOLATED</div>
        <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '9px', color: 'rgba(52, 211, 153, 0.6)', fontWeight: 600 }}>CALM / GROUNDED</div>

        {/* Concentric Radar Rings */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          border: '1px solid rgba(56, 189, 248, 0.1)'
        }} />

        {/* Active Laser Target Blip */}
        <div style={{
          position: 'absolute',
          left: `${posX}%`,
          top: `${posY}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: 'none'
        }}>
          {/* Outer Ripple */}
          <div style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            background: quad.color,
            opacity: 0.35,
            animation: 'pulse 1.2s infinite'
          }} />
          {/* Inner Core */}
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: quad.color,
            boxShadow: `0 0 14px ${quad.color}`,
            border: '2px solid #ffffff'
          }} />
        </div>
      </div>

      {/* Numerical Coordinate Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '6px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Arousal:</span>
          <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#f87171' }}>{(arousal * 100).toFixed(0)}%</span>
        </div>
        <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '6px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Valence:</span>
          <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>{valence > 0 ? `+${valence.toFixed(2)}` : valence.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
