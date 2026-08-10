import threading
import sys
import os
from PIL import Image, ImageDraw

class SystemTrayService:
    def __init__(self, client_instance, config_manager):
        self.client = client_instance
        self.config = config_manager
        self.icon = None

    def _create_image(self, connected=True):
        # Generate a sleek 64x64 icon dynamically
        width = 64
        height = 64
        image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        dc = ImageDraw.Draw(image)
        
        # Outer circle background
        color = (16, 185, 129, 255) if connected else (239, 68, 68, 255)
        dc.ellipse((4, 4, 60, 60), fill=(15, 23, 42, 255), outline=color, width=4)
        
        # Inner active dot
        dc.ellipse((22, 22, 42, 42), fill=color)
        
        return image

    def start(self):
        try:
            import pystray
            from pystray import MenuItem as item
        except ImportError:
            print("⚠️ pystray not installed. Running background service without tray icon.")
            return

        def on_toggle_autostart(icon, item):
            current = self.config.get("autostart", True)
            self.config.set_autostart(not current)

        def on_reconnect(icon, item):
            if self.client and hasattr(self.client, 'reconnect'):
                self.client.reconnect()

        def on_exit(icon, item):
            if self.client:
                self.client.running = False
                if self.client.ws:
                    self.client.ws.close()
            icon.stop()
            sys.exit(0)

        server_ip = self.config.get("server_host", "127.0.0.1")

        menu = pystray.Menu(
            item(f'CampusLink Background Service', lambda: None, enabled=False),
            item(f'Server IP: {server_ip}', lambda: None, enabled=False),
            pystray.Menu.SEPARATOR,
            item('🔄 Reconnect to Gateway', on_reconnect),
            item('🚀 Start on Windows Boot', on_toggle_autostart, checked=lambda item: self.config.get("autostart", True)),
            pystray.Menu.SEPARATOR,
            item('❌ Exit Service', on_exit)
        )

        self.icon = pystray.Icon(
            "CampusLink",
            self._create_image(connected=True),
            "CampusLink Silent Service (Active)",
            menu
        )

        threading.Thread(target=self.icon.run, daemon=True).start()

    def update_status(self, connected=True):
        if self.icon:
            self.icon.icon = self._create_image(connected)
            self.icon.title = f"CampusLink Service ({'Online' if connected else 'Connecting...'})"
