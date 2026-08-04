from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas, models, auth
from app.database import get_db

router = APIRouter(prefix="/clients", tags=["Client Management"])

@router.get("", response_model=List[schemas.ClientResponse])
def get_clients(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Returns list of all authorized student desktop clients connected or seen on the LAN.
    """
    query = db.query(models.Client)
    
    if status:
        query = query.filter(models.Client.status == status)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Client.computer_name.ilike(search_pattern)) |
            (models.Client.ip_address.ilike(search_pattern)) |
            (models.Client.os_info.ilike(search_pattern))
        )
        
    return query.order_by(models.Client.last_seen.desc()).all()
