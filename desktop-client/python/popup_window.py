import tkinter as tk
from tkinter import ttk
import webbrowser
import os
import time
import requests
from io import BytesIO
try:
    from PIL import Image, ImageTk
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

class GlassPopupWindow:
    def __init__(self, data, server_base_url="http://127.0.0.1:8000"):
        self.data = data
        self.server_base_url = server_base_url.rstrip("/")
        self.photo_ref = None # Prevent garbage collection of Tkinter PhotoImage
        
        media_path = data.get("image") or data.get("media")
        is_video = False
        if media_path:
            is_video = media_path.lower().endswith(('.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'))
        
        self.root = tk.Tk()
        self.root.title("CampusLink Announcement")
        self.root.overrideredirect(True) # Borderless floating window
        self.root.attributes("-topmost", True) # Always on top
        
        # Dimensions & Desktop Placement (Dynamically height-adjusted)
        width = 480
        base_height = 240
        if data.get("url"):
            base_height += 50
        if media_path:
            base_height += 140 if (HAS_PIL and not is_video) else 60
            
        height = base_height
        screen_width = self.root.winfo_screenwidth()
        screen_height = self.root.winfo_screenheight()
        
        # Bottom-right corner with padding
        x = screen_width - width - 24
        y = screen_height - height - 60
        self.root.geometry(f"{width}x{height}+{x}+{y}")
        
        # Dark Glassmorphism Styling
        bg_color = "#0f172a" # Slate 900
        border_color = "#f43f5e" if data.get("is_emergency") else "#6366f1"
        
        self.root.configure(bg=border_color)
        
        main_frame = tk.Frame(self.root, bg=bg_color, bd=0)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=2, pady=2)
        
        # Header Banner
        header_bg = "#881337" if data.get("is_emergency") else "#1e1b4b"
        header_frame = tk.Frame(main_frame, bg=header_bg, pady=8, padx=12)
        header_frame.pack(fill=tk.X)
        
        priority_label = "[ EMERGENCY ALERT ]" if data.get("is_emergency") else f"[ {data.get('priority', 'normal').upper()} PRIORITY ]"
        lbl_prio = tk.Label(header_frame, text=priority_label, font=("Segoe UI", 9, "bold"), fg="#fecdd3" if data.get("is_emergency") else "#a5b4fc", bg=header_bg)
        lbl_prio.pack(side=tk.LEFT)
        
        btn_close = tk.Button(header_frame, text=" ✕ Close ", font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#e11d48" if data.get("is_emergency") else "#334155", bd=0, activebackground="#f43f5e", activeforeground="#ffffff", command=self.close)
        btn_close.pack(side=tk.RIGHT)
        
        # Title & Body Content
        body_frame = tk.Frame(main_frame, bg=bg_color, padx=14, pady=10)
        body_frame.pack(fill=tk.BOTH, expand=True)
        
        title_text = data.get("title", "Campus Notice")
        lbl_title = tk.Label(body_frame, text=title_text, font=("Segoe UI", 12, "bold"), fg="#ffffff", bg=bg_color, anchor="w", justify="left", wraplength=440)
        lbl_title.pack(fill=tk.X, pady=(0, 4))
        
        msg_text = data.get("message", "")
        lbl_msg = tk.Label(body_frame, text=msg_text, font=("Segoe UI", 9.5), fg="#cbd5e1", bg=bg_color, anchor="w", justify="left", wraplength=440)
        lbl_msg.pack(fill=tk.X, pady=(0, 6))

        # Photo Image Preview (if image and PIL available)
        if media_path and not is_video and HAS_PIL:
            try:
                img_data = None
                if media_path.startswith("data:"):
                    import base64
                    b64_str = media_path.split(",", 1)[1]
                    raw_bytes = base64.b64decode(b64_str)
                    img_data = Image.open(BytesIO(raw_bytes))
                else:
                    full_img_url = media_path if media_path.startswith("http") else f"{self.server_base_url}{media_path}"
                    resp = requests.get(full_img_url, timeout=3)
                    if resp.status_code == 200:
                        img_data = Image.open(BytesIO(resp.content))

                if img_data:
                    img_data.thumbnail((440, 120))
                    self.photo_ref = ImageTk.PhotoImage(img_data)
                    lbl_img_preview = tk.Label(body_frame, image=self.photo_ref, bg="#020617", bd=1, relief="solid")
                    lbl_img_preview.pack(fill=tk.X, pady=(2, 6))
            except Exception as e:
                print(f"Failed to load image preview: {e}")
        
        # Selectable URL Input Box if URL exists
        if data.get("url"):
            url_frame = tk.Frame(body_frame, bg="#1e293b", padx=6, pady=4)
            url_frame.pack(fill=tk.X, pady=(4, 6))
            
            lbl_url_tag = tk.Label(url_frame, text="URL:", font=("Segoe UI", 8, "bold"), fg="#94a3b8", bg="#1e293b")
            lbl_url_tag.pack(side=tk.LEFT, padx=(0, 4))
            
            entry_url = tk.Entry(url_frame, font=("Consolas", 9), fg="#38bdf8", bg="#0f172a", bd=1, relief="solid", highlightthickness=0)
            entry_url.insert(0, data.get("url"))
            entry_url.config(state="readonly")
            entry_url.pack(side=tk.LEFT, fill=tk.X, expand=True)

        self.status_lbl = tk.Label(body_frame, text="", font=("Segoe UI", 8, "bold"), fg="#34d399", bg=bg_color)
        self.status_lbl.pack(fill=tk.X)

        # Action Buttons Row
        action_frame = tk.Frame(main_frame, bg=bg_color, padx=14, pady=8)
        action_frame.pack(fill=tk.X)
        
        if data.get("url"):
            btn_url = tk.Button(action_frame, text="🔗 Open Link", font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#4f46e5", activebackground="#4338ca", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.open_url)
            btn_url.pack(side=tk.LEFT, padx=(0, 4))
            
            btn_copy_url = tk.Button(action_frame, text="📋 Copy Link", font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#0284c7", activebackground="#0369a1", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.copy_url)
            btn_copy_url.pack(side=tk.LEFT, padx=(0, 4))

        if media_path:
            btn_media_text = "🎬 Play Video" if is_video else "🖼️ View Photo"
            btn_media = tk.Button(action_frame, text=btn_media_text, font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#9333ea", activebackground="#7e22ce", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.open_media)
            btn_media.pack(side=tk.LEFT, padx=(0, 4))

            btn_down_media = tk.Button(action_frame, text="📥 Save Media", font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#0d9488", activebackground="#0f766e", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.download_media)
            btn_down_media.pack(side=tk.LEFT, padx=(0, 4))

        btn_copy_msg = tk.Button(action_frame, text="📝 Copy Text", font=("Segoe UI", 9), fg="#e2e8f0", bg="#334155", activebackground="#475569", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.copy_msg)
        btn_copy_msg.pack(side=tk.LEFT, padx=(0, 4))
            
        if data.get("file"):
            btn_file = tk.Button(action_frame, text="📥 Doc", font=("Segoe UI", 9, "bold"), fg="#ffffff", bg="#059669", activebackground="#047857", activeforeground="#ffffff", bd=0, padx=8, pady=4, command=self.download_file)
            btn_file.pack(side=tk.LEFT, padx=(0, 4))

        # Windows stay on screen until student closes
        self.root.mainloop()

    def open_url(self):
        url = self.data.get("url")
        if url:
            webbrowser.open(url)

    def open_media(self):
        media_path = self.data.get("image") or self.data.get("media")
        if media_path:
            if media_path.startswith("data:"):
                import tempfile
                import base64
                b64_str = media_path.split(",", 1)[1]
                ext = ".png"
                if "video/mp4" in media_path: ext = ".mp4"
                elif "image/jpeg" in media_path: ext = ".jpg"
                temp_file = os.path.join(tempfile.gettempdir(), f"campuslink_media_{os.getpid()}{ext}")
                with open(temp_file, "wb") as f:
                    f.write(base64.b64decode(b64_str))
                webbrowser.open(temp_file)
            else:
                full_url = media_path if media_path.startswith("http") else f"{self.server_base_url}{media_path}"
                webbrowser.open(full_url)

    def download_media(self):
        media_path = self.data.get("image") or self.data.get("media")
        if not media_path:
            return
            
        save_dir = os.path.join(os.path.expanduser("~"), "Downloads")
        
        try:
            if media_path.startswith("data:"):
                import base64
                b64_str = media_path.split(",", 1)[1]
                ext = ".png"
                if "video/mp4" in media_path: ext = ".mp4"
                elif "image/jpeg" in media_path: ext = ".jpg"
                file_name = f"campuslink_media_{int(time.time())}{ext}"
                save_path = os.path.join(save_dir, file_name)
                with open(save_path, "wb") as f:
                    f.write(base64.b64decode(b64_str))
                webbrowser.open(save_dir)
                self.status_lbl.config(text="✓ Media downloaded to Downloads folder!")
            else:
                full_url = media_path if media_path.startswith("http") else f"{self.server_base_url}{media_path}"
                file_name = os.path.basename(media_path)
                save_path = os.path.join(save_dir, file_name)
                r = requests.get(full_url, stream=True, timeout=10)
                if r.status_code == 200:
                    with open(save_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                    webbrowser.open(save_dir)
                    self.status_lbl.config(text="✓ Media downloaded to Downloads folder!")
        except Exception as e:
            print(f"Media download failed: {e}")
            self.status_lbl.config(text=f"⚠️ Download error: {e}")

    def copy_url(self):
        url = self.data.get("url")
        if url:
            self.root.clipboard_clear()
            self.root.clipboard_append(url)
            self.status_lbl.config(text="✓ Link copied to clipboard!")
            self.root.after(3000, lambda: self.status_lbl.config(text=""))

    def copy_msg(self):
        msg = f"{self.data.get('title', '')}\n{self.data.get('message', '')}"
        if self.data.get("url"):
            msg += f"\n{self.data.get('url')}"
        self.root.clipboard_clear()
        self.root.clipboard_append(msg)
        self.status_lbl.config(text="✓ Announcement text copied to clipboard!")
        self.root.after(3000, lambda: self.status_lbl.config(text=""))

    def download_file(self):
        file_rel_path = self.data.get("file")
        if not file_rel_path:
            return
            
        full_url = f"{self.server_base_url}{file_rel_path}"
        file_name = self.data.get("file_name") or os.path.basename(file_rel_path)
        
        save_dir = os.path.join(os.path.expanduser("~"), "Downloads")
        save_path = os.path.join(save_dir, file_name)
        
        try:
            r = requests.get(full_url, stream=True)
            if r.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                webbrowser.open(save_dir)
                self.status_lbl.config(text="✓ File downloaded to Downloads folder!")
        except Exception as e:
            print(f"Download failed: {e}")

    def close(self):
        self.root.destroy()


