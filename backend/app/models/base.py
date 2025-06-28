from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


class TimestampMixin(SQLModel):
    """Mixin for common timestamp fields"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)


class BaseModel(TimestampMixin):
    """Base model with common fields"""
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
