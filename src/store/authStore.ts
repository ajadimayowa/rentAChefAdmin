import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { setToken } from '../config/api';
import { tokenStorage } from '../lib/tokenStorage';

export type UserRole = 'admin' | 'chef' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        tokenStorage.set(token);
        setToken(token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        tokenStorage.clear();
        setToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (patch) => {
        set((state) => state.user ? { user: { ...state.user, ...patch } } : state);
      }
    }),
    {
      name: 'rentachef-auth',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export function roleHome(role: UserRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'chef') return '/chef';
  return '/client';
}
