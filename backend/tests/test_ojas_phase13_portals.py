import pytest
import asyncio
from datetime import datetime, timezone
from fastapi import HTTPException, status
from starlette.requests import Request
from app.api.v1.endpoints import auth, quests, wellness, ai, admin, missions
from app.schemas.auth import LoginRequest, UserCreateRequest
from app.schemas.gamification import QuestClaimRequest, UnlockPlanetRequest
from app.schemas.wellness import MoodCheckInCreate, JournalEntryCreate, AIChatRequest
from app.services.seed_service import seed_initial_data
from app.core.security import create_access_token


@pytest.fixture
def mock_request():
    return Request({"type": "http", "client": ("127.0.0.1", 50000)})


@pytest.fixture(autouse=True)
def seed_test_db(db):
    seed_initial_data(db)


def test_dual_portal_astronaut_login_success(db, mock_request):
    """Verify astronaut can authenticate into the astronaut portal."""
    payload = LoginRequest(
        username="sarah.connor",
        password="Astronaut2026!",
        portal_type="astronaut"
    )
    res = auth.login(payload, mock_request, db)
    assert res.access_token is not None
    assert res.user.username == "sarah.connor"
    assert res.user.role == "astronaut"
    assert res.user.astronaut_id == "ASTRO-001"


def test_dual_portal_astronaut_rejected_from_admin_portal(db, mock_request):
    """Verify astronaut credentials are rejected when attempting admin portal login."""
    payload = LoginRequest(
        username="sarah.connor",
        password="Astronaut2026!",
        portal_type="admin"
    )
    with pytest.raises(HTTPException) as exc:
        auth.login(payload, mock_request, db)
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Astronaut Portal" in exc.value.detail


def test_dual_portal_admin_login_success(db, mock_request):
    """Verify flight surgeon can authenticate into NASA Administration portal."""
    payload = LoginRequest(
        username="dr.stone",
        password="FlightSurgeon2026!",
        portal_type="admin"
    )
    res = auth.login(payload, mock_request, db)
    assert res.access_token is not None
    assert res.user.role == "flight_surgeon"


def test_dual_portal_admin_rejected_from_astronaut_portal(db, mock_request):
    """Verify flight surgeon is rejected when attempting astronaut portal login."""
    payload = LoginRequest(
        username="dr.stone",
        password="FlightSurgeon2026!",
        portal_type="astronaut"
    )
    with pytest.raises(HTTPException) as exc:
        auth.login(payload, mock_request, db)
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "NASA Administration Portal" in exc.value.detail


def test_invalid_password_returns_401(db, mock_request):
    """Verify wrong password raises HTTP 401."""
    payload = LoginRequest(
        username="sarah.connor",
        password="WrongPassword!",
        portal_type="astronaut"
    )
    with pytest.raises(HTTPException) as exc:
        auth.login(payload, mock_request, db)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED


def test_duplicate_quest_xp_claim_prevention(db):
    """Verify duplicate claims for the same quest are rejected with HTTP 409 Conflict."""
    current_user = {
        "sub": "user-1",
        "username": "sarah.connor",
        "role": "astronaut",
        "astronaut_id": "ASTRO-001"
    }

    quest_id = f"test-quest-{int(datetime.now(timezone.utc).timestamp())}"
    claim_payload = QuestClaimRequest(quest_id=quest_id, title="Morning Hydration", xp_reward=50)

    # First claim succeeds
    res1 = quests.claim_quest(claim_payload, astronaut_id="ASTRO-001", current_user=current_user, db=db)
    assert res1["success"] is True
    assert res1["xp_awarded"] == 50

    # Duplicate claim must raise 409 Conflict
    with pytest.raises(HTTPException) as exc:
        quests.claim_quest(claim_payload, astronaut_id="ASTRO-001", current_user=current_user, db=db)
    assert exc.value.status_code == status.HTTP_409_CONFLICT
    assert "already been claimed" in exc.value.detail


def test_astronaut_isolation_enforcement(db):
    """Verify astronaut A cannot claim quests or access records for astronaut B."""
    current_user = {
        "sub": "user-1",
        "username": "sarah.connor",
        "role": "astronaut",
        "astronaut_id": "ASTRO-001"
    }

    # Attempt to access ASTRO-002 records
    with pytest.raises(HTTPException) as exc:
        quests.get_gamification_status(astronaut_id="ASTRO-002", current_user=current_user, db=db)
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN


def test_private_journal_confidentiality(db):
    """Verify private journals are only visible to author and conditionally to flight surgeon."""
    astro_user = {
        "sub": "user-1",
        "username": "sarah.connor",
        "role": "astronaut",
        "astronaut_id": "ASTRO-001"
    }

    # Astronaut creates private entry
    journal_payload = JournalEntryCreate(
        title="Private Cupola Thoughts",
        content="Looking at Earth from lunar transit is deeply grounding.",
        is_shared_with_surgeon=False
    )
    entry = wellness.create_journal_entry(journal_payload, astronaut_id="ASTRO-001", current_user=astro_user, db=db)
    assert entry.title == "Private Cupola Thoughts"

    # Flight Surgeon attempts to view - should NOT see unshared entry
    surgeon_user = {
        "sub": "user-2",
        "username": "dr.stone",
        "role": "flight_surgeon",
        "astronaut_id": None
    }
    surgeon_entries = wellness.get_journal(astronaut_id="ASTRO-001", current_user=surgeon_user, db=db)
    assert not any(e.title == "Private Cupola Thoughts" for e in surgeon_entries)

    # Operations monitor (non-surgeon admin) must be forbidden completely
    ops_user = {
        "sub": "user-3",
        "username": "capcom.ops",
        "role": "operations_monitor",
        "astronaut_id": None
    }
    with pytest.raises(HTTPException) as exc:
        wellness.get_journal(astronaut_id="ASTRO-001", current_user=ops_user, db=db)
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN


def test_ojas_ai_companion_context_and_safety(db):
    """Verify Ojas AI returns context-aware response with non-clinical safety notice."""
    astro_user = {
        "sub": "user-1",
        "username": "sarah.connor",
        "role": "astronaut",
        "astronaut_id": "ASTRO-001"
    }

    chat_payload = AIChatRequest(message="How has my sleep changed this week?")
    res = ai.chat_with_ojas(chat_payload, astronaut_id="ASTRO-001", current_user=astro_user, db=db)
    assert res.reply is not None
    assert "sleep" in res.reply.lower()
    assert "safety_notice" in res.model_dump()


def test_nasa_command_center_overview(db):
    """Verify NASA command center overview endpoint returns telemetry stream status."""
    admin_user = {
        "sub": "user-admin",
        "username": "admin.houston",
        "role": "nasa_super_admin",
        "astronaut_id": None
    }

    overview = admin.get_command_center_overview(current_user=admin_user, db=db)
    assert overview["active_astronauts"] >= 1
    assert "telemetry_stream" in overview
    assert overview["telemetry_stream"]["status"] == "NOMINAL_100HZ"
