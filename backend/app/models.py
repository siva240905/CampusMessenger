from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="faculty")  # faculty or admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String(100), unique=True, index=True, nullable=False) # hostname or mac hash
    computer_name = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=False)
    mac_address = Column(String(50), nullable=True)
    os_info = Column(String(100), nullable=False)
    client_version = Column(String(20), default="1.0.0")
    status = Column(String(20), default="online") # online, offline
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    receipts = relationship("DeliveryReceipt", back_populates="client")

class Broadcast(Base):
    __tablename__ = "broadcasts"

    id = Column(Integer, primary_key=True, index=True)
    broadcast_id = Column(String(100), unique=True, index=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    url = Column(String(500), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(200), nullable=True)
    file_size = Column(Integer, nullable=True)
    image_path = Column(Text, nullable=True)
    priority = Column(String(20), default="normal") # normal, high, emergency
    is_emergency = Column(Boolean, default=False)
    sender_name = Column(String(100), default="Faculty Office")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    receipts = relationship("DeliveryReceipt", back_populates="broadcast", cascade="all, delete-orphan")

class DeliveryReceipt(Base):
    __tablename__ = "delivery_receipts"

    id = Column(Integer, primary_key=True, index=True)
    broadcast_id = Column(String(100), ForeignKey("broadcasts.broadcast_id", ondelete="CASCADE"), nullable=False)
    client_id = Column(String(100), ForeignKey("clients.client_id"), nullable=False)
    status = Column(String(20), default="delivered") # delivered, acknowledged
    received_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    broadcast = relationship("Broadcast", back_populates="receipts")
    client = relationship("Client", back_populates="receipts")

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
