import React, { useState } from 'react';
import { WebRTCProvider, useWebRTC } from './services/WebRTCContext';
import { BriefingPage } from './pages/BriefingPage';
import { WarRoomPage } from './pages/WarRoomPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScorecardPage } from './pages/ScorecardPage';
import { TelemetryPage } from './pages/TelemetryPage';

type NavPage = 'briefing' | 'warroom' | 'analytics' | 'scorecard' | 'telemetry';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('warroom');
  const {
    isConnected,
    sessionState,
    startSession,
    stopSession,
    elapsed,
    formatTime,
    ttfa,
    emotionLabel,
    statusNotice,
    setStatusNotice,
  } = useWebRTC();

  const navItems: { id: NavPage; label: string; icon: string }[] = [
    { id: 'briefing', label: 'Briefing', icon: '🎯' },
    { id: 'warroom', label: 'War Room', icon: '🎙' },
    { id: 'analytics', label: 'Emotion Radar', icon: '🧠' },
    { id: 'scorecard', label: 'BCSM Scorecard', icon: '🏅' },
    { id: 'telemetry', label: 'Telemetry', icon: '⚡' },
  ];

  const stateColors: Record<string, string> = {
    IDLE: '#64748b',
    LISTENING: '#22d3ee',
    THINKING: '#a78bfa',
    SPEAKING: '#34d399',
    INTERRUPTED: '#f43f5e',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Top Universal Navbar */}
      <header
        style={{
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(5,11,22,0.92)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(34,211,238,0.3)',
            }}
          >
            ⚡
          </div>
          <div>
            <div className="gradient-text" style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.1em' }}>
              AURALIS
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Voice Emotion Engine
            </div>
          </div>
        </div>

        {/* Center: Navigation Bar */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Persistent Call Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isConnected && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#22d3ee',
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)',
                padding: '4px 10px',
                borderRadius: '6px',
              }}
            >
              {formatTime(elapsed)}
            </div>
          )}

          {isConnected ? (
            <button className="btn btn-danger btn-sm" onClick={stopSession}>
              Disconnect
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={startSession}>
              Connect Call
            </button>
          )}
        </div>
      </header>

      {/* Floating Status / Telemetry Ribbon */}
      <div
        style={{
          height: '36px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10,18,34,0.7)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: stateColors[sessionState] || '#64748b',
                boxShadow: `0 0 6px ${stateColors[sessionState]}`,
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>State:</span>
            <strong style={{ color: stateColors[sessionState], fontFamily: 'var(--font-mono)' }}>
              {sessionState}
            </strong>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Emotion:</span>
            <strong style={{ color: '#f1f5f9' }}>{emotionLabel}</strong>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Latency (TTFA):</span>
            <strong style={{ color: ttfa > 0 && ttfa <= 800 ? '#34d399' : '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {ttfa > 0 ? `${ttfa}ms` : '—'}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <span>aiortc • Whisper • Wav2Vec2 • Groq • Cartesia</span>
        </div>
      </div>

      {/* Error / Status Notice */}
      {statusNotice && (
        <div
          style={{
            padding: '8px 24px',
            background: 'rgba(244,63,94,0.1)',
            borderBottom: '1px solid rgba(244,63,94,0.25)',
            color: '#fb7185',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {statusNotice}</span>
          <button
            onClick={() => setStatusNotice(null)}
            style={{ background: 'transparent', border: 'none', color: '#fb7185', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Multi-Page Container */}
      <main style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        {currentPage === 'briefing' && (
          <BriefingPage onEnterWarRoom={() => setCurrentPage('warroom')} />
        )}
        {currentPage === 'warroom' && (
          <WarRoomPage
            onGoToAnalytics={() => setCurrentPage('analytics')}
            onGoToScorecard={() => setCurrentPage('scorecard')}
          />
        )}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'scorecard' && <ScorecardPage />}
        {currentPage === 'telemetry' && <TelemetryPage />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WebRTCProvider>
      <AppContent />
    </WebRTCProvider>
  );
};
