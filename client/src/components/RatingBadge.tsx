import React from 'react';

interface RatingBadgeProps {
  rating: string;
  size?: 'sm' | 'md';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, size = 'md' }) => {
  const isMature = rating.includes('R') || rating.includes('TV-MA') || rating.includes('18');

  return (
    <span
      className={`inline-flex items-center justify-center font-bold tracking-wider rounded border ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0.2' : 'text-xs px-2 py-0.5'
      } ${
        isMature
          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
          : 'bg-dark-800/80 text-slate-300 border-slate-600/50'
      }`}
    >
      {rating}
    </span>
  );
};
