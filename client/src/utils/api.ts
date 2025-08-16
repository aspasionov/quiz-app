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
};

// Auth API functions
export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<any> => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    // Server returns data directly, not wrapped in ApiResponse format
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return {
      success: true,
      data: response.data
    };
  },

  // Register
  register: async (userData: { name: string; email: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> => {
    const response: AxiosResponse<ApiResponse<{ token: string; user: any }>> = await api.post('/auth/register', userData);
    
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

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

export default api;
