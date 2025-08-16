import { create } from 'zustand';

import type { User } from '@/types';

type useUserStoreT = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

const useUserStore = create<useUserStoreT>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))

export default useUserStore