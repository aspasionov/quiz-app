'use client';

import React from 'react';
import { Button } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { useAnalytics } from '@/hooks/useAnalytics';

interface GoogleSignInButtonProps {
  mode?: 'login' | 'register';
  fullWidth?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

export default function GoogleSignInButton({
  mode = 'login',
  fullWidth = true,
  variant = 'outlined',
  size = 'large'
}: GoogleSignInButtonProps) {
  const { showSnackbar } = useSnackBarStore();
  const analytics = useAnalytics();

  const handleGoogleSignIn = async () => {
    try {
      // Track the authentication attempt
      analytics.track('google_auth_attempt', 'authentication', mode);
      
      // Redirect to server's Google OAuth endpoint
      const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      window.location.href = `${serverUrl}/auth/google`;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      showSnackbar('Failed to sign in with Google', 'error');
      
      // Track the error
      analytics.track('google_auth_error', 'authentication', mode);
    }
  };

  return (
    <Button
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      onClick={handleGoogleSignIn}
      startIcon={<GoogleIcon />}
      sx={{
        textTransform: 'none',
        borderColor: '#dadce0',
        color: '#3c4043',
        backgroundColor: variant === 'contained' ? '#fff' : 'transparent',
        '&:hover': {
          backgroundColor: '#f8f9fa',
          borderColor: '#dadce0',
        },
        '&:focus': {
          backgroundColor: '#f8f9fa',
        },
        fontWeight: 500,
        fontSize: '14px',
        padding: '12px 16px',
      }}
    >
      {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  );
}
