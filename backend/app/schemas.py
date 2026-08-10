from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    full_name: str
    role: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: Optional[str] = "faculty"

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Client Schemas
class ClientRegister(BaseModel):
    client_id: str
    computer_name: str
    ip_address: str
    mac_address: Optional[str] = None
    os_info: str
    client_version: Optional[str] = "1.0.0"

class ClientResponse(BaseModel):
    id: int
    client_id: str
    computer_name: str
    ip_address: str
    mac_address: Optional[str] = None
    os_info: str
    client_version: str
    status: str
    last_seen: datetime
    registered_at: datetime

    class Config:
        from_attributes = True

# Broadcast Schemas
class BroadcastCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    url: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    image_path: Optional[str] = None
    priority: Optional[str] = "normal"  # normal, high, emergency
    is_emergency: Optional[bool] = False

class BroadcastResponse(BaseModel):
    id: int
    broadcast_id: str
    title: str
    message: str
    url: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    image_path: Optional[str] = None
    priority: str
    is_emergency: bool
    sender_name: str
    created_at: datetime
    delivery_count: Optional[int] = 0

    class Config:
        from_attributes = True

# WebSocket Payload Schema
class WSPacket(BaseModel):
    type: str  # broadcast, ping, register, ack
    broadcast_id: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    url: Optional[str] = None
    file: Optional[str] = None
    file_name: Optional[str] = None
    image: Optional[str] = None
    priority: Optional[str] = "normal"
    is_emergency: Optional[bool] = False
    timestamp: Optional[str] = None
    client_info: Optional[ClientRegister] = None

# Analytics Schema
class AnalyticsResponse(BaseModel):
    total_clients: int
    online_clients: int
    total_broadcasts: int
    files_shared: int
    links_shared: int
    today_broadcasts: int
    recent_activity: List[dict]

# Remote Command Schemas
class RemoteCommandCreate(BaseModel):
    command_type: str = Field(..., description="open_url, open_pdf, open_chrome, lock, restart, shutdown")
    url: Optional[str] = None
    target_client_ids: Optional[List[str]] = Field(default_factory=list, description="Empty or ['all'] means broadcast to all connected student PCs")
    reason: Optional[str] = None

class RemoteCommandResponse(BaseModel):
    status: str
    command_type: str
    delivered_count: int
    total_clients: int
    timestamp: datetime

