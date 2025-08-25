'use client'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Question } from '@/types';
import { QuizInfoFormData } from './GeneralStep';

interface ReviewStepProps {
  watchedValues: QuizInfoFormData;
  questions: Question[];
  tags: string[];
  saving: boolean;
  onSave: () => void;
  calculateMaxPoints: () => number;
  isNewQuiz?: boolean;
}

export const ReviewStep = ({
  watchedValues,
  questions,
  tags,
  saving,
  onSave,
  calculateMaxPoints,
  isNewQuiz = true,
}: ReviewStepProps) => {
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
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
                {question.explanation && (
                  <Box sx={{ ml: 1, mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Explanation: {question.explanation}
                    </Typography>
                  </Box>
                )}
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
              onClick={onSave}
              disabled={saving}
              sx={{
                borderRadius: 2,
                py: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {saving 
                ? (isNewQuiz ? 'Creating Quiz...' : 'Updating Quiz...') 
                : (isNewQuiz ? 'Create Quiz' : 'Update Quiz')
              }
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
