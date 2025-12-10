'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  AutoFixHigh as AiIcon,
  TextSnippet as TextIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { quizApi } from '@/api/quiz.api';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AttemptInfo {
  attemptsUsed: number;
  remainingAttempts: number;
  canAttempt: boolean;
  resetsAt?: Date;
}

type QuizMode = 'text' | 'topic';

// Zod validation schemas
const textSchema = z.object({
  mode: z.literal('text'),
  text: z.string()
    .min(50, 'Please provide at least 50 characters of text')
    .max(10000, 'Text is too long. Maximum allowed is 10,000 characters'),
  topic: z.string().optional()
});

const topicSchema = z.object({
  mode: z.literal('topic'),
  topic: z.string()
    .min(3, 'Please provide at least 3 characters for the topic')
    .max(200, 'Topic is too long. Maximum allowed is 200 characters'),
  text: z.string().optional()
});

const quizFormSchema = z.discriminatedUnion('mode', [textSchema, topicSchema]);

type QuizFormData = z.infer<typeof quizFormSchema>;

import { withAuth } from '@/components/WithAuth';

function AiQuizPageContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<AttemptInfo | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  const fetchedRef = React.useRef(false);
  const router = useRouter();
  const { showSnackbar } = useSnackBarStore();
  const analytics = useAnalytics();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      mode: 'topic',
      text: '',
      topic: ''
    },
    mode: 'onChange'
  });

  const watchedMode = watch('mode');
  const watchedText = watch('text');
  const watchedTopic = watch('topic');

  // Fetch attempt information on component mount
  useEffect(() => {
    if (fetchedRef.current) return; // Prevent duplicate calls
    fetchedRef.current = true;
    
    const fetchAttemptInfo = async () => {
      try {
        const response = await quizApi.getAttemptInfo();
        if (response.success && response.data) {
          setAttemptInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch attempt info:', error);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchAttemptInfo();
  }, []);

  const handleGenerateQuiz = async (data: QuizFormData) => {
    setIsGenerating(true);

    try {
      // Use the appropriate content based on mode
      const content = data.mode === 'text' ? data.text!.trim() : data.topic!.trim();
      
      // Track the quiz generation attempt
      analytics.page.generateQuiz(content.substring(0, 100), 1); // Limit content length for tracking
      
      const response = await quizApi.generateAiQuiz(content, data.mode);

      if (response.success && response.data) {
        showSnackbar('AI quiz generated successfully!', 'success');
        
        // Track successful quiz creation
        analytics.quiz.create(
          response.data.quizId, 
          response.data.title || 'AI Generated Quiz',
          response.data.questionCount || 5
        );
        
        // Redirect to the quiz taking page with source parameter
        router.push(`/quizzes/${response.data.quizId}?source=quiz-generator`);
      } else {
        showSnackbar(response.message || 'Failed to generate quiz', 'error');
        analytics.track('quiz_generation_failed', 'ai', data.mode);
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error('Error generating quiz:', error);

      
      // Track the error
      analytics.track('quiz_generation_error', 'ai', data.mode);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        const errorMsg = errorData?.message || 'Failed to generate quiz';
        
        // Check if it's the quiz limit error
        if (errorData?.error === 'QUIZ_LIMIT_REACHED') {
          showSnackbar(
            `${errorMsg} You have ${errorData.data?.currentCount}/${errorData.data?.maxLimit} quizzes. Go to your quizzes page to delete some old ones.`,
            'warning'
          );
          // Optionally redirect to quizzes page after a delay
          setTimeout(() => {
            router.push('/quizzes?tab=my');
          }, 3000);
        } else {
          showSnackbar(errorMsg, 'error');
        }
      } else {
        showSnackbar('Network error. Please try again.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode: QuizMode | null) => {
    if (newMode) {
      setValue('mode', newMode);
      // Clear the other field when switching modes
      if (newMode === 'text') {
        setValue('topic', '');
      } else {
        setValue('text', '');
      }
    }
  };

  // Handle clear form
  const handleClearForm = () => {
    if (watchedMode === 'text') {
      setValue('text', '');
    } else {
      setValue('topic', '');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <AiIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            AI Quiz Generator
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Transform any text into an interactive quiz using advanced AI. 
          Perfect for studying, teaching, or testing knowledge!
        </Typography>
      </Box>

      {/* Attempt Info Alert */}
      {!loadingAttempts && attemptInfo && (
        <Alert 
          severity={attemptInfo.remainingAttempts === 0 ? 'warning' : 'info'} 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Daily AI Quiz Generation: {attemptInfo.attemptsUsed}/{attemptInfo.attemptsUsed + attemptInfo.remainingAttempts} attempts used today
          </Typography>
          <Typography variant="body2">
            {attemptInfo.remainingAttempts > 0 
              ? `${attemptInfo.remainingAttempts} attempts remaining` 
              : 'No attempts remaining today. Limit resets tomorrow.'}
          </Typography>
        </Alert>
      )}

      {/* Mode Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Controller
          name="mode"
          control={control}
          render={({ field }) => (
            <ToggleButtonGroup
              value={field.value}
              exclusive
              onChange={(e, newMode) => handleModeChange(newMode)}
              aria-label="quiz generation mode"
              sx={{ borderRadius: 2 }}
            >
              <ToggleButton value="text" sx={{ px: 3, py: 1.5, textTransform: 'none', fontSize: '1rem' }}>
                📝 From Text
              </ToggleButton>
              <ToggleButton value="topic" sx={{ px: 3, py: 1.5, textTransform: 'none', fontSize: '1rem' }}>
                💡 From Topic
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {/* Main Input Section */}
      <form onSubmit={handleSubmit(handleGenerateQuiz)}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TextIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {watchedMode === 'text' ? 'Enter Your Text' : 'Enter Topic'}
              </Typography>
            </Box>
            
            {watchedMode === 'text' ? (
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={12}
                    variant="outlined"
                    placeholder="Paste your text here... (minimum 50 characters)

Examples:
• Course material, lecture notes, or textbook chapters
• Articles, research papers, or documentation  
• Study guides or educational content
• Any text you want to create a quiz from

The AI will analyze your text and create thoughtful multiple-choice questions covering the main concepts, facts, and details."
                    disabled={isGenerating}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }
                    }}
                    helperText={
                      errors.text?.message || 
                      `${(field.value || '').length}/10,000 characters (minimum 50 required)`
                    }
                    error={!!errors.text}
                  />
                )}
              />
            ) : (
              <Controller
                name="topic"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter a topic for your quiz...

Examples:
• JavaScript fundamentals
• English Grammar C1 level
• World History - Renaissance period
• Biology - Photosynthesis
• Mathematics - Calculus basics
• Physics - Quantum mechanics
• Computer Science - Data structures

The AI will create multiple-choice questions about your chosen topic."
                    disabled={isGenerating}
                    multiline
                    rows={8}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }
                    }}
                    helperText={
                      errors.topic?.message
                    }
                    error={!!errors.topic}
                  />
                )}
              />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleClearForm}
                disabled={isGenerating || (watchedMode === 'text' ? !watchedText : !watchedTopic)}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                Clear {watchedMode === 'text' ? 'Text' : 'Topic'}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isGenerating || !isValid || (attemptInfo ? !attemptInfo.canAttempt : false)}
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <QuizIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {isGenerating ? 'Generating Quiz...' : 'Create AI Quiz'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </form>

      {/* Loading State Overlay */}
      {isGenerating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Card elevation={8} sx={{ p: 4, borderRadius: 3, textAlign: 'center', minWidth: 300 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Generating Your Quiz
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI is analyzing your text and creating thoughtful questions...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This may take 15-30 seconds
            </Typography>
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default withAuth(AiQuizPageContent);
