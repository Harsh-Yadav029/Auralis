import React from 'react';

interface TokenInfo {
  name: string;
  darkHex: string;
  lightHex: string;
  darkContrastVsBg: string;
  lightContrastVsBg: string;
  category: string;
}

const TOKENS: TokenInfo[] = [
  { name: '--bg', darkHex: '#0F1115', lightHex: '#FAF7F2', darkContrastVsBg: '1.00:1 (Base)', lightContrastVsBg: '1.00:1 (Base)', category: 'Background' },
  { name: '--surface', darkHex: '#181B22', lightHex: '#FFFFFF', darkContrastVsBg: '1.14:1 (Card surface)', lightContrastVsBg: '1.07:1 (Card surface)', category: 'Background' },
  { name: '--border', darkHex: '#262A33', lightHex: '#E6DFD3', darkContrastVsBg: '1.32:1 (Subtle divider)', lightContrastVsBg: '1.24:1 (Subtle divider)', category: 'Borders' },
  { name: '--border-interactive', darkHex: '#5A6275', lightHex: '#948C7E', darkContrastVsBg: '3.09:1 (Passes 3:1)', lightContrastVsBg: '3.11:1 (Passes 3:1)', category: 'Borders' },
  { name: '--text', darkHex: '#ECE9E2', lightHex: '#1E1B16', darkContrastVsBg: '15.59:1 (Passes 4.5:1)', lightContrastVsBg: '16.06:1 (Passes 4.5:1)', category: 'Typography' },
  { name: '--text-muted', darkHex: '#A3A8B3', lightHex: '#6B6458', darkContrastVsBg: '7.93:1 (Passes 4.5:1)', lightContrastVsBg: '5.48:1 (Passes 4.5:1)', category: 'Typography' },
  { name: '--accent', darkHex: '#F0A94B', lightHex: '#B45309', darkContrastVsBg: '9.43:1 (Focus pass)', lightContrastVsBg: '4.70:1 (Focus pass)', category: 'Interactive' },
  { name: '--on-accent', darkHex: '#0F1115', lightHex: '#FFFFFF', darkContrastVsBg: '9.43:1 vs accent', lightContrastVsBg: '5.02:1 vs accent', category: 'Interactive' },
  { name: '--secondary', darkHex: '#7FC8B8', lightHex: '#0F766E', darkContrastVsBg: '10.85:1 vs dark bg', lightContrastVsBg: '4.62:1 vs light bg', category: 'Interactive' },
  { name: '--danger-text', darkHex: '#F2B8B0', lightHex: '#B42318', darkContrastVsBg: '8.80:1 vs danger-bg', lightContrastVsBg: '5.75:1 vs danger-bg', category: 'Destructive' },
  { name: '--danger-bg', darkHex: '#3A1F1C', lightHex: '#FDECEA', darkContrastVsBg: 'Surface base', lightContrastVsBg: 'Surface base', category: 'Destructive' },
  { name: '--danger-border', darkHex: '#6B3029', lightHex: '#F3B5AE', darkContrastVsBg: 'Border boundary', lightContrastVsBg: 'Border boundary', category: 'Destructive' },
];

export const DevColorsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="badge badge-accent">DEV TOOL</span>
          <span className="badge">WCAG 2.1 AA</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: '0 0 6px 0' }}>
          /dev/colors — Bhaav Design Tokens Swatch Sheet
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Side-by-side comparison of Dark (default) and Light theme tokens with calculated contrast ratios against their respective backgrounds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Dark Theme Column */}
        <div style={{ background: '#0F1115', border: '1px solid #262A33', borderRadius: '16px', padding: '20px', color: '#ECE9E2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ECE9E2' }}>🌙 Dark Theme Swatches</h2>
            <span style={{ fontSize: '11px', color: '#A3A8B3' }}>bg: #0F1115</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TOKENS.map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#181B22',
                  border: '1px solid #262A33',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: t.darkHex,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#ECE9E2' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#A3A8B3' }}>{t.darkHex}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#7FC8B8' }}>{t.darkContrastVsBg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Light Theme Column */}
        <div style={{ background: '#FAF7F2', border: '1px solid #E6DFD3', borderRadius: '16px', padding: '20px', color: '#1E1B16' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B16' }}>☀️ Light Theme Swatches</h2>
            <span style={{ fontSize: '11px', color: '#6B6458' }}>bg: #FAF7F2</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {TOKENS.map((t) => (
              <div
                key={t.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  border: '1px solid #E6DFD3',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: t.lightHex,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: '#1E1B16' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B6458' }}>{t.lightHex}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#0F766E' }}>{t.lightContrastVsBg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
