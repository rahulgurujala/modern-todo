// User types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  email?: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Todo types
export enum TodoStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TodoPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  due_date: string | null;
  is_completed: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface TodoCreateRequest {
  title: string;
  description?: string;
  priority?: TodoPriority;
  due_date?: string;
}

export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  due_date?: string;
  is_completed?: boolean;
}

export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TodoFilterParams {
  status?: TodoStatus;
  priority?: TodoPriority;
  is_completed?: boolean;
  search?: string;
  due_before?: string;
  due_after?: string;
  page?: number;
  per_page?: number;
}

export interface TodoStatsResponse {
  total_todos: number;
  completed_todos: number;
  pending_todos: number;
  overdue_todos: number;
  todos_by_priority: Record<string, number>;
  todos_by_status: Record<string, number>;
} 