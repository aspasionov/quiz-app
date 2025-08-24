const express = require('express');
const OpenAI = require('openai');
const Quiz = require('../models/quiz');
const AiQuizAttempt = require('../models/aiQuizAttempt');
const auth = require('../helper/auth');

const router = express.Router();

// Generate AI quiz from text
router.post('/generate', auth, async (req, res) => {
  try {
    const { text, topic } = req.body;
    const mode = text ? 'text' : 'topic';
    const content = text || topic;
    
    // Validate input based on mode
    if (mode === 'text') {
      if (!text || text.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least 50 characters of text to generate a quiz.'
        });
      }
      if (text.trim().length > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Text is too long. Maximum allowed is 10,000 characters.'
        });
      }
    } else {
      if (!topic || topic.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least 3 characters for the topic.'
        });
      }
      if (topic.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Topic is too long. Maximum allowed is 200 characters.'
        });
      }
    }

    // Check user's total quiz limit (max 10 quizzes per user)
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

    // Check if user can make an attempt today
    const attemptCheck = await AiQuizAttempt.canUserAttempt(req.userId);
    if (!attemptCheck.canAttempt) {
      return res.status(429).json({
        success: false,
        message: 'Daily limit reached. You can generate up to 3 AI quizzes per day. Try again tomorrow.',
        data: {
          attemptsUsed: attemptCheck.attemptsUsed,
          remainingAttempts: attemptCheck.remainingAttempts
        }
      });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API key is not configured properly.'
      });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create a detailed prompt for GPT-4o-mini based on mode
    const prompt = mode === 'text' 
      ? `Based on the following text, create a quiz with exactly 10 multiple-choice questions. Each question should have 4 options (A, B, C, D) with exactly one correct answer. The questions should cover the main topics, concepts, and details from the text.

Text: "${content}"

Please respond with a valid JSON object in this exact format:
{
  "title": "Quiz about [main topic from the text]",
  "description": "A comprehensive quiz based on the provided text",
  "questions": [
    {
      "questionText": "Question text here?",
      "explanation": "Brief explanation of why this answer is correct",
      "options": [
        {"text": "Option A", "isCorrect": false, "points": 0},
        {"text": "Option B", "isCorrect": true, "points": 5},
        {"text": "Option C", "isCorrect": false, "points": 0},
        {"text": "Option D", "isCorrect": false, "points": 0}
      ]
    }
  ]
}`
      : `Create a comprehensive educational quiz about the following topic with exactly 10 multiple-choice questions. Each question should have 4 options (A, B, C, D) with exactly one correct answer. Cover various aspects, concepts, and important facts about this topic.

Topic: "${content}"

Please respond with a valid JSON object in this exact format:
{
  "title": "${content} Quiz",
  "description": "A comprehensive quiz about ${content}",
  "questions": [
    {
      "questionText": "Question text here?",
      "explanation": "Brief explanation of why this answer is correct",
      "options": [
        {"text": "Option A", "isCorrect": false, "points": 0},
        {"text": "Option B", "isCorrect": true, "points": 5},
        {"text": "Option C", "isCorrect": false, "points": 0},
        {"text": "Option D", "isCorrect": false, "points": 0}
      ]
    }
  ]
}`;

    const commonInstructions = `

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY 10 questions - no more, no less
2. Each question has exactly 4 options (A, B, C, D)
3. Only one option per question has "isCorrect": true and "points": 5
4. All other options have "isCorrect": false and "points": 0
5. Questions test understanding, not just memorization
6. Include variety: factual, conceptual, and analytical questions
7. Return only valid JSON, no additional text or explanations
8. Double-check that you have exactly 10 questions before responding

The "questions" array MUST contain exactly 10 objects.`;

    const fullPrompt = prompt + commonInstructions;

    console.log('Generating quiz with OpenAI...');
    
    // Function to call OpenAI API with retry logic
    const generateQuizWithRetry = async (attempt = 1, maxAttempts = 2) => {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", 
              content: "You are an expert quiz creator. Generate educational quizzes based on provided text. Always respond with valid JSON only, no markdown or additional formatting. YOU MUST GENERATE EXACTLY 10 QUESTIONS."
            },
            {
              role: "user", 
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        });
        
        return completion;
      } catch (error) {
        if (attempt < maxAttempts && (error.code === 'rate_limit_exceeded' || error.code === 'timeout')) {
          console.log(`OpenAI API attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return generateQuizWithRetry(attempt + 1, maxAttempts);
        }
        throw error;
      }
    };
    
    // Call OpenAI API with retry
    const completion = await generateQuizWithRetry();

    const aiResponse = completion.choices[0].message.content;
    console.log('AI Response received:', aiResponse.substring(0, 200) + '...');

    // Parse the AI response
    let quizData;
    try {
      // Clean up the response (remove any markdown formatting)
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      quizData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI-generated quiz. Please try again.'
      });
    }

    // Validate the quiz structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return res.status(500).json({
        success: false,
        message: 'Invalid quiz format received from AI.'
      });
    }

    // Ensure we have at least 5 questions and not more than 15
    if (quizData.questions.length < 5) {
      return res.status(500).json({
        success: false,
        message: `AI generated only ${quizData.questions.length} questions, which is too few. Please try again.`
      });
    }
    
    if (quizData.questions.length > 15) {
      // Trim to first 10 questions if too many were generated
      quizData.questions = quizData.questions.slice(0, 10);
      console.log('AI generated too many questions, trimmed to 10');
    }
    
    // If we have fewer than 10 questions, we'll work with what we have
    const actualQuestionCount = quizData.questions.length;
    if (actualQuestionCount < 10) {
      console.log(`AI generated ${actualQuestionCount} questions instead of 10, proceeding with available questions`);
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const question = quizData.questions[i];
      
      if (!question.questionText || !question.options || question.options.length !== 4) {
        return res.status(500).json({
          success: false,
          message: `Question ${i + 1} has invalid format. Please try again.`
        });
      }

      // Ensure exactly one correct answer
      const correctAnswers = question.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length !== 1) {
        return res.status(500).json({
          success: false,
          message: `Question ${i + 1} must have exactly one correct answer.`
        });
      }
    }

    // Calculate maximum points
    const maxPoints = quizData.questions.length * 5; // 10 questions × 5 points each

    // Create quiz object for database
    const quiz = new Quiz({
      title: quizData.title || 'AI Generated Quiz',
      author: req.userId,
      description: quizData.description || 'Quiz generated by AI from provided text',
      tags: ['AI Generated', 'Auto Quiz'],
      maxPoints: maxPoints,
      visibility: 'private',
      isPrivate: true,
      questions: quizData.questions
    });

    // Save the quiz
    await quiz.save();
    await quiz.populate('author', 'name email avatar');

    // Record the attempt
    await AiQuizAttempt.recordAttempt(req.userId);
    
    // Get updated attempt info
    const attemptInfo = await AiQuizAttempt.getUserAttemptInfo(req.userId);

    console.log('AI Quiz created successfully:', quiz._id);

    // Create appropriate success message
    const successMessage = actualQuestionCount === 10 
      ? 'AI quiz generated successfully!' 
      : `AI quiz generated successfully with ${actualQuestionCount} questions!`;

    res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        quizId: quiz._id,
        quiz: quiz,
        attemptInfo: {
          attemptsUsed: attemptInfo.attemptsUsed,
          remainingAttempts: attemptInfo.remainingAttempts
        },
        questionCount: actualQuestionCount
      }
    });

  } catch (error) {
    console.error('Error generating AI quiz:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(500).json({
        success: false,
        message: 'OpenAI API quota exceeded. Please try again later.'
      });
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return res.status(500).json({
        success: false,
        message: 'Rate limit exceeded. Please try again in a moment.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz. Please try again.'
    });
  }
});

// Get user's daily attempt information
router.get('/attempts', auth, async (req, res) => {
  try {
    const attemptInfo = await AiQuizAttempt.getUserAttemptInfo(req.userId);
    
    res.status(200).json({
      success: true,
      data: attemptInfo
    });
  } catch (error) {
    console.error('Error getting user attempt info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attempt information.'
    });
  }
});

module.exports = router;
