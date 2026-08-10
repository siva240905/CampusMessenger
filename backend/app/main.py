import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base, SessionLocal
from app import models
from app.websocket_manager import manager
from app.routers import auth, broadcast, upload, clients, messages, analytics, commands


# Create database tables & auto-seed initial users if missing
Base.metadata.create_all(bind=engine)

def auto_seed_default_users():
    db = SessionLocal()
    try:
        faculty = db.query(models.User).filter(models.User.username == "faculty").first()
        if not faculty:
            from app import auth as auth_utils
            faculty = models.User(
                username="faculty",
                password_hash=auth_utils.get_password_hash("faculty123"),
                full_name="Placement Officer",
                role="faculty",
                is_active=True
            )
            db.add(faculty)
            db.commit()
    except Exception as e:
        print(f"Auto-seed warning: {e}")
    finally:
        db.close()

auto_seed_default_users()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for LAN access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static files over LAN
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(broadcast.router, prefix=settings.API_PREFIX)
app.include_router(upload.router, prefix=settings.API_PREFIX)
app.include_router(clients.router, prefix=settings.API_PREFIX)
app.include_router(messages.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(commands.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "websocket_endpoint": "/ws"
    }

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str = Query(None),
    computer_name: str = Query("Student-PC"),
    ip_address: str = Query("127.0.0.1"),
    os_info: str = Query("Windows"),
    client_version: str = Query("1.0.0"),
    role: str = Query("student")
):
    """
    Sub-second real-time WebSocket channel for LAN Instant Communication.
    Handles Student Desktop Clients and Faculty Dashboard Live Stream.
    """
    if role == "faculty_dashboard":
        await manager.connect_dashboard(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                # Dashboard ping/pong heartbeat
                if data == "ping":
                    await websocket.send_text("pong")
        except WebSocketDisconnect:
            manager.disconnect_dashboard(websocket)
        return

    # Student Client Connection
    if not client_id:
        client_id = f"client_{ip_address}_{computer_name}"

    meta = {
        "client_id": client_id,
        "computer_name": computer_name,
        "ip_address": ip_address,
        "os_info": os_info,
        "client_version": client_version
    }

    await manager.connect_client(websocket, client_id, meta)

    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                payload = json.loads(data_str)
                msg_type = payload.get("type")
                
                if msg_type == "ping":
                    await websocket.send_json({"type": "pong"})
                elif msg_type == "ack":
                    # Client acknowledged broadcast delivery
                    broadcast_id = payload.get("broadcast_id")
                    if broadcast_id:
                        await manager.broadcast_to_dashboards({
                            "type": "client_ack",
                            "broadcast_id": broadcast_id,
                            "client_id": client_id,
                            "computer_name": computer_name
                        })
            except json.JSONDecodeError:
                if data_str == "ping":
                    await websocket.send_text("pong")

    except WebSocketDisconnect:
        manager.disconnect_client(client_id)
