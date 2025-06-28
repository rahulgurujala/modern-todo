from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from passlib.context import CryptContext
from jose import JWTError, jwt

from app.models.user import User, UserCreate
from app.schemas.auth import TokenData
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


class AuthService:
    """Authentication service"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> TokenData:
        """Verify JWT token and return token data"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            user_id: str = payload.get("user_id")
            
            if username is None:
                raise credentials_exception
                
            token_data = TokenData(username=username, user_id=UUID(user_id) if user_id else None)
            return token_data
        except JWTError:
            raise credentials_exception
    
    @staticmethod
    def get_user_by_username(session: Session, username: str) -> Optional[User]:
        """Get user by username"""
        statement = select(User).where(User.username == username)
        return session.exec(statement).first()
    
    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        """Get user by email"""
        statement = select(User).where(User.email == email)
        return session.exec(statement).first()
    
    @staticmethod
    def get_user_by_id(session: Session, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        statement = select(User).where(User.id == user_id)
        return session.exec(statement).first()
    
    @staticmethod
    def authenticate_user(session: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        user = AuthService.get_user_by_username(session, username)
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_user(session: Session, user_create: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        if AuthService.get_user_by_username(session, user_create.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        if AuthService.get_user_by_email(session, user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        hashed_password = AuthService.get_password_hash(user_create.password)
        db_user = User(
            username=user_create.username,
            email=user_create.email,
            full_name=user_create.full_name,
            hashed_password=hashed_password,
            is_active=True
        )
        
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user
    
    @staticmethod
    def change_password(session: Session, user: User, current_password: str, new_password: str) -> bool:
        """Change user password"""
        if not AuthService.verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        
        user.hashed_password = AuthService.get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        session.add(user)
        session.commit()
        return True
    
    @staticmethod
    def update_user_profile(session: Session, user: User, email: Optional[str] = None, 
                          full_name: Optional[str] = None) -> User:
        """Update user profile"""
        if email and email != user.email:
            # Check if email is already taken
            if AuthService.get_user_by_email(session, email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            user.email = email
        
        if full_name is not None:
            user.full_name = full_name
        
        user.updated_at = datetime.utcnow()
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
