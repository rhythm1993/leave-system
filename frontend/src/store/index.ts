import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
