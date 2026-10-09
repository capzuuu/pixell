import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post('/auth/login', { email, password });
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return api.post('/auth/register', { name, email, password });
  },

  firebaseSync: async (data: {
    idToken?: string;
    email: string;
    name?: string;
    avatar?: string;
    uid?: string;
  }): Promise<AuthResponse> => {
    return api.post('/auth/firebase-sync', data);
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    return api.get('/auth/me');
  },

  updateProfile: async (data: { name?: string; avatar?: string }): Promise<{ success: boolean; data: User }> => {
    return api.put('/auth/profile', data);
  }
};
