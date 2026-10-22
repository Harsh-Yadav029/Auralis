import React from 'react';
import { useTheme, ThemePreference } from '../services/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { themePreference, resolvedTheme, setThemePreference } = useTheme();

  const options: { value: ThemePreference; label: string; desc: string; icon: string }[] = [
    { value: 'system', label: 'System Default', desc: 'Syncs automatically with your operating system color mode', icon: '💻' },
    { value: 'dark', label: 'Dark Theme', desc: 'Default high-contrast dark surface (#0F1115)', icon: '🌙' },
    { value: 'light', label: 'Light Theme', desc: 'Warm cream-paper light surface (#FAF7F2)', icon: '☀️' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-accent">PREFERENCES</span>
          <span className="badge">MOCK STORAGE PERSISTENCE</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0' }}>
          Theme & Display Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Manage your color theme preferences. Currently resolved theme:{' '}
          <strong style={{ color: 'var(--accent)' }}>{resolvedTheme.toUpperCase()}</strong>
        </p>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
          Color Mode Override
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--surface-elevated)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '22px' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </div>

                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid var(--accent)' : '2px solid var(--border-interactive)',
                    background: 'var(--surface)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone Demonstration for Rule 6 */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--danger-border)', background: 'var(--danger-bg)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--danger-text)', marginBottom: '8px' }}>
          Destructive Action Demonstration (Rule 6)
        </h2>
        <p style={{ color: 'var(--danger-text)', fontSize: '12px', marginBottom: '16px', opacity: 0.9 }}>
          Destructive actions use explicit danger tokens and always include full text labels, not just color signals.
        </p>
        <button
          className="btn btn-danger"
          onClick={() => alert('Simulated Session Reset')}
        >
          🗑️ Clear Call Logs & Reset Cache
        </button>
      </div>
    </div>
  );
};
