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

    def start_service():
        ip = entry_ip.get().strip()
        if not ip:
            messagebox.showerror("Error", "Please enter a valid Server IP address")
            return
        
        root.withdraw()
        print(f"Starting CampusLink Client connecting to {ip}...")
        client = CampusLinkClient(server_host=ip)
        client.start()

    btn_connect = tk.Button(root, text="🔌 Connect & Start Service", font=("Segoe UI", 10, "bold"), fg="#ffffff", bg="#4f46e5", activebackground="#4338ca", bd=0, padx=15, pady=8, command=start_service)
    btn_connect.pack(pady=15)

    root.mainloop()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        ip = sys.argv[1]
        client = CampusLinkClient(server_host=ip)
        client.start()
        import time
        while True:
            time.sleep(1)
    else:
        launch_gui()
