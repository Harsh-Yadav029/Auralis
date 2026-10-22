import React, { useState } from 'react';
import { WebRTCProvider, useWebRTC } from './services/WebRTCContext';
import { ThemeProvider, useTheme } from './services/ThemeContext';
import { BriefingPage } from './pages/BriefingPage';
import { WarRoomPage } from './pages/WarRoomPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScorecardPage } from './pages/ScorecardPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DevColorsPage } from './pages/DevColorsPage';

type NavPage = 'briefing' | 'warroom' | 'analytics' | 'scorecard' | 'telemetry' | 'settings' | 'devcolors';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavPage>('warroom');
  const { themePreference, setThemePreference, resolvedTheme } = useTheme();
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
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'devcolors', label: '/dev/colors', icon: '🎨' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Universal Navbar */}
      <header
        style={{
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
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
              background: 'var(--accent)',
              color: 'var(--on-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--text)' }}>
              AURALIS
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Bhaav Emotion Design System
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
                  border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                  background: isActive ? 'var(--surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
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

        {/* Right: Quick Theme Switcher & Call Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick theme cycle button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (themePreference === 'system') setThemePreference('dark');
              else if (themePreference === 'dark') setThemePreference('light');
              else setThemePreference('system');
            }}
            title="Toggle Theme (System / Dark / Light)"
          >
            {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {isConnected && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
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

      {/* Floating Status Ribbon */}
      <div
        style={{
          height: '36px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-elevated)',
          borderBottom: '1px solid var(--border)',
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
                background: isConnected ? 'var(--secondary)' : 'var(--text-muted)',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>State:</span>
            <strong style={{ color: isConnected ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {sessionState}
            </strong>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Emotion:</span>
            <strong style={{ color: 'var(--text)' }}>{emotionLabel}</strong>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>TTFA:</span>
            <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {ttfa > 0 ? `${ttfa}ms` : '—'}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <span>Theme: <strong style={{ color: 'var(--accent)' }}>{resolvedTheme}</strong></span>
          <span>• Mode: <strong>{themePreference}</strong></span>
        </div>
      </div>

      {/* Status Notice */}
      {statusNotice && (
        <div
          style={{
            padding: '8px 24px',
            background: 'var(--danger-bg)',
            borderBottom: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {statusNotice}</span>
          <button
            onClick={() => setStatusNotice(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger-text)', cursor: 'pointer' }}
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
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'devcolors' && <DevColorsPage />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <WebRTCProvider>
        <AppContent />
      </WebRTCProvider>
    </ThemeProvider>
  );
};
