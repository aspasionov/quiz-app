import { create } from 'zustand';

import type { User } from '@/types';

type useUserStoreT = {
  user: User | null;
  setUser: (user: User) => void
}

const useUserStore = create<useUserStoreT>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

export default useUserStore