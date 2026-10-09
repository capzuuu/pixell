import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Genre } from '../types';
import { GenreBadge } from './GenreBadge';

interface FilterBarProps {
  genres: Genre[];
  selectedGenre?: string;
  onGenreSelect: (genreSlug: string | undefined) => void;
  selectedYear?: number;
  onYearSelect: (year: number | undefined) => void;
  selectedSort: string;
  onSortSelect: (sort: string) => void;
  selectedRating?: string;
  onRatingSelect?: (rating: string | undefined) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  genres,
  selectedGenre,
  onGenreSelect,
  selectedYear,
  onYearSelect,
  selectedSort,
  onSortSelect,
  selectedRating,
  onRatingSelect,
  onReset,
}) => {
  const years = [2025, 2024, 2023, 2022, 2021, 2020];
  const ratings = ['G', 'PG', 'PG-13', 'R', 'TV-MA', 'TV-14'];

  const hasActiveFilters = Boolean(selectedGenre || selectedYear || selectedRating || selectedSort !== 'popular');

  return (
    <div className="flex flex-col gap-4 my-6 bg-dark-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
        <GenreBadge
          name="All Genres"
          active={!selectedGenre}
          onClick={() => onGenreSelect(undefined)}
        />
        {genres.map((g) => (
          <GenreBadge
            key={g.id}
            name={g.name}
            active={selectedGenre === g.slug || selectedGenre === String(g.id)}
            onClick={() => onGenreSelect(selectedGenre === (g.slug || String(g.id)) ? undefined : (g.slug || String(g.id)))}
          />
        ))}
      </div>

      {/* Selectors and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear || ''}
            onChange={(e) => onYearSelect(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            className="px-3 py-1.5 rounded-lg bg-dark-800 text-xs font-medium text-slate-200 border border-white/10 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Rating Filter (if handler provided) */}
          {onRatingSelect && (
            <select
              value={selectedRating || ''}
              onChange={(e) => onRatingSelect(e.target.value || undefined)}
              className="px-3 py-1.5 rounded-lg bg-dark-800 text-xs font-medium text-slate-200 border border-white/10 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Ratings</option>
              {ratings.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSortSelect(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-dark-800 text-xs font-semibold text-slate-100 border border-brand-500/30 focus:border-brand-500 focus:outline-none shadow-glow-brand"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Release Date (Newest)</option>
            <option value="oldest">Release Date (Oldest)</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
