import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Mic,
  Radio,
  Brain,
  Award,
  Activity,
  Settings,
  Palette,
  PhoneCall,
  PhoneOff,
  Sun,
  Moon,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { WebRTCProvider, useWebRTC } from './services/WebRTCContext';
import { ThemeProvider, useTheme } from './services/ThemeContext';
import { BriefingPage } from './pages/BriefingPage';
import { WarRoomPage } from './pages/WarRoomPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScorecardPage } from './pages/ScorecardPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { SettingsPage } from './pages/SettingsPage';
import { DevColorsPage } from './pages/DevColorsPage';
import { ThreeBackground } from './components/ThreeBackground';

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

  const headerRef = useRef<HTMLElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Page Transitions
  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(
        mainContentRef.current,
        { opacity: 0, y: 15, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentPage]);

  // Initial header entrance
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    }
  }, []);

  const navItems: { id: NavPage; label: string; icon: React.ReactNode }[] = [
    { id: 'briefing', label: 'Briefing', icon: <Radio size={16} /> },
    { id: 'warroom', label: 'War Room', icon: <Mic size={16} /> },
    { id: 'analytics', label: 'Emotion Radar', icon: <Brain size={16} /> },
    { id: 'scorecard', label: 'BCSM Stairway', icon: <Award size={16} /> },
    { id: 'telemetry', label: 'Telemetry', icon: <Activity size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { id: 'devcolors', label: '/dev/colors', icon: <Palette size={16} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 3D Neural Particle & Waveform Background */}
      <ThreeBackground intensity={resolvedTheme === 'dark' ? 0.9 : 0.45} />

      {/* Top Universal Ultra-SaaS Navbar */}
      <header
        ref={headerRef}
        className="glass-panel"
        style={{
          height: '68px',
          margin: '12px 20px 0 20px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '12px',
          zIndex: 100,
        }}
      >
        {/* Brand / Logo with Neon Accent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              color: 'var(--on-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '18px',
              boxShadow: '0 4px 18px var(--accent-glow)',
            }}
          >
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.08em', color: 'var(--text)' }}>
                AURALIS
              </span>
              <span className="badge badge-accent" style={{ fontSize: '9px', padding: '2px 8px' }}>
                AI VOICE OS
              </span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Full-Duplex Crisis Intelligence
            </div>
          </div>
        </div>

        {/* Center: Interactive SaaS Navigation Pill Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid var(--border)',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? 'var(--on-accent)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.22s var(--ease-spring)',
                  boxShadow: isActive ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Controls & Live Session Launcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick theme cycle button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              if (themePreference === 'system') setThemePreference('dark');
              else if (themePreference === 'dark') setThemePreference('light');
              else setThemePreference('system');
            }}
            title="Toggle Theme"
            style={{ borderRadius: '10px' }}
          >
            {resolvedTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
          </button>

          {isConnected && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--secondary)',
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 16px rgba(0, 242, 254, 0.2)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--secondary)',
                  boxShadow: '0 0 8px var(--secondary)',
                }}
              />
              {formatTime(elapsed)}
            </div>
          )}

          {isConnected ? (
            <button className="btn btn-danger btn-sm" onClick={stopSession} style={{ gap: '6px' }}>
              <PhoneOff size={14} />
              <span>Disconnect</span>
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={startSession} style={{ gap: '6px' }}>
              <PhoneCall size={14} />
              <span>Connect Call</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Tactical Telemetry Ribbon */}
      <div
        ref={ribbonRef}
        className="glass-panel"
        style={{
          margin: '10px 20px 0 20px',
          height: '42px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? 'var(--emerald)' : 'var(--text-dim)',
                boxShadow: isConnected ? '0 0 10px var(--emerald)' : 'none',
              }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Engine State:</span>
            <strong
              style={{
                color: isConnected ? 'var(--accent)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}
            >
              {sessionState}
            </strong>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Acoustic Affect:</span>
            <span className="badge badge-accent" style={{ fontSize: '10px' }}>
              {emotionLabel}
            </span>
          </div>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={13} color="var(--secondary)" />
            <span style={{ color: 'var(--text-muted)' }}>Response TTFA:</span>
            <strong style={{ color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>
              {ttfa > 0 ? `${ttfa}ms` : '—'}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--text-muted)', fontSize: '11px' }}>
          <span>Latency SLA: <strong style={{ color: 'var(--emerald)' }}>&lt;800ms Passed</strong></span>
          <span>• Barge-in SLA: <strong style={{ color: 'var(--accent)' }}>&lt;150ms Active</strong></span>
        </div>
      </div>

      {/* Status Notice Alert with Pulse */}
      {statusNotice && (
        <div
          className="glass-panel"
          style={{
            margin: '10px 20px 0 20px',
            padding: '10px 20px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={16} />
            <span>{statusNotice}</span>
          </div>
          <button
            onClick={() => setStatusNotice(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger-text)',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main SaaS Multi-Page Container */}
      <main ref={mainContentRef} style={{ flex: 1, padding: '16px 20px 24px 20px', overflowY: 'auto' }}>
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
