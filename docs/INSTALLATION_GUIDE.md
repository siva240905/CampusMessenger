# CampusLink Installation & Setup Guide

This guide covers installing and running **CampusLink** on a college LAN network.

---

## System Requirements

- **Server Machine (Faculty/Department PC)**:
  - Windows 10/11 or Linux / macOS
  - Python 3.9+
  - Node.js v18+ (for building React frontend)
  - Connected to College LAN / Wi-Fi
- **Student Machines**:
  - Windows 10/11, macOS, or Linux
  - Python 3.9+ (for Python Desktop Client) OR Electron executable

---

## 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial database & faculty account
python ../database/seed.py

# Run server on LAN
python run_backend.py
```

The backend server will display your LAN IP (e.g., `http://192.168.1.100:8000`).

---

## 2. Frontend Setup (Faculty Dashboard)

```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` or `http://<LAN_IP>:3000` in your browser. Log in with:
- **Username**: `faculty`
- **Password**: `faculty123`

---

## 3. Student Desktop Client Setup

### Option A: Python Desktop Client (Recommended for low RAM)

```bash
cd desktop-client/python

# Install client dependencies
pip install -r requirements.txt

# Run client with GUI launcher
python run_client.py

# Or run directly pointing to server LAN IP
python client.py 192.168.1.100
```

### Option B: Electron Desktop Client

```bash
cd desktop-client/electron

# Install dependencies
npm install

# Start client
npm start
```

Enter the Faculty Server IP in the input box and click **Connect**.
