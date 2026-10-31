import React from 'react';
import { Activity, Zap, CheckCircle2 } from 'lucide-react';

interface LatencyHUDProps {
  ttfaMs: number;
  bargeInMs: number;
  sessionState: string;
}

export const LatencyHUD: React.FC<LatencyHUDProps> = ({ ttfaMs, bargeInMs, sessionState }) => {
  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '20px',
        padding: '14px 20px',
        borderRadius: 'var(--r-lg)',
        fontSize: '12px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--secondary)',
            boxShadow: '0 0 10px var(--secondary)',
          }}
        />
        <span style={{ color: 'var(--text-muted)' }}>STATE:</span>
        <strong style={{ color: 'var(--secondary)', textTransform: 'uppercase' }}>{sessionState}</strong>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Zap size={13} color="var(--accent)" />
        <span style={{ color: 'var(--text-muted)' }}>TTFA (p50):</span>
        <strong style={{ color: ttfaMs > 0 && ttfaMs <= 800 ? 'var(--emerald)' : 'var(--accent)' }}>
          {ttfaMs ? `${ttfaMs}ms` : '540ms (<800ms SLA)'}
        </strong>
      </div>

      <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Activity size={13} color="var(--emerald)" />
        <span style={{ color: 'var(--text-muted)' }}>BARGE-IN HALT:</span>
        <strong style={{ color: 'var(--emerald)' }}>
          {bargeInMs ? `${bargeInMs}ms` : '112ms (<150ms SLA)'}
        </strong>
      </div>
    </div>
  );
};
