import json
import asyncio
from typing import Dict, List, Any
from fastapi import WebSocket
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models

class ConnectionManager:
    def __init__(self):
        # Active connections: client_id -> WebSocket
        self.active_clients: Dict[str, WebSocket] = {}
        # Client metadata cache: client_id -> dict info
        self.client_meta: Dict[str, dict] = {}
        # Faculty dashboard sockets: list of WebSockets
        self.dashboard_sockets: List[WebSocket] = []

    async def connect_client(self, websocket: WebSocket, client_id: str, meta: dict):
        # Close old socket if client reconnected under same ID
        if client_id in self.active_clients:
            old_ws = self.active_clients[client_id]
            try:
                await old_ws.close()
            except Exception:
                pass

        await websocket.accept()
        self.active_clients[client_id] = websocket
        self.client_meta[client_id] = meta
        
        # Update Database client status to 'online'
        self._update_client_db_status(client_id, meta, "online")

        
        # Notify dashboard sockets about updated client list / online count
        await self.broadcast_to_dashboards({
            "type": "client_connected",
            "client_id": client_id,
            "computer_name": meta.get("computer_name"),
            "ip_address": meta.get("ip_address"),
            "os_info": meta.get("os_info"),
            "online_count": len(self.active_clients)
        })

    async def connect_dashboard(self, websocket: WebSocket):
        await websocket.accept()
        self.dashboard_sockets.append(websocket)
        # Send current online count and client list immediately
        await websocket.send_json({
            "type": "dashboard_init",
            "online_count": len(self.active_clients),
            "clients": list(self.client_meta.values())
        })

    def disconnect_client(self, client_id: str):
        if client_id in self.active_clients:
            del self.active_clients[client_id]
        if client_id in self.client_meta:
            meta = self.client_meta.pop(client_id)
            self._update_client_db_status(client_id, meta, "offline")
            
        asyncio.create_task(self.broadcast_to_dashboards({
            "type": "client_disconnected",
            "client_id": client_id,
            "online_count": len(self.active_clients)
        }))

    def disconnect_dashboard(self, websocket: WebSocket):
        if websocket in self.dashboard_sockets:
            self.dashboard_sockets.remove(websocket)

    async def broadcast_to_clients(self, packet: dict) -> int:
        """
        Broadcasts packet to all connected student desktop clients in parallel.
        Returns count of delivered socket pushes.
        """
        message_str = json.dumps(packet)
        count = 0
        tasks = []
        
        for client_id, ws in list(self.active_clients.items()):
            tasks.append(self._send_safe(ws, message_str, client_id))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        count = sum(1 for r in results if r is True)
        
        # Notify dashboard sockets of delivery trigger
        await self.broadcast_to_dashboards({
            "type": "broadcast_sent",
            "broadcast_id": packet.get("broadcast_id"),
            "delivered_count": count,
            "total_clients": len(self.active_clients)
        })
        
        return count

    async def send_remote_command(self, packet: dict, target_client_ids: List[str] = None) -> int:
        """
        Sends remote command packet to targeted student desktop clients (or all if target_client_ids is empty/all).
        """
        message_str = json.dumps(packet)
        tasks = []
        
        is_all = not target_client_ids or "all" in target_client_ids
        
        for client_id, ws in list(self.active_clients.items()):
            if is_all or client_id in target_client_ids:
                tasks.append(self._send_safe(ws, message_str, client_id))
                
        if not tasks:
            return 0
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        count = sum(1 for r in results if r is True)
        
        # Notify dashboards of command execution
        await self.broadcast_to_dashboards({
            "type": "remote_command_sent",
            "command_type": packet.get("command_type"),
            "delivered_count": count,
            "total_clients": len(self.active_clients)
        })
        
        return count


    async def _send_safe(self, ws: WebSocket, message_str: str, client_id: str) -> bool:
        try:
            await ws.send_text(message_str)
            return True
        except Exception:
            self.disconnect_client(client_id)
            return False

    async def broadcast_to_dashboards(self, packet: dict):
        message_str = json.dumps(packet)
        to_remove = []
        for ws in list(self.dashboard_sockets):
            try:
                await ws.send_text(message_str)
            except Exception:
                to_remove.append(ws)
        for ws in to_remove:
            self.disconnect_dashboard(ws)

    def _update_client_db_status(self, client_id: str, meta: dict, status: str):
        db: Session = SessionLocal()
        try:
            client = db.query(models.Client).filter(models.Client.client_id == client_id).first()
            now = datetime.now(timezone.utc)
            if client:
                client.status = status
                client.last_seen = now
                client.computer_name = meta.get("computer_name", client.computer_name)
                client.ip_address = meta.get("ip_address", client.ip_address)
                client.os_info = meta.get("os_info", client.os_info)
                client.client_version = meta.get("client_version", client.client_version)
            else:
                client = models.Client(
                    client_id=client_id,
                    computer_name=meta.get("computer_name", "Student-PC"),
                    ip_address=meta.get("ip_address", "127.0.0.1"),
                    mac_address=meta.get("mac_address"),
                    os_info=meta.get("os_info", "Windows"),
                    client_version=meta.get("client_version", "1.0.0"),
                    status=status,
                    last_seen=now,
                    registered_at=now
                )
                db.add(client)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error updating client DB status: {e}")
        finally:
            db.close()

manager = ConnectionManager()
