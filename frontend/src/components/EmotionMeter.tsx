import React from 'react';

interface EmotionMeterProps {
  arousal: number;
  valence: number;
  label: string;
}

export const EmotionMeter: React.FC<EmotionMeterProps> = ({ arousal, valence, label }) => {
  const getBadgeColor = () => {
    if (arousal > 0.7) return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (arousal > 0.4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Acoustic Emotion Meter</span>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-widest ${getBadgeColor()}`}>
          {label}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Arousal (Acoustic Energy)</span>
            <span className="font-mono text-rose-400">{(arousal * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${arousal * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Valence (Positivity Index)</span>
            <span className="font-mono text-cyan-400">{(((valence + 1) / 2) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${((valence + 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
