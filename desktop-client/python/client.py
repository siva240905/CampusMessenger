import socket
import platform
import json
import time
import threading
import sys
import os
import websocket
import webbrowser

if sys.platform == "win32" and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from storage import OfflineStorage
from audio_notifier import play_alert
from popup_window import GlassPopupWindow

class CampusLinkClient:
    def __init__(self, server_host="127.0.0.1", server_port=8000):
        self.server_host = server_host
        self.server_port = server_port
        self.http_base = f"http://{server_host}:{server_port}"
        self.ws_url = f"ws://{server_host}:{server_port}/ws"
        
        self.computer_name = socket.gethostname()
        self.ip_address = self._get_lan_ip()
        self.os_info = f"{platform.system()} {platform.release()}"
        self.client_id = f"client_{self.computer_name}_{self.ip_address.replace('.', '_')}"
        self.client_version = "1.0.0"
        
        self.storage = OfflineStorage()
        self.running = True
        self.ws = None

    def _get_lan_ip(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return "127.0.0.1"

    def start(self):
        print("=" * 60)
        print(f"🖥️  CampusLink Desktop Client Starting")
        print(f"💻 Computer Name: {self.computer_name}")
        print(f"🌐 LAN IP:        {self.ip_address}")
        print(f"💻 OS:            {self.os_info}")
        print(f"📡 Connecting to:  {self.ws_url}")
        print("=" * 60)
        
        # Start reconnect loop in background
        threading.Thread(target=self._connection_loop, daemon=True).start()

    def _connection_loop(self):
        while self.running:
            try:
                full_ws_url = f"{self.ws_url}?client_id={self.client_id}&computer_name={self.computer_name}&ip_address={self.ip_address}&os_info={self.os_info}&client_version={self.client_version}"
                
                self.ws = websocket.WebSocketApp(
                    full_ws_url,
                    on_open=self._on_open,
                    on_message=self._on_message,
                    on_error=self._on_error,
                    on_close=self._on_close
                )
                
                # Start websocket run loop
                self.ws.run_forever(ping_interval=20, ping_timeout=10)
            except Exception as e:
                print(f"⚠️ Connection error: {e}")
                
            print("🔄 Auto-reconnecting to CampusLink server in 3 seconds...")
            time.sleep(3)

    def reconnect(self):
        if self.ws:
            try:
                self.ws.close()
            except Exception:
                pass

    def _on_open(self, ws):
        print("✅ Connected to CampusLink LAN Gateway!")
        if hasattr(self, 'tray_service') and self.tray_service:
            self.tray_service.update_status(connected=True)


    def _on_message(self, ws, message):
        try:
            packet = json.loads(message)
            msg_type = packet.get("type")
            
            if msg_type == "broadcast":
                print(f"\n📩 NEW BROADCAST RECEIVED! Sub-second Delivery.")
                print(f"📢 Title: {packet.get('title')}")
                print(f"📝 Msg:   {packet.get('message')}")
                
                # 1. Play audio chime
                play_alert(is_emergency=packet.get("is_emergency", False))
                
                # 2. Save to offline SQLite cache
                self.storage.save_message(packet)
                
                # 3. Send acknowledgment to server
                ack_packet = {
                    "type": "ack",
                    "broadcast_id": packet.get("broadcast_id"),
                    "client_id": self.client_id
                }
                ws.send(json.dumps(ack_packet))
                
                # 4. Display Glassmorphism Floating Popup Window
                threading.Thread(
                    target=lambda: GlassPopupWindow(packet, server_base_url=self.http_base),
                    daemon=True
                ).start()

            elif msg_type == "remote_command":
                cmd = packet.get("command_type")
                target_url = packet.get("url")
                sender = packet.get("sender_name", "Faculty")
                print(f"\n⚡ REMOTE COMMAND RECEIVED [{cmd.upper()}] from {sender}")
                
                # Play alert chime
                play_alert(is_emergency=(cmd in ["shutdown", "restart"]))

                # Execute Remote Command
                self._handle_remote_command(cmd, target_url)

        except Exception as e:
            print(f"Error handling message packet: {e}")

    def _handle_remote_command(self, cmd_type, url):
        try:
            if cmd_type in ["open_url", "open_pdf"]:
                if url:
                    print(f"🌐 Remote Command: Opening URL -> {url}")
                    webbrowser.open(url)

            elif cmd_type == "open_chrome":
                if url:
                    print(f"🚀 Remote Command: Launching Chrome with URL -> {url}")
                    if sys.platform == "win32":
                        os.system(f'start chrome "{url}"')
                    else:
                        webbrowser.open(url)
                else:
                    print(f"🚀 Remote Command: Launching Chrome Browser")
                    if sys.platform == "win32":
                        os.system('start chrome')
                    else:
                        webbrowser.open("https://google.com")

            elif cmd_type == "lock":
                print("🔒 Remote Command: Locking Workstation Screen")
                if sys.platform == "win32":
                    import ctypes
                    ctypes.windll.user32.LockWorkStation()
                elif sys.platform == "darwin":
                    os.system("pmset displaysleepnow")
                else:
                    os.system("xdg-screensaver lock || gnome-screensaver-command -l")

            elif cmd_type == "restart":
                print("🔄 Remote Command: System Restart Initiated")
                if sys.platform == "win32":
                    os.system('shutdown /r /t 5 /c "CampusLink Remote Command: System Restart"')
                else:
                    os.system('shutdown -r +1 "CampusLink Remote Command: System Restart"')

            elif cmd_type == "shutdown":
                print("⚡ Remote Command: System Shutdown Initiated")
                if sys.platform == "win32":
                    os.system('shutdown /s /t 5 /c "CampusLink Remote Command: System Shutdown"')
                else:
                    os.system('shutdown -h +1 "CampusLink Remote Command: System Shutdown"')

        except Exception as err:
            print(f"⚠️ Error executing remote command {cmd_type}: {err}")


    def _on_error(self, ws, error):
        print(f"WS Error: {error}")

    def _on_close(self, ws, close_status_code, close_msg):
        print("❌ Disconnected from CampusLink server.")

if __name__ == "__main__":
    server_ip = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
    client = CampusLinkClient(server_host=server_ip)
    client.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping client...")
