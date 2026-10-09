import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { AVATAR_COLLECTIONS, DEFAULT_AVATAR, AvatarOption } from '../utils/avatars';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  gameHandle?: string;
  language?: string;
}

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  isManaging: boolean;
  setIsManaging: (val: boolean) => void;
  selectProfile: (profile: Profile) => void;
  createProfile: (name: string, avatar: string, isKids?: boolean) => Profile | null;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => boolean;
  availableAvatars: AvatarOption[];
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isManaging, setIsManaging] = useState<boolean>(false);

  const storageKey = user ? `pixell_profiles_${user.id}` : 'pixell_profiles_guest';
  const currentKey = user ? `pixell_active_profile_${user.id}` : 'pixell_active_profile_guest';

  // Load profiles from localStorage or generate defaults
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved profiles', e);
    }

    // Default starting profiles (just like Netflix)
    const initialProfiles: Profile[] = [
      {
        id: 'p-1',
        name: user?.name || 'Primary',
        avatar: user?.avatar || DEFAULT_AVATAR,
        isKids: false,
      },
      {
        id: 'p-2',
        name: 'Kids',
        avatar: AVATAR_COLLECTIONS.find(a => a.id === 'classic-kids')?.url || AVATAR_COLLECTIONS[1].url,
        isKids: true,
      }
    ];
    return initialProfiles;
  });

  // Current active profile
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(() => {
    try {
      const savedActiveId = localStorage.getItem(currentKey);
      if (savedActiveId) {
        const match = profiles.find((p) => p.id === savedActiveId);
        if (match) return match;
      }
    } catch (e) {}
    return profiles[0] || null;
  });

  // Keep profiles synced to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profiles to localStorage', e);
    }
  }, [profiles, storageKey]);

  // Keep active profile synced
  useEffect(() => {
    if (currentProfile) {
      try {
        localStorage.setItem(currentKey, currentProfile.id);
      } catch (e) {}
    }
  }, [currentProfile, currentKey]);

  // When user logs in/changes, synchronize primary profile name & avatar if appropriate
  useEffect(() => {
    if (user && profiles.length > 0) {
      setProfiles((prev) => {
        const updated = [...prev];
        if (updated[0] && updated[0].id === 'p-1' && user.name) {
          updated[0] = {
            ...updated[0],
            name: user.name,
            avatar: updated[0].avatar || user.avatar || DEFAULT_AVATAR,
          };
        }
        return updated;
      });
    }
  }, [user]);

  const selectProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    setIsManaging(false);
  };

  const createProfile = (name: string, avatar: string, isKids: boolean = false): Profile | null => {
    if (profiles.length >= 5) {
      error('Maximum of 5 profiles reached.');
      return null;
    }
    const cleanName = name.trim() || 'New Profile';
    const newProfile: Profile = {
      id: `p-${Date.now()}`,
      name: cleanName,
      avatar: avatar || DEFAULT_AVATAR,
      isKids,
    };

    setProfiles((prev) => [...prev, newProfile]);
    success(`Profile "${cleanName}" created!`);
    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (currentProfile?.id === id) {
            setCurrentProfile(updated);
          }
          return updated;
        }
        return p;
      })
    );
    success('Profile saved successfully');
  };

  const deleteProfile = (id: string): boolean => {
    if (profiles.length <= 1) {
      error('You must keep at least one profile.');
      return false;
    }

    const filtered = profiles.filter((p) => p.id !== id);
    setProfiles(filtered);

    if (currentProfile?.id === id) {
      setCurrentProfile(filtered[0]);
    }

    success('Profile deleted');
    return true;
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        isManaging,
        setIsManaging,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        availableAvatars: AVATAR_COLLECTIONS,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
