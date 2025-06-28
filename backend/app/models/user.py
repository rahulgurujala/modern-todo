from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID
from .base import BaseModel

if TYPE_CHECKING:
    from .todo import Todo


class UserBase(SQLModel):
    """Base user fields"""
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)


class User(UserBase, BaseModel, table=True):
    """User table model"""
    __tablename__ = "users"
    
    hashed_password: str
    
    # Relationships
    todos: List["Todo"] = Relationship(back_populates="owner")


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(min_length=8)


class UserRead(UserBase):
    """User read schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime]


class UserUpdate(SQLModel):
    """User update schema"""
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[str] = Field(default=None)
    full_name: Optional[str] = Field(default=None, max_length=100)
    is_active: Optional[bool] = Field(default=None)
    password: Optional[str] = Field(default=None, min_length=8)
