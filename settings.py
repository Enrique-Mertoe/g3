import os.path
from pathlib import Path

BASE_PATH = Path(os.path.dirname(os.path.abspath(__file__)))
VPN_DIR = Path("/etc/openvpn")

ALLOWED_ORIGINS = ['https://isp3.lomtechnology.com', 'http://127.0.0.1:5000', "http://localhost:5173"]

CORS_TRUSTED_ORIGINS = ["https://isp3.lomtechnology.com", "http://localhost:5173"]

CONFIG = {
    "require_api_key": False,  # Set to True to enable API key authentication
    "api_keys": ["your_secure_api_key_here"],  # List of valid API keys
    "router_host": "192.168.1.1",  # Default router address (can be overridden if needed)
    "router_port": 8728,  # Default RouterOS API port
    "connection_timeout": 10,  # Connection timeout in seconds
    "command_whitelist": None,  # Set to list of allowed commands or None to allow all
}
