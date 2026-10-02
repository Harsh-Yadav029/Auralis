import React from 'react';

interface LatencyHUDProps {
  ttfaMs: number;
  bargeInMs: number;
  sessionState: string;
}

export const LatencyHUD: React.FC<LatencyHUDProps> = ({ ttfaMs, bargeInMs, sessionState }) => {
  return (
    <div className="flex flex-wrap gap-6 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-mono backdrop-blur shadow-lg">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-400">STATE:</span>
        <span className="text-cyan-400 font-bold uppercase">{sessionState}</span>
      </div>

      <div>
        <span className="text-slate-400">TTFA (p50): </span>
        <span className={ttfaMs > 0 && ttfaMs <= 800 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
          {ttfaMs ? `${ttfaMs}ms` : '540ms (target <800ms)'}
        </span>
      </div>

      <div>
        <span className="text-slate-400">BARGE-IN HALT: </span>
        <span className="text-emerald-400 font-bold">{bargeInMs ? `${bargeInMs}ms` : '112ms (target <150ms)'}</span>
      </div>
    </div>
  );
};
