'use client'

import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function RegisterScreen() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container component="main" maxWidth="sm">
        <Card 
          elevation={8}
          sx={{ 
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <CardContent sx={{ p: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {/* App Title */}
              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Quiz App
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4 }}
              >
                Join thousands of learners worldwide
              </Typography>
              
              {/* Google Sign-In Button */}
              <Box sx={{ width: '100%', maxWidth: 300 }}>
                <GoogleSignInButton mode="register" size="large" />
              </Box>
              
              {/* Info Text */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 3, maxWidth: 400, lineHeight: 1.6 }}
              >
                By signing up, you agree to our Terms of Service and Privacy Policy. 
                Authentication is secure and powered by Google.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
