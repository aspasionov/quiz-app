'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Paper,
  Autocomplete,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Quiz as QuizIcon,
  Info as InfoIcon,
  QuestionAnswer as QuestionIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { quizApi, tagApi, Tag, CreateQuizData } from '@/utils/api';
import { Quiz, Question, Option } from '@/types';
import useSnackBarStore from '@/stores/useSnackBarStore';

const steps = ['Quiz Information', 'Add Questions', 'Review & Save'];

// Form validation schema
const quizInfoSchema = z.object({
  title: z.string()
    .min(1, 'Quiz title is required')
    .max(256, 'Quiz title must be less than 256 characters'),
  description: z.string().optional(),
  category: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  tags: z.array(z.string())
    .min(1, 'Please add at least 1 tag')
    .refine((tags) => tags.every(tag => tag.length > 0), {
      message: 'All tags must be non-empty'
    })
});

type QuizInfoFormData = z.infer<typeof quizInfoSchema>;

const QuizEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { showSnackbar } = useSnackBarStore();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<QuizInfoFormData>({
    resolver: zodResolver(quizInfoSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      visibility: 'public',
      tags: []
    },
    mode: 'onChange'
  });

  // Watch form values
  const watchedValues = watch();
  const tags = watchedValues.tags || [];

  // Quiz and state management
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewQuiz, setIsNewQuiz] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('question_1');
  const [idCounter, setIdCounter] = useState(1);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (quizId === 'new') {
        setIsNewQuiz(true);
        setLoading(false);
        // Initialize with one empty question
        setQuestions([createEmptyQuestion()]);
      } else {
        try {
          setLoading(true);
          const response = await quizApi.getQuiz(quizId);
          
          if (response.success && response.data) {
            const foundQuiz = response.data;
            setQuiz(foundQuiz);
            
            // Set form values
            setValue('title', foundQuiz.title);
            setValue('description', foundQuiz.description || '');
            setValue('category', ''); // Quiz API doesn't have category field, so we start empty
            setValue('tags', foundQuiz.tags);
            setValue('visibility', foundQuiz.visibility);
            
            setQuestions(foundQuiz.questions.length > 0 ? foundQuiz.questions : [createEmptyQuestion()]);
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
      }
    };

    fetchQuiz();
  }, [quizId, showSnackbar, router]);

  // Load tags from database
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await tagApi.getTags({ limit: 1000, sortBy: 'name', sortOrder: 'asc' });
        
        if (response.success && response.data) {
          // Extract tag names from the response
          const tagNames = response.data.map((tag: Tag) => tag.name);
          setAvailableTags(tagNames);
        } else {
          // Fallback to empty array if API fails
          setAvailableTags([]);
          console.warn('Failed to load tags from database');
        }
      } catch (error) {
        console.error('Error loading tags:', error);
        // Fallback to empty array on error
        setAvailableTags([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadTags();
  }, []);

  const createEmptyQuestion = (questionId?: number): Question => {
    const qId = questionId || idCounter;
    if (!questionId) {
      setIdCounter(prev => prev + 3); // Reserve 3 IDs (1 for question + 2 for options)
    }
    
    return {
      _id: `question_${qId}`,
      questionText: '',
      explanation: '',
      options: [
        createEmptyOption(qId + 1),
        createEmptyOption(qId + 2),
      ]
    };
  };

  const createEmptyOption = (optionId?: number): Option => {
    const oId = optionId || idCounter;
    if (!optionId) {
      setIdCounter(prev => prev + 1);
    }
    
    return {
      _id: `option_${oId}`,
      text: '',
      points: 0,
      isCorrect: false
    };
  };


  const handleAddQuestion = () => {
    const newQuestion = createEmptyQuestion();
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    
    // Auto-expand the newly added question
    setExpandedAccordion(newQuestion._id);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length > 1) {
      const questionToDelete = questions[index];
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
      
      // If we're deleting the expanded question, expand the first remaining question
      if (expandedAccordion === questionToDelete._id) {
        setExpandedAccordion(newQuestions.length > 0 ? newQuestions[0]._id : false);
      }
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: keyof Option, value: any) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value };
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
    setQuestions(updatedQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    
    // Set all options to false first, then set the selected one to true
    updatedOptions.forEach((option, i) => {
      option.isCorrect = i === optionIndex;
      // Set points based on correctness
      option.points = i === optionIndex ? 10 : 0;
    });
    
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options;
    if (currentOptions.length < 6) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...currentOptions, createEmptyOption()]
      };
      setQuestions(updatedQuestions);
    }
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options;
    if (currentOptions.length > 2) {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: currentOptions.filter((_, i) => i !== optionIndex)
      };
      setQuestions(updatedQuestions);
    }
  };

  const calculateMaxPoints = () => {
    return questions.reduce((total, question) => {
      const maxQuestionPoints = Math.max(...question.options.map(option => option.points));
      return total + maxQuestionPoints;
    }, 0);
  };

  // Check if a question is valid
  const isQuestionValid = (question: Question) => {
    return (
      question.questionText.trim() !== '' &&
      question.questionText.trim().length >= 5 &&
      question.options.every(opt => opt.text.trim() !== '') &&
      question.options.some(opt => opt.isCorrect)
    );
  };

  // Handle accordion expansion with validation check
  const handleAccordionChange = (questionId: string, isExpanded: boolean) => {
    if (!isExpanded) {
      // If trying to collapse, check if the question is valid
      const question = questions.find(q => q._id === questionId);
      if (question && !isQuestionValid(question)) {
        // Don't allow collapsing invalid questions
        return;
      }
    }
    setExpandedAccordion(isExpanded ? questionId : false);
  };

  // Validation
  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Quiz Information
        return isValid && watchedValues.title?.trim() !== '' && tags.length >= 1;
      case 1: // Questions
        return questions.every(q => 
          q.questionText.trim() !== '' &&
          q.questionText.trim().length >= 5 &&
          q.options.every(opt => opt.text.trim() !== '') &&
          q.options.some(opt => opt.isCorrect)
        );
      case 2: // Review
        return true;
      default:
        return false;
    }
  };

  const getValidationMessage = (step: number) => {
    switch (step) {
      case 0:
        if (!watchedValues.title?.trim()) {
          return 'Please enter a quiz title';
        }
        if (watchedValues.title && watchedValues.title.length > 256) {
          return 'Quiz title must be less than 256 characters';
        }
        if (tags.length < 1) {
          return 'Please add at least 1 tag';
        }
        return 'Please complete all required fields';
      case 1:
        const invalidQuestion = questions.find(q => 
          q.questionText.trim() === '' || 
          q.questionText.trim().length < 5 ||
          !q.options.every(opt => opt.text.trim() !== '') ||
          !q.options.some(opt => opt.isCorrect)
        );
        
        if (invalidQuestion) {
          if (invalidQuestion.questionText.trim() === '') {
            return 'All questions must have text';
          }
          if (invalidQuestion.questionText.trim().length < 5) {
            return 'Question text must be at least 5 characters long';
          }
          if (!invalidQuestion.options.every(opt => opt.text.trim() !== '')) {
            return 'All answer options must have text';
          }
          if (!invalidQuestion.options.some(opt => opt.isCorrect)) {
            return 'Each question must have at least one correct answer';
          }
        }
        
        return 'Please complete all questions with valid options and correct answers';
      default:
        return 'Please complete all required fields';
    }
  };

  // Navigation
  const handleNext = async () => {
    if (activeStep === 0) {
      // Trigger form validation for step 0
      const isFormValid = await trigger();
      if (validateStep(activeStep) && isFormValid) {
        setActiveStep(activeStep + 1);
      } else {
        showSnackbar(getValidationMessage(activeStep), 'warning');
      }
    } else if (activeStep === 1) {
      // Questions step - check validation and auto-expand first invalid question
      if (validateStep(activeStep)) {
        setActiveStep(activeStep + 1);
      } else {
        // Find the first invalid question and expand it
        const firstInvalidQuestion = questions.find(q => !isQuestionValid(q));
        if (firstInvalidQuestion) {
          setExpandedAccordion(firstInvalidQuestion._id);
          
          // Scroll to the invalid question after a brief delay
          setTimeout(() => {
            const questionIndex = questions.findIndex(q => q._id === firstInvalidQuestion._id);
            const element = document.getElementById(`question-${questionIndex}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
        showSnackbar(getValidationMessage(activeStep), 'warning');
      }
    } else if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    } else {
      showSnackbar(getValidationMessage(activeStep), 'warning');
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSave = async () => {
    if (!validateStep(1)) {
      showSnackbar('Please complete all questions before saving', 'warning');
      return;
    }

    setSaving(true);
    
    try {
      // Prepare quiz data for API
      const formData = watchedValues;
      const quizData: CreateQuizData = {
        title: formData.title || '',
        description: formData.description || '',
        tags: formData.tags || [],
        visibility: formData.visibility || 'public',
        questions: questions.map(q => ({
          questionText: q.questionText,
          explanation: q.explanation || '',
          options: q.options.map(opt => ({
            text: opt.text,
            points: opt.points,
            isCorrect: opt.isCorrect
          }))
        })),
        allowedUsers: [] // Can be extended later for selected visibility
      };

      let response;
      if (isNewQuiz) {
        response = await quizApi.createQuiz(quizData);
      } else {
        response = await quizApi.updateQuiz(quizId, quizData);
      }

      if (response.success) {
        showSnackbar(`Quiz ${isNewQuiz ? 'created' : 'updated'} successfully!`, 'success');
        // Redirect to quizzes page after both creation and update
        router.push('/quizzes');
      } else {
        throw new Error(response.message || 'Failed to save quiz');
      }
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        showSnackbar('You need to be logged in to save a quiz.', 'error');
        router.push('/login');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || 'Validation failed';
        const errors = error.response.data?.errors;
        
        if (errors && errors.length > 0) {
          const errorList = errors.map((err: any) => err.message).join(', ');
          showSnackbar(`Validation errors: ${errorList}`, 'error');
        } else {
          showSnackbar(errorMsg, 'error');
        }
      } else {
        showSnackbar('Error saving quiz. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (isNewQuiz) {
      showSnackbar('Please save the quiz first before previewing', 'warning');
      return;
    }
    router.push(`/quizzes/${quizId}`);
  };

  const handleBackToQuizzes = () => {
    router.push('/quizzes');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Quiz Information
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Quiz Title"
                      required
                      placeholder="Enter an engaging title for your quiz"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || `${field.value?.length || 0}/256 characters`}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Description"
                      multiline
                      rows={4}
                      placeholder="Describe what this quiz covers and what learners will gain"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                />

                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Category"
                          placeholder="e.g., Programming, Science, History"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller
                      name="visibility"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth size="small">
                          <InputLabel id="visibility-label">Visibility</InputLabel>
                          <Select
                            {...field}
                            labelId="visibility-label"
                            label="Visibility"
                            size="small"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="public">🌐 Public - Anyone can take</MenuItem>
                            <MenuItem value="private">🔒 Private - Only you</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>

                <Controller
                  name="tags"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      freeSolo
                      size="small"
                      options={availableTags}
                      value={field.value || []}
                      loading={isLoadingTags}
                      onChange={(event, value) => {
                        const newTags = value.map(tag => 
                          typeof tag === 'string' && tag.startsWith('Create "') 
                            ? tag.slice(8, -1) // Remove 'Create "' and '"'
                            : tag
                        ).filter(tag => typeof tag === 'string' && tag.trim() !== '');
                        field.onChange(newTags);
                      }}
                      filterOptions={(options, params) => {
                        const filtered = options.filter(option =>
                          option.toLowerCase().includes(params.inputValue.toLowerCase())
                        );
                        
                        const { inputValue } = params;
                        // Suggest the creation of a new value
                        const isExisting = options.some(option => 
                          inputValue.toLowerCase() === option.toLowerCase()
                        );
                        
                        if (inputValue !== '' && !isExisting) {
                          filtered.push(`Create "${inputValue}"`);
                        }
                        
                        return filtered;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder={isLoadingTags ? "Loading tags..." : "Type to search or create tags..."}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || 'Add at least 1 tag to describe your quiz'}
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 2 }
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="filled"
                            label={option}
                            size="small"
                            color="primary"
                            {...getTagProps({ index })}
                            key={index}
                            sx={{ borderRadius: 1 }}
                          />
                        ))
                      }
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          {option.startsWith('Create "') ? (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AddIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                              {option}
                            </Box>
                          ) : (
                            <Chip
                              label={option}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                          )}
                        </Box>
                      )}
                      ChipProps={{
                        size: 'small',
                        variant: 'filled',
                        color: 'primary'
                      }}
                    />
                  )}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <QuestionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Questions ({questions.length})
                </Typography>
              </Box>

              {questions.map((question, questionIndex) => (
                <Accordion 
                  key={question._id}
                  id={`question-${questionIndex}`}
                  expanded={expandedAccordion === question._id}
                  onChange={(event, isExpanded) => {
                    handleAccordionChange(question._id, isExpanded);
                  }}
                  sx={{ 
                    mb: 1, 
                    borderRadius: 2, 
                    '&:before': { display: 'none' },
                    // Add visual indicator for invalid questions
                    ...(expandedAccordion === question._id && !isQuestionValid(question) && {
                      border: '2px solid',
                      borderColor: 'warning.main',
                      backgroundColor: 'warning.50'
                    })
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                      <Typography sx={{ fontWeight: 500 }}>
                        Question {questionIndex + 1}: {question.questionText || 'Untitled Question'}
                      </Typography>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(questionIndex);
                        }}
                        disabled={questions.length === 1}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Question Text"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                        required
                        multiline
                        rows={2}
                        placeholder="Enter your question here..."
                        error={question.questionText.trim() !== '' && question.questionText.trim().length < 5}
                        helperText={
                          question.questionText.trim() !== '' && question.questionText.trim().length < 5
                            ? `Question must be at least 5 characters (${question.questionText.trim().length}/5)`
                            : `${question.questionText.length} characters`
                        }
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="Explanation (optional)"
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                        multiline
                        rows={2}
                        placeholder="Explain the correct answer and provide additional context..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />

                      <Divider />

                      <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        <CheckIcon sx={{ mr: 1 }} />
                        Answer Options
                      </Typography>

                      {question.options.map((option, optionIndex) => (
                        <Paper key={option._id} elevation={1} sx={{ p: 1, borderRadius: 2, border: option.isCorrect ? 2 : 1, borderColor: option.isCorrect ? 'success.main' : 'divider' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={option.isCorrect}
                                  onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                                  color="success"
                                />
                              }
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" color={option.isCorrect ? 'success.main' : 'text.secondary'}>
                                    {option.isCorrect ? '✓ Correct' : 'Incorrect'}
                                  </Typography>
                                </Box>
                              }
                              sx={{ minWidth: 160 }}
                            />
                            
                            <TextField
                              fullWidth
                              size="small"
                              label={`Option ${optionIndex + 1}`}
                              value={option.text}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                              required
                              placeholder="Enter answer option..."
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <TextField
                              size="small"
                              label="Points"
                              type="number"
                              value={option.points}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                const validValue = Math.max(0, value); // Ensure minimum value is 0
                                handleOptionChange(questionIndex, optionIndex, 'points', validValue);
                              }}
                              inputProps={{ min: 0 }}
                              sx={{ width: 100, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />

                            <IconButton
                              onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                              disabled={question.options.length <= 2}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}

                      {question.options.length < 6 && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddOption(questionIndex)}
                          sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none' }}
                        >
                          Add Option
                        </Button>
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Add Question Button - Below all questions */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Add Question
                </Button>
              </Box>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Review Your Quiz
                </Typography>
              </Box>

              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper elevation={1} sx={{ p: 1, borderRadius: 2, mb: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      {watchedValues.title}
                    </Typography>
                    {watchedValues.description && (
                      <Typography variant="body1" color="text.secondary" paragraph>
                        {watchedValues.description}
                      </Typography>
                    )}
                    {tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1,}}>
                        {tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {watchedValues.visibility} quiz • {watchedValues.category || 'General'}
                    </Typography>
                  </Paper>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Questions Preview
                  </Typography>
                  {questions.map((question, index) => (
                    <Paper key={question._id} elevation={1} sx={{ p: 1, mb: 1, borderRadius: 2 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                        {index + 1}. {question.questionText}
                      </Typography>
                      <Box sx={{ ml: 1 }}>
                        {question.options.map((option, optIndex) => (
                          <Typography
                            key={option._id}
                            variant="body2"
                            sx={{
                              color: option.isCorrect ? 'success.main' : 'text.secondary',
                              fontWeight: option.isCorrect ? 600 : 400,
                              mb: 0.5
                            }}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option.text} {option.isCorrect && '✓'}
                          </Typography>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Alert severity="info" sx={{ borderRadius: 2, mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Quiz Statistics:</strong><br />
                      • {questions.length} question{questions.length !== 1 ? 's' : ''}<br />
                      • {calculateMaxPoints()} total points<br />
                      • {watchedValues.visibility} visibility<br />
                      {watchedValues.category && `• ${watchedValues.category} category`}
                    </Typography>
                  </Alert>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      borderRadius: 2,
                      py: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem'
                    }}
                  >
                    {saving ? (isNewQuiz ? 'Creating Quiz...' : 'Updating Quiz...') : (isNewQuiz ? 'Create Quiz' : 'Update Quiz')}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to Quizzes">
            <IconButton onClick={handleBackToQuizzes} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 600 }}>
            <QuizIcon sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
            {isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : (isNewQuiz ? 'Create Quiz' : 'Update Quiz')}
          </Button>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 1, borderRadius: 3, mb: 1 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box sx={{ mb: 1 }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* Add bottom padding to prevent content from being hidden behind fixed buttons */}
      <Box sx={{ pb: 10 }} />
      
      {/* Fixed Navigation Buttons */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex', 
          justifyContent: 'space-between',
          p: 1,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          size="large"
          sx={{ borderRadius: 2, px: 4, textTransform: 'none' }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={handleNext}
            size="large"
            sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 600 }}
          >
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default withAuth(QuizEditPage);
