import { useCallback } from 'react';
import {
  trackEvent,
  trackQuizEvent,
  trackUserEvent,
  trackPageEvent,
  trackPageView,
  isAnalyticsEnabled,
} from '@/utils/analytics';

/**
 * Custom hook for Google Analytics tracking
 * Provides easy-to-use functions for tracking various events in the quiz app
 */
export const useAnalytics = () => {
  // Generic event tracking
  const track = useCallback((action: string, category: string, label?: string, value?: number) => {
    trackEvent(action, category, label, value);
  }, []);

  // Page view tracking
  const trackPage = useCallback((url: string, title?: string) => {
    trackPageView(url, title);
  }, []);

  // Quiz-related tracking
  const quiz = {
    start: (quizId: string, quizTitle: string) => {
      trackQuizEvent.start(quizId, quizTitle);
    },
    complete: (quizId: string, quizTitle: string, score: number, totalQuestions: number) => {
      trackQuizEvent.complete(quizId, quizTitle, score, totalQuestions);
    },
    create: (quizId: string, quizTitle: string, questionCount: number) => {
      trackQuizEvent.create(quizId, quizTitle, questionCount);
    },
    share: (quizId: string, quizTitle: string, method: string) => {
      trackQuizEvent.share(quizId, quizTitle, method);
    },
    answerQuestion: (quizId: string, questionNumber: number, isCorrect: boolean) => {
      trackQuizEvent.answerQuestion(quizId, questionNumber, isCorrect);
    },
  };

  // User-related tracking
  const user = {
    register: (method: string) => {
      trackUserEvent.register(method);
    },
    login: (method: string) => {
      trackUserEvent.login(method);
    },
    logout: () => {
      trackUserEvent.logout();
    },
  };

  // Page-specific tracking
  const page = {
    generateQuiz: (topic: string, questionCount: number) => {
      trackPageEvent.generateQuiz(topic, questionCount);
    },
    contactSubmit: () => {
      trackPageEvent.contactSubmit();
    },
  };

  // Check if analytics is enabled
  const enabled = isAnalyticsEnabled();

  return {
    track,
    trackPage,
    quiz,
    user,
    page,
    enabled,
  };
};

export default useAnalytics;
