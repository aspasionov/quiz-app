'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Group as GroupIcon,
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { withAuth } from '@/components/WithAuth';
import { Quiz } from '@/types';
import { getAllQuizzes } from '@/data/mockQuizzes';

// Mock data for additional quizzes (extending our base set)
const additionalQuizzes: Quiz[] = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    author: 'John Doe',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    tags: ['JavaScript', 'Programming', 'Web Development'],
    maxPoints: 100,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    title: 'React Hooks Deep Dive',
    author: 'Jane Smith',
    description: 'Advanced React hooks concepts and best practices.',
    tags: ['React', 'Hooks', 'Frontend'],
    maxPoints: 150,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
  },
  {
    _id: '3',
    title: 'Python Data Structures',
    author: 'Mike Johnson',
    description: 'Comprehensive quiz on Python lists, dictionaries, sets, and tuples.',
    tags: ['Python', 'Data Structures', 'Programming'],
    maxPoints: 120,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
  },
  {
    _id: '4',
    title: 'CSS Grid and Flexbox',
    author: 'Sarah Wilson',
    description: 'Master modern CSS layout techniques with this comprehensive quiz.',
    tags: ['CSS', 'Layout', 'Web Design'],
    maxPoints: 90,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
  },
  {
    _id: '5',
    title: 'Node.js and Express',
    author: 'David Brown',
    description: 'Backend development quiz covering Node.js fundamentals and Express framework.',
    tags: ['Node.js', 'Express', 'Backend'],
    maxPoints: 110,
    isPrivate: false,
    visibility: 'selected',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z',
  },
  {
    _id: '6',
    title: 'Database Design Principles',
    author: 'Lisa Garcia',
    description: 'Fundamentals of database design, normalization, and relationships.',
    tags: ['Database', 'SQL', 'Design'],
    maxPoints: 130,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-10T13:30:00Z',
    updatedAt: '2024-01-10T13:30:00Z',
  },
  {
    _id: '7',
    title: 'TypeScript Advanced Types',
    author: 'Alex Chen',
    description: 'Deep dive into TypeScript\'s advanced type system and generic programming.',
    tags: ['TypeScript', 'Types', 'Programming'],
    maxPoints: 140,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-09T08:45:00Z',
    updatedAt: '2024-01-09T08:45:00Z',
  },
  {
    _id: '8',
    title: 'Machine Learning Basics',
    author: 'Emma Davis',
    description: 'Introduction to machine learning concepts and algorithms.',
    tags: ['Machine Learning', 'AI', 'Data Science'],
    maxPoints: 160,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-08T15:20:00Z',
    updatedAt: '2024-01-08T15:20:00Z',
  },
  {
    _id: '9',
    title: 'Docker and Containerization',
    author: 'Tom Anderson',
    description: 'Learn Docker fundamentals and container orchestration.',
    tags: ['Docker', 'DevOps', 'Containers'],
    maxPoints: 100,
    isPrivate: false,
    visibility: 'selected',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-07T12:10:00Z',
    updatedAt: '2024-01-07T12:10:00Z',
  },
  {
    _id: '10',
    title: 'Git Version Control',
    author: 'Rachel Green',
    description: 'Master Git commands and version control workflows.',
    tags: ['Git', 'Version Control', 'Development'],
    maxPoints: 80,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-06T14:55:00Z',
    updatedAt: '2024-01-06T14:55:00Z',
  },
  {
    _id: '11',
    title: 'AWS Cloud Services',
    author: 'Kevin Lee',
    description: 'Comprehensive quiz on Amazon Web Services and cloud computing.',
    tags: ['AWS', 'Cloud', 'DevOps'],
    maxPoints: 180,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-05T10:30:00Z',
    updatedAt: '2024-01-05T10:30:00Z',
  },
  {
    _id: '12',
    title: 'Cybersecurity Fundamentals',
    author: 'Maria Rodriguez',
    description: 'Essential cybersecurity concepts and best practices.',
    tags: ['Security', 'Cybersecurity', 'IT'],
    maxPoints: 120,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-04T09:45:00Z',
    updatedAt: '2024-01-04T09:45:00Z',
  },
  {
    _id: '13',
    title: 'Agile and Scrum Methodology',
    author: 'Chris Taylor',
    description: 'Agile development principles and Scrum framework practices.',
    tags: ['Agile', 'Scrum', 'Project Management'],
    maxPoints: 95,
    isPrivate: false,
    visibility: 'selected',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-03T16:20:00Z',
    updatedAt: '2024-01-03T16:20:00Z',
  },
  {
    _id: '14',
    title: 'REST API Design',
    author: 'Anna White',
    description: 'Best practices for designing and implementing RESTful APIs.',
    tags: ['API', 'REST', 'Web Services'],
    maxPoints: 110,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-02T11:15:00Z',
    updatedAt: '2024-01-02T11:15:00Z',
  },
  {
    _id: '15',
    title: 'MongoDB and NoSQL',
    author: 'James Wilson',
    description: 'NoSQL database concepts with focus on MongoDB operations.',
    tags: ['MongoDB', 'NoSQL', 'Database'],
    maxPoints: 125,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2024-01-01T13:40:00Z',
    updatedAt: '2024-01-01T13:40:00Z',
  },
  {
    _id: '16',
    title: 'Vue.js Composition API',
    author: 'Sophie Martin',
    description: 'Modern Vue.js development with Composition API and reactive programming.',
    tags: ['Vue.js', 'Frontend', 'JavaScript'],
    maxPoints: 105,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2023-12-31T15:25:00Z',
    updatedAt: '2023-12-31T15:25:00Z',
  },
  {
    _id: '17',
    title: 'GraphQL Query Language',
    author: 'Robert Clark',
    description: 'GraphQL fundamentals, queries, mutations, and schema design.',
    tags: ['GraphQL', 'API', 'Query Language'],
    maxPoints: 135,
    isPrivate: true,
    visibility: 'private',
    allowedUsers: [],
    questions: [],
    createdAt: '2023-12-30T10:50:00Z',
    updatedAt: '2023-12-30T10:50:00Z',
  },
  {
    _id: '18',
    title: 'Mobile App Development',
    author: 'Jennifer Adams',
    description: 'Cross-platform mobile development concepts and frameworks.',
    tags: ['Mobile', 'React Native', 'App Development'],
    maxPoints: 150,
    isPrivate: false,
    visibility: 'selected',
    allowedUsers: [],
    questions: [],
    createdAt: '2023-12-29T14:35:00Z',
    updatedAt: '2023-12-29T14:35:00Z',
  },
  {
    _id: '19',
    title: 'Blockchain Technology',
    author: 'Mark Thompson',
    description: 'Blockchain fundamentals, cryptocurrencies, and smart contracts.',
    tags: ['Blockchain', 'Cryptocurrency', 'Technology'],
    maxPoints: 170,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2023-12-28T12:20:00Z',
    updatedAt: '2023-12-28T12:20:00Z',
  },
  {
    _id: '20',
    title: 'UI/UX Design Principles',
    author: 'Amy Parker',
    description: 'User interface and user experience design best practices.',
    tags: ['UI/UX', 'Design', 'User Experience'],
    maxPoints: 90,
    isPrivate: false,
    visibility: 'public',
    allowedUsers: [],
    questions: [],
    createdAt: '2023-12-27T16:10:00Z',
    updatedAt: '2023-12-27T16:10:00Z',
  },
];

const QuizzesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Combine all quiz data
  const allQuizzes = [...getAllQuizzes(), ...additionalQuizzes.slice(3)];

  // Simulate loading for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateQuiz = () => {
    router.push('/quizzes/create');
  };

  const handlePlayQuiz = (quizId: string) => {
    router.push(`/quizzes/${quizId}`);
  };

  const handleEditQuiz = (quizId: string) => {
    router.push(`/quizzes/${quizId}/edit`);
  };

  const handleDeleteQuiz = (quizId: string) => {
    console.log('Deleting quiz:', quizId);
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

  const filteredQuizzes = allQuizzes.filter(quiz => {
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
    <Grid item sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, minWidth: 280 }}>
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
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Quizzes" />
          <Tab label="Public" />
          <Tab label="Private" />
        </Tabs>
      </Box>

      {/* Results Count */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
      </Typography>

      {/* Quizzes Grid */}
      <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
        {filteredQuizzes.map((quiz) => (
          <Grid item sx={{ width: { xs: '100%', sm: '48%', md: '31%' }, minWidth: 280 }} key={quiz._id}>
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
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main', fontSize: '0.75rem' }}>
                      {typeof quiz.author === 'string' ? quiz.author.charAt(0) : quiz.author.name.charAt(0)}
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
                <IconButton
                  size="small"
                  onClick={() => handleEditQuiz(quiz._id)}
                  sx={{ color: 'text.secondary' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteQuiz(quiz._id)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
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
    </Container>
  );
};

export default withAuth(QuizzesPage);
