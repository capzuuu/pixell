import React from 'react';

export const CardSkeleton: React.FC<{ count?: number; aspect?: 'poster' | 'backdrop' }> = ({
  count = 6,
  aspect = 'poster',
}) => {
  const aspectClass = aspect === 'poster' ? 'aspect-[2/3]' : 'aspect-video';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-xl overflow-hidden animate-pulse"
        >
          <div className={`w-full ${aspectClass} bg-dark-850 rounded-xl border border-white/5`} />
          <div className="h-4 bg-dark-800 rounded w-3/4" />
          <div className="h-3 bg-dark-800/60 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] bg-dark-900 animate-pulse flex items-end p-8 md:p-16">
      <div className="max-w-2xl w-full flex flex-col gap-4 z-10">
        <div className="h-8 bg-dark-800 rounded w-1/4" />
        <div className="h-12 bg-dark-800 rounded w-3/4" />
        <div className="h-4 bg-dark-800 rounded w-full" />
        <div className="h-4 bg-dark-800 rounded w-5/6" />
        <div className="flex gap-4 mt-4">
          <div className="h-12 bg-dark-700 rounded-xl w-36" />
          <div className="h-12 bg-dark-800 rounded-xl w-36" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full flex flex-col gap-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-dark-850 rounded-xl w-full border border-white/5" />
      ))}
    </div>
  );
};
