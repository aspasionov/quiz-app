'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useUserStore from '@/stores/useUserStore';
import api from '@/api/base.api';
import { getUser } from '@/api/auth.api';


export function withAuth<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  const AuthComponent = (props: T) => {
    const { user } = useUserStore();
    const router = useRouter();

    
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token !== null) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`
          getUser()
      } else {
        router.push('/login');
      }

    }, []);

    if (!user) return null;

    return <Component {...props} />;
  };

  return AuthComponent;
}