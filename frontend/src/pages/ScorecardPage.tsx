import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Award, CheckCircle2, ChevronRight, Target, Shield, BookOpen } from 'lucide-react';
import { useWebRTC } from '../services/WebRTCContext';
import { BCSMStaircase } from '../components/BCSMStaircase';

export const ScorecardPage: React.FC = () => {
  const { bcsmData, isConnected } = useWebRTC();
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

  const stages = [
    {
      num: 1,
      title: 'Active Listening',
      desc: 'Demonstrate deep attunement using emotional labeling, mirroring, and tactical pauses.',
      weight: 'Step 1: Baseline',
      color: '#F0A94B',
    },
    {
      num: 2,
      title: 'Empathy',
      desc: 'Validate the subject’s inner reality and emotional grievance without endorsing violence.',
      weight: 'Step 2: Foundation',
      color: '#00F2FE',
    },
    {
      num: 3,
      title: 'Rapport',
      desc: 'Foster reciprocal trust. The subject lowers defensive walls and begins voluntary disclosures.',
      weight: 'Step 3: Turning Point',
      color: '#A855F7',
    },
    {
      num: 4,
      title: 'Influence',
      desc: 'Collaborative problem solving. The subject welcomes suggestions, alternatives, and compromises.',
      weight: 'Step 4: Action Phase',
      color: '#3B82F6',
    },
    {
      num: 5,
      title: 'Behavioral Change',
      desc: 'Surrender of weapons, release of hostages, and peaceful resolution without tactical breach.',
      weight: 'Step 5: Mission Success',
      color: '#10B981',
    },
  ];

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
      {/* SaaS Scorecard Header */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-accent" style={{ gap: '6px' }}>
                <Award size={12} />
                FBI CRISIS NEGOTIATION UNIT
              </span>
              {isConnected && (
                <span className="badge badge-secondary" style={{ gap: '6px' }}>
                  <Shield size={12} />
                  LIVE BCSM SCORING
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Behavioral Change Stairway Model (BCSM)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              Asynchronous evaluation of tactical de-escalation mastery across 5 sequential tiers
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: '14px 22px',
              borderRadius: '16px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CURRENT STAIRWAY TIER
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'var(--accent)',
                marginTop: '4px',
              }}
            >
              {bcsmData?.stage_name || 'Stage 1: Active Listening'}
            </div>
          </div>
        </div>
      </div>

      {/* Main BCSM Staircase Visualizer */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--r-xl)' }}>
        <BCSMStaircase data={bcsmData} />
      </div>

      {/* 5-Stage Explanatory SaaS Matrix */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={16} color="var(--accent)" />
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            BCSM Tier Criteria & Progression Rules
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
          {stages.map((st) => {
            const isCurrent = bcsmData?.stage === st.num;
            return (
              <div
                key={st.num}
                className="glass-panel"
                style={{
                  padding: '20px',
                  border: isCurrent ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isCurrent ? 'rgba(240, 169, 75, 0.08)' : 'var(--surface)',
                  boxShadow: isCurrent ? '0 0 24px rgba(240, 169, 75, 0.2)' : 'none',
                  borderRadius: 'var(--r-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span
                      className="badge"
                      style={{
                        fontSize: '10px',
                        borderColor: st.color,
                        color: st.color,
                        background: 'rgba(0,0,0,0.3)',
                      }}
                    >
                      TIER {st.num}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{st.weight}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                    {st.title}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {st.desc}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: isCurrent ? 'var(--accent)' : 'var(--text-dim)',
                    fontWeight: 700,
                    marginTop: '16px',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '10px',
                  }}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 size={13} color="var(--accent)" />
                      <span>Currently Assessing</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight size={13} />
                      <span>Sequential Milestone</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
