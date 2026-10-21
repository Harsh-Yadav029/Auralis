import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';

export const TelemetryPage: React.FC = () => {
  const { ttfa, isConnected, sessionState } = useWebRTC();

  const services = [
    { name: 'Frontend Client', port: '5173', role: 'React 18 + Web Audio API', status: 'ONLINE', latency: '< 5ms' },
    { name: 'WebRTC Gateway', port: '8000', role: 'FastAPI + aiortc PeerConnection', status: isConnected ? 'CONNECTED' : 'STANDBY', latency: '~20ms' },
    { name: 'ML Audio Service', port: '8001', role: 'Silero VAD + Faster-Whisper + Wav2Vec2', status: 'ACTIVE', latency: '~160ms' },
    { name: 'Groq LPU Engine', port: 'Cloud', role: 'Llama 3.1 8B Instant (LLM)', status: 'ACTIVE', latency: '~80ms TTFT' },
    { name: 'Cartesia Sonic', port: 'Cloud', role: 'Ultra-low latency streaming TTS', status: 'ACTIVE', latency: '~150ms TTFB' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="card" style={{ padding: '20px', background: 'radial-gradient(circle at top right, rgba(52,211,153,0.08), rgba(15,23,42,0.9))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-emerald">SYSTEM DIAGNOSTICS & TELEMETRY</span>
              <span className="badge badge-cyan">SLA BUDGET &lt; 800MS</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Architecture Latency & Service Telemetry
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MEASURED TIME-TO-FIRST-AUDIO (TTFA)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: ttfa > 0 && ttfa <= 800 ? '#34d399' : '#fbbf24' }}>
              {ttfa > 0 ? `${ttfa}ms` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Latency Breakdown Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase' }}>
          Turnaround Pipeline Latency Budget
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: 'rgba(15,25,48,0.8)' }}>
            <div style={{ width: '4%', background: '#38bdf8' }} title="WebRTC Ingestion: 20ms" />
            <div style={{ width: '15%', background: '#818cf8' }} title="Silero VAD: 80ms" />
            <div style={{ width: '22%', background: '#a78bfa' }} title="Whisper ASR: 120ms" />
            <div style={{ width: '15%', background: '#f59e0b' }} title="Groq LLM TTFT: 80ms" />
            <div style={{ width: '28%', background: '#34d399' }} title="Cartesia TTS TTFB: 150ms" />
            <div style={{ width: '16%', background: 'rgba(148,163,184,0.15)' }} title="Remaining SLA Margin" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#38bdf8' }}>■ WebRTC (20ms)</span>
            <span style={{ color: '#818cf8' }}>■ Silero VAD (80ms)</span>
            <span style={{ color: '#a78bfa' }}>■ Whisper ASR (120ms)</span>
            <span style={{ color: '#f59e0b' }}>■ Groq LLM (80ms)</span>
            <span style={{ color: '#34d399' }}>■ Cartesia TTS (150ms)</span>
            <span>Target: &lt; 800ms</span>
          </div>
        </div>
      </div>

      {/* Microservice Status Grid */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase' }}>
          Microservice Health & Ports
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {services.map((srv, idx) => (
            <div key={idx} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{srv.name}</span>
                <span className="badge badge-emerald" style={{ fontSize: '10px' }}>{srv.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>{srv.role}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Port / Target: <strong style={{ color: '#e2e8f0' }}>{srv.port}</strong></span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{srv.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
