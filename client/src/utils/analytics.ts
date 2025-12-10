declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

// Google Analytics Measurement ID - replace with your actual ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Quiz-specific event tracking functions
export const trackQuizEvent = {
  // Track when a quiz is started
  start: (quizId: string, quizTitle: string) => {
    trackEvent('quiz_start', 'quiz', `${quizTitle} (${quizId})`);
  },

  // Track when a quiz is completed
  complete: (quizId: string, quizTitle: string, score: number, totalQuestions: number) => {
    trackEvent('quiz_complete', 'quiz', `${quizTitle} (${quizId})`, score);
    
    // Track completion rate
    const completionRate = Math.round((score / totalQuestions) * 100);
    window.gtag('event', 'quiz_score', {
      event_category: 'quiz',
      event_label: quizTitle,
      value: completionRate,
      custom_parameters: {
        quiz_id: quizId,
        score: score,
        total_questions: totalQuestions,
        completion_rate: completionRate
      }
    });
  },

  // Track when a quiz is created
  create: (quizId: string, quizTitle: string, questionCount: number) => {
    trackEvent('quiz_create', 'quiz', `${quizTitle} (${quizId})`, questionCount);
  },

  // Track when a quiz is shared
  share: (quizId: string, quizTitle: string, method: string) => {
    trackEvent('quiz_share', 'social', `${method}: ${quizTitle} (${quizId})`);
  },

  // Track question interactions
  answerQuestion: (quizId: string, questionNumber: number, isCorrect: boolean) => {
    trackEvent('question_answered', 'quiz', `Quiz ${quizId} - Q${questionNumber}`, isCorrect ? 1 : 0);
  }
};

// User engagement tracking
export const trackUserEvent = {
  // Track user registration
  register: (method: string) => {
    trackEvent('sign_up', 'user', method);
  },

  // Track user login
  login: (method: string) => {
    trackEvent('login', 'user', method);
  },

  // Track user logout
  logout: () => {
    trackEvent('logout', 'user');
  }
};

// Page-specific tracking
export const trackPageEvent = {
  // Track quiz generator usage
  generateQuiz: (topic: string, questionCount: number) => {
    trackEvent('generate_quiz', 'ai', topic, questionCount);
  },

  // Track contact form submission
  contactSubmit: () => {
    trackEvent('contact_submit', 'form');
  }
};

// Check if analytics is enabled
export const isAnalyticsEnabled = () => {
  return !!(GA_MEASUREMENT_ID && typeof window !== 'undefined');
};
