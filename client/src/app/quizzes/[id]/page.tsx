'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Chip,
  Avatar,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { quizApi } from '@/utils/api';
import { Quiz } from '@/types';
import useSnackBarStore from '@/stores/useSnackBarStore';

interface UserAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  points: number;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  answers: UserAnswer[];
}

const QuizTakingPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { showSnackbar } = useSnackBarStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await quizApi.getQuiz(quizId);
        
        if (response.success && response.data) {
          setQuiz(response.data);
          setStartTime(new Date());
        } else {
          showSnackbar('Quiz not found', 'error');
          router.push('/quizzes');
        }
      } catch (error: unknown) {
        console.error('Error fetching quiz:', error);
        let errorMessage = 'Error loading quiz';
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || 'Error loading quiz';
        }
        showSnackbar(errorMessage, 'error');
        router.push('/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, showSnackbar, router]);

  useEffect(() => {
    if (startTime && !showResults) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (!selectedOption || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOptionObj = currentQuestion.options.find(opt => opt._id === selectedOption);
    
    if (selectedOptionObj) {
      const userAnswer: UserAnswer = {
        questionId: currentQuestion._id!,
        selectedOptionId: selectedOption,
        isCorrect: selectedOptionObj.isCorrect,
        points: selectedOptionObj.isCorrect ? selectedOptionObj.points : 0,
      };

      const newAnswers = [...userAnswers, userAnswer];
      setUserAnswers(newAnswers);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption('');
        setShowExplanation(false);
      } else {
        // Quiz completed
        finishQuiz(newAnswers);
      }
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
  };

  const finishQuiz = (answers: UserAnswer[]) => {
    if (!quiz) return;

    const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0);
    const correctAnswers = answers.filter(answer => answer.isCorrect).length;
    const percentage = (totalPoints / quiz.maxPoints) * 100;

    const result: QuizResult = {
      totalQuestions: quiz.questions.length,
      correctAnswers,
      totalPoints,
      maxPoints: quiz.maxPoints,
      percentage,
      answers,
    };

    setQuizResult(result);
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption('');
    setShowResults(false);
    setQuizResult(null);
    setStartTime(new Date());
    setElapsedTime(0);
    setShowExplanation(false);
  };

  const handleBackToQuizzes = () => {
    router.push('/quizzes');
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircleIcon />;
    if (percentage >= 60) return <StarIcon />;
    return <CancelIcon />;
  };


  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Loading quiz...
        </Alert>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Quiz not found.
        </Alert>
      </Container>
    );
  }

  if (showResults && quizResult) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Chip
                icon={getScoreIcon(quizResult.percentage)}
                label={`${quizResult.percentage.toFixed(1)}%`}
                color={getScoreColor(quizResult.percentage) as 'success' | 'warning' | 'error'}
                size="large"
                sx={{ 
                  fontSize: '1.2rem', 
                  height: 48, 
                  mb: 2,
                  '& .MuiChip-icon': { fontSize: '1.5rem' }
                }}
              />
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Quiz Completed!
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {quiz.title}
              </Typography>
            </Box>

            {/* Results Summary */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                <Box>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                    {quizResult.correctAnswers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Correct Answers
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary" sx={{ fontWeight: 600 }}>
                    {quizResult.totalPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Points Earned
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" color="text.primary" sx={{ fontWeight: 600 }}>
                    {formatTime(elapsedTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time Taken
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={quizResult.percentage}
                color={getScoreColor(quizResult.percentage) as 'success' | 'warning' | 'error'}
                sx={{ 
                  height: 12, 
                  borderRadius: 6, 
                  mb: 2,
                  backgroundColor: 'rgba(0,0,0,0.1)'
                }}
              />
              <Typography variant="body1">
                {quizResult.totalPoints} / {quizResult.maxPoints} points
              </Typography>
            </Box>

            {/* Performance Message */}
            <Box sx={{ mb: 4 }}>
              {quizResult.percentage >= 80 && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <strong>Excellent!</strong> You have a great understanding of the material.
                </Alert>
              )}
              {quizResult.percentage >= 60 && quizResult.percentage < 80 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <strong>Good job!</strong> You&apos;re on the right track, but there&apos;s room for improvement.
                </Alert>
              )}
              {quizResult.percentage < 60 && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  <strong>Keep practicing!</strong> Review the material and try again.
                </Alert>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleRetakeQuiz}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Retake Quiz
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleBackToQuizzes}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Back to Quizzes
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to Quizzes">
          <IconButton onClick={handleBackToQuizzes} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            {quiz.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 20, height: 20, bgcolor: 'secondary.main', fontSize: '0.7rem' }}>
                {typeof quiz.author === 'string' ? quiz.author.charAt(0) : quiz.author.name.charAt(0)}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {typeof quiz.author === 'string' ? quiz.author : quiz.author.name}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">•</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TimerIcon sx={{ fontSize: 16 }} color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatTime(elapsedTime)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Question Card */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Question */}
          <Typography variant="h6" component="h2" sx={{ mb: 3, lineHeight: 1.4 }}>
            {currentQuestion.questionText}
          </Typography>

          {/* Options */}
          <RadioGroup
            value={selectedOption}
            onChange={(e) => handleOptionChange(e.target.value)}
          >
            {currentQuestion.options.map((option) => (
              <FormControlLabel
                key={option._id}
                value={option._id!}
                control={<Radio />}
                label={option.text}
                sx={{
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '1rem',
                    lineHeight: 1.4,
                  },
                }}
              />
            ))}
          </RadioGroup>

          {/* Explanation (if shown) */}
          {showExplanation && currentQuestion.explanation && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleShowExplanation}
          disabled={!selectedOption || showExplanation}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Show Explanation
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleNextQuestion}
          disabled={!selectedOption}
          sx={{ 
            borderRadius: 2, 
            px: 4,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </Box>

    </Container>
  );
};

export default withAuth(QuizTakingPage);
