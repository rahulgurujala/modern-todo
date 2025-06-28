import axios from 'axios';
import Cookies from 'js-cookie';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ChangePasswordRequest,
  UpdateProfileRequest,
  Todo,
  TodoCreateRequest,
  TodoUpdateRequest,
  TodoListResponse,
  TodoFilterParams,
  TodoStatsResponse,
} from '@/lib/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  get: () => Cookies.get(TOKEN_KEY),
  set: (token: string) => Cookies.set(TOKEN_KEY, token, { expires: 7 }),
  remove: () => Cookies.remove(TOKEN_KEY),
};

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.remove();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/json', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// Todo API
export const todoApi = {
  getTodos: async (params?: TodoFilterParams): Promise<TodoListResponse> => {
    const response = await api.get('/todos/', { params });
    return response.data;
  },

  getTodo: async (id: string): Promise<Todo> => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  createTodo: async (data: TodoCreateRequest): Promise<Todo> => {
    const response = await api.post('/todos/', data);
    return response.data;
  },

  updateTodo: async (id: string, data: TodoUpdateRequest): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, data);
    return response.data;
  },

  deleteTodo: async (id: string): Promise<void> => {
    await api.delete(`/todos/${id}`);
  },

  markCompleted: async (id: string): Promise<Todo> => {
    const response = await api.post(`/todos/${id}/complete`);
    return response.data;
  },

  markPending: async (id: string): Promise<Todo> => {
    const response = await api.post(`/todos/${id}/pending`);
    return response.data;
  },

  getStats: async (): Promise<TodoStatsResponse> => {
    const response = await api.get('/todos/stats/overview');
    return response.data;
  },

  getOverdue: async (): Promise<Todo[]> => {
    const response = await api.get('/todos/overdue');
    return response.data;
  },

  getDueSoon: async (hours = 24): Promise<Todo[]> => {
    const response = await api.get('/todos/due-soon', {
      params: { hours },
    });
    return response.data;
  },
}; 