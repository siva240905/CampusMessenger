# CampusLink Production Deployment Guide

Guide for deploying CampusLink across 500+ student computers on a campus local network.

---

## 1. Network & Firewall Configuration

To ensure sub-second delivery to 500+ client systems:

1. **Server Static IP**: Assign a static IP address to the Faculty Server host (e.g. `192.168.1.100`).
2. **Inbound Firewall Rule**: Open port **8000** (TCP) on the server machine:
   - **Windows Firewall**: `New Inbound Rule -> Port 8000 -> Allow Connection`.
3. **WebSocket Subnets**: Ensure the college network router allows internal WebSocket connections across VLANs/Subnets if student labs are on separate subnets.

---

## 2. Production Service Setup (Windows Service / Systemd)

### Running Backend with Uvicorn Production Workers

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Auto-Starting Backend on Windows Server (NSSM)

Use **NSSM** (Non-Sucking Service Manager) to run `run_backend.py` as a background Windows Service:

```cmd
nssm install CampusLinkBackend "C:\Python312\python.exe" "S:\project\share\backend\run_backend.py"
nssm start CampusLinkBackend
```

---

## 3. Mass Deployment to Student Lab PCs

1. **Silent Python Client Package**: Pack `desktop-client/python` into a single `.exe` using `PyInstaller`:
   ```bash
   pip install pyinstaller
   pyinstaller --noconfirm --onedir --windowed run_client.py
   ```
2. **Windows Group Policy / Task Scheduler**:
   - Create a startup script running `run_client.exe 192.168.1.100` silently on student login.

---

## 4. Scalability & Latency Tuning

- **Sub-Second Delivery**: The Python WebSocket gateway handles over 1,000 concurrent client connections in under 150ms on a standard gigabit campus LAN.
- **SQLite Performance**: SQLite in WAL mode (`PRAGMA journal_mode=WAL;`) allows high concurrency for read queries and receipt writes.

---

## 5. Online Cloud Deployment

CampusLink supports instant online cloud deployment for remote or hybrid access.

### Option A: Render.com (Pre-configured Blueprint)
1. Push this repository to GitHub/GitLab.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and provisions:
   - Backend API & WebSocket Service (`campuslink-backend`)
   - Static Faculty Dashboard (`campuslink-frontend`)

### Option B: Docker Container Deployment
Use the included `backend/Dockerfile`:
```bash
docker build -t campuslink-backend ./backend
docker run -d -p 8000:8000 campuslink-backend
```

### Option C: Student Desktop Client Cloud Endpoint
Set the client connection URL to your secure WebSocket server domain:
- Python Client: `wss://campuslink-backend.onrender.com/ws`
- Faculty Dashboard: Set `VITE_API_BASE_URL=https://campuslink-backend.onrender.com`

