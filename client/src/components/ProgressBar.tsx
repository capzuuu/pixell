import React from 'react';

interface ProgressBarProps {
  progressSeconds: number;
  durationSeconds: number;
  showText?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressSeconds,
  durationSeconds,
  showText = false,
  className = '',
}) => {
  const percentage = durationSeconds > 0
    ? Math.min(100, Math.max(0, Math.round((progressSeconds / durationSeconds) * 100)))
    : 0;

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span>Progress</span>
          <span className="font-semibold text-brand-300">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-pink rounded-full transition-all duration-300 shadow-glow-brand"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
