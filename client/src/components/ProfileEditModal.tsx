import React, { useState, useEffect } from 'react';
import { X, Edit2, Shield, Trash2, Check, Sparkles } from 'lucide-react';
import { Profile, useProfile } from '../store/ProfileContext';
import { AvatarPickerModal } from './AvatarPickerModal';
import { DEFAULT_AVATAR } from '../utils/avatars';

interface ProfileEditModalProps {
  isOpen: boolean;
  profile: Profile | null; // null means create new profile
  onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  profile,
  onClose,
}) => {
  const { createProfile, updateProfile, deleteProfile, profiles } = useProfile();
  const isEditing = Boolean(profile);

  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [isKids, setIsKids] = useState<boolean>(false);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAvatar(profile.avatar);
      setIsKids(profile.isKids);
    } else {
      setName('');
      setAvatar(DEFAULT_AVATAR);
      setIsKids(false);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && profile) {
      updateProfile(profile.id, {
        name: name.trim(),
        avatar,
        isKids,
      });
    } else {
      createProfile(name.trim(), avatar, isKids);
    }
    onClose();
  };

  const handleDelete = () => {
    if (profile && confirm(`Are you sure you want to delete profile "${profile.name}"?`)) {
      deleteProfile(profile.id);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
        <div
          className="relative w-full max-w-lg bg-[#181818] border border-white/15 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isEditing ? 'Edit Profile' : 'Add Profile'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Picker Section */}
            <div className="flex items-center gap-5">
              <div className="relative group/avatar cursor-pointer" onClick={() => setIsPickerOpen(true)}>
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-black border-2 border-white/20 group-hover/avatar:border-white transition-all shadow-xl">
                  <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center border border-white/30">
                    <Edit2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] text-white text-xs font-bold border border-white/15 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Choose Profile Logo</span>
                </button>
                <p className="text-[11px] text-[#888888] leading-relaxed">
                  Select from classic Netflix smiles, gaming emblems, superheroes, or movie icons.
                </p>
              </div>
            </div>

            {/* Profile Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#a3a3a3]">
                Profile Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Family, Guest"
                required
                maxLength={25}
                className="w-full px-4 py-2.5 rounded-lg bg-[#222222] border border-white/15 focus:border-[#E50914] focus:outline-none text-white text-sm font-semibold placeholder-[#666666] transition-colors"
              />
            </div>

            {/* Kids Profile Switch */}
            <div className="p-4 rounded-xl bg-[#202020] border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#46D369]" />
                  <span className="text-xs font-bold text-white">Kids Profile?</span>
                </div>
                <p className="text-[11px] text-[#888888]">
                  Only display family-friendly TV shows and movies specially curated for children.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsKids(!isKids)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                  isKids ? 'bg-[#E50914]' : 'bg-[#3a3a3a]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isKids ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-6 py-2.5 rounded-lg bg-white hover:bg-white/80 text-black text-xs font-black tracking-wide shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isEditing ? 'Save Changes' : 'Create Profile'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#333333] text-white text-xs font-bold border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {isEditing && profiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-bold transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Profile</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Picker Sub-Modal */}
      <AvatarPickerModal
        isOpen={isPickerOpen}
        currentAvatarUrl={avatar}
        onSelect={(newAvatar) => setAvatar(newAvatar)}
        onClose={() => setIsPickerOpen(false)}
      />
    </>
  );
};
