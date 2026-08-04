from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app import schemas, models, auth
from app.database import get_db
from app.websocket_manager import manager

router = APIRouter(prefix="/broadcast", tags=["Broadcast"])

@router.post("", response_model=schemas.BroadcastResponse)
async def create_broadcast(
    payload: schemas.BroadcastCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Creates a broadcast record in SQLite and instantly sends sub-second WebSocket packet to all connected student clients.
    """
    new_broadcast = models.Broadcast(
        title=payload.title,
        message=payload.message,
        url=payload.url,
        file_path=payload.file_path,
        file_name=payload.file_name,
        file_size=payload.file_size,
        image_path=payload.image_path,
        priority=payload.priority or "normal",
        is_emergency=payload.is_emergency or False,
        sender_name=current_user.full_name
    )
    
    db.add(new_broadcast)
    db.commit()
    db.refresh(new_broadcast)
    
    # Log analytics
    log = models.AnalyticsLog(
        event_type="broadcast_sent",
        details=f"Broadcast '{payload.title}' sent by {current_user.username}"
    )
    db.add(log)
    db.commit()

    # Prepare WebSocket sub-second packet payload
    packet = {
        "type": "broadcast",
        "broadcast_id": new_broadcast.broadcast_id,
        "title": new_broadcast.title,
        "message": new_broadcast.message,
        "url": new_broadcast.url,
        "file": new_broadcast.file_path,
        "file_name": new_broadcast.file_name,
        "file_size": new_broadcast.file_size,
        "image": new_broadcast.image_path,
        "priority": new_broadcast.priority,
        "is_emergency": new_broadcast.is_emergency,
        "sender_name": new_broadcast.sender_name,
        "timestamp": new_broadcast.created_at.isoformat()
    }

    # Instantly trigger parallel websocket push < 1 second
    delivered_count = await manager.broadcast_to_clients(packet)
    
    response = schemas.BroadcastResponse.model_validate(new_broadcast)
    response.delivery_count = delivered_count
    return response

@router.post("/ack")
def acknowledge_receipt(
    broadcast_id: str,
    client_id: str,
    db: Session = Depends(get_db)
):
    """
    Records student client delivery acknowledgment.
    """
    receipt = models.DeliveryReceipt(
        broadcast_id=broadcast_id,
        client_id=client_id,
        status="acknowledged",
        received_at=datetime.now(timezone.utc)
    )
    db.add(receipt)
    db.commit()
    return {"status": "ok", "message": "Acknowledgment recorded"}
