import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { BCSMStaircase } from '../components/BCSMStaircase';

export const ScorecardPage: React.FC = () => {
  const { bcsmData, isConnected } = useWebRTC();

  const stages = [
    {
      num: 1,
      title: 'Active Listening',
      desc: 'Demonstrate deep attention using mirroring, emotional labeling, silence, and minimal encouragers.',
      weight: 'Baseline',
    },
    {
      num: 2,
      title: 'Empathy',
      desc: 'Acknowledge the suspect’s point of view and feelings without necessarily agreeing with their actions.',
      weight: 'Foundation',
    },
    {
      num: 3,
      title: 'Rapport',
      desc: 'Build mutual trust. Empathy becomes reciprocal as the suspect starts offering voluntary disclosures.',
      weight: 'Turning Point',
    },
    {
      num: 4,
      title: 'Influence',
      desc: 'Collaborative problem-solving. Suspect is receptive to suggestions, alternatives, and compromises.',
      weight: 'Action Phase',
    },
    {
      num: 5,
      title: 'Behavioral Change',
      desc: 'Surrender of weapons, release of hostages, peaceful resolution without tactical assault.',
      weight: 'Goal',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="card" style={{ padding: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-accent">FBI BEHAVIORAL CHANGE STAIRWAY MODEL</span>
              {isConnected && <span className="badge badge-secondary">● EVALUATION ACTIVE</span>}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Tactical Negotiation Scorecard & Debrief
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CURRENT STAIRWAY STAGE</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>
              {bcsmData?.stage_name || 'Stage 1: Active Listening'}
            </div>
          </div>
        </div>
      </div>

      {/* Main BCSM Staircase Visualizer */}
      <BCSMStaircase data={bcsmData} />

      {/* 5-Stage Explanatory Matrix */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          BCSM Methodology & Progression Criteria
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {stages.map((st) => {
            const isCurrent = bcsmData?.stage === st.num;
            return (
              <div
                key={st.num}
                className="card"
                style={{
                  padding: '16px',
                  border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isCurrent ? 'var(--surface-elevated)' : 'var(--surface)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge" style={{ fontSize: '10px', borderColor: isCurrent ? 'var(--accent)' : 'var(--border)' }}>
                    STAGE {st.num}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{st.weight}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
                  {st.title}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
