import React from 'react';
import { useWebRTC } from '../services/WebRTCContext';

export const TelemetryPage: React.FC = () => {
  const { ttfa, isConnected } = useWebRTC();

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
      <div className="card" style={{ padding: '24px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-accent">SYSTEM DIAGNOSTICS & TELEMETRY</span>
              <span className="badge">SLA BUDGET &lt; 800MS</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Architecture Latency & Service Telemetry
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MEASURED TIME-TO-FIRST-AUDIO (TTFA)</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>
              {ttfa > 0 ? `${ttfa}ms` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Latency Breakdown Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', textTransform: 'uppercase' }}>
          Turnaround Pipeline Latency Budget
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', height: '24px', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <div style={{ width: '4%', background: 'var(--accent)' }} title="WebRTC Ingestion: 20ms" />
            <div style={{ width: '15%', background: 'var(--secondary)' }} title="Silero VAD: 80ms" />
            <div style={{ width: '22%', background: 'var(--border-interactive)' }} title="Whisper ASR: 120ms" />
            <div style={{ width: '15%', background: 'var(--accent)' }} title="Groq LLM TTFT: 80ms" />
            <div style={{ width: '28%', background: 'var(--secondary)' }} title="Cartesia TTS TTFB: 150ms" />
            <div style={{ width: '16%', background: 'var(--surface)' }} title="Remaining SLA Margin" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
            <span>■ WebRTC (20ms)</span>
            <span>■ Silero VAD (80ms)</span>
            <span>■ Whisper ASR (120ms)</span>
            <span>■ Groq LLM (80ms)</span>
            <span>■ Cartesia TTS (150ms)</span>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Target: &lt; 800ms</span>
          </div>
        </div>
      </div>

      {/* Microservice Status Grid */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', textTransform: 'uppercase' }}>
          Microservice Health & Ports
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {services.map((srv, idx) => (
            <div key={idx} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{srv.name}</span>
                <span className="badge badge-secondary" style={{ fontSize: '10px' }}>{srv.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{srv.role}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Port / Target: <strong style={{ color: 'var(--text)' }}>{srv.port}</strong></span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{srv.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
