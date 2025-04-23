import os
import random
import re
import subprocess

import settings
from main.dir_manager import VPNManager


def check_dirs():
    print("BASE_PATH: ", settings.BASE_PATH)
    print("VPN_PATH: ", settings.VPN_DIR)

    # vpn items
    vpn = settings.VPN_DIR
    if vpn.exists():
        directories = [p for p in vpn.iterdir()]
        print("VPN_DIR_ITEMS: ", directories)
    else:
        print("VPN_PATH doesnt exist")

    # test_easy_rsa()


def generate_client_name(prefix="client", min_id=1, max_id=9999):
    client_id = random.randint(min_id, max_id)
    return f"{prefix}{client_id}"


def test_easy_rsa():
    client_name = generate_client_name()
    ersa = VPNManager.get("server", "easy-rsa")
    os.chdir(ersa)
    sanitized_client = re.sub(r'[^0-9a-zA-Z_-]', '_', client_name)

    if not sanitized_client:
        print("Invalid client name.")
        return False
    p = subprocess.run([
        "./easyrsa",
        "--batch",
        "--days=3650",
        "build-client-full",
        sanitized_client,
        "nopass"
    ], check=True)
