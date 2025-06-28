from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.todo import TodoStatus, TodoPriority


class TodoCreateRequest(BaseModel):
    """Create todo request"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: TodoPriority = TodoPriority.MEDIUM
    due_date: Optional[datetime] = None


class TodoUpdateRequest(BaseModel):
    """Update todo request"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[TodoStatus] = None
    priority: Optional[TodoPriority] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None


class TodoResponse(BaseModel):
    """Todo response"""
    id: UUID
    title: str
    description: Optional[str]
    status: TodoStatus
    priority: TodoPriority
    due_date: Optional[datetime]
    is_completed: bool
    owner_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TodoListResponse(BaseModel):
    """Todo list response with pagination"""
    todos: List[TodoResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class TodoFilterParams(BaseModel):
    """Todo filtering parameters"""
    status: Optional[TodoStatus] = None
    priority: Optional[TodoPriority] = None
    is_completed: Optional[bool] = None
    search: Optional[str] = None  # Search in title and description
    due_before: Optional[datetime] = None
    due_after: Optional[datetime] = None
    page: int = Field(1, ge=1)
    per_page: int = Field(10, ge=1, le=100)


class TodoStatsResponse(BaseModel):
    """Todo statistics response"""
    total_todos: int
    completed_todos: int
    pending_todos: int
    overdue_todos: int
    todos_by_priority: dict
    todos_by_status: dict
