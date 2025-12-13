'use client'

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { quizApi, type LeaderboardEntry } from '@/api/quiz.api';
import useSnackBarStore from '@/stores/useSnackBarStore';

interface LeaderboardDialogProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

const LeaderboardDialog = ({ open, onClose, quizId, quizTitle }: LeaderboardDialogProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState<{ rank: number; submission: LeaderboardEntry } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const { showSnackbar } = useSnackBarStore();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await quizApi.getLeaderboard(quizId, { limit, offset });

      if (response.success && response.data) {
        setLeaderboard(response.data.leaderboard);
        setTotal(response.data.total);
        setCurrentUserRank(response.data.currentUserRank || null);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err: unknown) {
      console.error('Error fetching leaderboard:', err);
      let errorMessage = 'Failed to load leaderboard';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open, offset]);

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  const handleReset = () => {
    setOffset(0);
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon color="primary" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Leaderboard
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {quizTitle}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {loading && offset === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Button size="small" onClick={fetchLeaderboard} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        ) : leaderboard.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <TrophyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No submissions yet!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to take this quiz and claim the top spot!
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Score</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.user._id}
                      sx={{
                        backgroundColor: entry.isCurrentUser ? 'action.selected' : 'transparent',
                        '&:hover': { backgroundColor: entry.isCurrentUser ? 'action.selected' : 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: entry.rank <= 3 ? 600 : 400 }}>
                            {getMedalEmoji(entry.rank)} {entry.rank}
                          </Typography>
                          {entry.isCurrentUser && (
                            <Chip label="You" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={entry.user.avatar}
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}
                          >
                            {entry.user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: entry.isCurrentUser ? 600 : 400 }}>
                            {entry.user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.score} pts
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.percentage.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">{formatTime(entry.timeSpent)}</Typography>
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

            {currentUserRank && !leaderboard.find(e => e.isCurrentUser) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your Rank: <strong>#{currentUserRank.rank}</strong> out of {total} submissions
              </Alert>
            )}

            {offset + limit < total && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" onClick={handleLoadMore} disabled={loading}>
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}

            {offset > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button size="small" onClick={handleReset}>
                  Back to Top
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {total > 0 && `${total} total ${total === 1 ? 'submission' : 'submissions'}`}
        </Typography>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaderboardDialog;
