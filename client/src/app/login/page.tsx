'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import GoogleSignInButton from '@/components/GoogleSignInButton';

export default function LoginPage() {
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
      <Container component="main" maxWidth="sm">
        <Card 
          elevation={2}
          sx={{ 
            borderRadius: 4
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
                  color: 'primary.main'
                }}
              >
                Quiz App
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4 }}
              >
                Welcome back! Sign in to continue
              </Typography>
              
              {/* Google Sign-In Button */}
              <Box sx={{ width: '100%', maxWidth: 300 }}>
                <GoogleSignInButton mode="login" size="large" />
              </Box>
              
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

