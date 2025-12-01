'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import useUserStore from '@/stores/useUserStore';
import api from '@/api/base.api';
import { authManager } from '@/utils/authManager';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  const AuthComponent = (props: T) => {
    const { user, isLoading } = useUserStore();
    const router = useRouter();
    const hasInitialized = useRef(false);

    useEffect(() => {
      const checkAuth = async () => {
        // Prevent duplicate initialization
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        try {
          // Set up API authorization header
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          
          // Use centralized auth manager to ensure no duplicate calls
          await authManager.ensureAuthenticated();
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          authManager.clearAuthCache();
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    // Show loading state while checking authentication
    if (isLoading || (!hasInitialized.current && !user)) {
      return null; // or a loading spinner
    }

    if (!user) return null;

    return <Component {...props} />;
  };

  return AuthComponent;
}
