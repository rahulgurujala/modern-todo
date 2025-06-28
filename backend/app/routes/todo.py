from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from app.database import get_session
from app.services.todo import TodoService
from app.models.user import User
from app.models.todo import TodoCreate, TodoUpdate, TodoStatus, TodoPriority
from app.schemas.todo import (
    TodoCreateRequest,
    TodoUpdateRequest,
    TodoResponse,
    TodoListResponse,
    TodoFilterParams,
    TodoStatsResponse,
)
from app.routes.auth import get_active_user

# Create router (blueprint equivalent)
router = APIRouter(prefix="/todos", tags=["todos"])


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreateRequest,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Create a new todo"""
    todo_create = TodoCreate(
        title=todo_data.title,
        description=todo_data.description,
        priority=todo_data.priority,
        due_date=todo_data.due_date
    )
    
    todo = TodoService.create_todo(session, todo_create, current_user.id)
    return TodoResponse.model_validate(todo)


@router.get("/", response_model=TodoListResponse)
async def get_todos(
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)],
    # Query parameters for filtering
    status: Annotated[TodoStatus | None, Query()] = None,
    priority: Annotated[TodoPriority | None, Query()] = None,
    is_completed: Annotated[bool | None, Query()] = None,
    search: Annotated[str | None, Query()] = None,
    due_before: Annotated[str | None, Query()] = None,
    due_after: Annotated[str | None, Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=100)] = 10,
):
    """Get todos with filtering and pagination"""
    # Parse dates if provided
    due_before_dt = None
    due_after_dt = None
    
    if due_before:
        from datetime import datetime
        try:
            due_before_dt = datetime.fromisoformat(due_before.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid due_before date format. Use ISO format."
            )
    
    if due_after:
        from datetime import datetime
        try:
            due_after_dt = datetime.fromisoformat(due_after.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid due_after date format. Use ISO format."
            )
    
    filters = TodoFilterParams(
        status=status,
        priority=priority,
        is_completed=is_completed,
        search=search,
        due_before=due_before_dt,
        due_after=due_after_dt,
        page=page,
        per_page=per_page
    )
    
    todos, total = TodoService.get_todos_with_filters(session, current_user.id, filters)
    
    # Convert to response models
    todo_responses = [TodoResponse.model_validate(todo) for todo in todos]
    
    return TodoListResponse(
        todos=todo_responses,
        total=total,
        page=page,
        per_page=per_page,
        has_next=page * per_page < total,
        has_prev=page > 1
    )


# IMPORTANT: Specific routes must come BEFORE parameterized routes
@router.get("/stats/overview", response_model=TodoStatsResponse)
async def get_todo_stats(
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get user's todo statistics"""
    stats = TodoService.get_user_todo_stats(session, current_user.id)
    return stats


@router.get("/overdue", response_model=List[TodoResponse])
async def get_overdue_todos(
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get overdue todos"""
    overdue_todos = TodoService.get_overdue_todos(session, current_user.id)
    return [TodoResponse.model_validate(todo) for todo in overdue_todos]


@router.get("/due-soon", response_model=List[TodoResponse])
async def get_todos_due_soon(
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)],
    hours: Annotated[int, Query(ge=1, le=168)] = 24  # 1 hour to 1 week
):
    """Get todos due soon (within specified hours)"""
    due_soon_todos = TodoService.get_todos_due_soon(session, current_user.id, hours)
    return [TodoResponse.model_validate(todo) for todo in due_soon_todos]


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: UUID,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Get a specific todo by ID"""
    todo = TodoService.get_todo_by_id(session, todo_id, current_user.id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse.model_validate(todo)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: UUID,
    todo_data: TodoUpdateRequest,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update a specific todo"""
    todo_update = TodoUpdate(**todo_data.model_dump(exclude_unset=True))
    
    updated_todo = TodoService.update_todo(session, todo_id, current_user.id, todo_update)
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse.model_validate(updated_todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: UUID,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Delete a specific todo"""
    deleted = TodoService.delete_todo(session, todo_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )


@router.post("/{todo_id}/complete", response_model=TodoResponse)
async def mark_todo_completed(
    todo_id: UUID,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Mark a todo as completed"""
    todo = TodoService.mark_todo_completed(session, todo_id, current_user.id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse.model_validate(todo)


@router.post("/{todo_id}/pending", response_model=TodoResponse)
async def mark_todo_pending(
    todo_id: UUID,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Mark a todo as pending"""
    todo = TodoService.mark_todo_pending(session, todo_id, current_user.id)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse.model_validate(todo)
