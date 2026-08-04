from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, timedelta
from app import schemas, models, auth
from app.database import get_db
from app.websocket_manager import manager

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=schemas.AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns live stats for faculty dashboard cards & charts.
    """
    total_clients = db.query(models.Client).count()
    online_clients = len(manager.active_clients)
    
    total_broadcasts = db.query(models.Broadcast).count()
    files_shared = db.query(models.Broadcast).filter(models.Broadcast.file_path.isnot(None)).count()
    links_shared = db.query(models.Broadcast).filter(models.Broadcast.url.isnot(None)).count()
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_broadcasts = db.query(models.Broadcast).filter(models.Broadcast.created_at >= today_start).count()
    
    # Recent logs
    logs = db.query(models.AnalyticsLog).order_by(models.AnalyticsLog.timestamp.desc()).limit(10).all()
    recent_activity = [
        {
            "id": log.id,
            "event_type": log.event_type,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        } for log in logs
    ]
    
    return {
        "total_clients": total_clients,
        "online_clients": online_clients,
        "total_broadcasts": total_broadcasts,
        "files_shared": files_shared,
        "links_shared": links_shared,
        "today_broadcasts": today_broadcasts,
        "recent_activity": recent_activity
    }
