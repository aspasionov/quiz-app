'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import useUserStore from '@/stores/useUserStore';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { authApi } from '@/utils/api';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUserStore();
  const { showSnackbar } = useSnackBarStore();

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        showSnackbar('Google authentication failed. Please try again.', 'error');
        router.push('/login');
        return;
      }

      if (!token) {
        showSnackbar('Authentication token not received. Please try again.', 'error');
        router.push('/login');
        return;
      }

      try {
        // Store the token
        localStorage.setItem('token', token);
        console.log('Token stored:', token.substring(0, 20) + '...');

        // Get user data with the token using auth manager
        const { authManager } = await import('@/utils/authManager');
        const userData = await authManager.ensureAuthenticated();
        
        if (userData) {
          setUser(userData);
          showSnackbar('Successfully signed in with Google!', 'success');
          router.push('/quizzes');
        } else {
          throw new Error('Failed to get user data');
        }
      } catch (error) {
        console.error('Google auth success handler error:', error);
        console.error('Error details:', error.response?.data);
        localStorage.removeItem('token');
        showSnackbar('Authentication failed. Please try again.', 'error');
        router.push('/login');
      }
    };

    handleGoogleAuthSuccess();
  }, [searchParams, router, setUser, showSnackbar]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
}
