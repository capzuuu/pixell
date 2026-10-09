import React, { ReactNode } from 'react';
import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-2xl glass-card border border-white/5 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-dark-800/80 border border-brand-500/20 flex items-center justify-center mb-5 text-brand-400 shadow-glow-brand">
        {icon || <Film className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white font-semibold text-sm shadow-glow-brand transition-all hover:scale-105 active:scale-95"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white font-semibold text-sm shadow-glow-brand transition-all hover:scale-105 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
