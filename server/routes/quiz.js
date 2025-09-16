const express = require('express');
const { body } = require('express-validator');
const Quiz = require('../models/quiz');
const auth = require('../helper/auth');
const { validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for quiz creation
const quizValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('visibility')
    .isIn(['private', 'public'])
    .withMessage('Visibility must be private or public'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.questionText')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Question text must be at least 5 characters'),
  body('questions.*.options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Each question must have between 2 and 6 options'),
  body('questions.*.options.*.text')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Option text cannot be empty'),
  body('questions.*.options.*.points')
    .isInt({ min: 0 })
    .withMessage('Points must be a non-negative integer'),
  body('questions.*.options.*.isCorrect')
    .isBoolean()
    .withMessage('isCorrect must be a boolean')
];

// GET /api/quiz - Get all quizzes (with filters and proper access control)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '', 
      visibility = '', 
      tags = '', 
      author = '' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    // Get user ID from token if available (optional authentication)
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.SECRET);
        currentUserId = decoded._id;
      } catch (error) {
        // Invalid token, continue as unauthenticated user
      }
    }

    // Apply privacy filtering based on user authentication
    if (currentUserId) {
      // Authenticated user can see:
      // 1. All public quizzes
      // 2. Their own private quizzes
      filter.$or = [
        { visibility: 'public' },
        { author: currentUserId }
      ];
    } else {
      // Unauthenticated user can only see public quizzes
      filter.visibility = 'public';
    }

    // Search in title, description
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      };
      
      // Combine search with privacy filter
      filter.$and = [{ $or: filter.$or || [{ visibility: 'public' }] }, searchCondition];
      delete filter.$or;
    }

    // Filter by visibility (only if user has access)
    if (visibility && visibility !== 'all') {
      if (currentUserId) {
        // For authenticated users, apply additional visibility filter
        const visibilityFilter = { visibility };
        if (filter.$and) {
          filter.$and.push(visibilityFilter);
        } else if (filter.$or) {
          filter.$and = [{ $or: filter.$or }, visibilityFilter];
          delete filter.$or;
        } else {
          filter.visibility = visibility;
        }
      } else if (visibility === 'public') {
        // Unauthenticated users can only filter for public
        filter.visibility = 'public';
      }
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      const tagsFilter = { tags: { $in: tagArray } };
      if (filter.$and) {
        filter.$and.push(tagsFilter);
      } else {
        filter.tags = { $in: tagArray };
      }
    }

    // Filter by author
    if (author) {
      const authorFilter = { author };
      if (filter.$and) {
        filter.$and.push(authorFilter);
      } else {
        filter.author = author;
      }
    }

    // Get total count for pagination
    const total = await Quiz.countDocuments(filter);

    // Get quizzes with pagination
    const quizzes = await Quiz.find(filter)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: quizzes,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quizzes'
    });
  }
});

// GET /api/quiz/:id - Get single quiz by ID with access control
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('author', 'name email avatar');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Get user ID from token if available
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.SECRET);
        currentUserId = decoded._id;
      } catch (error) {
        // Invalid token, continue as unauthenticated user
      }
    }

    // Check access permissions
    const isPublic = quiz.visibility === 'public';
    const isOwner = currentUserId && quiz.author._id.toString() === currentUserId;

    if (!isPublic && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this quiz.'
      });
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching quiz'
    });
  }
});

// POST /api/quiz - Create new quiz
router.post('/', auth, quizValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, tags, visibility, questions, category } = req.body;

    // Check user's quiz limit (max 10 quizzes per user)
    const userQuizCount = await Quiz.countDocuments({ author: req.userId });
    if (userQuizCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'You have reached the maximum limit of 10 quizzes. Please delete some old quizzes to create new ones.',
        error: 'QUIZ_LIMIT_REACHED',
        data: {
          currentCount: userQuizCount,
          maxLimit: 10
        }
      });
    }

    // Validate that each question has at least one correct answer
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have at least one correct answer`
        });
      }
    }

    // Calculate maximum points
    const maxPoints = questions.reduce((total, question) => {
      const maxQuestionPoints = Math.max(...question.options.map(opt => opt.points));
      return total + maxQuestionPoints;
    }, 0);

    // Create quiz object
    const quizData = {
      title,
      author: req.userId,
      description: description || '',
      tags: tags || [],
      maxPoints,
      visibility,
      questions
    };

    // Set isPrivate based on visibility for backward compatibility
    quizData.isPrivate = visibility === 'private';

    const quiz = new Quiz(quizData);
    await quiz.save();

    // Populate author info before sending response
    await quiz.populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Error creating quiz:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating quiz'
    });
  }
});

// PUT /api/quiz/:id - Update quiz
router.put('/:id', auth, quizValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is the author
    if (quiz.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own quizzes'
      });
    }

    const { title, description, tags, visibility, questions } = req.body;

    // Validate that each question has at least one correct answer
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have at least one correct answer`
        });
      }
    }

    // Calculate maximum points
    const maxPoints = questions.reduce((total, question) => {
      const maxQuestionPoints = Math.max(...question.options.map(opt => opt.points));
      return total + maxQuestionPoints;
    }, 0);

    // Update quiz
    quiz.title = title;
    quiz.description = description || '';
    quiz.tags = tags || [];
    quiz.visibility = visibility;
    quiz.isPrivate = visibility === 'private';
    quiz.questions = questions;
    quiz.maxPoints = maxPoints;
    quiz.updatedAt = new Date();

    await quiz.save();
    await quiz.populate('author', 'name email avatar');

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Error updating quiz:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating quiz'
    });
  }
});

// DELETE /api/quiz/:id - Delete quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is the author
    if (quiz.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own quizzes'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz'
    });
  }
});

// GET /api/quiz/user/:userId - Get quizzes by user with access control
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get user ID from token if available (optional authentication)
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.SECRET);
        currentUserId = decoded._id;
      } catch (error) {
        // Invalid token, continue as unauthenticated user
      }
    }

    // Apply access control filtering
    const targetUserId = req.params.userId;
    let filter = { author: targetUserId };
    
    // If viewing someone else's quizzes and not authenticated, show only public
    if (!currentUserId || currentUserId !== targetUserId) {
      // For other users or unauthenticated users, only show public quizzes
      filter.visibility = 'public';
    }
    // If viewing own quizzes, no additional filtering needed - can see all
    
    const total = await Quiz.countDocuments(filter);
    
    const quizzes = await Quiz.find(filter)
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: quizzes,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching user quizzes:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching user quizzes'
    });
  }
});

// GET /api/quiz/user/count - Get current user's quiz count
router.get('/user/count', auth, async (req, res) => {
  try {
    const count = await Quiz.countDocuments({ author: req.userId });
    
    res.json({
      success: true,
      data: {
        count,
        maxLimit: 10,
        remaining: Math.max(0, 10 - count)
      }
    });
  } catch (error) {
    console.error('Error getting user quiz count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting quiz count'
    });
  }
});

module.exports = router;
