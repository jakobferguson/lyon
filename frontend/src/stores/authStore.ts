import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role, Division } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  division: Division | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser, role: Role, division: Division | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      division: null,
      isAuthenticated: false,
      setUser: (user, role, division) =>
        set({ user, role, division, isAuthenticated: true }),
      clearUser: () =>
        set({ user: null, role: null, division: null, isAuthenticated: false }),
    }),
    {
      name: 'lyon-auth',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
