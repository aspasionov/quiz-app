'use client'

import { Box, Button, Container, Typography } from '@mui/material';
import { withAuth } from '@/components/WithAuth';

const QuizzesPage = () => {

  const handleCreateQuiz = () => {
    // Handle create quiz logic here
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Quizzes
        </Typography>
        <Button variant="contained">
          Create Quiz
        </Button>
      </Box>
    </Container>
  );
};

export default withAuth(QuizzesPage);
