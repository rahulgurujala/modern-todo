from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from uuid import UUID
from enum import Enum
from .base import BaseModel

if TYPE_CHECKING:
    from .user import User


class TodoStatus(str, Enum):
    """Todo status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TodoPriority(str, Enum):
    """Todo priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TodoBase(SQLModel):
    """Base todo fields"""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: TodoStatus = Field(default=TodoStatus.PENDING)
    priority: TodoPriority = Field(default=TodoPriority.MEDIUM)
    due_date: Optional[datetime] = Field(default=None)
    is_completed: bool = Field(default=False)


class Todo(TodoBase, BaseModel, table=True):
    """Todo table model"""
    __tablename__ = "todos"
    
    # Foreign key to user
    owner_id: UUID = Field(foreign_key="users.id")
    
    # Relationships
    owner: "User" = Relationship(back_populates="todos")


class TodoCreate(TodoBase):
    """Todo creation schema"""
    pass


class TodoRead(TodoBase):
    """Todo read schema"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]


class TodoUpdate(SQLModel):
    """Todo update schema"""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    status: Optional[TodoStatus] = Field(default=None)
    priority: Optional[TodoPriority] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    is_completed: Optional[bool] = Field(default=None)
