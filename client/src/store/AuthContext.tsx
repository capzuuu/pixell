import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useToast } from './ToastContext';
import { ref, set, remove, onDisconnect, onValue } from 'firebase/database';
import { rtdb } from '../config/firebase';

const DEFAULT_USER: User = {
  id: 'guest_streamer',
  name: 'Alex Chen',
  email: 'member@pixell.stream',
  role: 'ADMIN',
  avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
  createdAt: new Date().toISOString(),
};

interface AuthContextType {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const cached = localStorage.getItem('pixell_user');
      return cached ? JSON.parse(cached) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pixell_token') || 'open_stream_token');
  const [loading] = useState<boolean>(false);
  const { success } = useToast();

  // Save active user profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pixell_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  // Real-time presence synchronization with Firebase RTDB
  useEffect(() => {
    if (!user || !rtdb) return;

    const presenceRef = ref(rtdb, `presence/${user.id}`);
    const connectedRef = ref(rtdb, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(presenceRef).remove().catch(() => {});

        set(presenceRef, {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userAvatar: user.avatar,
          role: user.role,
          online: true,
          lastSeen: new Date().toISOString(),
        }).catch(() => {});
      }
    });

    const handlePresenceExit = () => {
      remove(presenceRef).catch(() => {});
    };

    window.addEventListener('beforeunload', handlePresenceExit);
    window.addEventListener('pagehide', handlePresenceExit);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handlePresenceExit);
      window.removeEventListener('pagehide', handlePresenceExit);
      remove(presenceRef).catch(() => {});
    };
  }, [user]);

  const login = async (): Promise<boolean> => {
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    return true;
  };

  const register = async (name: string): Promise<boolean> => {
    setUser((prev) => ({ ...prev, name }));
    return true;
  };

  const logout = () => {
    setUser(DEFAULT_USER);
    success('Reset to default streaming profile');
  };

  const updateProfile = async (data: { name?: string; avatar?: string }): Promise<boolean> => {
    setUser((prev) => ({
      ...prev,
      name: data.name || prev.name,
      avatar: data.avatar || prev.avatar,
    }));
    success('Profile updated');
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: true,
        isAdmin: true,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
