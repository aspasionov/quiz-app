'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { quizApi, type Quiz } from '@/api/quiz.api';
import useSnackBarStore from '@/stores/useSnackBarStore';
import useUserStore from '@/stores/useUserStore';

const QuizzesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userQuizCount, setUserQuizCount] = useState<{ count: number; maxLimit: number; remaining: number } | null>(null);
  const [limitWarningOpen, setLimitWarningOpen] = useState(false);
  const fetchedRef = React.useRef(false);
  const { showSnackbar } = useSnackBarStore();
  const { user } = useUserStore();

  // Tab mapping
  const tabNames = ['all', 'public', 'private', 'my'];
  const getTabIndexFromName = (name: string) => {
    const index = tabNames.indexOf(name);
    return index >= 0 ? index : 0;
  };
  const getTabNameFromIndex = (index: number) => {
    return tabNames[index] || 'all';
  };

  // Initialize tab from URL on component mount
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab) {
      const tabIndex = getTabIndexFromName(urlTab);
      setTabValue(tabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
    const tabName = getTabNameFromIndex(newValue);
    const url = new URL(window.location.href);
    
    if (tabName === 'all') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tabName);
    }
    
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // Fetch quizzes from API
  useEffect(() => {
    if (fetchedRef.current) return; // Prevent duplicate calls
    fetchedRef.current = true;
    
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        const response = await quizApi.getQuizzes({ limit: 100 });
        
        if (response.success && response.data) {
          setQuizzes(response.data);
        } else {
          showSnackbar('Failed to load quizzes', 'error');
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;
        console.error('Error fetching quizzes:', error);
        showSnackbar(
          err.response?.data?.message || 'Error loading quizzes',
          'error'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate user quiz count from loaded quizzes
  useEffect(() => {
    if (user && quizzes.length > 0 && !isLoading) {
      const userQuizzes = quizzes.filter(quiz => isQuizOwner(quiz));
      const quizCount = {
        count: userQuizzes.length,
        maxLimit: 10,
        remaining: Math.max(0, 10 - userQuizzes.length)
      };
      setUserQuizCount(quizCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, quizzes, isLoading]);

  const handleCreateQuiz = () => {
    
    // If we don't have quiz count data, try to calculate from current quizzes
    if (!userQuizCount && user && quizzes.length > 0) {
      const userQuizzes = quizzes.filter(quiz => isQuizOwner(quiz));
      const calculatedCount = {
        count: userQuizzes.length,
        maxLimit: 10,
        remaining: Math.max(0, 10 - userQuizzes.length)
      };
      setUserQuizCount(calculatedCount);
      
      // Check limit with calculated count
      if (calculatedCount.remaining <= 0) {
        setLimitWarningOpen(true);
        return;
      }
    }
    
    // Check if user has reached the quiz limit
    if (userQuizCount && userQuizCount.remaining <= 0) {
      console.log('Quiz limit reached, showing warning');
      setLimitWarningOpen(true);
      return;
    }
    
    console.log('Proceeding to create quiz page');
    router.push('/quizzes/create?fresh=true');
  };

  const handlePlayQuiz = (quizId: string) => {
    router.push(`/quizzes/${quizId}`);
  };

  const handleEditQuiz = (quizId: string) => {
    router.push(`/quizzes/${quizId}/edit`);
  };

  const handleDeleteQuiz = (quizId: string) => {
    const quiz = quizzes.find(q => q._id === quizId);
    if (quiz) {
      setQuizToDelete(quiz);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setIsDeleting(true);
    try {
      const response = await quizApi.deleteQuiz(quizToDelete._id);
      
      if (response.success) {
        // Remove quiz from local state
        setQuizzes(prevQuizzes => prevQuizzes.filter(q => q._id !== quizToDelete._id));
        
        // Update user quiz count
        if (userQuizCount) {
          setUserQuizCount({
            ...userQuizCount,
            count: userQuizCount.count - 1,
            remaining: userQuizCount.remaining + 1
          });
        }
        
        showSnackbar('Quiz deleted successfully!', 'success');
      } else {
        throw new Error(response.message || 'Failed to delete quiz');
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.error('Error deleting quiz:', error);

      if (err.response?.status === 401) {
        showSnackbar('You need to be logged in to delete quizzes.', 'error');
        router.push('/login');
      } else if (err.response?.status === 403) {
        showSnackbar('You can only delete your own quizzes.', 'error');
      } else {
        showSnackbar(
          err.response?.data?.message || 'Error deleting quiz. Please try again.',
          'error'
        );
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const cancelDeleteQuiz = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <PublicIcon />;
      case 'private':
        return <PrivateIcon />;
      default:
        return <PrivateIcon />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'success';
      case 'private':
        return 'error';
      default:
        return 'default';
    }
  };

  // Check if current user owns the quiz
  const isQuizOwner = (quiz: Quiz) => {
    if (!user) return false;
    
    // Handle both string and object author types
    const authorId = typeof quiz.author === 'string' ? quiz.author : quiz.author._id;
    return authorId === user._id;
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    // Filter out selected quizzes entirely
    if (quiz.visibility === 'selected') {
      return false;
    }
    
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    switch (tabValue) {
      case 0: // All quizzes
        return matchesSearch;
      case 1: // Public quizzes
        return matchesSearch && quiz.visibility === 'public';
      case 2: // Private quizzes
        return matchesSearch && quiz.visibility === 'private';
      case 3: // My quizzes
        return matchesSearch && isQuizOwner(quiz);
      default:
        return matchesSearch;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading skeleton component
  const QuizCardSkeleton = () => (
    <Grid sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, minWidth: 280 }}>
      <Card elevation={2} sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={80} height={16} />
            </Box>
            <Skeleton variant="text" width={40} height={16} />
          </Box>
          <Skeleton variant="text" width={120} height={16} />
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
          <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
          <Skeleton variant="circular" width={32} height={32} />
        </CardActions>
      </Card>
    </Grid>
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
              <QuizIcon sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
              Quizzes
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleCreateQuiz}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Create Quiz
            </Button>
          </Box>

          {/* Search Bar Skeleton */}
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 2, mb: 3 }} />

          {/* Filter Tabs Skeleton */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, pb: 1 }}>
              <Skeleton variant="text" width={80} height={24} />
              <Skeleton variant="text" width={60} height={24} />
              <Skeleton variant="text" width={70} height={24} />
              <Skeleton variant="text" width={80} height={24} />
            </Box>
          </Box>
        </Box>

        {/* Loading indicator with text */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body1" color="text.secondary">
            Loading quizzes...
          </Typography>
        </Box>

        {/* Results Count Skeleton */}
        <Skeleton variant="text" width={150} height={24} sx={{ mb: 3 }} />

        {/* Skeleton Cards Grid */}
        <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          {Array.from({ length: 12 }).map((_, index) => (
            <QuizCardSkeleton key={index} />
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            <QuizIcon sx={{ mr: 2, fontSize: 'inherit', color: 'primary.main' }} />
            Quizzes
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateQuiz}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create Quiz
          </Button>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search quizzes by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* Filter Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => handleTabChange(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Quizzes" />
          <Tab label="Public" />
          <Tab label="Private" />
          <Tab label="My" />
        </Tabs>
      </Box>

      {/* Results Count */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
      </Typography>

      {/* Quizzes Grid */}
      <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        {filteredQuizzes.map((quiz) => (
          <Grid sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, minWidth: 280 }} key={quiz._id}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                {/* Quiz Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {quiz.title}
                  </Typography>
                  <Tooltip title={`${quiz.visibility} quiz`}>
                    <Chip
                      icon={getVisibilityIcon(quiz.visibility)}
                      label={quiz.visibility}
                      size="small"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      color={getVisibilityColor(quiz.visibility) as any}
                      variant="outlined"
                    />
                  </Tooltip>
                </Box>

                {/* Description */}
                {quiz.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {quiz.description}
                  </Typography>
                )}

                {/* Tags */}
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {quiz.tags.slice(0, 3).map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="filled"
                      sx={{
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        fontSize: '0.75rem',
                      }}
                    />
                  ))}
                  {quiz.tags.length > 3 && (
                    <Chip
                      label={`+${quiz.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>

                {/* Quiz Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: typeof quiz.author === 'object' && quiz.author.avatar ? 'transparent' : 'secondary.main', 
                        fontSize: '0.75rem', 
                        color: 'primary.main' 
                      }}
                      src={typeof quiz.author === 'object' ? quiz.author.avatar : undefined}
                    >
                      {!((typeof quiz.author === 'object' && quiz.author.avatar)) && 
                        (typeof quiz.author === 'string' ? quiz.author.charAt(0) : quiz.author.name.charAt(0))
                      }
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {typeof quiz.author === 'string' ? quiz.author : quiz.author.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {quiz.maxPoints} pts
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Created {formatDate(quiz.createdAt)}
                </Typography>
              </CardContent>

              {/* Card Actions */}
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={() => handlePlayQuiz(quiz._id)}
                  sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
                >
                  Take Quiz
                </Button>
                {/* Only show edit/delete buttons for quiz owners */}
                {isQuizOwner(quiz) && (
                  <>
                    <Tooltip title="Edit Quiz">
                      <IconButton
                        size="small"
                        onClick={() => handleEditQuiz(quiz._id)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Quiz">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <QuizIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No quizzes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}

      {/* Quiz Limit Warning Dialog */}
      <Dialog
        open={limitWarningOpen}
        onClose={() => setLimitWarningOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 2 }}>
          🚫 Quiz Limit Reached
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>You have reached the maximum limit of {userQuizCount?.maxLimit || 10} quizzes.</strong>
            </Typography>
            <Typography variant="body2">
              You currently have <strong>{userQuizCount?.count || 0}</strong> quizzes. 
              Please delete some old quizzes to create new ones.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            💡 What you can do:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Go to 'My Quizzes' tab" 
                secondary="Review your existing quizzes and find ones you no longer need"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Delete old or unused quizzes" 
                secondary="Each deleted quiz will free up space for a new one"
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Edit existing quizzes instead" 
                secondary="You can always update and improve your current quizzes"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setLimitWarningOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setLimitWarningOpen(false);
              handleTabChange(3); // Switch to "My" tab
            }}
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Go to My Quizzes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteQuiz}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Quiz
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>&quot;{quizToDelete?.title}&quot;</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={cancelDeleteQuiz}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteQuiz}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: 'none' }}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Quiz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default withAuth(QuizzesPage);
