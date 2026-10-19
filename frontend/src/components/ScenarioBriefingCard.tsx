import React from 'react';

export interface ScenarioDossier {
  id: string;
  title: string;
  subject_name: string;
  threat_level: 'CRITICAL' | 'HIGH' | 'MODERATE';
  location: string;
  hostages: string;
  overview: string;
  avatar_icon: string;
  primary_motive: string;
}

export const SCENARIO_DOSSIERS: Record<string, ScenarioDossier> = {
  bank_hostage: {
    id: 'bank_hostage',
    title: 'Armed Bank Robbery',
    subject_name: 'Mark Vance (Age 34)',
    threat_level: 'CRITICAL',
    location: 'First Federal Savings, Vault Room B',
    hostages: '4 civilian bank employees',
    overview: 'Suspect is armed with a 9mm firearm. Cornered by tactical units. Demands an armored escape vehicle and unobstructed interstate transit.',
    avatar_icon: '🚨',
    primary_motive: 'Financial desperation / Extreme fear of lifetime imprisonment'
  },
  bridge_jumper: {
    id: 'bridge_jumper',
    title: 'Suicide Intervention',
    subject_name: 'David Cole (Age 28)',
    threat_level: 'HIGH',
    location: 'Bay Suspension Bridge, North Outer Rail',
    hostages: 'Self-harm danger',
    overview: 'Subject is perched on a 6-inch steel beam above icy water. Severely depressed, emotionally disconnected. Hostile to standard police commands.',
    avatar_icon: '🌊',
    primary_motive: 'Severe depressive isolation / Perception of worthlessness'
  },
  cyber_extortion: {
    id: 'cyber_extortion',
    title: 'Healthcare Ransomware Syndicate',
    subject_name: 'Cipher-X Lead Operative',
    threat_level: 'MODERATE',
    location: 'Darknet Encrypted VoIP Relay',
    hostages: '350 hospital ICU life-support networks',
    overview: 'Syndicate locked pediatric hospital infrastructure. Demands 50 BTC. 40-minute hard ultimatum before private master decryption keys are erased.',
    avatar_icon: '💻',
    primary_motive: 'Organized financial extortion / Leverage testing'
  }
};

interface ScenarioBriefingCardProps {
  scenarioId: string;
  onScenarioSelect: (id: string) => void;
  isConnected: boolean;
}

export const ScenarioBriefingCard: React.FC<ScenarioBriefingCardProps> = ({
  scenarioId,
  onScenarioSelect,
  isConnected
}) => {
  const current = SCENARIO_DOSSIERS[scenarioId] || SCENARIO_DOSSIERS.bank_hostage;

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' };
      case 'HIGH': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      default: return { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.4)' };
    }
  };

  const threat = getThreatColor(current.threat_level);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: '22px',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {current.avatar_icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
                {current.subject_name}
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: '999px',
                background: threat.bg,
                color: threat.text,
                border: `1px solid ${threat.border}`
              }}>
                {current.threat_level} THREAT
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              📍 {current.location}
            </span>
          </div>
        </div>

        {/* Tactical Scenario Quick Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Incident:</span>
          <select
            value={scenarioId}
            onChange={(e) => onScenarioSelect(e.target.value)}
            disabled={isConnected}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              outline: 'none',
              cursor: isConnected ? 'not-allowed' : 'pointer',
              opacity: isConnected ? 0.7 : 1
            }}
          >
            <option value="bank_hostage">Vault Siege (Mark Vance)</option>
            <option value="bridge_jumper">Bridge Ledge (David Cole)</option>
            <option value="cyber_extortion">Darknet Call (Cipher-X)</option>
          </select>
        </div>
      </div>

      {/* Briefing Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '16px',
        alignItems: 'center',
        padding: '10px 14px',
        background: 'rgba(2, 6, 23, 0.5)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong style={{ color: '#38bdf8', marginRight: '6px' }}>TACTICAL DOSSIER:</strong>
          {current.overview}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '2px',
          borderLeft: '1px solid rgba(51, 65, 85, 0.6)',
          paddingLeft: '14px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Hostages / Stake:</span>
          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>{current.hostages}</span>
        </div>
      </div>
    </div>
  );
};
