const express = require('express');
const { body } = require('express-validator');
const Tag = require('../models/tag');
const Quiz = require('../models/quiz');
const auth = require('../helper/auth');
const { validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware for tag creation/update
const tagValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tag name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Tag name can only contain letters, numbers, spaces, hyphens, and underscores')
];

// GET /api/tags - Get all tags with optional filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search = '',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};

    // Search by tag name
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['name', 'count', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    sortObj[sortField] = sortDirection;

    // Get total count for pagination
    const total = await Tag.countDocuments(filter);

    // Get tags with pagination and sorting
    const tags = await Tag.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: tags,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
});

// GET /api/tags/popular - Get popular tags (most used)
router.get('/popular', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit);

    const tags = await Tag.find({ count: { $gt: 0 } })
      .sort({ count: -1, name: 1 })
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular tags'
    });
  }
});

// GET /api/tags/search - Search tags by name (for autocomplete)
router.get('/search', async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    if (!q.trim()) {
      return res.json({
        success: true,
        data: []
      });
    }

    const tags = await Tag.find({
      name: { $regex: q.trim(), $options: 'i' }
    })
      .sort({ count: -1, name: 1 })
      .limit(limitNum)
      .select('name count')
      .lean();

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error searching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching tags'
    });
  }
});

// GET /api/tags/user/me - Get tags used by current user
router.get('/user/me', auth, async (req, res) => {
  try {
    // Get all quizzes by the current user
    const userQuizzes = await Quiz.find({ author: req.userId })
      .select('tags')
      .lean();

    // Extract unique tags
    const tagSet = new Set();
    userQuizzes.forEach(quiz => {
      if (quiz.tags && Array.isArray(quiz.tags)) {
        quiz.tags.forEach(tag => tagSet.add(tag));
      }
    });

    // Get tag objects from database
    const tagNames = Array.from(tagSet);
    const tags = await Tag.find({ name: { $in: tagNames } })
      .sort({ count: -1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching user tags:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tags'
    });
  }
});

// GET /api/tags/user/:userId - Get tags used by specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all public quizzes by the specified user
    const userQuizzes = await Quiz.find({ 
      author: userId,
      visibility: 'public' // Only public quizzes to respect privacy
    })
      .select('tags')
      .lean();

    // Extract unique tags
    const tagSet = new Set();
    userQuizzes.forEach(quiz => {
      if (quiz.tags && Array.isArray(quiz.tags)) {
        quiz.tags.forEach(tag => tagSet.add(tag));
      }
    });

    // Get tag objects from database
    const tagNames = Array.from(tagSet);
    const tags = await Tag.find({ name: { $in: tagNames } })
      .sort({ count: -1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching user tags:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tags'
    });
  }
});

// GET /api/tags/:id - Get single tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching tag'
    });
  }
});

// POST /api/tags - Create new tag (admin only)
router.post('/', auth, tagValidation, async (req, res) => {
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

    const { name } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    const tag = new Tag({
      name: name.trim(),
      count: 0
    });

    await tag.save();

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    console.error('Error creating tag:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Tag already exists'
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
      message: 'Server error while creating tag'
    });
  }
});

// PUT /api/tags/:id - Update tag (admin only)
router.put('/:id', auth, tagValidation, async (req, res) => {
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

    const { name } = req.body;
    const trimmedName = name.trim();

    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if another tag with the new name already exists
    if (trimmedName !== tag.name) {
      const existingTag = await Tag.findOne({ name: trimmedName });
      if (existingTag) {
        return res.status(409).json({
          success: false,
          message: 'Tag with this name already exists'
        });
      }
    }

    // Update tag name and update timestamp
    tag.name = trimmedName;
    await tag.save();

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });
  } catch (error) {
    console.error('Error updating tag:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating tag'
    });
  }
});

// DELETE /api/tags/:id - Delete tag (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Optional: Check if tag is being used in any quizzes
    const quizCount = await Quiz.countDocuments({ tags: tag.name });
    if (quizCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete tag. It is currently used in ${quizCount} quiz(es).`
      });
    }

    await Tag.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tag:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid tag ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting tag'
    });
  }
});

module.exports = router;
