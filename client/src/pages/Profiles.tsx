import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plus, Edit2, Shield, ArrowLeft } from 'lucide-react';
import { useProfile, Profile } from '../store/ProfileContext';
import { ProfileEditModal } from '../components/ProfileEditModal';

export const Profiles: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profiles, currentProfile, selectProfile, isManaging, setIsManaging } = useProfile();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Sync URL search param ?manage=true if present
  React.useEffect(() => {
    if (searchParams.get('manage') === 'true') {
      setIsManaging(true);
    }
  }, [searchParams, setIsManaging]);

  const handleProfileClick = (profile: Profile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setModalOpen(true);
    } else {
      selectProfile(profile);
      navigate('/');
    }
  };

  const handleAddClick = () => {
    setEditingProfile(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4 sm:p-8 select-none relative animate-fade-in">
      {/* Top Left Logo & Back button */}
      <div className="absolute top-6 left-6 sm:left-12 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/pixelLogo.png" alt="Pixell" className="h-7 sm:h-9 w-auto object-contain" />
        </Link>
      </div>

      {/* Main Who's Watching Box */}
      <div className="max-w-4xl w-full flex flex-col items-center text-center my-auto py-12">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white mb-8 sm:mb-12 font-display">
          {isManaging ? 'Manage Profiles:' : "Who's Watching?"}
        </h1>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-10 mb-10 sm:mb-16">
          {profiles.map((profile) => {
            const isCurrent = currentProfile?.id === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className="group flex flex-col items-center gap-3 cursor-pointer w-24 sm:w-32 md:w-36 transition-all"
              >
                {/* Avatar Box */}
                <div
                  className={`relative w-full aspect-square rounded-md overflow-hidden bg-[#202020] border-2 transition-all duration-200 group-hover:scale-105 shadow-2xl ${
                    isManaging
                      ? 'border-white/40 hover:border-white'
                      : isCurrent
                      ? 'border-white shadow-glow-brand'
                      : 'border-transparent group-hover:border-white'
                  }`}
                >
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Manage Edit Pencil Overlay */}
                  {isManaging && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/80 border border-white/60 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Name & Kids Tag */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs sm:text-sm md:text-base font-medium text-[#808080] group-hover:text-white transition-colors truncate max-w-full">
                    {profile.name}
                  </span>
                  {profile.isKids && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30">
                      Kids
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Profile Card (Max 5 profiles) */}
          {profiles.length < 5 && (
            <div
              onClick={handleAddClick}
              className="group flex flex-col items-center gap-3 cursor-pointer w-24 sm:w-32 md:w-36 transition-all"
            >
              <div className="w-full aspect-square rounded-md border-2 border-transparent group-hover:border-white group-hover:bg-[#222222] transition-all flex items-center justify-center bg-transparent group-hover:scale-105">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-[#808080] group-hover:text-white group-hover:scale-110 transition-transform">
                  <Plus className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                </div>
              </div>
              <span className="text-xs sm:text-sm md:text-base font-medium text-[#808080] group-hover:text-white transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Manage Profiles / Done Toggle Button */}
        <div>
          {isManaging ? (
            <button
              onClick={() => setIsManaging(false)}
              className="px-8 py-2.5 bg-white text-black font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-[#E50914] hover:text-white transition-all shadow-xl active:scale-95 rounded-sm"
            >
              Done
            </button>
          ) : (
            <button
              onClick={() => setIsManaging(true)}
              className="px-6 py-2 border border-[#808080] text-[#808080] font-semibold text-xs sm:text-sm uppercase tracking-widest hover:text-white hover:border-white transition-colors rounded-sm"
            >
              Manage Profiles
            </button>
          )}
        </div>
      </div>

      {/* Profile Edit / Create Modal */}
      <ProfileEditModal
        isOpen={modalOpen}
        profile={editingProfile}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
