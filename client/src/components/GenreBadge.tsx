import React from 'react';

interface GenreBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
}

export const GenreBadge: React.FC<GenreBadgeProps> = ({
  name,
  size = 'md',
  active = false,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium transition-all ${
        sizeClasses[size]
      } ${
        active
          ? 'bg-gradient-to-r from-brand-600 to-accent-pink text-white shadow-glow-brand font-semibold'
          : 'bg-dark-800/80 text-slate-300 border border-white/10 hover:border-brand-500/50 hover:text-white hover:bg-dark-700'
      } ${onClick ? 'cursor-pointer select-none active:scale-95' : ''}`}
    >
      {name}
    </span>
  );
};
