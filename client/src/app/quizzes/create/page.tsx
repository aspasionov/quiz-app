'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Stepper,
  Step,
  StepLabel,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Quiz as QuizIcon,
  Info as InfoIcon,
  QuestionAnswer as QuestionIcon,
  Preview as PreviewIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { Question, Option } from '@/types';
import { quizApi, CreateQuizData } from '@/utils/api';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { QUIZ_STORAGE_KEY } from '@/constans';

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

// Predefined tag suggestions
const predefinedTags = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  
  // Web Development
  'HTML', 'CSS', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'Webpack', 'Vite',
  
  // Backend & Databases
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'Docker', 'Kubernetes',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Firebase', 'Heroku', 'Netlify', 'Vercel', 'CI/CD', 'Git', 'GitHub',
  
  // Data & AI
  'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Jupyter', 'SQL',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
  
  // Testing & Quality
  'Jest', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing', 'TDD', 'BDD',
  
  // General Topics
  'Algorithms', 'Data Structures', 'Design Patterns', 'System Design', 'Security', 'Performance',
  
  // Difficulty Levels
  'Beginner', 'Intermediate', 'Advanced', 'Expert',
  
  // Categories
  'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Mobile', 'Game Development', 'Cybersecurity',
  
  // Methodologies
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'Lean',
  
  // Soft Skills
  'Problem Solving', 'Critical Thinking', 'Communication', 'Leadership', 'Teamwork'
];

const CreateQuizPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackBarStore();
  
  // Get initial step from URL or default to 0
  const getInitialStep = () => {
    const stepFromUrl = searchParams.get('step');
    const step = stepFromUrl ? parseInt(stepFromUrl, 10) : 0;
    return step >= 0 && step < steps.length ? step : 0;
  };
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(getInitialStep);

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

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);

  // ID counter to ensure consistent IDs
  const [idCounter, setIdCounter] = useState(1);


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

  // Save quiz data to localStorage whenever it changes
  const saveToLocalStorage = () => {
    try {
      const quizData = {
        questions,
        idCounter,
        formData: watchedValues,
        activeStep
      };
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizData));
    } catch (error) {
      console.warn('Failed to save quiz data to localStorage:', error);
    }
  };

  // Load quiz data from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (savedData) {
        const { questions: savedQuestions, idCounter: savedIdCounter, formData: savedFormData } = JSON.parse(savedData);
        
        if (savedQuestions && Array.isArray(savedQuestions) && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setIdCounter(savedIdCounter || 4);
          
          // Restore form data
          if (savedFormData) {
            Object.keys(savedFormData).forEach(key => {
              if (savedFormData[key] !== undefined) {
                setValue(key as keyof QuizInfoFormData, savedFormData[key]);
              }
            });
          }
          
          return true; // Data was loaded
        }
      }
    } catch (error) {
      console.warn('Failed to load quiz data from localStorage:', error);
    }
    return false; // No data was loaded
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  // Initialize with one empty question on client side only
  useEffect(() => {
    if (!isInitialized) {
      const dataLoaded = loadFromLocalStorage();
      
      if (!dataLoaded) {
        // No saved data, create default question
        setQuestions([createEmptyQuestion(1)]);
        setIdCounter(4); // Start from 4 for next items (1 question + 2 options = 3, so next starts at 4)
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save to localStorage whenever questions or form data changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage();
    }
  }, [questions, watchedValues, activeStep, isInitialized]);

  // Question management
  const handleAddQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
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

  // Validation
  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Quiz Information
        return isValid && watchedValues.title?.trim() !== '' && tags.length >= 1;
      case 1: // Questions
        return questions.every(q => 
          q.questionText.trim() !== '' &&
          q.options.every(opt => opt.text.trim() !== '') &&
          q.options.some(opt => opt.isCorrect)
        );
      case 2: // Review
        return true;
      default:
        return false;
    }
  };

  // Update URL when step changes
  const updateUrlStep = (step: number) => {
    const url = new URL(window.location.href);
    if (step === 0) {
      url.searchParams.delete('step');
    } else {
      url.searchParams.set('step', step.toString());
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Navigation
  const handleNext = async () => {
    if (activeStep === 0) {
      // Trigger form validation for step 0
      const isFormValid = await trigger();
      if (validateStep(activeStep) && isFormValid) {
        const nextStep = activeStep + 1;
        setActiveStep(nextStep);
        updateUrlStep(nextStep);
      } else {
        showSnackbar(getValidationMessage(activeStep), 'warning');
      }
    } else if (validateStep(activeStep)) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      updateUrlStep(nextStep);
    } else {
      showSnackbar(getValidationMessage(activeStep), 'warning');
    }
  };

  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
    updateUrlStep(prevStep);
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
        return 'Please complete all questions with valid options and correct answers';
      default:
        return 'Please complete all required fields';
    }
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

      console.log('Creating quiz:', quizData);
      
      // Call API to create quiz
      const response = await quizApi.createQuiz(quizData);
      
      if (response.success) {
        // Clear localStorage after successful submission
        clearLocalStorage();
        showSnackbar('Quiz created successfully!', 'success');
        router.push('/quizzes');
      } else {
        throw new Error(response.message || 'Failed to create quiz');
      }
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        showSnackbar('You need to be logged in to create a quiz.', 'error');
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
        showSnackbar('Error creating quiz. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBackToQuizzes = () => {
    // Optionally clear localStorage when user navigates away
    // Uncomment the next line if you want to clear draft when user goes back
    // clearLocalStorage();
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
                      options={predefinedTags}
                      value={field.value || []}
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
                          placeholder="Type to search or create tags..."
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <QuestionIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Questions ({questions.length})
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddQuestion}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Add Question
                </Button>
              </Box>

              {questions.map((question, questionIndex) => (
                <Accordion 
                  key={question._id} 
                  defaultExpanded={questionIndex === 0}
                  sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' } }}
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
                    {saving ? 'Creating Quiz...' : 'Create Quiz'}
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Tooltip title="Back to Quizzes">
          <IconButton onClick={handleBackToQuizzes} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Create Quiz
        </Typography>
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
        {isInitialized ? renderStepContent(activeStep) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <Typography variant="body1">Loading...</Typography>
          </Box>
        )}
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

export default withAuth(CreateQuizPage);
