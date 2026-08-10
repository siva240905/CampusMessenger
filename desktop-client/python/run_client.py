import tkinter as tk
from tkinter import ttk, messagebox
import sys
import os
import threading
from client import CampusLinkClient

def launch_gui():
    root = tk.Tk()
    root.title("CampusLink Student Client Setup")
    root.geometry("400x260")
    root.configure(bg="#0f172a")
    root.resizable(False, False)

    lbl_title = tk.Label(root, text="CampusLink Student Client", font=("Segoe UI", 14, "bold"), fg="#ffffff", bg="#0f172a")
    lbl_title.pack(pady=(20, 5))

    lbl_sub = tk.Label(root, text="Connect to College Faculty LAN Broadcast Server", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a")
    lbl_sub.pack(pady=(0, 15))

    frame_input = tk.Frame(root, bg="#0f172a")
    frame_input.pack(pady=10)

    lbl_ip = tk.Label(frame_input, text="Faculty Server IP:", font=("Segoe UI", 10, "bold"), fg="#cbd5e1", bg="#0f172a")
    lbl_ip.grid(row=0, column=0, padx=5, sticky="e")

    entry_ip = tk.Entry(frame_input, font=("Consolas", 11), bg="#1e293b", fg="#ffffff", insertbackground="white", bd=1, relief="solid")
    entry_ip.insert(0, "127.0.0.1")
    entry_ip.grid(row=0, column=1, padx=5, ipady=4)

from config_manager import ConfigManager
from tray_service import SystemTrayService

def run_service(server_ip, is_silent=False):
    config = ConfigManager()
    if server_ip:
        config.save_config({"server_host": server_ip})
    else:
        server_ip = config.get("server_host", "127.0.0.1")

    print(f"🚀 CampusLink Background Service starting silently (Server IP: {server_ip})...")
    client = CampusLinkClient(server_host=server_ip)
    
    # Initialize System Tray Icon
    tray = SystemTrayService(client, config)
    client.tray_service = tray
    tray.start()

    client.start()

    import time
    try:
        while client.running:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping CampusLink Service...")

def launch_gui():
    config = ConfigManager()
    saved_ip = config.get("server_host", "https://campusmessenger-backend.onrender.com")

    root = tk.Tk()
    root.title("CampusLink Student Client Setup")
    root.geometry("450x300")
    root.configure(bg="#0f172a")
    root.resizable(False, False)

    lbl_title = tk.Label(root, text="CampusLink Student Client", font=("Segoe UI", 14, "bold"), fg="#ffffff", bg="#0f172a")
    lbl_title.pack(pady=(15, 2))

    lbl_sub = tk.Label(root, text="Connect to Faculty Cloud Server or Local LAN Server", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a")
    lbl_sub.pack(pady=(0, 12))

    frame_input = tk.Frame(root, bg="#0f172a")
    frame_input.pack(pady=5)

    lbl_ip = tk.Label(frame_input, text="Server Host / IP:", font=("Segoe UI", 9, "bold"), fg="#cbd5e1", bg="#0f172a")
    lbl_ip.grid(row=0, column=0, padx=5, sticky="e")

    entry_ip = tk.Entry(frame_input, font=("Consolas", 10), bg="#1e293b", fg="#ffffff", insertbackground="white", bd=1, relief="solid", width=32)
    entry_ip.insert(0, saved_ip)
    entry_ip.grid(row=0, column=1, padx=5, ipady=4)

    frame_presets = tk.Frame(root, bg="#0f172a")
    frame_presets.pack(pady=8)

    def set_cloud():
        entry_ip.delete(0, tk.END)
        entry_ip.insert(0, "https://campusmessenger-backend.onrender.com")

    def set_local():
        entry_ip.delete(0, tk.END)
        entry_ip.insert(0, "127.0.0.1")

    btn_cloud = tk.Button(frame_presets, text="🌐 Cloud Server", font=("Segoe UI", 8, "bold"), fg="#38bdf8", bg="#1e293b", activebackground="#334155", bd=1, relief="solid", command=set_cloud)
    btn_cloud.pack(side="left", padx=4)

    btn_local = tk.Button(frame_presets, text="💻 Local LAN (127.0.0.1)", font=("Segoe UI", 8, "bold"), fg="#a7f3d0", bg="#1e293b", activebackground="#334155", bd=1, relief="solid", command=set_local)
    btn_local.pack(side="left", padx=4)

    def start_service():
        ip = entry_ip.get().strip()
        if not ip:
            messagebox.showerror("Error", "Please enter a valid Server IP or Host address")
            return
        
        root.destroy()
        run_service(ip, is_silent=True)

    btn_connect = tk.Button(root, text="🔌 Connect & Start Background Service", font=("Segoe UI", 10, "bold"), fg="#ffffff", bg="#4f46e5", activebackground="#4338ca", bd=0, padx=15, pady=8, command=start_service)
    btn_connect.pack(pady=12)

    root.mainloop()

if __name__ == "__main__":
    is_silent = "--silent" in sys.argv or "--service" in sys.argv
    custom_ip = None
    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            custom_ip = arg
            break

    if is_silent or custom_ip:
        run_service(custom_ip, is_silent=is_silent)
    else:
        launch_gui()

