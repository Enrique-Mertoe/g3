import datetime
import os
import re
import subprocess
from pathlib import Path
import socket
from flask import send_file, abort, Response
import os
from pathlib import Path
import mimetypes

from flask import render_template

import settings
from main.exceptions import PathError


class VPNManager:
    BASE = settings.VPN_DIR
    
    @classmethod
    def getIpAddress(cls,provision_identity):
        """Get client IP from OpenVPN status log file"""
        try:
            print(f"Getting IP for provision_identity: {provision_identity}")
            
            # Path to the OpenVPN status log file
            status_file = "/var/log/openvpn/openvpn-status.log"
            
            if not os.path.exists(status_file):
                print(f"OpenVPN status file not found at {status_file}")
                return jsonify({"error": "OpenVPN status file not found"}), 404
                
            # Read and parse the status file
            with open(status_file, 'r') as f:
                content = f.read()
                
            print("\nOpenVPN Status Log Content:")
            print("-" * 50)
            print(content)
            print("-" * 50)
            
            # Re-read for actual parsing
            with open(status_file, 'r') as f:
                lines = f.readlines()
            
            # Find both CLIENT_LIST and ROUTING_TABLE sections
            client_list_section = False
            routing_table_section = False
            headers = {}
            
            for line in lines:
                line = line.strip()
                
                # Detect section headers
                if line.startswith("HEADER,CLIENT_LIST,"):
                    client_headers = line.split(',')[2:]  # Skip "HEADER" and "CLIENT_LIST"
                    headers["CLIENT_LIST"] = client_headers
                    client_list_section = True
                    routing_table_section = False
                    continue
                    
                if line.startswith("HEADER,ROUTING_TABLE,"):
                    routing_headers = line.split(',')[2:]  # Skip "HEADER" and "ROUTING_TABLE"
                    headers["ROUTING_TABLE"] = routing_headers
                    routing_table_section = True
                    client_list_section = False
                    continue
                    
                # Process CLIENT_LIST entries
                if line.startswith("CLIENT_LIST,"):
                    parts = line.split(',')
                    if len(parts) > 1:
                        common_name = parts[1]
                        real_address = parts[2].split(':')[0] if len(parts) > 2 else None
                        virtual_address = parts[3] if len(parts) > 3 else None
                        
                        print(f"Client entry - Common Name: '{common_name}', Real Address: '{real_address}', Virtual: '{virtual_address}'")
                        
                        # Try to match by common name
                        if common_name == provision_identity:
                            ip = virtual_address if virtual_address and virtual_address.strip() else real_address
                            print(f"Found client match by common name: {provision_identity}, IP: {ip}")
                            return jsonify({"ip": ip}), 200
                            
                # Process ROUTING_TABLE entries
                if line.startswith("ROUTING_TABLE,"):
                    parts = line.split(',')
                    if len(parts) > 2:
                        virtual_address = parts[1]
                        common_name = parts[2]
                        
                        print(f"Routing entry - Virtual Address: '{virtual_address}', Common Name: '{common_name}'")
                        
                        # Try to match by common name
                        if common_name == provision_identity:
                            print(f"Found routing match by common name: {provision_identity}, IP: {virtual_address}")
                            return jsonify({"ip": virtual_address}), 200
            
            # If client is not found in the standard entries, let's check if there's any connection with a matching IP
            # This is a fallback for non-standard configurations
            for line in lines:
                line = line.strip()
                parts = line.split(',')
                
                # Look for any line that contains the provision identity
                if provision_identity in line:
                    print(f"Found line containing '{provision_identity}': {line}")
                    
                    # Extract IP-like strings from the line
                    import re
                    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
                    ips = re.findall(ip_pattern, line)
                    
                    if ips:
                        print(f"Found potential IP(s) in line containing '{provision_identity}': {ips}")
                        return jsonify({"ip": ips[0]}), 200
            
            print(f"\nNo client found with provision_identity: {provision_identity}")
            return jsonify({"error": "Client not connected"}), 404
            
        except Exception as e:
            print(f"Error reading status file: {str(e)}")
            return jsonify({"error": f"Error reading status file: {str(e)}"}), 500


    @classmethod
    def download_client_config(cls, client_name):
        """
        Takes a client name and returns the .ovpn file for automatic download
        
        Usage example: /download_config/Alpha1_Ndesa1150415666
        """
        try:
            # Sanitize the client name to prevent path traversal attacks
            if not client_name or '../' in client_name or '/' in client_name:
                abort(400, "Invalid client name")
                
            # Get the path to the client's .ovpn file
            client_file = settings.VPN_DIR.joinpath("client", f"{client_name}.ovpn")
            
            # Check if the file exists
            if not client_file.exists() or not client_file.is_file():
                abort(404, f"Client configuration for {client_name} not found")
                
            # Set the correct MIME type for .ovpn files
            mimetype = "application/x-openvpn-profile"
            
            # Return the file for download with the proper filename
            return send_file(
                client_file,
                mimetype=mimetype,
                as_attachment=True,
                download_name=f"{client_name}.ovpn"
            )
            
        except Exception as e:
            abort(500, f"Error processing request: {str(e)}")

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
                    print(line)

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
        print(cls.BASE.joinpath("client", client_name + ".ovpn").exists())
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
        current_dir = os.getcwd()
        os.chdir(ersa)
        subprocess.run([
            "./easyrsa",
            "--batch",
            "--days=3650",
            "build-client-full",
            sanitized_client,
            "nopass"
        ], check=True)
        print(f"Certificate generated for {sanitized_client}")

        common = cls.get("server", "client-common.txt")
        ca = cls.get("server", "easy-rsa", "pki", "ca.crt")
        cert = cls.get("server", "easy-rsa", "pki", "issued", sanitized_client + ".crt")
        key = cls.get("server", "easy-rsa", "pki", "private", sanitized_client + ".key")
        cls._check_exists(ersa, common, ca, cert, key)
        match = re.search(r'remote\s+(\d+\.\d+\.\d+\.\d+)', common.read_text())
        remote_ip = match.group(1) if match else "Invalid"
        ca = ca.read_text()
        cert = subprocess.run(f"sed -ne '/BEGIN CERTIFICATE/,$ p' {cert}", shell=True, check=True, text=True,
                              capture_output=True).stdout

        key = key.read_text()
        tls_cmd = f"sed -ne '/BEGIN OpenVPN Static key/,$ p' {cls.get('server', 'ta.key')}"
        tls = subprocess.run(tls_cmd, shell=True, check=True, text=True, capture_output=True).stdout
        template = render_template("cert.ovpn",
                                   ca=ca.strip(),
                                   cert=cert.strip(),
                                   key=key.strip(),
                                   tls=False,
                                   ip=remote_ip)
        print(f"Template rendered for {template}")
        cls.save_client(sanitized_client, template)
        os.chdir(current_dir)
        print(f"Client saved for {sanitized_client}")
        return True

    @classmethod
    def revoke(cls, client_name):
        try:
            ersa = cls.get("server", "easy-rsa")
            pki = ersa / "pki"
            crl_source = pki / "crl.pem"
            crl_dest = cls.get("server", "crl.pem")
            group_name = "nogroup"  # Adjust if your OpenVPN uses a different group

            if not ersa.exists():
                raise FileNotFoundError(f"Easy-RSA path not found: {ersa}")

            os.chdir(ersa)

            # Revoke certificate
            subprocess.run(["./easyrsa", "--batch", "revoke", client_name], check=True)

            # Generate new CRL valid for 10 years
            subprocess.run(["./easyrsa", "--batch", "--days=3650", "gen-crl"], check=True)

            # Remove certificate-related files
            req_file = pki / "reqs" / f"{client_name}.req"
            key_file = pki / "private" / f"{client_name}.key"

            for file_path in [crl_dest, req_file, key_file]:
                try:
                    if file_path.exists():
                        file_path.unlink()
                except Exception as e:
                    print(f"Warning: Could not delete {file_path}: {e}")

            # Copy updated CRL to OpenVPN server directory
            subprocess.run(["cp", str(crl_source), str(crl_dest)], check=True)

            # Set proper permissions (OpenVPN reads CRL as 'nobody')
            subprocess.run(["chown", f"nobody:{group_name}", str(crl_dest)], check=True)

            print(f"\n{client_name} revoked!")

            # Restart OpenVPN service (optional but useful)
            subprocess.run(["systemctl", "restart", "openvpn-server@server"], check=False)
            subprocess.run(["systemctl", "restart", "openvpn"], check=False)

        except subprocess.CalledProcessError as e:
            print(f"Error during revocation process: {e}")
        except Exception as ex:
            print(f"Unexpected error: {ex}")

    @classmethod
    def delete_client(cls,client_name):
        try:
            cls.revoke(client_name)
        except:
            pass
        # Remove client config
        client = cls.get("client",client_name+".ovpn")
        if client.exists():
            client.unlink(missing_ok=True)

    @staticmethod
    def get_logs(lines=100):
        """Get the last N lines from the OpenVPN log file"""
        log_path = Path('/var/log/openvpn/openvpn-status.log')  # Adjust path as needed
        if not log_path.exists():
            return []

        try:
            result = subprocess.run(
                ['tail', f'-{lines}', str(log_path)],
                capture_output=True, text=True, check=True
            )
            return result.stdout.splitlines()
        except subprocess.CalledProcessError:
            return ["Error reading logs"]

    @staticmethod
    def tail_logs():
        """Generator that yields new log lines as they appear"""
        log_path = Path('/var/log/openvpn/openvpn-status.log')  # Adjust path as needed

        if not log_path.exists():
            yield "Log file not found"
            return

        # Start a process to tail the logs
        process = subprocess.Popen(
            ['tail', '-f', str(log_path)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )

        try:
            while True:
                line = process.stdout.readline()
                if line:
                    yield line.rstrip()
                else:
                    break
        except GeneratorExit:
            # This will be raised when the generator is closed
            process.terminate()
        except Exception as e:
            yield f"Error: {str(e)}"
            process.terminate()