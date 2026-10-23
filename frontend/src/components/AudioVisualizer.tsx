import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  color?: string;
  height?: number;
}

// Helper to resolve CSS variables like 'var(--accent)' into real computed hex/rgba strings for HTML5 Canvas
const resolveColor = (colorStr: string, fallback: string = '#F0A94B'): string => {
  if (!colorStr) return fallback;
  if (!colorStr.startsWith('var(')) return colorStr;
  if (typeof window === 'undefined') return fallback;

  const varName = colorStr.replace(/var\(|\)/g, '').trim();
  const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return computed || fallback;
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  color = '#F0A94B',
  height = 48
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId: number;

    const render = () => {
      animationId = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const resolvedColor = resolveColor(color, '#F0A94B');
      const barWidth = (canvas.width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height);
        
        // Gradient styling
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, resolvedColor);
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.shadowColor = resolvedColor;
        ctx.shadowBlur = 6;
        
        // Rounded bar top
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, canvas.height - barHeight, Math.max(2, barWidth - 2.5), barHeight, [3, 3, 0, 0]);
        } else {
          ctx.rect(x, canvas.height - barHeight, Math.max(2, barWidth - 2.5), barHeight);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      audioCtx.close();
    };
  }, [stream, color]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={height}
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'block',
        borderRadius: '8px',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
      }}
    />
  );
};
