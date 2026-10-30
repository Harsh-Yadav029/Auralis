import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Settings as SettingsIcon, Moon, Sun, Monitor, AlertOctagon, ShieldCheck } from 'lucide-react';
import { useTheme, ThemePreference } from '../services/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();
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

  const options: { value: ThemePreference; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'system',
      label: 'System Sync',
      desc: 'Matches operating system light/dark display preference automatically',
      icon: <Monitor size={20} color="var(--secondary)" />,
    },
    {
      value: 'dark',
      label: 'Deep Obsidian Dark',
      desc: 'High-contrast glassmorphic dark theme for low-light environments',
      icon: <Moon size={20} color="var(--accent)" />,
    },
    {
      value: 'light',
      label: 'Executive Paper Light',
      desc: 'Ultra-clean high-legibility daytime SaaS theme with crisp borders',
      icon: <Sun size={20} color="#EA580C" />,
    },
  ];

  return (
    <div
      ref={pageRef}
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
      }}
    >
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-accent" style={{ gap: '6px' }}>
            <SettingsIcon size={12} />
            PREFERENCES
          </span>
          <span className="badge" style={{ gap: '6px' }}>
            <ShieldCheck size={12} color="var(--emerald)" />
            LOCAL PERSISTENCE
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Display & Client Environment Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Manage your interface appearance and audio rendering mode. Active theme:{' '}
          <strong style={{ color: 'var(--accent)' }}>{resolvedTheme.toUpperCase()}</strong>
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--r-xl)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', marginBottom: '16px' }}>
          Theme Appearance Mode
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {options.map((opt) => {
            const isSelected = themePreference === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => setThemePreference(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'rgba(240, 169, 75, 0.08)' : 'rgba(0, 0, 0, 0.2)',
                  boxShadow: isSelected ? '0 0 24px rgba(240, 169, 75, 0.18)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s var(--ease-spring)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? '6px solid var(--accent)' : '2px solid var(--border)',
                    background: 'transparent',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          border: '1px solid var(--danger-border)',
          background: 'var(--danger-bg)',
          borderRadius: 'var(--r-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AlertOctagon size={18} color="var(--danger-text)" />
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--danger-text)', margin: 0 }}>
            Session Reset & Cache Clear
          </h2>
        </div>
        <p style={{ color: 'var(--danger-text)', fontSize: '13px', marginBottom: '18px', opacity: 0.9, lineHeight: 1.5 }}>
          Flushes active WebRTC audio queues, resets BCSM Staircase metrics, and clears local browser session state.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{ gap: '8px', padding: '0 22px' }}
        >
          <AlertOctagon size={14} />
          <span>Reset Session Data & Hard Reload</span>
        </button>
      </div>
    </div>
  );
};
