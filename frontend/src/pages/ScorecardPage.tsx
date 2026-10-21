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
      <div className="card" style={{ padding: '20px', background: 'radial-gradient(circle at top right, rgba(56,189,248,0.08), rgba(15,23,42,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-cyan">FBI BEHAVIORAL CHANGE STAIRWAY MODEL</span>
              {isConnected && <span className="badge badge-emerald">● EVALUATION ACTIVE</span>}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Tactical Negotiation Scorecard & Debrief
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CURRENT STAIRWAY STAGE</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>
              {bcsmData?.stage_name || 'Stage 1: Active Listening'}
            </div>
          </div>
        </div>
      </div>

      {/* Main BCSM Staircase Visualizer */}
      <BCSMStaircase data={bcsmData} />

      {/* 5-Stage Explanatory Matrix */}
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#cbd5e1', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          BCSM Methodology & Progression Criteria
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {stages.map((st) => {
            const isCurrent = bcsmData?.stage === st.num;
            return (
              <div
                key={st.num}
                className="card"
                style={{
                  padding: '16px',
                  border: isCurrent ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'rgba(56,189,248,0.08)' : 'rgba(10,18,34,0.6)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '10px' }}>STAGE {st.num}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{st.weight}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
                  {st.title}
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
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
