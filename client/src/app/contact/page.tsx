'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import EmailIcon from '@mui/icons-material/Email';
import { HEADER_HEIGHT } from '@/constans';

export default function Contact() {
  return (
    <Box sx={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Contact Us
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
            We're here to help! Get in touch with us for support, questions, or feedback.
          </Typography>
        </Box>

        {/* Main Contact Card */}
        <EmailIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Get in Touch
            </Typography>
            <Typography variant="h6" paragraph sx={{ lineHeight: 1.8, mb: 4, color: 'text.secondary' }}>
              For any questions, support requests, or feedback about the Quiz App, 
              please don't hesitate to reach out to us.
            </Typography>
            
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 3, 
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              borderRadius: 2,
              mb: 3
            }}>
              <EmailIcon sx={{ color: 'primary.main' }} />
              <Link 
                href="mailto:quizgeneratorhelp@gmail.com"
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                quizgeneratorhelp@gmail.com
              </Link>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              We typically respond within 24 hours during business days.
            </Typography>
      </Container>
    </Box>
  );
}
