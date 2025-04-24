import sqlite3
import json
import threading
import time
from datetime import datetime


class UserCacheManager:
    def __init__(self, db_path="user_cache.db"):
        self.db_path = db_path
        self.lock = threading.Lock()
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    data TEXT,
                    last_updated TIMESTAMP
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS cache_metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
            ''')

    def store_users(self, users):
        with self.lock, sqlite3.connect(self.db_path) as conn:
            # Store each user
            for user in users:
                conn.execute(
                    "INSERT OR REPLACE INTO users (username, data, last_updated) VALUES (?, ?, ?)",
                    (user["username"], json.dumps(user), datetime.now().isoformat())
                )
            # Update last refresh time
            conn.execute(
                "INSERT OR REPLACE INTO cache_metadata (key, value) VALUES (?, ?)",
                ("last_full_refresh", datetime.now().isoformat())
            )

    def get_users(self):
        with self.lock, sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT data FROM users")
            return [json.loads(row[0]) for row in cursor.fetchall()]

    def get_last_refresh_time(self):
        with self.lock, sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT value FROM cache_metadata WHERE key = ?", ("last_full_refresh",))
            result = cursor.fetchone()
            return result[0] if result else None

    def update_refresh_timestamp(self):
        """Update only the last refresh timestamp without changing user data"""
        with self.lock, sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO cache_metadata (key, value) VALUES (?, ?)",
                ("last_full_refresh", datetime.now().isoformat())
            )