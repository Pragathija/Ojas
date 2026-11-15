import logging
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.wellness import MoodCheckIn, PrivateJournal
from app.schemas.wellness import (
    MoodCheckInCreate,
    MoodCheckInResponse,
    JournalEntryCreate,
    JournalEntryResponse,
)
from app.core.security import (
    get_current_user,
    verify_astronaut_isolation,
    ASTRONAUT_ROLE,
    require_role,
)

logger = logging.getLogger("ojas.wellness")
router = APIRouter()


@router.get("/moods", response_model=List[MoodCheckInResponse], summary="Get Astronaut Mood History")
def get_moods(
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve astronaut's voluntary self-reported mood history. Strictly isolated to the authorized astronaut."""
    verify_astronaut_isolation(current_user, astronaut_id)

    moods = (
        db.query(MoodCheckIn)
        .filter(MoodCheckIn.astronaut_id == astronaut_id)
        .order_by(MoodCheckIn.created_at.desc())
        .limit(30)
        .all()
    )

    return [
        MoodCheckInResponse(
            id=m.id,
            astronaut_id=m.astronaut_id,
            mood=m.mood,
            stress_level=m.stress_level,
            energy_level=m.energy_level,
            notes=m.notes,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in moods
    ]


@router.post("/moods", response_model=MoodCheckInResponse, status_code=status.HTTP_201_CREATED, summary="Log Mood Check-In")
def record_mood(
    payload: MoodCheckInCreate,
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Voluntary astronaut self-reported wellness check-in. Never used for mission grading or punitive evaluation."""
    verify_astronaut_isolation(current_user, astronaut_id)

    mood = MoodCheckIn(
        astronaut_id=astronaut_id,
        mood=payload.mood,
        stress_level=payload.stress_level,
        energy_level=payload.energy_level,
        notes=payload.notes,
    )
    db.add(mood)
    db.commit()
    db.refresh(mood)

    return MoodCheckInResponse(
        id=mood.id,
        astronaut_id=mood.astronaut_id,
        mood=mood.mood,
        stress_level=mood.stress_level,
        energy_level=mood.energy_level,
        notes=mood.notes,
        created_at=mood.created_at.isoformat() if mood.created_at else "",
    )


@router.get("/journal", response_model=List[JournalEntryResponse], summary="Get Private Journal Entries")
def get_journal(
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve private reflections. Strict privacy: flight surgeons only see entries where is_shared_with_surgeon=True."""
    user_role = current_user.get("role")
    user_astro_id = current_user.get("astronaut_id")

    query = db.query(PrivateJournal).filter(PrivateJournal.astronaut_id == astronaut_id)

    if user_role == ASTRONAUT_ROLE:
        if user_astro_id != astronaut_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You cannot view another astronaut's private reflections.",
            )
    elif user_role == "flight_surgeon":
        # Flight surgeon only sees entries the astronaut explicitly chose to share
        query = query.filter(PrivateJournal.is_shared_with_surgeon == True)
    else:
        # Administrators and other staff are forbidden from viewing private astronaut reflections
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Astronaut private journals are confidential and protected by aerospace privacy policies.",
        )

    entries = query.order_by(PrivateJournal.created_at.desc()).all()
    return [
        JournalEntryResponse(
            id=e.id,
            astronaut_id=e.astronaut_id,
            title=e.title,
            content=e.content,
            is_shared_with_surgeon=e.is_shared_with_surgeon,
            created_at=e.created_at.isoformat() if e.created_at else "",
            updated_at=e.updated_at.isoformat() if e.updated_at else None,
        )
        for e in entries
    ]


@router.post("/journal", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED, summary="Create Private Reflection")
def create_journal_entry(
    payload: JournalEntryCreate,
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a confidential reflection entry in the astronaut's Mind Garden."""
    verify_astronaut_isolation(current_user, astronaut_id)

    entry = PrivateJournal(
        astronaut_id=astronaut_id,
        title=payload.title,
        content=payload.content,
        is_shared_with_surgeon=payload.is_shared_with_surgeon,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return JournalEntryResponse(
        id=entry.id,
        astronaut_id=entry.astronaut_id,
        title=entry.title,
        content=entry.content,
        is_shared_with_surgeon=entry.is_shared_with_surgeon,
        created_at=entry.created_at.isoformat() if entry.created_at else "",
        updated_at=entry.updated_at.isoformat() if entry.updated_at else None,
    )
