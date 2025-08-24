import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  };
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

export interface Tag {
  _id: string;
  name: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
}

export interface GetTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'count' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
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
  generateAiQuiz: async (content: string, mode: 'text' | 'topic' = 'text'): Promise<ApiResponse<{ quizId: string; quiz: Quiz }>> => {
    const payload = mode === 'text' ? { text: content } : { topic: content };
    const response: AxiosResponse<ApiResponse<{ quizId: string; quiz: Quiz }>> = await api.post('/api/ai-quiz/generate', payload);
    return response.data;
  },

  // Get user's AI quiz attempt information
  getAttemptInfo: async (): Promise<ApiResponse<{ attemptsUsed: number; remainingAttempts: number; canAttempt: boolean; resetsAt?: Date }>> => {
    const response: AxiosResponse<ApiResponse<{ attemptsUsed: number; remainingAttempts: number; canAttempt: boolean; resetsAt?: Date }>> = await api.get('/api/ai-quiz/attempts');
    return response.data;
  },
};

// Auth API functions
export const authApi = {

  // Logout
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get current user (if token exists)
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/auth/me');
    return response.data;
  },
};

// Tag API functions
export const tagApi = {
  // Get all tags with optional filters and pagination
  getTags: async (params: GetTagsParams = {}): Promise<ApiResponse<Tag[]>> => {
    const response: AxiosResponse<ApiResponse<Tag[]>> = await api.get('/api/tags', { params });
    return response.data;
  },

  // Get single tag by ID
  getTag: async (id: string): Promise<ApiResponse<Tag>> => {
    const response: AxiosResponse<ApiResponse<Tag>> = await api.get(`/api/tags/${id}`);
    return response.data;
  },

  // Create new tag
  createTag: async (data: CreateTagData): Promise<ApiResponse<Tag>> => {
    const response: AxiosResponse<ApiResponse<Tag>> = await api.post('/api/tags', data);
    return response.data;
  },

  // Update tag
  updateTag: async (id: string, data: CreateTagData): Promise<ApiResponse<Tag>> => {
    const response: AxiosResponse<ApiResponse<Tag>> = await api.put(`/api/tags/${id}`, data);
    return response.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.delete(`/api/tags/${id}`);
    return response.data;
  },

  // Get popular/trending tags
  getPopularTags: async (limit: number = 20): Promise<ApiResponse<Tag[]>> => {
    const response: AxiosResponse<ApiResponse<Tag[]>> = await api.get('/api/tags/popular', { 
      params: { limit } 
    });
    return response.data;
  },

  // Search tags by name
  searchTags: async (query: string, limit: number = 10): Promise<ApiResponse<Tag[]>> => {
    const response: AxiosResponse<ApiResponse<Tag[]>> = await api.get('/api/tags/search', { 
      params: { q: query, limit } 
    });
    return response.data;
  },

  // Get tags used by current user
  getUserTags: async (userId?: string): Promise<ApiResponse<Tag[]>> => {
    const endpoint = userId ? `/api/tags/user/${userId}` : '/api/tags/user/me';
    const response: AxiosResponse<ApiResponse<Tag[]>> = await api.get(endpoint);
    return response.data;
  },
};

export default api;
