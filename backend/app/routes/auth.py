from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.database import get_session
from app.services.auth import AuthService, ACCESS_TOKEN_EXPIRE_MINUTES, oauth2_scheme
from app.models.user import User, UserCreate
from app.schemas.auth import (
    Token,
    LoginRequest,
    RegisterRequest,
    ChangePasswordRequest,
    UserProfile,
    UpdateProfileRequest,
)

# Create router (blueprint equivalent)
router = APIRouter(prefix="/auth", tags=["authentication"])


# Dependency to get current user
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """Get current authenticated user"""
    token_data = AuthService.verify_token(token)
    user = AuthService.get_user_by_username(session, token_data.username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    session: Annotated[Session, Depends(get_session)]
):
    """Register a new user"""
    user_create = UserCreate(
        username=user_data.username,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    user = AuthService.create_user(session, user_create)
    return UserProfile.model_validate(user)


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)]
):
    """Login with username and password"""
    user = AuthService.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.username, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: LoginRequest,
    session: Annotated[Session, Depends(get_session)]
):
    """Login with JSON payload"""
    user = AuthService.authenticate_user(session, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.username, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_active_user)]
):
    """Get current user profile"""
    return UserProfile.model_validate(current_user)


@router.put("/me", response_model=UserProfile)
async def update_profile(
    profile_data: UpdateProfileRequest,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Update current user profile"""
    updated_user = AuthService.update_user_profile(
        session=session,
        user=current_user,
        email=profile_data.email,
        full_name=profile_data.full_name
    )
    return UserProfile.model_validate(updated_user)


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_active_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """Change user password"""
    AuthService.change_password(
        session=session,
        user=current_user,
        current_password=password_data.current_password,
        new_password=password_data.new_password
    )
    return {"message": "Password changed successfully"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: Annotated[User, Depends(get_active_user)]
):
    """Refresh access token"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": current_user.username, "user_id": str(current_user.id)},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
