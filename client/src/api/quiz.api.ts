import api from '@/api/base.api';
import type { AxiosResponse } from 'axios';

// Types and Interfaces
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface CreateQuizData {
  title: string;
  description?: string;
  tags?: string[];
  visibility: 'private' | 'public' | 'selected';
  questions: Array<{
    questionText: string;
    explanation?: string;
    options: Array<{
      text: string;
      points: number;
      isCorrect: boolean;
    }>;
  }>;
  allowedUsers?: string[];
}

export interface Quiz {
  _id: string;
  title: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | string;
  description?: string;
  tags: string[];
  maxPoints: number;
  isPrivate: boolean;
  visibility: 'private' | 'public' | 'selected';
  allowedUsers: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  questions: Array<{
    _id: string;
    questionText: string;
    explanation?: string;
    options: Array<{
      _id: string;
      text: string;
      points: number;
      isCorrect: boolean;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetQuizzesParams {
  page?: number;
  limit?: number;
  search?: string;
  visibility?: 'all' | 'private' | 'public' | 'selected';
  tags?: string;
  author?: string;
}

export interface AiQuizAttemptInfo {
  attemptsUsed: number;
  remainingAttempts: number;
  canAttempt: boolean;
  resetsAt?: Date;
}

export interface AiQuizGenerationResponse {
  quizId: string;
  quiz: Quiz;
  attemptInfo: {
    attemptsUsed: number;
    remainingAttempts: number;
  };
}

// Quiz API functions
export const quizApi = {
  // Get all quizzes with optional filters
  getQuizzes: async (params: GetQuizzesParams = {}): Promise<ApiResponse<Quiz[]>> => {
    const response: AxiosResponse<ApiResponse<Quiz[]>> = await api.get('/api/quiz', { params });
    return response.data;
  },

  // Get single quiz by ID
  getQuiz: async (id: string): Promise<ApiResponse<Quiz>> => {
    const response: AxiosResponse<ApiResponse<Quiz>> = await api.get(`/api/quiz/${id}`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (data: CreateQuizData): Promise<ApiResponse<Quiz>> => {
    const response: AxiosResponse<ApiResponse<Quiz>> = await api.post('/api/quiz', data);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (id: string, data: CreateQuizData): Promise<ApiResponse<Quiz>> => {
    const response: AxiosResponse<ApiResponse<Quiz>> = await api.put(`/api/quiz/${id}`, data);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/api/quiz/${id}`);
    return response.data;
  },

  // Get quizzes by user
  getUserQuizzes: async (userId: string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Quiz[]>> => {
    const response: AxiosResponse<ApiResponse<Quiz[]>> = await api.get(`/api/quiz/user/${userId}`, { params });
    return response.data;
  },

  // Generate AI quiz from text or topic
  generateAiQuiz: async (content: string, mode: 'text' | 'topic' = 'text'): Promise<ApiResponse<AiQuizGenerationResponse>> => {
    const payload = mode === 'text' ? { text: content } : { topic: content };
    const response: AxiosResponse<ApiResponse<AiQuizGenerationResponse>> = await api.post('/api/quiz-generator/generate', payload);
    return response.data;
  },

  // Get user's AI quiz attempt information
  getAttemptInfo: async (): Promise<ApiResponse<AiQuizAttemptInfo>> => {
    const response: AxiosResponse<ApiResponse<AiQuizAttemptInfo>> = await api.get('/api/quiz-generator/attempts');
    return response.data;
  },

  // Get current user's quiz count
  getUserQuizCount: async (): Promise<ApiResponse<{ count: number; maxLimit: number; remaining: number }>> => {
    const response: AxiosResponse<ApiResponse<{ count: number; maxLimit: number; remaining: number }>> = await api.get('/api/quiz/user/count');
    return response.data;
  },
};

export default quizApi;
