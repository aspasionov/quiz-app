const mongoose = require('mongoose');
const Quiz = require('../models/quiz');
const User = require('../models/user');
require('dotenv').config();

const sampleQuizzes = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    tags: ['JavaScript', 'Programming', 'Web Development'],
    visibility: 'public',
    questions: [
      {
        questionText: 'Which of the following is the correct way to declare a variable in JavaScript?',
        explanation: 'let and const are the modern ways to declare variables in JavaScript. var is older and has different scoping rules.',
        options: [
          { text: 'variable myVar = 5;', points: 0, isCorrect: false },
          { text: 'let myVar = 5;', points: 10, isCorrect: true },
          { text: 'declare myVar = 5;', points: 0, isCorrect: false },
          { text: 'myVar := 5;', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'What does the "typeof" operator return for an array in JavaScript?',
        explanation: 'Arrays are objects in JavaScript, so typeof returns "object" for arrays.',
        options: [
          { text: 'array', points: 0, isCorrect: false },
          { text: 'object', points: 10, isCorrect: true },
          { text: 'list', points: 0, isCorrect: false },
          { text: 'undefined', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'Which method is used to add an element to the end of an array?',
        explanation: 'The push() method adds one or more elements to the end of an array.',
        options: [
          { text: 'append()', points: 0, isCorrect: false },
          { text: 'add()', points: 0, isCorrect: false },
          { text: 'push()', points: 10, isCorrect: true },
          { text: 'insert()', points: 0, isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'React Hooks Deep Dive',
    description: 'Advanced React hooks concepts and best practices.',
    tags: ['React', 'Hooks', 'Frontend'],
    visibility: 'public',
    questions: [
      {
        questionText: 'Which hook is used for side effects in React?',
        explanation: 'useEffect is the hook used for performing side effects in functional components.',
        options: [
          { text: 'useState', points: 0, isCorrect: false },
          { text: 'useEffect', points: 10, isCorrect: true },
          { text: 'useContext', points: 0, isCorrect: false },
          { text: 'useReducer', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'What is the purpose of the dependency array in useEffect?',
        explanation: 'The dependency array controls when the effect should re-run based on changes to specified values.',
        options: [
          { text: 'To store state values', points: 0, isCorrect: false },
          { text: 'To control when the effect runs', points: 10, isCorrect: true },
          { text: 'To pass props to child components', points: 0, isCorrect: false },
          { text: 'To handle errors', points: 0, isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'CSS Grid and Flexbox',
    description: 'Master modern CSS layout techniques with this comprehensive quiz.',
    tags: ['CSS', 'Layout', 'Web Design'],
    visibility: 'public',
    questions: [
      {
        questionText: 'Which CSS property is used to create a flex container?',
        explanation: 'display: flex creates a flex container, enabling flexbox layout for its children.',
        options: [
          { text: 'flex: container', points: 0, isCorrect: false },
          { text: 'display: flex', points: 10, isCorrect: true },
          { text: 'flex-container: true', points: 0, isCorrect: false },
          { text: 'layout: flex', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'In CSS Grid, what does "grid-template-columns: 1fr 1fr 1fr" create?',
        explanation: '1fr means "1 fraction" of the available space. This creates three equal-width columns.',
        options: [
          { text: 'Three columns with 1px width each', points: 0, isCorrect: false },
          { text: 'Three equal-width columns', points: 10, isCorrect: true },
          { text: 'One column with 3fr width', points: 0, isCorrect: false },
          { text: 'Three rows', points: 0, isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Node.js and Express',
    description: 'Backend development quiz covering Node.js fundamentals and Express framework.',
    tags: ['Node.js', 'Express', 'Backend'],
    visibility: 'public',
    questions: [
      {
        questionText: 'What is Express.js?',
        explanation: 'Express.js is a minimal and flexible web application framework for Node.js.',
        options: [
          { text: 'A database', points: 0, isCorrect: false },
          { text: 'A web framework for Node.js', points: 10, isCorrect: true },
          { text: 'A frontend library', points: 0, isCorrect: false },
          { text: 'A testing tool', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'Which method is used to handle GET requests in Express?',
        explanation: 'app.get() is used to handle GET requests in Express applications.',
        options: [
          { text: 'app.get()', points: 10, isCorrect: true },
          { text: 'app.request()', points: 0, isCorrect: false },
          { text: 'app.handle()', points: 0, isCorrect: false },
          { text: 'app.receive()', points: 0, isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'Database Design Principles',
    description: 'Fundamentals of database design, normalization, and relationships.',
    tags: ['Database', 'SQL', 'Design'],
    visibility: 'private',
    questions: [
      {
        questionText: 'What is database normalization?',
        explanation: 'Normalization is the process of organizing data to minimize redundancy and dependency.',
        options: [
          { text: 'Making database faster', points: 0, isCorrect: false },
          { text: 'Organizing data to reduce redundancy', points: 10, isCorrect: true },
          { text: 'Adding more tables', points: 0, isCorrect: false },
          { text: 'Backing up data', points: 0, isCorrect: false }
        ]
      },
      {
        questionText: 'What is a primary key?',
        explanation: 'A primary key is a unique identifier for each record in a database table.',
        options: [
          { text: 'The first column in a table', points: 0, isCorrect: false },
          { text: 'A unique identifier for each record', points: 10, isCorrect: true },
          { text: 'The most important column', points: 0, isCorrect: false },
          { text: 'A password for the database', points: 0, isCorrect: false }
        ]
      }
    ]
  }
];

async function seedQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('Connected to MongoDB');

    // Find the existing user to assign as author
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('No user found with email test@example.com. Please create a user first.');
      return;
    }

    // Clear existing quizzes (optional)
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Create quizzes with the user as author
    const quizzesWithAuthor = sampleQuizzes.map(quiz => ({
      ...quiz,
      author: user._id,
      maxPoints: quiz.questions.reduce((total, q) => 
        total + Math.max(...q.options.map(opt => opt.points)), 0),
      isPrivate: quiz.visibility === 'private'
    }));

    // Insert quizzes
    const insertedQuizzes = await Quiz.insertMany(quizzesWithAuthor);
    console.log(`Successfully created ${insertedQuizzes.length} quizzes`);

    // Display created quizzes
    insertedQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (${quiz.visibility}) - ${quiz.maxPoints} points`);
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedQuizzes();
