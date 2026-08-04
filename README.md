# CampusLink - Instant LAN Communication Platform

**CampusLink** is a production-quality, low-latency LAN instant communication system designed for campus placement drives, emergency alerts, and department notices. It enables faculty members to instantly share placement registration links, announcements, PDFs, images, and emergency alerts to student desktop computers connected to the college local network in **under 1 second**.

---

## 🌟 Key Features

### Faculty Dashboard
- **Modern Glassmorphic Dark UI**: Apple & Windows 11 Fluent inspired design with dark/light mode toggle.
- **Instant LAN Broadcast**: Pushes announcements, registration URLs, document PDFs, and images via WebSockets in `< 1` second.
- **Live Connected Systems**: Monitors online student desktop clients with Hostname, IP address, OS version, and status.
- **Delivery Status & Receipts**: Tracks delivery count and student acknowledgments.
- **QR Code Generator**: Automatic QR code image creation for registration links.
- **Message History & Management**: Search, filter, delete, and view past announcements.
- **LAN Analytics & Audit Logs**: Activity charts, file type breakdowns, and event logs.

### Student Desktop Client (Python & Electron)
- **Auto Connect & Background Service**: Auto-discovers and connects to the Faculty LAN server.
- **Sub-Second Live Popup**: Floating Glassmorphism toast window with slide-in animation.
- **Audio Chime Notifier**: Sound alerts for standard notices and emergency sirens.
- **Action Buttons**: One-click "Open Link", "Download File", and "View Image".
- **Offline Cache**: Local SQLite storage to browse past notices even when offline.
- **Auto Reconnect**: Resilient reconnection loop with exponential backoff.

---

## 🛠️ Tech Stack

- **Backend**: Python FastAPI, WebSocket Gateway, SQLite, SQLAlchemy, Uvicorn, JWT Authentication, PyJWT, Passlib (Bcrypt).
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Axios, QRCode SVG.
- **Desktop Clients**:
  1. **Python Client**: Tkinter Glassmorphic Popup, `websocket-client`, `requests`, `winsound` / audio synth, SQLite local cache.
  2. **Electron Client**: Node.js, Electron, HTML5/CSS3, native OS notifications.
- **Database**: SQLite (SQLAlchemy ORM + raw SQL schemas).

---

## 📂 Project Structure

```
s:/project/share/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── websocket_manager.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── broadcast.py
│   │       ├── upload.py
│   │       ├── clients.py
│   │       ├── messages.py
│   │       └── analytics.py
│   ├── uploads/
│   ├── requirements.txt
│   └── run_backend.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── desktop-client/
│   ├── python/
│   │   ├── client.py
│   │   ├── popup_window.py
│   │   ├── audio_notifier.py
│   │   ├── storage.py
│   │   ├── run_client.py
│   │   └── requirements.txt
│   └── electron/
│       ├── main.js
│       ├── preload.js
│       ├── renderer/
│       └── package.json
├── database/
│   ├── schema.sql
│   └── seed.py
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── INSTALLATION_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TESTING_GUIDE.md
│   └── ARCHITECTURE.md
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Start Backend Server
```bash
cd backend
pip install -r requirements.txt
python ../database/seed.py
python run_backend.py
```
*Backend listens on `http://0.0.0.0:8000` (LAN accessible).*

### 2. Start Faculty Dashboard
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in browser. Login: `faculty` / `faculty123`.*

### 3. Start Student Desktop Client
```bash
cd desktop-client/python
pip install -r requirements.txt
python run_client.py
```
*Enter Faculty Server IP (e.g., `127.0.0.1` or LAN IP `192.168.x.x`).*

---

## 🔒 Security & Authorization Notice

CampusLink only communicates with authorized student desktop client applications that have explicitly connected to the server over WebSocket. It does not force packets onto unauthorized machines or bypass network security controls. All broadcasts originate from authenticated faculty accounts secured via JWT tokens.

---

## 📄 Documentation Links
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Installation Guide](docs/INSTALLATION_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
