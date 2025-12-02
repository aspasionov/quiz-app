'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Question, Option } from '@/types';
import { quizApi, type CreateQuizData } from '@/api/quiz.api';
import { tagApi, type Tag } from '@/utils/api';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { QUIZ_STORAGE_KEY } from '@/constans';
import Wizard from '@/components/Wizard';
import { renderStepContent, type StepRendererProps } from '@/components/Wizard/StepRenderer';
import { type QuizInfoFormData } from '@/components/Wizard/steps/GeneralStep';

const steps = ['Quiz Information', 'Add Questions', 'Review & Save'];

// Form validation schema
const quizInfoSchema = z.object({
  title: z.string()
    .min(1, 'Quiz title is required')
    .max(256, 'Quiz title must be less than 256 characters'),
  description: z.string(),
  category: z.string(),
  visibility: z.enum(['public', 'private', 'selected']),
  tags: z.array(z.string())
    .min(1, 'Please add at least 1 tag')
    .refine((tags) => tags.every(tag => tag.length > 0), {
      message: 'All tags must be non-empty'
    })
});

function CreateQuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSnackbar } = useSnackBarStore();

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);

  // React Hook Form setup
  const {
    control,
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

  // Initialize active step from URL on client side
  useEffect(() => {
    const stepFromUrl = searchParams.get('step');
    if (stepFromUrl) {
      const step = parseInt(stepFromUrl, 10);
      if (step >= 0 && step < steps.length) {
        setActiveStep(step);
      }
    }
  }, [searchParams]);

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
    if (firstQuestion._id) {
      setExpandedAccordion(firstQuestion._id); // Auto-expand the first question
    }
    
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
        if (firstQuestion._id) {
          setExpandedAccordion(firstQuestion._id); // Auto-expand the first question
        }
        
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
        if (questions.length > 0 && questions[0]._id) {
          setExpandedAccordion(questions[0]._id);
        }
      }
      
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, watchedValues, activeStep, isInitialized]);

  // Question management
  const handleAddQuestion = () => {
    const newQuestion = createEmptyQuestion();
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);

    // Auto-expand the newly added question
    if (newQuestion._id) {
      setExpandedAccordion(newQuestion._id);
    }

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
        setExpandedAccordion(newQuestions.length > 0 && newQuestions[0]._id ? newQuestions[0]._id : false);
      }
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: unknown) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };

    // If points field is being changed, update the correct option's points as well
    if (field === 'points') {
      const updatedOptions = [...updatedQuestions[index].options];
      const pointsValue = (typeof value === 'number' ? value : 0) || 0;
      updatedOptions.forEach((option) => {
        if (option.isCorrect) {
          option.points = pointsValue; // Set correct option to the new points value
        } else {
          option.points = 0; // Ensure incorrect options have 0 points
        }
      });
      updatedQuestions[index].options = updatedOptions;
    }

    setQuestions(updatedQuestions);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (invalidQuestions.length > 0 && invalidQuestions[0]._id) {
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
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error('Error creating quiz:', error);

      // Handle specific error cases
      if (err.response?.status === 401) {
        showSnackbar('You need to be logged in to create a quiz.', 'error');
        router.push('/login');
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Prepare step renderer props
  const stepRendererProps: StepRendererProps = {
    step: activeStep,
    control,
    errors,
    watchedValues,
    availableTags,
    isLoadingTags,
    questions,
    expandedAccordion,
    onQuestionChange: handleQuestionChange,
    onOptionChange: handleOptionChange,
    onCorrectAnswerChange: handleCorrectAnswerChange,
    onAddOption: handleAddOption,
    onRemoveOption: handleRemoveOption,
    onAddQuestion: handleAddQuestion,
    onDeleteQuestion: handleDeleteQuestion,
    onAccordionChange: handleAccordionChange,
    isQuestionValid,
    tags,
    calculateMaxPoints,
    onSave: handleSave,
    saving,
    isNewQuiz: true,
  };

  // Title prefix - back button
  const titlePrefix = (
    <Tooltip title="Back to Quizzes">
      <IconButton onClick={handleBackToQuizzes}>
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );

  // Header actions - draft controls
  const headerActions = hasDraftData ? (
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
  ) : null;

  return (
    <Wizard
      title="Create Quiz"
      steps={steps}
      activeStep={activeStep}
      onBack={handleBack}
      onNext={handleNext}
      isInitialized={isInitialized}
      titlePrefix={titlePrefix}
      headerActions={headerActions}
    >
      {renderStepContent(stepRendererProps)}
    </Wizard>
  );
}

import { withAuth } from '@/components/WithAuth';

function CreateQuizPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateQuizPageContent />
    </Suspense>
  );
}

export default withAuth(CreateQuizPageWrapper);
