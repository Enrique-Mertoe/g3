import os.path
from pathlib import Path

BASE_PATH = Path(os.path.dirname(os.path.abspath(__file__)))
VPN_DIR = Path("/etc/openvpn")

ALLOWED_ORIGINS = ['https://yourdomain.com', 'http://127.0.0.1:5000', "http://localhost:5173"]

CORS_TRUSTED_ORIGINS = ["https://yourdomain.com", "http://localhost:5173"]
