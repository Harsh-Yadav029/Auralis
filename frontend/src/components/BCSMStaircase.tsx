import React from 'react';

export interface BCSMData {
  stage: number;
  stage_name: string;
  scores: {
    active_listening: number;
    emotional_labeling: number;
    mirroring: number;
    rapport: number;
  };
  tactical_feedback: string;
  overall_progress: number;
}

interface BCSMStaircaseProps {
  data: BCSMData | null;
}

const STAGES = [
  { id: 1, name: 'Active Listening', tag: 'Stage 1' },
  { id: 2, name: 'Empathy', tag: 'Stage 2' },
  { id: 3, name: 'Rapport', tag: 'Stage 3' },
  { id: 4, name: 'Influence', tag: 'Stage 4' },
  { id: 5, name: 'Behavioral Change', tag: 'Stage 5' },
];

export const BCSMStaircase: React.FC<BCSMStaircaseProps> = ({ data }) => {
  const currentStage = data?.stage || 1;
  const progress = data?.overall_progress || 15;
  const scores = data?.scores || {
    active_listening: 50,
    emotional_labeling: 40,
    mirroring: 35,
    rapport: 20,
  };
  const feedback = data?.tactical_feedback || "Listen actively and reflect the suspect's core emotions using calm, grounding phrases.";

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid rgba(56, 189, 248, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#38bdf8',
            boxShadow: '0 0 10px #38bdf8'
          }} />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: '#e2e8f0', textTransform: 'uppercase' }}>
            FBI BCSM Tactical Scorecard
          </span>
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.1)',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          {progress.toFixed(0)}% De-escalation
        </div>
      </div>

      {/* 5-Step Stairway Indicator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
        {STAGES.map((s) => {
          const isPassed = s.id < currentStage;
          const isCurrent = s.id === currentStage;
          let borderColor = 'rgba(51, 65, 85, 0.6)';
          let bgColor = 'rgba(30, 41, 59, 0.4)';
          let textColor = '#64748b';

          if (isCurrent) {
            borderColor = '#38bdf8';
            bgColor = 'rgba(56, 189, 248, 0.15)';
            textColor = '#38bdf8';
          } else if (isPassed) {
            borderColor = 'rgba(52, 211, 153, 0.6)';
            bgColor = 'rgba(16, 185, 129, 0.12)';
            textColor = '#34d399';
          }

          return (
            <div
              key={s.id}
              style={{
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 600, color: textColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.tag}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: isCurrent ? '#f8fafc' : textColor, marginTop: '2px' }}>
                {s.name}
              </span>
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#38bdf8',
                  boxShadow: '0 0 8px #38bdf8'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '4px' }}>
        <MetricBadge label="Active Listening" value={scores.active_listening} color="#38bdf8" />
        <MetricBadge label="Emotion Labeling" value={scores.emotional_labeling} color="#a855f7" />
        <MetricBadge label="Mirroring" value={scores.mirroring} color="#ec4899" />
        <MetricBadge label="Rapport Building" value={scores.rapport} color="#34d399" />
      </div>

      {/* Live Tactical Feedback Advice */}
      <div style={{
        background: 'rgba(2, 6, 23, 0.6)',
        borderLeft: '3px solid #38bdf8',
        borderRadius: '6px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
          <strong style={{ color: '#38bdf8', marginRight: '6px' }}>Tactical Coach:</strong>
          {feedback}
        </span>
      </div>
    </div>
  );
};

const MetricBadge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '10px',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '11px', color: color, fontWeight: 700 }}>{value}%</span>
    </div>
    <div style={{ width: '100%', height: '4px', background: 'rgba(51, 65, 85, 0.5)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: color,
        borderRadius: '2px',
        transition: 'width 0.4s ease'
      }} />
    </div>
  </div>
);
