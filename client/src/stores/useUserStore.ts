import { create } from 'zustand';

import type { User } from '@/types';

type useUserStoreT = {
  user: User | null;
  lastFetched: number | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  shouldRefetchUser: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useUserStore = create<useUserStoreT>((set, get) => ({
  user: null,
  lastFetched: null,
  isLoading: false,
  setUser: (user) => set({ 
    user, 
    lastFetched: user ? Date.now() : null,
    isLoading: false 
  }),
  clearUser: () => set({ 
    user: null, 
    lastFetched: null,
    isLoading: false 
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  shouldRefetchUser: () => {
    const { lastFetched, user } = get();
    if (!user || !lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  },
}))

export default useUserStore
