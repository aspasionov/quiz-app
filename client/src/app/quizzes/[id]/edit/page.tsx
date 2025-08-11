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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { getQuizById } from '@/data/mockQuizzes';
import { Quiz, Question, Option } from '@/types';

const QuizEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'selected'>('public');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewQuiz, setIsNewQuiz] = useState(false);

  useEffect(() => {
    if (quizId === 'new') {
      setIsNewQuiz(true);
      setLoading(false);
      // Initialize with one empty question
      setQuestions([createEmptyQuestion()]);
    } else {
      const foundQuiz = getQuizById(quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        setTitle(foundQuiz.title);
        setDescription(foundQuiz.description || '');
        setTags(foundQuiz.tags);
        setVisibility(foundQuiz.visibility);
        setQuestions(foundQuiz.questions.length > 0 ? foundQuiz.questions : [createEmptyQuestion()]);
      }
      setLoading(false);
    }
  }, [quizId]);

  const createEmptyQuestion = (): Question => ({
    _id: Date.now().toString(),
    questionText: '',
    explanation: '',
    options: [
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
      createEmptyOption(),
    ]
  });

  const createEmptyOption = (): Option => ({
    _id: Date.now().toString() + Math.random(),
    text: '',
    points: 0,
    isCorrect: false
  });

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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

  const handleSave = () => {
    // Validation
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (questions.some(q => !q.questionText.trim())) {
      alert('Please fill in all question texts');
      return;
    }

    if (questions.some(q => q.options.some(opt => !opt.text.trim()))) {
      alert('Please fill in all option texts');
      return;
    }

    if (questions.some(q => !q.options.some(opt => opt.isCorrect))) {
      alert('Please mark at least one correct answer for each question');
      return;
    }

    // Save logic here (would typically send to API)
    console.log('Saving quiz:', {
      title,
      description,
      tags,
      visibility,
      questions,
      maxPoints: calculateMaxPoints()
    });

    alert('Quiz saved successfully!');
  };

  const handlePreview = () => {
    if (isNewQuiz) {
      alert('Please save the quiz first before previewing');
      return;
    }
    router.push(`/quizzes/${quizId}`);
  };

  const handleBack = () => {
    router.push('/quizzes');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back to Quizzes">
            <IconButton onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 600 }}>
            <QuizIcon sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
            {isNewQuiz ? 'Create New Quiz' : 'Edit Quiz'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isNewQuiz && (
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Preview
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Save Quiz
          </Button>
        </Box>
      </Box>

      {/* Quiz Basic Info */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Quiz Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              size="small"
              label="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                sx={{ borderRadius: 2, py: 1.75 }}
              >
                Add Tag
              </Button>
            </Box>

            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="filled"
                  />
                ))}
              </Box>
            )}

            <FormControl>
              <InputLabel id="visibility-label-edit">Visibility</InputLabel>
              <Select
                labelId="visibility-label-edit"
                label="Visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="selected">Selected Users</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Questions ({questions.length})
            </Typography>
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
            <Accordion key={question._id} sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Question Text"
                    value={question.questionText}
                    onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                    required
                    multiline
                    rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    fullWidth
                    label="Explanation (optional)"
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                    multiline
                    rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <Divider />

                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Answer Options
                  </Typography>

                  {question.options.map((option, optionIndex) => (
                    <Paper key={option._id} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={option.isCorrect}
                              onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                              color="success"
                            />
                          }
                          label="Correct"
                          sx={{ minWidth: 100 }}
                        />
                        
                        <TextField
                          fullWidth
                          label={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <TextField
                          label="Points"
                          type="number"
                          value={option.points}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'points', parseInt(e.target.value) || 0)}
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

      {/* Summary */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Quiz Summary:</strong> {questions.length} question{questions.length !== 1 ? 's' : ''} • 
          Maximum {calculateMaxPoints()} points • {visibility} visibility
        </Typography>
      </Alert>
    </Container>
  );
};

export default withAuth(QuizEditPage);
