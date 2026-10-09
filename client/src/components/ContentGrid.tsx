import React, { ReactNode } from 'react';

interface ContentGridProps {
  children: ReactNode;
  columns?: 'standard' | 'wide';
}

export const ContentGrid: React.FC<ContentGridProps> = ({ children, columns = 'standard' }) => {
  return (
    <div
      className={`grid gap-4 sm:gap-6 ${
        columns === 'standard'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}
    >
      {children}
    </div>
  );
};
