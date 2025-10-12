const HEADER_HEIGHT = 70;
const  MAIN_COLOR = '#7e57c2';
const  SECOND_COLOR = '#ffeb3b';

// Local storage keys for quiz creation
const QUIZ_STORAGE_KEY = 'quiz-creation-draft';
const QUIZ_FORM_STORAGE_KEY = 'quiz-creation-form';
const QUIZ_STEP_STORAGE_KEY = 'quiz-creation-step';

export {
  HEADER_HEIGHT,
  MAIN_COLOR,
  SECOND_COLOR,
  QUIZ_STORAGE_KEY,
  QUIZ_FORM_STORAGE_KEY,
  QUIZ_STEP_STORAGE_KEY
}

export const authenticatedPages = ['home', 'quizzes', 'quiz-generator', 'contact'];
export const unauthenticatedPages = ['home', 'login', 'contact'];
