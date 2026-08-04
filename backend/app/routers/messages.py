from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, models, auth
from app.database import get_db

router = APIRouter(prefix="/messages", tags=["Message History"])

@router.get("", response_model=List[schemas.BroadcastResponse])
def get_messages(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves message history for dashboard or desktop clients with search & pagination.
    """
    query = db.query(models.Broadcast)
    
    if priority:
        query = query.filter(models.Broadcast.priority == priority)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Broadcast.title.ilike(search_pattern)) |
            (models.Broadcast.message.ilike(search_pattern))
        )
        
    broadcasts = query.order_by(models.Broadcast.created_at.desc()).offset(offset).limit(limit).all()
    
    # Calculate delivery count for each broadcast
    result = []
    for b in broadcasts:
        item = schemas.BroadcastResponse.model_validate(b)
        item.delivery_count = db.query(models.DeliveryReceipt).filter(
            models.DeliveryReceipt.broadcast_id == b.broadcast_id
        ).count()
        result.append(item)
        
    return result

@router.delete("/{broadcast_id}")
def delete_message(
    broadcast_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deletes a broadcast message from history.
    """
    broadcast = db.query(models.Broadcast).filter(models.Broadcast.broadcast_id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")
        
    db.delete(broadcast)
    db.commit()
    return {"status": "success", "message": f"Broadcast {broadcast_id} deleted successfully"}
