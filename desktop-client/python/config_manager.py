import os
import json
import sys
import winreg

CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
REG_PATH = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "CampusLinkBackgroundService"

DEFAULT_CONFIG = {
    "server_host": "127.0.0.1",
    "server_port": 8000,
    "autostart": True,
    "silent_mode": True
}

class ConfigManager:
    def __init__(self):
        self.config = self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {**DEFAULT_CONFIG, **data}
            except Exception as e:
                print(f"Config load error: {e}")
        return DEFAULT_CONFIG.copy()

    def save_config(self, new_config=None):
        if new_config:
            self.config.update(new_config)
        try:
            with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=4)
        except Exception as e:
            print(f"Config save error: {e}")

    def get(self, key, default=None):
        return self.config.get(key, default)

    def set_autostart(self, enable=True):
        self.config["autostart"] = enable
        self.save_config()

        if sys.platform != "win32":
            return

        script_dir = os.path.dirname(os.path.abspath(__file__))
        vbs_path = os.path.join(script_dir, "run_silent.vbs")

        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_PATH, 0, winreg.KEY_ALL_ACCESS)
            if enable:
                cmd = f'wscript.exe "{vbs_path}"'
                winreg.SetValueEx(key, APP_NAME, 0, winreg.REG_SZ, cmd)
                print("✅ Windows Auto-Start registered in Registry.")
            else:
                try:
                    winreg.DeleteValue(key, APP_NAME)
                    print("❌ Windows Auto-Start removed from Registry.")
                except FileNotFoundError:
                    pass
            winreg.CloseKey(key)
        except Exception as e:
            print(f"Registry update error: {e}")

    def is_autostart_enabled(self):
        if sys.platform != "win32":
            return False
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_PATH, 0, winreg.KEY_READ)
            value, _ = winreg.QueryValueEx(key, APP_NAME)
            winreg.CloseKey(key)
            return True
        except FileNotFoundError:
            return False
        except Exception:
            return False
