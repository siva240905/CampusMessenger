from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app import schemas, models, auth
from app.database import get_db
from app.websocket_manager import manager

router = APIRouter(prefix="/commands", tags=["Remote Commands"])

VALID_COMMANDS = {"open_url", "open_pdf", "open_chrome", "lock", "restart", "shutdown"}

@router.post("/remote", response_model=schemas.RemoteCommandResponse)
async def send_remote_command(
    payload: schemas.RemoteCommandCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Sends sub-second Remote Commands (Shutdown, Restart, Lock Screen, Open Link/PDF/Chrome)
    to connected student desktop clients on the LAN.
    """
    if payload.command_type not in VALID_COMMANDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid command_type '{payload.command_type}'. Valid commands: {list(VALID_COMMANDS)}"
        )

    # Build WebSocket command packet
    packet = {
        "type": "remote_command",
        "command_type": payload.command_type,
        "url": payload.url,
        "sender_name": current_user.full_name,
        "reason": payload.reason or f"Executed by faculty {current_user.full_name}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    # Dispatch to WebSocket Gateway
    delivered_count = await manager.send_remote_command(packet, payload.target_client_ids)

    # Log analytics
    log_detail = f"Remote command '{payload.command_type}' sent by {current_user.username} to {delivered_count} clients."
    if payload.url:
        log_detail += f" URL: {payload.url}"

    log = models.AnalyticsLog(
        event_type="remote_command",
        details=log_detail
    )
    db.add(log)
    db.commit()

    return schemas.RemoteCommandResponse(
        status="success",
        command_type=payload.command_type,
        delivered_count=delivered_count,
        total_clients=len(manager.active_clients),
        timestamp=datetime.now(timezone.utc)
    )
