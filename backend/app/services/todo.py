from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from uuid import UUID
from sqlmodel import Session, select, func, and_, or_

from app.models.todo import Todo, TodoCreate, TodoUpdate, TodoStatus, TodoPriority
from app.schemas.todo import TodoFilterParams, TodoStatsResponse


class TodoService:
    """Todo service for CRUD operations"""
    
    @staticmethod
    def create_todo(session: Session, todo_data: TodoCreate, owner_id: UUID) -> Todo:
        """Create a new todo"""
        db_todo = Todo(
            **todo_data.model_dump(),
            owner_id=owner_id
        )
        
        session.add(db_todo)
        session.commit()
        session.refresh(db_todo)
        return db_todo
    
    @staticmethod
    def get_todo_by_id(session: Session, todo_id: UUID, owner_id: UUID) -> Optional[Todo]:
        """Get todo by ID (only if owned by user)"""
        statement = select(Todo).where(
            and_(Todo.id == todo_id, Todo.owner_id == owner_id)
        )
        return session.exec(statement).first()
    
    @staticmethod
    def get_todos_with_filters(
        session: Session, 
        owner_id: UUID, 
        filters: TodoFilterParams
    ) -> Tuple[List[Todo], int]:
        """Get todos with filtering and pagination"""
        # Base query
        statement = select(Todo).where(Todo.owner_id == owner_id)
        count_statement = select(func.count(Todo.id)).where(Todo.owner_id == owner_id)
        
        # Apply filters
        conditions = []
        
        if filters.status:
            conditions.append(Todo.status == filters.status)
        
        if filters.priority:
            conditions.append(Todo.priority == filters.priority)
        
        if filters.is_completed is not None:
            conditions.append(Todo.is_completed == filters.is_completed)
        
        if filters.search:
            search_term = f"%{filters.search}%"
            conditions.append(
                or_(
                    Todo.title.contains(search_term.strip('%')),
                    Todo.description.contains(search_term.strip('%'))
                )
            )
        
        if filters.due_before:
            conditions.append(Todo.due_date <= filters.due_before)
        
        if filters.due_after:
            conditions.append(Todo.due_date >= filters.due_after)
        
        # Apply all conditions
        if conditions:
            statement = statement.where(and_(*conditions))
            count_statement = count_statement.where(and_(*conditions))
        
        # Get total count
        total = session.exec(count_statement).one()
        
        # Apply pagination and ordering
        statement = statement.order_by(Todo.created_at.desc())
        statement = statement.offset((filters.page - 1) * filters.per_page)
        statement = statement.limit(filters.per_page)
        
        todos = session.exec(statement).all()
        return todos, total
    
    @staticmethod
    def update_todo(
        session: Session, 
        todo_id: UUID, 
        owner_id: UUID, 
        todo_update: TodoUpdate
    ) -> Optional[Todo]:
        """Update todo"""
        todo = TodoService.get_todo_by_id(session, todo_id, owner_id)
        if not todo:
            return None
        
        # Update fields
        update_data = todo_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(todo, field, value)
        
        # Auto-update status based on is_completed
        if 'is_completed' in update_data:
            if update_data['is_completed']:
                todo.status = TodoStatus.COMPLETED
            elif todo.status == TodoStatus.COMPLETED:
                todo.status = TodoStatus.PENDING
        
        todo.updated_at = datetime.utcnow()
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
    
    @staticmethod
    def delete_todo(session: Session, todo_id: UUID, owner_id: UUID) -> bool:
        """Delete todo"""
        todo = TodoService.get_todo_by_id(session, todo_id, owner_id)
        if not todo:
            return False
        
        session.delete(todo)
        session.commit()
        return True
    
    @staticmethod
    def mark_todo_completed(session: Session, todo_id: UUID, owner_id: UUID) -> Optional[Todo]:
        """Mark todo as completed"""
        todo = TodoService.get_todo_by_id(session, todo_id, owner_id)
        if not todo:
            return None
        
        todo.is_completed = True
        todo.status = TodoStatus.COMPLETED
        todo.updated_at = datetime.utcnow()
        
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
    
    @staticmethod
    def mark_todo_pending(session: Session, todo_id: UUID, owner_id: UUID) -> Optional[Todo]:
        """Mark todo as pending"""
        todo = TodoService.get_todo_by_id(session, todo_id, owner_id)
        if not todo:
            return None
        
        todo.is_completed = False
        todo.status = TodoStatus.PENDING
        todo.updated_at = datetime.utcnow()
        
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
    
    @staticmethod
    def get_user_todo_stats(session: Session, owner_id: UUID) -> TodoStatsResponse:
        """Get user's todo statistics"""
        # Total todos
        total_todos = session.exec(
            select(func.count(Todo.id)).where(Todo.owner_id == owner_id)
        ).one()
        
        # Completed todos
        completed_todos = session.exec(
            select(func.count(Todo.id)).where(
                and_(Todo.owner_id == owner_id, Todo.is_completed == True)
            )
        ).one()
        
        # Pending todos
        pending_todos = session.exec(
            select(func.count(Todo.id)).where(
                and_(Todo.owner_id == owner_id, Todo.is_completed == False)
            )
        ).one()
        
        # Overdue todos (only count todos that have due dates)
        now = datetime.utcnow()
        overdue_todos = session.exec(
            select(func.count(Todo.id)).where(
                and_(
                    Todo.owner_id == owner_id,
                    Todo.due_date != None,
                    Todo.due_date < now,
                    Todo.is_completed == False
                )
            )
        ).one()
        
        # Todos by priority
        priority_stats = {}
        for priority in TodoPriority:
            count = session.exec(
                select(func.count(Todo.id)).where(
                    and_(Todo.owner_id == owner_id, Todo.priority == priority)
                )
            ).one()
            priority_stats[priority.value] = count
        
        # Todos by status
        status_stats = {}
        for status in TodoStatus:
            count = session.exec(
                select(func.count(Todo.id)).where(
                    and_(Todo.owner_id == owner_id, Todo.status == status)
                )
            ).one()
            status_stats[status.value] = count
        
        return TodoStatsResponse(
            total_todos=total_todos,
            completed_todos=completed_todos,
            pending_todos=pending_todos,
            overdue_todos=overdue_todos,
            todos_by_priority=priority_stats,
            todos_by_status=status_stats
        )
    
    @staticmethod
    def get_overdue_todos(session: Session, owner_id: UUID) -> List[Todo]:
        """Get overdue todos for a user"""
        now = datetime.utcnow()
        statement = select(Todo).where(
            and_(
                Todo.owner_id == owner_id,
                Todo.due_date != None,
                Todo.due_date < now,
                Todo.is_completed == False
            )
        ).order_by(Todo.due_date.asc())
        
        return session.exec(statement).all()
    
    @staticmethod
    def get_todos_due_soon(session: Session, owner_id: UUID, hours: int = 24) -> List[Todo]:
        """Get todos due within specified hours"""
        now = datetime.utcnow()
        due_before = now + timedelta(hours=hours)
        
        statement = select(Todo).where(
            and_(
                Todo.owner_id == owner_id,
                Todo.due_date != None,
                Todo.due_date >= now,
                Todo.due_date <= due_before,
                Todo.is_completed == False
            )
        ).order_by(Todo.due_date.asc())
        
        return session.exec(statement).all()
