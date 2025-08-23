'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import { authApi } from '@/utils/api';
import useUserStore from '@/stores/useUserStore';
import useSnackBarStore from '@/stores/useSnackBarStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { setUser } = useUserStore();
  const { showSnackbar } = useSnackBarStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email || !password) {
      showSnackbar('Please fill in all fields', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.data) {
        // Set user data in store
        const { token, ...userData } = response.data;
        setUser(userData);
        
        // Show success message
        showSnackbar('Login successful!', 'success');
        
        // Redirect to quizzes page
        router.push('/quizzes');
      } else {
        showSnackbar(response.message || 'Login failed', 'error');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showSnackbar(
        err.response?.data?.message || 
        err.message || 
        'An error occurred during login',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
        
        {/* Registration guidance */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account yet?
          </Typography>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body2" 
              color="primary"
              sx={{ 
                mt: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Create an account here
            </Typography>
          </Link>
        </Box>
        </Box>
      </Container>
    </Box>
  );
}

