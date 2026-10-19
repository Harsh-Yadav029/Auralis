import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  color?: string;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream, color = '#38bdf8', height = 64 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    const source = audioCtx.createMediaStreamSource(stream);
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

      const barWidth = (canvas.width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height);
        
        // Gradient styling
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        
        // Rounded bar top
        ctx.beginPath();
        ctx.roundRect(x, canvas.height - barHeight, Math.max(2, barWidth - 2.5), barHeight, [3, 3, 0, 0]);
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
        borderRadius: '12px',
        background: 'rgba(2, 6, 23, 0.7)',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}
    />
  );
};
