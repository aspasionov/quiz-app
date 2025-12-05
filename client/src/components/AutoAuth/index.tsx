'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/utils/authManager';
import useUserStore from '@/stores/useUserStore';

export default function AutoAuth() {
  const router = useRouter();
  const { user, setLoading } = useUserStore();

  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem('token');

      // If no token exists, do nothing
      if (!token) {
        return;
      }

      // If user is already loaded, do nothing
      if (user) {
        return;
      }

      // Try to fetch user data with the existing token
      try {
        setLoading(true);
        await authManager.ensureAuthenticated();
      } catch (error) {
        // Token is invalid or expired, clear it
        localStorage.removeItem('token');
        authManager.clearAuthCache();
      } finally {
        setLoading(false);
      }
    };

    autoLogin();
  }, [user, setLoading]);

  return null; // This component doesn't render anything
}
