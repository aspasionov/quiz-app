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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { quizApi, type LeaderboardEntry, type Quiz } from '@/api/quiz.api';
import useSnackBarStore from '@/stores/useSnackBarStore';
import { withAuth } from '@/components/WithAuth';

function LeaderboardPageContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { showSnackbar } = useSnackBarStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quiz info and leaderboard in parallel
        const [quizResponse, leaderboardResponse] = await Promise.all([
          quizApi.getQuiz(quizId),
          quizApi.getLeaderboard(quizId, { limit, offset }),
        ]);

        if (quizResponse.success && quizResponse.data) {
          setQuiz(quizResponse.data);
        }

        if (leaderboardResponse.success && leaderboardResponse.data) {
          setLeaderboard(leaderboardResponse.data.leaderboard);
          setTotal(leaderboardResponse.data.total);
        }
      } catch (err: unknown) {
        console.error('Error fetching leaderboard:', err);
        let errorMessage = 'Failed to load leaderboard';

        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { message?: string }; status?: number } };
          errorMessage = axiosError.response?.data?.message || errorMessage;

          // Handle 403 - no access to leaderboard
          if (axiosError.response?.status === 403) {
            showSnackbar('You do not have permission to view this leaderboard', 'error');
            router.push('/quizzes');
            return;
          }
        }

        setError(errorMessage);
        showSnackbar(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, offset, limit, router, showSnackbar]);

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  const handleReset = () => {
    setOffset(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMedalEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  if (loading && !quiz) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !quiz) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/quizzes')}>
          Back to Quizzes
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => router.push('/quizzes')} sx={{ mr: -1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              Leaderboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
              {quiz?.title}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Leaderboard Table */}
      <Card elevation={2} sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading && offset === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 4 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Box>
          ) : leaderboard.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <TrophyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                No submissions yet!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Be the first to take this quiz and claim the top spot!
              </Typography>
              <Button variant="contained" onClick={() => router.push(`/quizzes/${quizId}`)}>
                Take Quiz
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Player</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Score</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Percentage</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.user._id}
                      sx={{
                        backgroundColor: entry.isCurrentUser ? 'action.selected' : 'transparent',
                        '&:hover': { backgroundColor: entry.isCurrentUser ? 'action.selected' : 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: entry.rank <= 3 ? 700 : 500,
                              fontSize: entry.rank <= 3 ? '1.1rem' : '1rem',
                            }}
                          >
                            {getMedalEmoji(entry.rank)} {entry.rank}
                          </Typography>
                          {entry.isCurrentUser && (
                            <Chip label="You" size="small" color="primary" sx={{ height: 22, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={entry.user.avatar}
                            sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem' }}
                          >
                            {entry.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body1" sx={{ fontWeight: entry.isCurrentUser ? 600 : 400 }}>
                            {entry.user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {entry.score} pts
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${entry.percentage.toFixed(1)}%`}
                          size="small"
                          color={entry.percentage >= 80 ? 'success' : entry.percentage >= 60 ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {formatTime(entry.timeSpent)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(entry.completedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Load More / Pagination */}
      {leaderboard.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          {offset + limit < total && (
            <Button variant="outlined" onClick={handleLoadMore} disabled={loading} size="large">
              {loading ? 'Loading...' : `Load More (${Math.min(limit, total - offset - limit)} more)`}
            </Button>
          )}
          {offset > 0 && (
            <Button variant="outlined" onClick={handleReset} size="large">
              Back to Top
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
}

export default withAuth(LeaderboardPageContent);
