import React, { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { AVATAR_COLLECTIONS, AvatarOption } from '../utils/avatars';

interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  onSelect: (avatarUrl: string) => void;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  currentAvatarUrl,
  onSelect,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl);

  if (!isOpen) return null;

  const categories = ['All', 'Classics', 'Characters', 'Gaming & Sci-Fi', 'Pop Culture'];

  const filteredAvatars = selectedCategory === 'All'
    ? AVATAR_COLLECTIONS
    : AVATAR_COLLECTIONS.filter((a) => a.category === selectedCategory);

  const handleApply = () => {
    onSelect(previewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div
        className="relative w-full max-w-2xl bg-[#181818] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#E50914]" />
            <h3 className="text-lg font-black tracking-tight text-white">
              Choose Profile Icon & Logo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="px-6 py-3 border-b border-white/10 bg-[#141414] flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-black font-black shadow-md'
                  : 'bg-[#242424] text-[#a3a3a3] hover:text-white hover:bg-[#333333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Avatars Grid */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[300px] custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {filteredAvatars.map((avatar) => {
              const isSelected = previewUrl === avatar.url;

              return (
                <div
                  key={avatar.id}
                  onClick={() => setPreviewUrl(avatar.url)}
                  className={`group relative rounded-xl overflow-hidden bg-[#202020] border-2 cursor-pointer transition-all duration-200 flex flex-col items-center p-2 text-center hover:scale-105 ${
                    isSelected
                      ? 'border-[#E50914] shadow-glow-brand ring-2 ring-[#E50914]/50'
                      : 'border-white/10 hover:border-white/40'
                  }`}
                >
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-2 relative">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center text-white shadow">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#cccccc] group-hover:text-white truncate w-full">
                    {avatar.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 border-t border-white/10 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 bg-black">
              <img src={previewUrl} alt="Selected Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-[#888888] hidden sm:inline">Selected Icon Preview</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#242424] hover:bg-[#333333] text-white text-xs font-bold transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-lg bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-black tracking-wide shadow-md transition-all active:scale-95"
            >
              Select Icon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
