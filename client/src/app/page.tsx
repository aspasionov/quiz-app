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
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { HEADER_HEIGHT } from '@/constans';

// Create motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGrid = motion(Grid);
const MotionListItem = motion(ListItem);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2
    }
  }
};

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.3
    }
  }
};

const staggeredContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const slideInVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};


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

  const headerRef = useRef(null);
  const aiSectionRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });
  const aiSectionInView = useInView(aiSectionRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" });

  return (
    <Box sx={{ minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <MotionBox 
          ref={headerRef}
          sx={{ textAlign: 'center', mb: 6 }}
          variants={containerVariants}
          initial="hidden"
          animate={headerInView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Welcome to Quiz App
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6, mt: 2 }}>
              Create, share, and take quizzes easily. Perfect for learning, teaching, and having fun!
            </Typography>
          </motion.div>
        </MotionBox>

        {/* AI Quiz Feature */}
        <MotionCard 
          ref={aiSectionRef}
          sx={{ mb: 4, elevation: 2 }}
          variants={cardVariants}
          initial="hidden"
          animate={aiSectionInView ? "visible" : "hidden"}
          whileHover="hover"
        >
          <CardContent sx={{ p: 4 }}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={aiSectionInView ? "visible" : "hidden"}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <motion.div
                  variants={iconVariants}
                  whileHover="hover"
                >
                  <SmartToyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                </motion.div>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  AI-Powered Quiz Generation
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
                  Experience the future of quiz creation with our advanced AI technology
                </Typography>
              </Box>
            </motion.div>
            
            <motion.div
              variants={staggeredContainerVariants}
              initial="hidden"
              animate={aiSectionInView ? "visible" : "hidden"}
            >
              <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
                <MotionGrid size={{ xs: 12, md: 4 }} variants={slideInVariants}>
                  <Box sx={{ textAlign: 'center', height: '100%' }}>
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                    </motion.div>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                      Smart Question Generation
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Our AI creates intelligent, contextually relevant questions on any topic you specify. Just provide a subject, and watch as custom quizzes are generated instantly.
                    </Typography>
                  </Box>
                </MotionGrid>
                <MotionGrid size={{ xs: 12, md: 4 }} variants={slideInVariants}>
                  <Box sx={{ textAlign: 'center', height: '100%' }}>
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <SmartToyIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                    </motion.div>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                      Adaptive Difficulty
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      The AI adjusts question difficulty based on your performance and learning level, ensuring an optimal challenge that promotes effective learning.
                    </Typography>
                  </Box>
                </MotionGrid>
                <MotionGrid size={{ xs: 12, md: 4 }} variants={slideInVariants}>
                  <Box sx={{ textAlign: 'center', height: '100%' }}>
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
                    </motion.div>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                      Instant Feedback
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Get detailed explanations for answers, personalized learning insights, and AI-powered suggestions to improve your knowledge retention.
                    </Typography>
                  </Box>
                </MotionGrid>
              </Grid>
            </motion.div>
          </CardContent>
        </MotionCard>

        {/* What You Can Do */}
        <MotionCard 
          ref={featuresRef}
          sx={{ mb: 4, elevation: 2 }}
          variants={cardVariants}
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          whileHover="hover"
        >
          <CardContent sx={{ p: 4 }}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
            >
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                What You Can Do
              </Typography>
              <Typography variant="h6" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 3 }}>
                Our quiz platform makes it simple to create engaging quizzes and test your knowledge. 
                Whether you're a teacher, student, trainer, or just someone who loves trivia, this app is for you!
              </Typography>
            </motion.div>
            
            {/* Features Grid */}
            <motion.div
              variants={staggeredContainerVariants}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
            >
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <MotionGrid size={{ xs: 12, md: 6 }} key={index} variants={cardVariants}>
                    <MotionCard 
                      variant="outlined" 
                      sx={{ height: '100%', p: 2 }}
                      whileHover={{
                        y: -3,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <motion.div 
                          sx={{ mt: 0.5 }}
                          variants={iconVariants}
                          whileHover="hover"
                        >
                          {feature.icon}
                        </motion.div>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </MotionCard>
                  </MotionGrid>
                ))}
              </Grid>
            </motion.div>
          </CardContent>
        </MotionCard>

        {/* Who Is This For */}
        <MotionCard 
          ref={benefitsRef}
          sx={{ mb: 4, elevation: 2 }}
          variants={cardVariants}
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
          whileHover="hover"
        >
          <CardContent sx={{ p: 4 }}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={benefitsInView ? "visible" : "hidden"}
            >
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                Who Is This For?
              </Typography>
            </motion.div>
            <motion.div
              variants={staggeredContainerVariants}
              initial="hidden"
              animate={benefitsInView ? "visible" : "hidden"}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <List>
                    {benefits.slice(0, 3).map((benefit, index) => (
                      <MotionListItem 
                        key={index} 
                        sx={{ pl: 0 }}
                        variants={slideInVariants}
                        whileHover={{
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <ListItemIcon>
                          <motion.div
                            variants={iconVariants}
                            whileHover="hover"
                          >
                            <QuizIcon color="primary" />
                          </motion.div>
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                        />
                      </MotionListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    {benefits.slice(3).map((benefit, index) => (
                      <MotionListItem 
                        key={index + 3} 
                        sx={{ pl: 0 }}
                        variants={slideInVariants}
                        whileHover={{
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <ListItemIcon>
                          <motion.div
                            variants={iconVariants}
                            whileHover="hover"
                          >
                            <QuizIcon color="primary" />
                          </motion.div>
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                        />
                      </MotionListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </motion.div>
          </CardContent>
        </MotionCard>

        {/* How It Works */}
        <MotionCard 
          ref={howItWorksRef}
          sx={{ elevation: 2 }}
          variants={cardVariants}
          initial="hidden"
          animate={howItWorksInView ? "visible" : "hidden"}
          whileHover="hover"
        >
          <CardContent sx={{ p: 4 }}>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate={howItWorksInView ? "visible" : "hidden"}
            >
              <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
                How It Works
              </Typography>
            </motion.div>
            <motion.div
              variants={staggeredContainerVariants}
              initial="hidden"
              animate={howItWorksInView ? "visible" : "hidden"}
            >
              <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
                <MotionGrid size={{ xs: 12, sm: 4 }} variants={cardVariants}>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2
                    }}>
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                      >
                        <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                      </motion.div>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                        1. Sign Up
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                        Create your free account in seconds. Your quizzes and progress will be safely stored.
                      </Typography>
                    </Box>
                  </motion.div>
                </MotionGrid>
                <MotionGrid size={{ xs: 12, sm: 4 }} variants={cardVariants}>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2
                    }}>
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                      >
                        <CreateIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                      </motion.div>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                        2. Create or Browse
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                        Build your own quizzes with custom questions or browse existing quizzes from other users.
                      </Typography>
                    </Box>
                  </motion.div>
                </MotionGrid>
                <MotionGrid size={{ xs: 12, sm: 4 }} variants={cardVariants}>
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Box sx={{ 
                      textAlign: 'center', 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2
                    }}>
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                      >
                        <QuizIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                      </motion.div>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark' }}>
                        3. Take & Share
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, textAlign: 'center' }}>
                        Answer questions, get instant results, and share your favorite quizzes with others.
                      </Typography>
                    </Box>
                  </motion.div>
                </MotionGrid>
              </Grid>
            </motion.div>
          </CardContent>
        </MotionCard>
      </Container>
    </Box>
  );
}
