import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';
import { SCENARIO_DOSSIERS } from '../components/ScenarioBriefingCard';

interface BriefingPageProps {
  onEnterWarRoom: () => void;
}

export const BriefingPage: React.FC<BriefingPageProps> = ({ onEnterWarRoom }) => {
  const { scenarioId, setScenarioId, isConnected, startSession } = useWebRTC();
  const currentDossier = SCENARIO_DOSSIERS[scenarioId] || SCENARIO_DOSSIERS.bank_hostage;

  const threatColor = {
    CRITICAL: '#f43f5e',
    HIGH: '#f59e0b',
    MODERATE: '#38bdf8',
  }[currentDossier.threat_level] || '#38bdf8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Hero / Incident Header */}
      <div className="card" style={{ padding: '24px', background: 'radial-gradient(circle at top right, rgba(34,211,238,0.08), rgba(15,23,42,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{currentDossier.avatar_icon}</span>
              <span className="badge" style={{ background: `${threatColor}22`, color: threatColor, border: `1px solid ${threatColor}44`, fontWeight: 700 }}>
                THREAT LEVEL: {currentDossier.threat_level}
              </span>
              <span className="badge badge-cyan">INCIDENT BRIEFING</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              {currentDossier.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Location: <strong style={{ color: '#e2e8f0' }}>{currentDossier.location}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {!isConnected ? (
              <button
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}
                onClick={async () => {
                  await startSession();
                  onEnterWarRoom();
                }}
              >
                🎙 Connect & Launch Crisis Line
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 700 }}
                onClick={onEnterWarRoom}
              >
                ➔ Return to Live War Room
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Grid Selector */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#cbd5e1', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Select Incident Scenario
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {Object.values(SCENARIO_DOSSIERS).map((sc) => {
            const isSelected = sc.id === scenarioId;
            return (
              <div
                key={sc.id}
                onClick={() => setScenarioId(sc.id)}
                className="card"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #22d3ee' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(34,211,238,0.06)' : 'rgba(10,18,34,0.6)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>ACTIVE</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{sc.avatar_icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '16px' }}>{sc.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sc.subject_name}</div>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '8px 0 12px 0' }}>
                  {sc.overview}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  <span>Status: <strong>{sc.hostages}</strong></span>
                  <span style={{ color: isSelected ? '#22d3ee' : 'inherit', fontWeight: 600 }}>
                    {isSelected ? 'Selected' : 'Click to Activate'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Dossier Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', marginBottom: '12px', letterSpacing: '0.04em' }}>
            🎯 FBI TACTICAL OBJECTIVES & RULES OF ENGAGEMENT
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.8 }}>
            <li><strong>Establish Emotional Rapport:</strong> Lower suspect arousal through active listening and mirror back key clauses.</li>
            <li><strong>Avoid Direct Rejection:</strong> Do not use absolute denials or make impossible logistical promises immediately.</li>
            <li><strong>Continuous Deception Monitoring:</strong> Watch the Dual-Stream Emotion Fusion indicator for incongruence.</li>
            <li><strong>Execute BCSM Progression:</strong> Climb sequentially from Active Listening to Behavioral Surrender.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b', marginBottom: '12px', letterSpacing: '0.04em' }}>
            🧠 SUSPECT PSYCHOLOGICAL PROFILE & VULNERABILITIES
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Primary Motive: </span>
              <strong>{currentDossier.primary_motive}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Demands: </span>
              <span>Armored vehicle, cleared perimeter corridor, non-negotiable deadline.</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Emotional Stability: </span>
              <span style={{ color: '#fb7185' }}>Volatile, prone to sudden panic spikes if boxed in.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
