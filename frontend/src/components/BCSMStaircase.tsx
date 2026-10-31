import React from 'react';
import { Award, Shield, CheckCircle2, ChevronRight } from 'lucide-react';

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
  { id: 1, name: 'Active Listening', tag: 'Stage 1', color: '#F0A94B' },
  { id: 2, name: 'Empathy', tag: 'Stage 2', color: '#00F2FE' },
  { id: 3, name: 'Rapport', tag: 'Stage 3', color: '#A855F7' },
  { id: 4, name: 'Influence', tag: 'Stage 4', color: '#3B82F6' },
  { id: 5, name: 'Behavioral Change', tag: 'Stage 5', color: '#10B981' },
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
  const feedback =
    data?.tactical_feedback ||
    "Listen actively and reflect the suspect's core emotions using calm, grounding phrases.";

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderRadius: 'var(--r-xl)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              boxShadow: '0 0 12px var(--accent)',
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: 'var(--text)',
              textTransform: 'uppercase',
            }}
          >
            FBI BCSM Tactical Scorecard
          </span>
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--secondary)',
            background: 'rgba(0, 242, 254, 0.1)',
            padding: '5px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.15)',
          }}
        >
          {progress.toFixed(0)}% De-escalation
        </div>
      </div>

      {/* 5-Step Stairway Indicator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {STAGES.map((s) => {
          const isPassed = s.id < currentStage;
          const isCurrent = s.id === currentStage;
          let borderColor = 'var(--border)';
          let bgColor = 'rgba(0, 0, 0, 0.2)';
          let textColor = 'var(--text-muted)';

          if (isCurrent) {
            borderColor = 'var(--accent)';
            bgColor = 'rgba(240, 169, 75, 0.12)';
            textColor = 'var(--accent)';
          } else if (isPassed) {
            borderColor = 'var(--emerald)';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            textColor = 'var(--emerald)';
          }

          return (
            <div
              key={s.id}
              style={{
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: bgColor,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: textColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {s.tag}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: isCurrent ? 'var(--text)' : textColor,
                  marginTop: '4px',
                }}
              >
                {s.name}
              </span>
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 10px var(--accent)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <MetricBadge label="Active Listening" value={scores.active_listening} color="#F0A94B" />
        <MetricBadge label="Emotion Labeling" value={scores.emotional_labeling} color="#A855F7" />
        <MetricBadge label="Mirroring" value={scores.mirroring} color="#EC4899" />
        <MetricBadge label="Rapport Building" value={scores.rapport} color="#10B981" />
      </div>

      {/* Live Tactical Feedback Advice */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.25)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: '10px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid var(--border)',
          borderLeftWidth: '4px',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <Shield size={20} color="var(--accent)" />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--accent)', marginRight: '8px' }}>Tactical Coach:</strong>
          {feedback}
        </span>
      </div>
    </div>
  );
};

const MetricBadge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div
    style={{
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      border: '1px solid var(--border)',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '13px', color: color, fontWeight: 800 }}>{value}%</span>
    </div>
    <div
      style={{
        width: '100%',
        height: '5px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          background: color,
          borderRadius: '3px',
          boxShadow: `0 0 8px ${color}`,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  </div>
);
