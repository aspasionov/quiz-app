'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import QuizIcon from '@mui/icons-material/Quiz';
import CreateIcon from '@mui/icons-material/Create';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { HEADER_HEIGHT } from '@/constans';

export default function Home() {
  const features = [
    {
      title: 'Create Custom Quizzes',
      description: 'Design your own quizzes with multiple-choice questions, set correct answers, and assign point values to create engaging learning experiences.',
      icon: <CreateIcon color="primary" />
    },
    {
      title: 'Take Interactive Quizzes',
      description: 'Answer questions, get instant feedback, and see your scores. Perfect for studying, training, or just having fun with trivia.',
      icon: <QuizIcon color="primary" />
    },
    {
      title: 'Manage Your Content',
      description: 'Keep track of all your quizzes in one place. Edit, update, or delete your quizzes whenever you need to make changes.',
      icon: <PeopleIcon color="primary" />
    },
    {
      title: 'Secure Account System',
      description: 'Your quizzes and progress are safely stored with your personal account. Login from any device to access your content.',
      icon: <SecurityIcon color="primary" />
    },
    {
      title: 'Works Everywhere',
      description: 'Use the app on your computer, tablet, or phone. The responsive design ensures a great experience on any device.',
      icon: <DevicesIcon color="primary" />
    },
    {
      title: 'Instant Feedback',
      description: 'Get immediate notifications about your actions, quiz results, and system updates so you always know what\'s happening.',
      icon: <NotificationsIcon color="primary" />
    }
  ];

  const benefits = [
    'Perfect for teachers creating classroom quizzes',
    'Great for students studying for exams',
    'Ideal for training departments in companies',
    'Fun for families and friends with trivia nights',
    'Useful for self-assessment and learning',
    'Easy to share quizzes with others'
  ];

  return (
    <Box sx={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Welcome to Quiz App
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
            Create, share, and take quizzes easily. Perfect for learning, teaching, and having fun!
          </Typography>
        </Box>

        {/* What You Can Do */}
        <Card sx={{ mb: 4, elevation: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
              What You Can Do
            </Typography>
            <Typography variant="h6" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 3 }}>
              Our quiz platform makes it simple to create engaging quizzes and test your knowledge. 
              Whether you're a teacher, student, trainer, or just someone who loves trivia, this app is for you!
            </Typography>
            
            {/* Features Grid */}
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card variant="outlined" sx={{ height: '100%', p: 2, '&:hover': { elevation: 2 } }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ mt: 0.5 }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Who Is This For */}
        <Card sx={{ mb: 4, elevation: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
              Who Is This For?
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <List>
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <QuizIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={benefit}
                        primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <List>
                  {benefits.slice(3).map((benefit, index) => (
                    <ListItem key={index + 3} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <QuizIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={benefit}
                        primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card sx={{ elevation: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
              How It Works
            </Typography>
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2
                }}>
                  <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                    1. Sign Up
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                    Create your free account in seconds. Your quizzes and progress will be safely stored.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2
                }}>
                  <CreateIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                    2. Create or Browse
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                    Build your own quizzes with custom questions or browse existing quizzes from other users.
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2
                }}>
                  <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                    3. Take & Share
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                    Answer questions, get instant results, and share your favorite quizzes with others.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
