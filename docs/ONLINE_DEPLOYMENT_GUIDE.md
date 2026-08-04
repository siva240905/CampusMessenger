# 🌐 CampusLink Online Cloud Deployment Guide

This guide walks you through deploying **CampusLink** online so that it can be accessed over the internet across multiple campuses, remote locations, or cloud instances.

---

## 🏗️ Architecture Summary

| Component | Technology | Recommended Cloud Hosting |
| :--- | :--- | :--- |
| **Backend & WebSocket Gateway** | Python FastAPI, Uvicorn, WebSockets | **Render** / **Railway** / **Koyeb** / **Fly.io** |
| **Faculty Dashboard** | React + Vite | **Vercel** / **Netlify** / **Render Static** |
| **Database** | SQLite (or PostgreSQL on Railway/Render) | Cloud Persistent Volume / Hosted SQL |
| **Desktop Clients** | Python Tkinter / Electron | Connect to `wss://your-backend.onrender.com/ws` |

---

## 🚀 Option 1: 1-Click Deployment on Render (Recommended & Free)

### Step 1: Push Code to GitHub / GitLab
1. Create a repository on GitHub and push the CampusLink codebase.

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository containing CampusLink.
4. Render will automatically detect [`render.yaml`](file:///s:/project/share/render.yaml) and create both services:
   - **`campuslink-backend`** (Python FastAPI Service supporting `https://` & `wss://`)
   - **`campuslink-frontend`** (Static Web App for Faculty Dashboard)
5. Click **Apply**. Render will build and deploy both services automatically!

---

## ⚡ Option 2: Deploy Backend on Render / Railway & Frontend on Vercel

### Step 1: Backend Deployment (Render or Railway)
1. In Render, select **New Web Service**.
2. Connect your repository and configure:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `SECRET_KEY`: `your_custom_jwt_secret_key`
   - `ADMIN_API_KEY`: `your_custom_admin_key`
4. Once deployed, note down your live backend URL (e.g. `https://campuslink-backend.onrender.com`).

### Step 2: Frontend Deployment (Vercel)
1. Install Vercel CLI or connect via [Vercel Dashboard](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable:
   - `VITE_API_BASE_URL` = `https://campuslink-backend.onrender.com`
6. Deploy! Your dashboard will be live at `https://campuslink.vercel.app`.

---

## 🐳 Option 3: Docker Deployment (Any VPS / AWS / DigitalOcean)

Run CampusLink in a Docker container on any Linux / Cloud Server:

```bash
# Build Docker image
cd backend
docker build -t campuslink-backend .

# Run Container with port 8000 exposed
docker run -d -p 8000:8000 --name campuslink \
  -e SECRET_KEY="your_secure_secret" \
  campuslink-backend
```

---

## 💻 Connecting Desktop Clients to Online Cloud Gateway

Once your backend is deployed online (e.g., `https://campuslink-backend.onrender.com`), configure your desktop clients:

### 1. Python Student Desktop Client
Run the python client using the online domain (without `https://` prefix):
```bash
cd desktop-client/python
python run_client.py campuslink-backend.onrender.com
```

### 2. Electron Desktop Client
Open the Electron app, enter your live online server domain (e.g., `campuslink-backend.onrender.com`), and click **🔌 Connect & Start Service**.

---

## 🔒 Production Security Checklist
- Ensure `SECRET_KEY` in `backend/app/config.py` is set via cloud Environment Variables.
- Enable `wss://` (secure WebSockets) when hosting over HTTPS (handled automatically by Render / Vercel / Railway).
