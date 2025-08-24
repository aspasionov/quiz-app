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
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { Question, Option } from '@/types';
import { quizApi, type CreateQuizData } from '@/api/quiz.api';
import { tagApi, type Tag } from '@/utils/api';
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

  // Tags from database
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [hasDraftData, setHasDraftData] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>('question_1');

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
      points: undefined, // No default value, will show placeholder
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
          setHasDraftData(true); // Mark that we have draft data
          
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
    setHasDraftData(false); // No draft data available
    return false; // No data was loaded
  };

  // Clear localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      setHasDraftData(false); // Update state to reflect no draft data
      console.log('✅ localStorage cleared successfully');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  // Start fresh - clear all data and reset form
  const startFresh = () => {
    clearLocalStorage();
    const firstQuestion = createEmptyQuestion(1);
    setQuestions([firstQuestion]);
    setIdCounter(4);
    setActiveStep(0);
    setExpandedAccordion(firstQuestion._id); // Auto-expand the first question
    
    // Reset form to default values
    setValue('title', '');
    setValue('description', '');
    setValue('category', '');
    setValue('visibility', 'public');
    setValue('tags', []);
    
    // Update URL to remove step parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('step');
    url.searchParams.delete('fresh');
    url.searchParams.delete('new');
    router.replace(url.pathname, { scroll: false });
  };

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
  // Initialize with one empty question on client side only
  useEffect(() => {
    if (!isInitialized) {
      // Check if user wants to start fresh (no draft recovery)
      const urlParams = new URLSearchParams(window.location.search);
      const startFresh = urlParams.has('fresh') || urlParams.has('new');
      
      let dataLoaded = false;
      if (!startFresh) {
        dataLoaded = loadFromLocalStorage();
      }
      
      if (!dataLoaded) {
        // No saved data or starting fresh, create default question
        const firstQuestion = createEmptyQuestion(1);
        setQuestions([firstQuestion]);
        setIdCounter(4); // Start from 4 for next items (1 question + 2 options = 3, so next starts at 4)
        setExpandedAccordion(firstQuestion._id); // Auto-expand the first question
        
        // Reset form to default values if starting fresh
        if (startFresh) {
          setValue('title', '');
          setValue('description', '');
          setValue('category', '');
          setValue('visibility', 'public');
          setValue('tags', []);
        }
      } else {
        // Data was loaded, expand the first question
        if (questions.length > 0) {
          setExpandedAccordion(questions[0]._id);
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, setValue, questions]);

  // Save to localStorage whenever questions or form data changes
  useEffect(() => {
    if (isInitialized) {
      saveToLocalStorage();
      
      // Remove fresh parameter from URL after user starts working (has content)
      const hasContent = watchedValues.title?.trim() || 
                        watchedValues.description?.trim() || 
                        (watchedValues.tags && watchedValues.tags.length > 0) ||
                        questions.some(q => q.questionText.trim() || q.options.some(opt => opt.text.trim()));
      
      if (hasContent) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('fresh') || urlParams.has('new')) {
          urlParams.delete('fresh');
          urlParams.delete('new');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          router.replace(newUrl, { scroll: false });
        }
      }
    }
  }, [questions, watchedValues, activeStep, isInitialized, router]);

  // Question management
  const handleAddQuestion = () => {
    const newQuestion = createEmptyQuestion();
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    
    // Auto-expand the newly added question
    setExpandedAccordion(newQuestion._id);
    
    // Auto-scroll to the newly added question after a short delay
    setTimeout(() => {
      const newQuestionIndex = newQuestions.length - 1;
      const newQuestionElement = document.getElementById(`question-${newQuestionIndex}`);
      if (newQuestionElement) {
        newQuestionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure the DOM is updated
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
    
    // If points field is being changed, update the correct option's points as well
    if (field === 'points') {
      const updatedOptions = [...updatedQuestions[index].options];
      updatedOptions.forEach((option, i) => {
        if (option.isCorrect) {
          option.points = value || 0; // Set correct option to the new points value
        } else {
          option.points = 0; // Ensure incorrect options have 0 points
        }
      });
      updatedQuestions[index].options = updatedOptions;
    }
    
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
      // Set points based on correctness using question.points value
      option.points = i === optionIndex ? (updatedQuestions[questionIndex].points || 5) : 0;
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
      // Use question.points directly instead of looking at option.points
      return total + (question.points || 5);
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

  // Expand all invalid questions
  const expandInvalidQuestions = () => {
    const invalidQuestions = questions.filter(q => !isQuestionValid(q));
    if (invalidQuestions.length > 0) {
      // If there are invalid questions, expand the first one
      // (we can only expand one at a time with accordion)
      setExpandedAccordion(invalidQuestions[0]._id);
      
      // Scroll to the first invalid question
      setTimeout(() => {
        const firstInvalidIndex = questions.findIndex(q => q._id === invalidQuestions[0]._id);
        const invalidQuestionElement = document.getElementById(`question-${firstInvalidIndex}`);
        if (invalidQuestionElement) {
          invalidQuestionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
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
      // Validation failed - expand invalid questions and show warning
      expandInvalidQuestions();
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
        // Check for specific validation issues
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
            points: opt.isCorrect ? (q.points || 5) : 0, // Use question points for correct answers, default 5
            isCorrect: opt.isCorrect
          }))
        })),
        allowedUsers: [] // Can be extended later for selected visibility
      };

      console.log('Creating quiz:', quizData);
      
      // Call API to create quiz
      const response = await quizApi.createQuiz(quizData);
      
      if (response.success) {
        showSnackbar('Quiz created successfully!', 'success');
        
        // Clear localStorage and redirect to quizzes page
        clearLocalStorage();
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
        const errorData = error.response.data;
        const errorMsg = errorData?.message || 'Validation failed';
        const errors = errorData?.errors;
        
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
        } else if (errors && errors.length > 0) {
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
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                          <Box component="li" key={key} {...otherProps}>
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
                        );
                      }}
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
                <Box key={question._id} sx={{ position: 'relative' }}>
                  <Accordion 
                    id={`question-${questionIndex}`}
                    expanded={expandedAccordion === question._id}
                    onChange={(event, isExpanded) => {
                      handleAccordionChange(question._id, isExpanded);
                    }}
                    sx={{ 
                      mb: 1, 
                      borderRadius: 2, 
                      '&:before': { display: 'none' },
                      border: '2px solid',
                      borderColor: 'transparent',
                      // Add visual indicator for invalid questions
                      ...(expandedAccordion === question._id && !isQuestionValid(question) && {
                        
                        borderColor: 'warning.main',
                        backgroundColor: 'warning.50'
                      })
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ pr: 6 }} // Add padding to make room for delete button
                    >
                      <Typography sx={{ fontWeight: 500 }}>
                        Question {questionIndex + 1}: {question.questionText || 'Untitled Question'}
                      </Typography>
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

                      <Grid container sx={{ mt: 1 }} alignItems="flex-end">
                      {question.options.length < 6 && (
                      <Grid size="auto" >
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddOption(questionIndex)}
                          sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none' }}
                        >
                          Add Option
                        </Button>
                        </Grid>
                      )}

                        
                        <Grid size="auto" sx={{ ml: 'auto'}}>

                        <TextField
                        size="small"
                        label="Points"
                        type="number"
                        value={question.points || ''}
                        placeholder='5'
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const validValue = Math.max(0, value); // Ensure minimum value is 0
                          handleQuestionChange(questionIndex, 'points', validValue || undefined);
                        }}
                        inputProps={{ min: 0 }}
                        sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                        </Grid>

                      </Grid>

                    </Box>
                  </AccordionDetails>
                </Accordion>
                
                {/* Delete button positioned absolutely outside the accordion */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(questionIndex);
                  }}
                  disabled={questions.length === 1}
                  size="small"
                  sx={{ 
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: 'error.main',
                    zIndex: 1
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                </Box>
              ))}

              {/* Question Navigation and Add Question Button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                {/* Question Navigation */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {questions.length > 1 && (
                    <Button
                      variant="outlined"
                      size="large"
                      disabled={(() => {
                        const currentIndex = questions.findIndex(q => q._id === expandedAccordion);
                        return currentIndex >= questions.length - 1;
                      })()}
                      onClick={() => {
                        const currentIndex = questions.findIndex(q => q._id === expandedAccordion);
                        if (currentIndex < questions.length - 1) {
                          const nextIndex = currentIndex + 1;
                          setExpandedAccordion(questions[nextIndex]._id);
                          // Scroll to the question
                          setTimeout(() => {
                            const element = document.getElementById(`question-${nextIndex}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }
                      }}
                      sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                    >
                      Next <ArrowDownwardIcon sx={{ ml: 0.5, fontSize: 16 }} />
                    </Button>
                  )}
                </Box>

                {/* Add Question Button */}
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
                <Grid size={{ xs: 12, md: 8}}>
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to Quizzes">
            <IconButton onClick={handleBackToQuizzes} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Create Quiz
          </Typography>
        </Box>
        
        {/* Show draft indicator and start fresh button if there's saved data */}
        {hasDraftData && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label="Draft recovered" 
              size="small" 
              color="info" 
              variant="outlined"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={startFresh}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Start Fresh
            </Button>
          </Box>
        )}
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
