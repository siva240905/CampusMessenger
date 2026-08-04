import uvicorn
import socket
import sys

if sys.platform == "win32" and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    lan_ip = get_lan_ip()
    print("=" * 60)
    print(f"🚀 Starting CampusLink Backend Server on LAN")
    print(f"📡 Local Address:  http://127.0.0.1:8000")
    print(f"🌐 LAN Address:    http://{lan_ip}:8000")
    print(f"🔌 WebSocket URL:  ws://{lan_ip}:8000/ws")
    print(f"📚 API Docs:       http://{lan_ip}:8000/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, http="h11")
