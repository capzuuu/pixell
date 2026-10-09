import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Episode } from '../types';

interface EpisodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Episode | null;
  seasonId: string;
  title: string;
}

export const EpisodeFormModal: React.FC<EpisodeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  seasonId,
  title,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    episodeNumber: 1,
    duration: 48,
    thumbnailUrl: '',
    videoUrl: '',
    releaseDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        episodeNumber: initialData.episodeNumber || 1,
        duration: initialData.duration || 48,
        thumbnailUrl: initialData.thumbnailUrl || '',
        videoUrl: initialData.videoUrl || '',
        releaseDate: initialData.releaseDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        episodeNumber: 1,
        duration: 48,
        thumbnailUrl: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        releaseDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        seasonId,
        episodeNumber: parseInt(String(formData.episodeNumber), 10),
        duration: parseInt(String(formData.duration), 10),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Episode Number & Title */}
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Episode #</label>
            <input
              type="number"
              name="episodeNumber"
              required
              min="1"
              value={formData.episodeNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm font-bold text-center"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Episode Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
              placeholder="e.g. The Zero Hour"
            />
          </div>
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
            placeholder="Episode plot summary..."
          />
        </div>

        {/* Thumbnail & Video URL */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Thumbnail URL *</label>
          <input
            type="url"
            name="thumbnailUrl"
            required
            value={formData.thumbnailUrl}
            onChange={handleChange}
            className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Video URL (MP4/HLS) *</label>
          <input
            type="url"
            name="videoUrl"
            required
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
          />
        </div>

        {/* Duration & Release Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Release Date</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-800 text-white border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
            />
          </div>
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
            {loading ? 'Saving...' : initialData ? 'Save Episode' : 'Create Episode'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
