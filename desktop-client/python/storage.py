import sqlite3
import os
from datetime import datetime

class OfflineStorage:
    def __init__(self, db_path="client_cache.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                broadcast_id TEXT UNIQUE,
                title TEXT,
                message TEXT,
                url TEXT,
                file_path TEXT,
                image_path TEXT,
                priority TEXT,
                is_emergency INTEGER,
                received_at TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def save_message(self, msg_data):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO messages 
                (broadcast_id, title, message, url, file_path, image_path, priority, is_emergency, received_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                msg_data.get('broadcast_id'),
                msg_data.get('title'),
                msg_data.get('message'),
                msg_data.get('url'),
                msg_data.get('file'),
                msg_data.get('image'),
                msg_data.get('priority', 'normal'),
                1 if msg_data.get('is_emergency') else 0,
                msg_data.get('timestamp', datetime.now().isoformat())
            ))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving to offline storage: {e}")

    def get_all_messages(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM messages ORDER BY id DESC LIMIT 50')
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
