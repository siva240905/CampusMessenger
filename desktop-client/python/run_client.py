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
    saved_ip = config.get("server_host", "127.0.0.1")

    root = tk.Tk()
    root.title("CampusLink Student Client Setup")
    root.geometry("400x270")
    root.configure(bg="#0f172a")
    root.resizable(False, False)

    lbl_title = tk.Label(root, text="CampusLink Student Client", font=("Segoe UI", 14, "bold"), fg="#ffffff", bg="#0f172a")
    lbl_title.pack(pady=(20, 5))

    lbl_sub = tk.Label(root, text="Connect to College Faculty LAN Broadcast Server", font=("Segoe UI", 9), fg="#94a3b8", bg="#0f172a")
    lbl_sub.pack(pady=(0, 15))

    frame_input = tk.Frame(root, bg="#0f172a")
    frame_input.pack(pady=5)

    lbl_ip = tk.Label(frame_input, text="Faculty Server IP:", font=("Segoe UI", 10, "bold"), fg="#cbd5e1", bg="#0f172a")
    lbl_ip.grid(row=0, column=0, padx=5, sticky="e")

    entry_ip = tk.Entry(frame_input, font=("Consolas", 11), bg="#1e293b", fg="#ffffff", insertbackground="white", bd=1, relief="solid")
    entry_ip.insert(0, saved_ip)
    entry_ip.grid(row=0, column=1, padx=5, ipady=4)

    def start_service():
        ip = entry_ip.get().strip()
        if not ip:
            messagebox.showerror("Error", "Please enter a valid Server IP address")
            return
        
        root.destroy()
        run_service(ip, is_silent=True)

    btn_connect = tk.Button(root, text="🔌 Connect & Start Background Service", font=("Segoe UI", 10, "bold"), fg="#ffffff", bg="#4f46e5", activebackground="#4338ca", bd=0, padx=15, pady=8, command=start_service)
    btn_connect.pack(pady=15)

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

