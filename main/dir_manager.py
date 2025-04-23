import datetime
import os
import re
import subprocess
from pathlib import Path

from flask import render_template

import settings
from main.exceptions import PathError


class VPNManager:
    BASE = settings.VPN_DIR

    @classmethod
    def get(cls, *path):
        return cls.BASE.joinpath(*path)

    @classmethod
    def save_client(cls, name: str, content: str):
        path = cls.BASE.joinpath("client")
        if not path.exists():
            raise PathError
        path = path.joinpath(name + ".ovpn")
        path.write_text(content)

    @classmethod
    def get_clients(cls):
        clients = {}
        path = cls.BASE.joinpath("client")
        if not path.exists():
            return clients
        for file in path.iterdir():
            if file.suffix == '.ovpn' and file.is_file():
                client_name = file.stem  # gets filename without extension
                stat = file.stat()
                clients[client_name] = {
                    'created': datetime.datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                    'file_size': stat.st_size
                }
        return clients

    @classmethod
    def get_connected_clients(cls):
        connected = {}
        status_path = Path("/var/log/openvpn/openvpn-status.log")

        if status_path.exists():
            try:
                lines = status_path.read_text().splitlines()
                client_section = False

                for line in lines:
                    stripped = line.strip()

                    if stripped == "ROUTING TABLE":
                        client_section = False
                        continue

                    if client_section and stripped and not stripped.startswith('Common Name'):
                        parts = stripped.split(',')
                        if len(parts) >= 3:
                            client_name = parts[0]
                            real_ip = parts[1]
                            vpn_ip = parts[2].split(':')[0]
                            connected_since = parts[3] if len(parts) > 3 else 'Unknown'
                            connected[client_name] = {
                                'real_ip': real_ip,
                                'vpn_ip': vpn_ip,
                                'last_seen': connected_since
                            }

                    if stripped == "CLIENT LIST":
                        client_section = True

            except Exception as e:
                print(f"Error reading VPN status: {e}")

        return connected

    @classmethod
    def exists(cls, client_name: str):
        return cls.BASE.joinpath("client", client_name + ".ovpn").exists()

    @classmethod
    def _check_exists(cls, *args):
        for arg in args:
            if not arg.exists():
                raise PathError(arg.name)

    @classmethod
    def gen_cert(cls, client):
        sanitized_client = re.sub(r'[^0-9a-zA-Z_-]', '_', client)

        if not sanitized_client:
            print("Invalid client name.")
            return False

        ersa = cls.get("server", "easy-rsa")
        if not ersa.exists():
            raise PathError
        os.chdir(ersa)
        subprocess.run([
            "./easyrsa",
            "--batch",
            "--days=3650",
            "build-client-full",
            sanitized_client,
            "nopass"
        ], check=True)

        common = cls.get("server", "client-common.txt")
        ca = cls.get("server", "easy-rsa", "pki", "ca.crt")
        cert = cls.get("server", "easy-rsa", "pki", "issued", sanitized_client + ".crt")
        key = cls.get("server", "easy-rsa", "pki", "private", sanitized_client + ".key")
        cls._check_exists(ersa, common, ca, cert, key)
        common = common.read_text()
        ca = ca.read_text()
        cert = subprocess.run(f"sed -ne '/BEGIN CERTIFICATE/,$ p' {cert}",shell=True, check=True, text=True, capture_output=True).stdout

        key = key.read_text()

        tls_cmd = f"sed -ne '/BEGIN OpenVPN Static key/,$ p' {cls.get('server','tc.key')}"
        tls = subprocess.run(tls_cmd, shell=True, check=True, text=True, capture_output=True).stdout
        template = render_template("cert.ovpn.html",
                                   ca=ca,
                                   cert=cert,
                                   key=key,
                                   tls=tls,
                                   common=common)
        cls.save_client(sanitized_client, template)
        return True
