'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Container,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { quizApi, type CreateQuizData } from '@/api/quiz.api';
import { tagApi, type Tag } from '@/utils/api';
import { Question, Option } from '@/types';
import useSnackBarStore from '@/stores/useSnackBarStore';
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

export default function QuizEditPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
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

  // Quiz and state management
  // const [quiz, setQuiz] = useState<Quiz | null>(null);
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
            // setQuiz(foundQuiz);
            
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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


  const handleAddQuestion = () => {
    const newQuestion = createEmptyQuestion();
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);

    // Auto-expand the newly added question
    if (newQuestion._id) {
      setExpandedAccordion(newQuestion._id);
    }
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
        if (firstInvalidQuestion && firstInvalidQuestion._id) {
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
            points: opt.isCorrect ? (q.points || 5) : 0, // Use question points for correct answers, default 5
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
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error('Error saving quiz:', error);

      // Handle specific error cases
      if (err.response?.status === 401) {
        showSnackbar('You need to be logged in to save a quiz.', 'error');
        router.push('/login');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || 'Validation failed';
        const errors = err.response.data?.errors;

        if (errors && errors.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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


  const handleBackToQuizzes = () => {
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
    isNewQuiz,
  };

  // Title prefix - back button and quiz icon
  const titlePrefix = (
    <>
      <Tooltip title="Back to Quizzes">
        <IconButton onClick={handleBackToQuizzes}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <QuizIcon sx={{ ml: 1, mr: 1, color: 'primary.main' }} />
    </>
  );

  // Header actions - save button
  const headerActions = (
    <Button
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={handleSave}
      disabled={saving}
      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
    >
      {saving ? 'Saving...' : (isNewQuiz ? 'Create Quiz' : 'Update Quiz')}
    </Button>
  );

  // Loading state
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
    <Wizard
      title={isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
      steps={steps}
      activeStep={activeStep}
      onBack={handleBack}
      onNext={handleNext}
      isInitialized={!loading}
      titlePrefix={titlePrefix}
      headerActions={headerActions}
    >
      {renderStepContent(stepRendererProps)}
    </Wizard>
  );
}
