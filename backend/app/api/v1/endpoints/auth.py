import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_user,
    ASTRONAUT_ROLE,
    ADMIN_ROLES,
)

logger = logging.getLogger("ojas.auth")
router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Dual Portal Authentication")
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate either an Astronaut or a NASA Administrator based on portal selection."""
    username = login_data.username.strip().lower()
    user = db.query(User).filter(User.username == username).first()

    ip_address = request.client.host if request.client else "unknown"

    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record failed login attempt in audit log
        audit = AuditLog(
            actor_id=username,
            actor_role="UNKNOWN",
            action="LOGIN_FAILED",
            target_resource=f"portal:{login_data.portal_type}",
            details="Invalid username or password supplied",
            ip_address=ip_address,
        )
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your username and password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Contact NASA Flight Operations Security.",
        )

    # Portal isolation enforcement
    if login_data.portal_type == "astronaut":
        if user.role != ASTRONAUT_ROLE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User '{user.username}' has administrative role '{user.role}'. Please use the NASA Administration Portal.",
            )
    elif login_data.portal_type == "admin":
        if user.role not in ADMIN_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. User '{user.username}' is registered as an astronaut. Please use the Astronaut Portal.",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid portal_type. Must be 'astronaut' or 'admin'.",
        )

    # Generate JWT token with role claims
    token_payload = {
        "sub": user.id,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name,
        "astronaut_id": user.astronaut_id,
        "portal": login_data.portal_type,
    }
    access_token = create_access_token(token_payload)

    # Log successful login
    audit = AuditLog(
        actor_id=user.username,
        actor_role=user.role,
        action="LOGIN_SUCCESS",
        target_resource=f"portal:{login_data.portal_type}",
        details=f"Successful authentication into {login_data.portal_type} portal",
        ip_address=ip_address,
    )
    db.add(audit)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            astronaut_id=user.astronaut_id,
            callsign=user.callsign,
            is_active=user.is_active,
        ),
    )


@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve full profile of currently authenticated user."""
    user = db.query(User).filter(User.id == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User record not found")
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        astronaut_id=user.astronaut_id,
        callsign=user.callsign,
        is_active=user.is_active,
    )


@router.post("/logout", summary="Logout & Record Audit Event")
def logout(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Acknowledge logout and record security audit log."""
    audit = AuditLog(
        actor_id=current_user.get("username", "unknown"),
        actor_role=current_user.get("role", "unknown"),
        action="LOGOUT",
        target_resource="session",
        details="User logged out of active session",
    )
    db.add(audit)
    db.commit()
    return {"message": "Logged out successfully"}
