import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.wellness import AIChatRequest, AIChatResponse
from app.services.ai_companion import ask_ojas_ai, check_ollama_status
from app.models.wellness import AIChatHistory
from app.core.security import get_current_user, verify_astronaut_isolation

logger = logging.getLogger("ojas.ai_api")
router = APIRouter()


@router.post("/chat", response_model=AIChatResponse, summary="Ojas AI Companion Chat")
def chat_with_ojas(
    payload: AIChatRequest,
    astronaut_id: str = "ASTRO-001",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Interact with Ojas AI, a context-aware space health and wellness companion."""
    verify_astronaut_isolation(current_user, astronaut_id)

    response = ask_ojas_ai(
        message=payload.message,
        astronaut_id=astronaut_id,
        db=db,
        conversation_history=payload.history,
    )

    # Persist in user's chat history
    try:
        user_turn = AIChatHistory(
            astronaut_id=astronaut_id,
            role="user",
            content=payload.message,
            provenance_tag="USER_INPUT",
        )
        asst_turn = AIChatHistory(
            astronaut_id=astronaut_id,
            role="assistant",
            content=response["reply"],
            provenance_tag=response.get("source_context", "AI_RESPONSE"),
        )
        db.add(user_turn)
        db.add(asst_turn)
        db.commit()
    except Exception as e:
        logger.warning(f"Could not persist chat message: {str(e)}")

    return AIChatResponse(
        reply=response["reply"],
        source_context=response["source_context"],
        safety_notice=response["safety_notice"],
        model_used=response["model_used"],
        timestamp=response["timestamp"],
    )


@router.get("/status", summary="Check AI Service Status")
def get_ai_service_status():
    """Returns local Ollama readiness and active model configuration."""
    status_info = check_ollama_status()
    return {
        "service": "Ojas AI Companion Engine",
        "engine_version": "3.0",
        "ollama": status_info,
        "capabilities": [
            "Context-aware biometric trend analysis",
            "NASA OSDR & Bedrest research grounding",
            "Guided breathing and relaxation suggestions",
            "Deterministic alert safety guardrails",
        ],
    }
