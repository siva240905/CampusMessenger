# CampusLink Architecture Overview

CampusLink is designed for instant, resilient, low-latency communication over campus local area networks.

```
                               ┌──────────────────────────────────┐
                               │     Faculty Web Dashboard        │
                               │   (React + Vite + Tailwind)      │
                               └────────────────┬─────────────────┘
                                                │ REST / WebSockets
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FastAPI Backend & WS Gateway                          │
│                                (Uvicorn / Python)                               │
├───────────────────────────────────────┬─────────────────────────────────────────┤
│  • JWT Auth & Role Access             │  • WebSocket Connection Manager         │
│  • Broadcast Router & Upload API      │  • Static File Server (Uploads)         │
│  • Client & Analytics Tracking        │  • SQLite Persistence (SQLAlchemy)      │
└───────────────────────────────────────┴─────────────────────────────────────────┘
                                                │ WebSocket (Sub-second Broadcast)
                                                ▼
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         │                                                                             │
         ▼                                                                             ▼
┌───────────────────────────────────────────┐                     ┌───────────────────────────────────────────┐
│     Student Desktop Client (Python)       │                     │    Student Desktop Client (Electron)      │
│  • Auto-connect & Heartbeat (IP/Host/OS) │                     │  • Auto-connect & Background Service      │
│  • Glassmorphism Floating Toast / Popup   │                     │  • System Tray & Native Toasts            │
│  • Audio Alert & Link/Download Manager   │                     │  • Link Opener & Download Manager         │
│  • Offline Cache (SQLite)                 │                     │  • Offline Message Cache                  │
└───────────────────────────────────────────┘                     └───────────────────────────────────────────┘
```

## Key Architectural Decisions

1. **Sub-Second WebSocket Delivery**: Fast async broadcast loop pushes JSON packets directly to all connected sockets in `< 1` second across local subnets.
2. **Authorized Voluntary Client Registration**: Desktop clients register their Hostname, IP address, OS name, and client version on connection. No unauthorized network forcing or OS boundary violations are used.
3. **Glassmorphism Apple & Windows 11 UI**: Faculty Dashboard and Desktop Popups feature dark glass design systems with blur, smooth animations, and priority color coding.
4. **Offline Resilience**: Student desktop client caches all received broadcasts in a local SQLite database (`client_cache.db`) so students can read notices even when disconnected.
