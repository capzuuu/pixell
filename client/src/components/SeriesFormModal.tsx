import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Series, Genre } from '../types';
import { genreService } from '../services/genreService';

interface SeriesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Series | null;
  title: string;
}

export const SeriesFormModal: React.FC<SeriesFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    releaseYear: 2025,
    rating: 'TV-MA',
    language: 'English',
    country: 'United States',
    isFeatured: false,
    isPublished: true,
    genreIds: [] as string[],
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    genreService.getGenres().then((res) => {
      if (res.success && res.data) setGenres(res.data);
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        posterUrl: initialData.posterUrl || '',
        backdropUrl: initialData.backdropUrl || '',
        trailerUrl: initialData.trailerUrl || '',
        releaseYear: initialData.releaseYear || 2025,
        rating: initialData.rating || 'TV-MA',
        language: initialData.language || 'English',
        country: initialData.country || 'United States',
        isFeatured: Boolean(initialData.isFeatured),
        isPublished: Boolean(initialData.isPublished),
        genreIds: initialData.genres ? initialData.genres.map((g) => String(g.id)) : [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        posterUrl: '',
        backdropUrl: '',
        trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        releaseYear: 2025,
        rating: 'TV-MA',
        language: 'English',
        country: 'United States',
        isFeatured: false,
        isPublished: true,
        genreIds: [],
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreToggle = (genreId: string | number) => {
    const strId = String(genreId);
    setFormData((prev) => {
      const exists = prev.genreIds.includes(strId);
      return {
        ...prev,
        genreIds: exists ? prev.genreIds.filter((id) => id !== strId) : [...prev.genreIds, strId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        releaseYear: parseInt(String(formData.releaseYear), 10),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Series Title *</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            placeholder="e.g. Chrono City"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description / Synopsis</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            placeholder="Enter series synopsis..."
          />
        </div>

        {/* URLs row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Poster URL (Vertical) *</label>
            <input
              type="url"
              name="posterUrl"
              required
              value={formData.posterUrl}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Backdrop URL (16:9) *</label>
            <input
              type="url"
              name="backdropUrl"
              required
              value={formData.backdropUrl}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Trailer & Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Trailer URL</label>
            <input
              type="url"
              name="trailerUrl"
              value={formData.trailerUrl}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Rating</label>
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            >
              <option value="TV-Y">TV-Y</option>
              <option value="TV-G">TV-G</option>
              <option value="TV-PG">TV-PG</option>
              <option value="TV-14">TV-14</option>
              <option value="TV-MA">TV-MA</option>
            </select>
          </div>
        </div>

        {/* Genres Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Select Genres</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const selected = formData.genreIds.includes(String(g.id));
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => handleGenreToggle(g.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-brand-600 text-white shadow-glow-brand'
                      : 'bg-dark-800 text-slate-400 border border-white/5 hover:border-white/20'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-dark-800 border-white/20"
            />
            <span className="text-sm font-medium text-slate-200">Featured in Hero</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-dark-800 border-white/20"
            />
            <span className="text-sm font-medium text-slate-200">Published to Site</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-pink hover:from-brand-500 hover:to-accent-pink text-white font-bold text-sm shadow-glow-brand transition-all hover:scale-105 active:scale-95"
          >
            {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Series'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
