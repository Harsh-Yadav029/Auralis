import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Radio, ShieldAlert, Award, PhoneCall, ChevronRight, Target, Users, MapPin } from 'lucide-react';
import { useWebRTC } from '../services/WebRTCContext';
import { SCENARIO_DOSSIERS } from '../components/ScenarioBriefingCard';
import { EmotionOrb } from '../components/EmotionOrb';

interface BriefingPageProps {
  onEnterWarRoom: () => void;
}

export const BriefingPage: React.FC<BriefingPageProps> = ({ onEnterWarRoom }) => {
  const { scenarioId, setScenarioId, isConnected, startSession, emotionLabel, arousal, valence } = useWebRTC();
  const currentDossier = SCENARIO_DOSSIERS[scenarioId] || SCENARIO_DOSSIERS.bank_hostage;
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.from(pageRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, []);

  return (
    <div
      ref={pageRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Hero / Incident Header Card */}
      <div className="glass-panel" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <EmotionOrb emotion={emotionLabel} arousal={arousal} valence={valence} size={100} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge badge-accent" style={{ gap: '6px' }}>
                  <ShieldAlert size={12} />
                  THREAT ASSESSMENT: {currentDossier.threat_level}
                </span>
                <span className="badge">TACTICAL INCIDENT BRIEFING</span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                {currentDossier.title}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--accent)" />
                Location: <strong style={{ color: 'var(--text)' }}>{currentDossier.location}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {!isConnected ? (
              <button
                className="btn btn-primary"
                style={{ padding: '0 28px', height: '46px', fontSize: '14px', fontWeight: 800, gap: '10px' }}
                onClick={async () => {
                  await startSession();
                  onEnterWarRoom();
                }}
              >
                <PhoneCall size={16} />
                <span>Connect & Launch Crisis Line</span>
              </button>
            ) : (
              <button
                className="btn btn-primary"
                style={{ padding: '0 28px', height: '46px', fontSize: '14px', fontWeight: 800, gap: '10px' }}
                onClick={onEnterWarRoom}
              >
                <span>Enter Live War Room</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Grid Selector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Radio size={16} color="var(--accent)" />
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select Crisis Negotiation Incident
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
          {Object.values(SCENARIO_DOSSIERS).map((sc) => {
            const isSelected = sc.id === scenarioId;
            return (
              <div
                key={sc.id}
                onClick={() => setScenarioId(sc.id)}
                className="glass-panel"
                style={{
                  padding: '24px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(240, 169, 75, 0.08)' : 'var(--surface)',
                  boxShadow: isSelected ? '0 0 28px rgba(240, 169, 75, 0.22)' : 'none',
                  borderRadius: 'var(--r-xl)',
                  transition: 'all 0.22s var(--ease-spring)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                      ACTIVE
                    </span>
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                      }}
                    >
                      {sc.avatar_icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '16px' }}>{sc.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--secondary)', fontWeight: 600 }}>{sc.subject_name}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '8px 0 16px 0' }}>
                    {sc.overview}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '14px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={13} color="var(--accent)" />
                    Status: <strong style={{ color: 'var(--text)' }}>{sc.hostages}</strong>
                  </span>
                  <span style={{ color: isSelected ? 'var(--accent)' : 'inherit', fontWeight: 700 }}>
                    {isSelected ? '✓ Active Scenario' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Dossier Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--r-xl)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--secondary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} />
            FBI TACTICAL OBJECTIVES & RULES OF ENGAGEMENT
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', fontSize: '13px', lineHeight: 1.9 }}>
            <li><strong>Ground Volatile Arousal:</strong> Lower suspect stress through mirror statements and steady pacing.</li>
            <li><strong>Continuous Affect Fusion:</strong> Watch for deception when stated calm contradicts acoustic pitch spikes.</li>
            <li><strong>Sub-150ms Barge-In Discipline:</strong> Allow the suspect to speak; interrupt only with precise tactical pivots.</li>
            <li><strong>BCSM Progression:</strong> Guide the dialogue systematically to win non-violent voluntary surrender.</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--r-xl)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} />
            SUSPECT PSYCHOLOGICAL PROFILE & DEMANDS
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Core Motive: </span>
              <strong style={{ color: 'var(--text)' }}>{currentDossier.primary_motive}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Subject Demands: </span>
              <span>Armored vehicle extraction, unmonitored corridor, strict deadline.</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Acoustic Volatility: </span>
              <span style={{ color: 'var(--danger-text)', fontWeight: 600 }}>Prone to sudden panic spikes if pressured prematurely.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
