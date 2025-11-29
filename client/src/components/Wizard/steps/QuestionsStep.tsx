'use client'

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { Question, Option } from '@/types';

interface QuestionsStepProps {
  questions: Question[];
  expandedAccordion: string | false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuestionChange: (index: number, field: keyof Question, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOptionChange: (questionIndex: number, optionIndex: number, field: keyof Option, value: any) => void;
  onCorrectAnswerChange: (questionIndex: number, optionIndex: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (index: number) => void;
  onAccordionChange: (questionId: string, isExpanded: boolean) => void;
  isQuestionValid: (question: Question) => boolean;
}

export const QuestionsStep = ({
  questions,
  expandedAccordion,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption,
  onAddQuestion,
  onDeleteQuestion,
  onAccordionChange,
  isQuestionValid,
}: QuestionsStepProps) => {
  
  // All handlers are now passed as props from parent component

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
                onAccordionChange(question._id, isExpanded);
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
                    onChange={(e) => onQuestionChange(questionIndex, 'questionText', e.target.value)}
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
                    onChange={(e) => onQuestionChange(questionIndex, 'explanation', e.target.value)}
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
                              onChange={() => onCorrectAnswerChange(questionIndex, optionIndex)}
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
                          onChange={(e) => onOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                          required
                          placeholder="Enter answer option..."
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />

                        <IconButton
                          onClick={() => onRemoveOption(questionIndex, optionIndex)}
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
                      <Grid size="auto">
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => onAddOption(questionIndex)}
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
                          onQuestionChange(questionIndex, 'points', validValue || undefined);
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
                onDeleteQuestion(questionIndex);
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
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          {/* Add Question Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={onAddQuestion}
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
};
