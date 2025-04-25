import datetime
import logging
import os
import re
import socket
from typing import List, Dict, Any, Optional, Tuple

from main.api_handlers import run_host_command
from main.cache import UserCacheRefresher
from main.cache.user_cashe import UserCacheManager
from main.config import ConfigManager
from main.model_classes import VPNUser


class VpnManager:
    """
    A class to manage OpenVPN server operations including client management,
    server status monitoring, and administrative tasks.
    """

    def __init__(self,
                 config_dir: str = '/etc/openvpn',
                 log_file: str = '/var/log/openvpn/openvpn-status.log',
                 status_file: str = '/var/log/openvpn/openvpn-status.log',
                 management_host: str = '127.0.0.1',
                 management_port: int = 7505,
                 service_name: str = 'openvpn'):
        """
        Initialize the OpenVPN manager with configuration paths.

        Args:
            config_dir: Directory containing OpenVPN configuration files
            log_file: Path to OpenVPN log file
            status_file: Path to OpenVPN status file
            management_host: Host for OpenVPN management interface
            management_port: Port for OpenVPN management interface
            service_name: Name of the OpenVPN systemd service
        """
        self.config_dir = config_dir
        self.server_conf_dir = config_dir + "/server"
        self.log_file = log_file
        self.status_file = status_file
        self.management_host = management_host
        self.management_port = management_port
        self.service_name = service_name
        self.logger = logging.getLogger('openvpn_manager')
        self.user_cache = UserCacheManager()
        self.cache_refresher = UserCacheRefresher(self, self.user_cache)
        self.cache_refresher.start()
        self.config_manager = ConfigManager(self.server_conf_dir)
        # Ensure the required directories exist and are accessible

        self.cert_dir = os.path.join(self.config_dir, "server/easy-rsa/pki/issued")
        self.crl_path = os.path.join(self.config_dir, "server/easy-rsa/pki/crl.pem")
        self._check_paths()

    def _check_paths(self) -> None:
        """Verify that necessary paths exist and are accessible."""
        if not os.path.exists(self.config_dir):
            self.logger.warning(f"Config directory {self.config_dir} does not exist")

        if not os.path.exists(self.log_file):
            self.logger.warning(f"Log file {self.log_file} does not exist")

        if not os.path.exists(self.status_file):
            self.logger.warning(f"Status file {self.status_file} does not exist")

    def _run_command(self, command: List[str]) -> Tuple[str, str, int]:
        """
        Run a shell command on the host machine using Docker socket.

        Args:
            command: List of command and arguments to execute

        Returns:
            Tuple of (stdout, stderr, return_code)
        """

        command = " ".join(command)

        try:

            res = run_host_command(command)
            stdout = res["stdout"]
            stderr = res["stderr"]
            return stdout, stderr, res['exit_code']
        except Exception as e:
            self.logger.error(f"Error executing command {command}: {str(e)}")
            return "", str(e), 1

    def _connect_management_interface(self) -> Optional[socket.socket]:
        """
        Connect to the OpenVPN management interface.

        Returns:
            Socket connection to management interface or None if failed
        """
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((self.management_host, self.management_port))
            # Read the welcome message
            sock.recv(4096)
            return sock
        except Exception as e:
            self.logger.error(f"Failed to connect to management interface: {str(e)}")
            return None

    def _send_management_command(self, command: str) -> List[str]:
        """
        Send a command to the OpenVPN management interface and get the response.

        Args:
            command: Command to send

        Returns:
            List of response lines from the management interface
        """
        sock = self._connect_management_interface()
        if not sock:
            return []

        try:
            # Send command
            sock.send(f"{command}\n".encode())

            # Wait for response
            response = b""
            while True:
                data = sock.recv(4096)
                if not data:
                    break
                response += data
                # Check if response is complete (ends with "END" or "SUCCESS:")
                if b"END\r\n" in response or b"SUCCESS:" in response:
                    break

            return response.decode().splitlines()
        except Exception as e:
            self.logger.error(f"Error communicating with management interface: {str(e)}")
            return []
        finally:
            sock.close()

    def get_server_status(self) -> Dict[str, Any]:
        """
        Get the current status of the OpenVPN server.

        Returns:
            Dictionary with server status information
        """
        # Check if service is running
        stdout, _, _ = self._run_command(["systemctl", "is-active", self.service_name])
        is_active = stdout.strip() == "active"

        # Get uptime if active
        uptime_seconds = 0
        uptime_str = "0d 0h 0m"

        if is_active:
            # Get process start time
            stdout, _, _ = self._run_command([
                "systemctl", "show", self.service_name,
                "--property=ExecMainStartTimestamp"
            ])

            if stdout:
                # Parse the timestamp (format: ExecMainStartTimestamp=Day YYYY-MM-DD HH:MM:SS UTC)
                match = re.search(r'ExecMainStartTimestamp=(.*)\n', stdout)
                if match:
                    try:
                        start_time_str = match.group(1)
                        start_time = datetime.datetime.strptime(
                            start_time_str,
                            "%a %Y-%m-%d %H:%M:%S %Z"
                        )
                        uptime = datetime.datetime.now() - start_time
                        uptime_seconds = uptime.total_seconds()
                        uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds // 60) % 60}m"
                    except Exception as e:
                        self.logger.error(f"Error parsing service start time: {str(e)}")

        return {
            "status": "online" if is_active else "offline",
            "uptime": uptime_str,
            "uptime_seconds": uptime_seconds
        }

    def get_active_clients(self) -> List[Dict[str, Any]]:
        """
        Get information about currently connected clients.

        Returns:
            List of dictionaries with client information
        """
        clients = []

        # Try using management interface first
        response = self._send_management_command("status")

        # Parse client connections from response
        client_section = False
        for line in response:
            if line.startswith("Common Name,Real Address,Bytes Received,Bytes Sent"):
                client_section = True
                continue
            elif client_section and line.strip() == "ROUTING TABLE" or line.strip() == "GLOBAL STATS":
                break
            elif client_section and line.strip():
                # Parse client line
                parts = line.split(',')
                if len(parts) >= 4:
                    username = parts[0]
                    if username == "UNDEF":
                        continue

                    real_address = parts[1].split(':')[0]  # Remove port number
                    bytes_received = int(parts[2])
                    bytes_sent = int(parts[3])

                    # Get connection time from status log if available
                    connected_since = self._get_client_connect_time(username)

                    clients.append({
                        "username": username,
                        "full_name": username,  # We might not have real names from OpenVPN
                        "ip_address": real_address,
                        "connected_since": connected_since,
                        "download": round(bytes_received / (1024 * 1024 * 1024), 2),  # Convert to GB
                        "upload": round(bytes_sent / (1024 * 1024 * 1024), 2)  # Convert to GB
                    })

        # If management interface failed, try parsing status log
        if not clients and os.path.exists(self.status_file):
            try:
                with open(self.status_file, 'r') as f:
                    content = f.read()

                # Find client list section
                client_sections = re.findall(
                    r'OpenVPN CLIENT LIST.*?\n(.*?)ROUTING TABLE',
                    content,
                    re.DOTALL
                )

                if client_sections:
                    client_lines = client_sections[0].strip().split("\n")[1:]  # Skip header
                    for line in client_lines:
                        parts = line.split(',')
                        if len(parts) >= 4:
                            username = parts[0]
                            if username == "UNDEF":
                                continue

                            real_address = parts[1].split(':')[0]
                            bytes_received = int(parts[2])
                            bytes_sent = int(parts[3])

                            clients.append({
                                "username": username,
                                "full_name": username,
                                "ip_address": real_address,
                                "connected_since": self._get_client_connect_time(username),
                                "download": round(bytes_received / (1024 * 1024 * 1024), 2),
                                "upload": round(bytes_sent / (1024 * 1024 * 1024), 2)
                            })
            except Exception as e:
                self.logger.error(f"Error parsing status file: {str(e)}")

        return clients

    def _get_client_connect_time(self, username: str) -> str:
        """
        Get the time since a client connected.

        Args:
            username: Client username to look for

        Returns:
            String representing time since connection (e.g., "5h 10m ago")
        """
        # Try to find connection time in logs
        try:
            command = ["grep", f"'{username} Connection Initiated'", self.log_file]
            stdout, _, _ = self._run_command(command)

            if stdout:
                # Extract timestamp from log entry
                match = re.search(r'(\w{3} \w{3} \d{1,2} \d{2}:\d{2}:\d{2} \d{4})', stdout)
                if match:
                    timestamp_str = match.group(1)
                    timestamp = datetime.datetime.strptime(timestamp_str, "%a %b %d %H:%M:%S %Y")
                    time_diff = datetime.datetime.now() - timestamp

                    if time_diff.days > 0:
                        return f"{time_diff.days}d ago"
                    elif time_diff.seconds // 3600 > 0:
                        return f"{time_diff.seconds // 3600}h {(time_diff.seconds // 60) % 60}m ago"
                    else:
                        return f"{time_diff.seconds // 60}m ago"

            return "unknown"
        except Exception as e:
            self.logger.error(f"Error getting client connect time: {str(e)}")
            return "unknown"

    def get_resource_usage(self) -> Dict[str, float]:
        """
        Get resource usage of the OpenVPN server.

        Returns:
            Dictionary with CPU, memory, disk, and bandwidth usage percentages
        """
        resource_usage = {
            "cpu": 0.0,
            "memory": 0.0,
            "disk": 0.0,
            "bandwidth": 0.0
        }

        # Get CPU and memory usage for OpenVPN process
        stdout, _, _ = self._run_command([
            "ps", "-C", "openvpn", "-o", "%cpu,%mem", "--no-headers"
        ])

        if stdout:
            parts = stdout.strip().split()
            if len(parts) >= 2:
                try:
                    resource_usage["cpu"] = float(parts[0])
                    resource_usage["memory"] = float(parts[1])
                except ValueError:
                    pass

        # Get disk usage for OpenVPN directory
        stdout, _, _ = self._run_command([
            "df", "-h", self.config_dir
        ])

        if stdout:
            lines = stdout.strip().split("\n")
            if len(lines) >= 2:
                parts = lines[1].split()
                if len(parts) >= 5:
                    try:
                        # Parse percentage like '45%'
                        disk_percent = parts[4].rstrip('%')
                        resource_usage["disk"] = float(disk_percent)
                    except ValueError:
                        pass

        # Estimate bandwidth usage based on active clients
        clients = self.get_active_clients()
        if clients:
            # Calculate total bandwidth usage (arbitrary scale based on client count)
            active_count = len(clients)
            if active_count > 0:
                # This is a very rough estimate - in a real scenario you'd want
                # to monitor actual network interface traffic
                resource_usage["bandwidth"] = min(active_count * 10, 100)

        return resource_usage

    def get_traffic_data(self, period: str = 'day') -> Dict[str, Any]:
        """
        Get network traffic data over a specific period.

        Args:
            period: Time period for data ('day', 'week', 'month')

        Returns:
            Dictionary with labels and traffic data
        """
        # This would ideally come from a real monitoring system that tracks OpenVPN traffic
        # For now, we'll provide a simple implementation that reads the current client data

        # Get current client usage
        clients = self.get_active_clients()
        total_download = sum(client['download'] for client in clients)
        total_upload = sum(client['upload'] for client in clients)

        # Create simulated data based on period and current totals
        if period == 'day':
            labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
            # Distribute total download/upload across hours with some variation
            current_hour = datetime.datetime.now().hour
            download = []
            upload = []

            for i, _ in enumerate(labels):
                hour_block = i * 3
                if hour_block <= current_hour:
                    # For hours that have passed, create realistic looking data
                    factor = 0.7 + 0.6 * (hour_block / 24)  # Traffic increases during the day
                    download.append(round(total_download * factor / len(labels), 2))
                    upload.append(round(total_upload * factor / len(labels), 2))
                else:
                    # For future hours, use zeros
                    download.append(0)
                    upload.append(0)

        elif period == 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            current_day = datetime.datetime.now().weekday()  # 0 = Monday

            download = []
            upload = []
            for i in range(7):
                if i <= current_day:
                    # Weekdays have more traffic than weekends
                    factor = 1.0 if i < 5 else 0.7
                    download.append(round(total_download * factor / 5, 2))
                    upload.append(round(total_upload * factor / 5, 2))
                else:
                    download.append(0)
                    upload.append(0)

        elif period == 'month':
            labels = [f'Week {i + 1}' for i in range(4)]
            current_week = min(3, (datetime.datetime.now().day - 1) // 7)

            download = []
            upload = []
            for i in range(4):
                if i <= current_week:
                    download.append(round(total_download * (i + 1) / 6, 2))
                    upload.append(round(total_upload * (i + 1) / 6, 2))
                else:
                    download.append(0)
                    upload.append(0)

        return {
            "labels": labels,
            "datasets": [
                {
                    "label": "Download",
                    "data": download
                },
                {
                    "label": "Upload",
                    "data": upload
                }
            ]
        }

    def disconnect_client(self, username: str) -> bool:
        """
        Disconnect a client from the OpenVPN server.

        Args:
            username: Username of the client to disconnect

        Returns:
            True if successful, False otherwise
        """
        if not username:
            return False

        # Use management interface to kill the client
        response = self._send_management_command(f"kill {username}")

        # Check if the command was successful
        for line in response:
            if "SUCCESS" in line:
                self.logger.info(f"Successfully disconnected client: {username}")
                return True

        self.logger.warning(f"Failed to disconnect client: {username}")
        return False

    def parse_openvpn_config(self):
        """Parse an OpenVPN configuration file into a structured format"""
        config_file = self.server_conf_dir + "/server.conf"
        if not os.path.exists(config_file):
            return {}

        config = {}
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or line.startswith(';'):
                    continue

                parts = line.split(None, 1)
                directive = parts[0]
                value = parts[1] if len(parts) > 1 else True

                config[directive] = value

        return config

    def restart_server(self) -> bool:
        """
        Restart the OpenVPN server service.

        Returns:
            True if successful, False otherwise
        """
        _, _, return_code = self._run_command(["systemctl", "restart", self.service_name])
        success = return_code == 0

        if success:
            self.logger.info("OpenVPN server restarted successfully")
        else:
            self.logger.error("Failed to restart OpenVPN server")

        return success

    def _get_user_list_internal(self) -> List[Dict[str, Any]]:
        """
        Internal method that does the actual work of getting the user list.
        This is the original get_user_list implementation.
        """
        users = []
        cert_dir = os.path.join(self.config_dir, "server/easy-rsa/pki/issued")
        ovpn_dir = os.path.join(self.config_dir, "client")

        if not os.path.exists(cert_dir):
            self.logger.warning(f"Certificate directory not found: {cert_dir}")
            return users

        # Get list of certificate files
        try:
            cert_files = [f for f in os.listdir(cert_dir) if f.endswith('.crt')]

            for cert_file in cert_files:
                username = cert_file[:-4]  # Remove .crt extension

                # Skip server certificate
                if username == "server":
                    continue

                # Get certificate details
                cert_path = os.path.join(cert_dir, cert_file)
                stdout, _, _ = self._run_command(["openssl", "x509", "-in", cert_path, "-text"])

                # Extract expiry date
                expiry_date = "unknown"
                not_after_match = re.search(r"Not After\s*:\s*(.+)", stdout)
                if not_after_match:
                    expiry_date = not_after_match.group(1).strip()

                # Check if user is active (has a valid certificate that's not revoked)
                active = True
                crl_path = os.path.join(self.config_dir, "server/easy-rsa/pki/crl.pem")
                if os.path.exists(crl_path):
                    stdout, _, _ = self._run_command(["openssl", "crl", "-in", crl_path, "-text"])
                    if username in stdout:
                        active = False

                ovpn_file_path = os.path.join(ovpn_dir, f"{username}.ovpn")
                has_ovpn_file = os.path.exists(ovpn_file_path)

                # Get user's last connection from logs (if possible)
                last_connected = self._get_last_connection_time(username)

                users.append({
                    "username": username,
                    "full_name": username,  # We don't have this info in certs
                    "email": "",  # We don't have this info in certs
                    "created_at": self._get_certificate_creation_time(cert_path),
                    "last_connected": last_connected,
                    "expiry_date": expiry_date,
                    "active": active,
                    "ip": "",  # Only available when connected
                    "download": 0,  # Only available when connected
                    "upload": 0,  # Only available when connected
                    "has_ovpn_file": has_ovpn_file
                })

            # Update user information with connection status for active clients
            active_clients = self.get_active_clients()
            for client in active_clients:
                for user in users:
                    if user["username"] == client["username"]:
                        user["active"] = True
                        user["ip"] = client["ip_address"]
                        user["download"] = client["download"]
                        user["upload"] = client["upload"]
                        break

        except Exception as e:
            self.logger.error(f"Error getting user list: {str(e)}")

        return users

    def get_users(self) -> List[Dict[str, Any]]:
        """Public method to get all VPN users as dictionaries"""
        users = self._get_user_list_internal1()
        return [user.to_dict() for user in users]

    def _get_user_list_internal1(self) -> List[VPNUser]:
        """
        Internal method that does the actual work of getting the user list.
        Returns a list of VPNUser objects.
        """
        users = []

        if not os.path.exists(self.cert_dir):
            self.logger.warning(f"Certificate directory not found: {self.cert_dir}")
            return users

        # Get revoked certificates list first (to avoid calling for each user)
        revoked_users = set()
        if os.path.exists(self.crl_path):
            try:
                stdout = self._run_command(["openssl", "crl", "-in", self.crl_path, "-text"])
                # Extract all revoked certificate common names
                revoked_matches = re.findall(
                    r"Serial Number:.*?\n\s+Revocation Date:.*?\n\s+CRL entry extensions:.*?\n\s+X509v3 Subject Alternative Name:.*?\n\s+DNS:([\w\-]+)",
                    stdout, re.DOTALL)
                revoked_users = set(revoked_matches)
            except Exception as e:
                self.logger.error(f"Error reading CRL: {str(e)}")

        try:
            # Get certificate files
            cert_files = [f for f in os.listdir(self.cert_dir) if f.endswith('.crt') and f != "server.crt"]

            # Get active clients data once (to avoid repeated calls)
            active_clients = {client["username"]: client for client in self.get_active_clients()}

            for cert_file in cert_files:
                username = cert_file[:-4]  # Remove .crt extension

                try:
                    # Create basic user with available data
                    user = VPNUser(
                        username=username,
                        active=username not in revoked_users,
                        created_at=self._get_certificate_creation_time(os.path.join(self.cert_dir, cert_file))
                    )

                    # Get certificate details
                    cert_path = os.path.join(self.cert_dir, cert_file)
                    stdout = self._run_command(["openssl", "x509", "-in", cert_path, "-text"])

                    # Extract expiry date
                    not_after_match = re.search(r"Not After\s*:\s*(.+)", stdout)
                    if not_after_match:
                        user.expiry_date = not_after_match.group(1).strip()

                    # Get user's last connection from logs
                    user.last_connected = self._get_last_connection_time(username)

                    # Update with connection status if active
                    if username in active_clients:
                        client = active_clients[username]
                        user.active = True
                        user.ip = client["ip_address"]
                        user.download = client["download"]
                        user.upload = client["upload"]

                    users.append(user)

                except Exception as e:
                    self.logger.error(f"Error processing certificate for {username}: {str(e)}")
                    continue

        except Exception as e:
            self.logger.error(f"Error listing certificates: {str(e)}")

        return users

    def get_user_list(self) -> List[Dict[str, Any]]:
        """
        Get list of all OpenVPN users (from certificates).

        Returns:
            List of dictionaries with user information
        """
        users = self.user_cache.get_users()

        # If cache is empty, try to populate it immediately but with a timeout
        if not users:
            self.logger.info("User cache empty, triggering background refresh")
            self.cache_refresher.force_refresh()
            # Return empty list for now - next request will have the data
            return []

        # Update with active client information (this should be fast)
        active_clients = self.get_active_clients()
        for client in active_clients:
            for user in users:
                if user["username"] == client["username"]:
                    user["active"] = True
                    user["ip"] = client["ip_address"]
                    user["download"] = client["download"]
                    user["upload"] = client["upload"]
                    break

        return users

    def _get_certificate_creation_time(self, cert_path: str) -> str:
        """
        Get the creation time of a certificate file.

        Args:
            cert_path: Path to certificate file

        Returns:
            ISO format timestamp string
        """
        try:
            stdout, _, _ = self._run_command(["openssl", "x509", "-in", cert_path, "-text"])
            not_before_match = re.search(r"Not Before\s*:\s*(.+)", stdout)

            if not_before_match:
                date_str = not_before_match.group(1).strip()
                # Parse OpenSSL date format
                date_obj = datetime.datetime.strptime(date_str, "%b %d %H:%M:%S %Y %Z")
                return date_obj.isoformat()

            # Fall back to file creation time
            ctime = os.path.getctime(cert_path)
            return datetime.datetime.fromtimestamp(ctime).isoformat()
        except Exception as e:
            self.logger.error(f"Error getting certificate creation time: {str(e)}")
            return datetime.datetime.now().isoformat()

    def _get_last_connection_time(self, username: str) -> str:
        """
        Get the last time a user connected to the VPN.

        Args:
            username: Username to search for

        Returns:
            ISO format timestamp string or empty string if not found
        """
        try:
            # Look for the last successful connection in logs
            stdout, _, _ = self._run_command([
                "grep", "-a", f"'{username} Connection Initiated'", self.log_file
            ])

            if stdout:
                # Get the most recent entry
                lines = stdout.strip().split('\n')
                last_line = lines[-1]

                # Extract timestamp from log entry
                match = re.search(r'(\w{3} \w{3} \d{1,2} \d{2}:\d{2}:\d{2} \d{4})', last_line)
                if match:
                    timestamp_str = match.group(1)
                    timestamp = datetime.datetime.strptime(timestamp_str, "%a %b %d %H:%M:%S %Y")
                    return timestamp.isoformat()

            return ""
        except Exception as e:
            self.logger.error(f"Error getting last connection time: {str(e)}")
            return ""

    def add_client(self, username: str, email: str = "", full_name: str = "") -> bool:
        """
        Create a new OpenVPN client certificate.

        Args:
            username: Username for the new client
            email: Email address for the new client
            full_name: Full name for the new client

        Returns:
            True if successful, False otherwise
        """
        if not username:
            return False

        # Check if the username already exists
        users = self.get_user_list()
        if any(user["username"] == username for user in users):
            self.logger.warning(f"User {username} already exists")
            return False

        # Change to easy-rsa directory
        easy_rsa_dir = os.path.join(self.config_dir, "easy-rsa")
        if not os.path.exists(easy_rsa_dir):
            self.logger.error(f"easy-rsa directory not found: {easy_rsa_dir}")
            return False
        current_dir = os.getcwd()
        # Generate client certificate
        try:
            # Navigate to easy-rsa directory

            os.chdir(easy_rsa_dir)

            # Source the vars file if it exists
            if os.path.exists("vars"):
                self._run_command(["source", "vars"])

            # Generate client certificate
            _, _, return_code = self._run_command([
                "./easyrsa", "build-client-full", username, "nopass"
            ])

            if return_code != 0:
                self.logger.error(f"Failed to generate certificate for user {username}")
                return False

            # Create client configuration
            self._create_client_config(username)

            self.logger.info(f"Successfully created client {username}")
            return True
        except Exception as e:
            self.logger.error(f"Error creating client: {str(e)}")
            return False
        finally:
            # Return to original directory
            os.chdir(current_dir)

    def _create_client_config(self, username: str) -> None:
        """
        Create a client configuration file for OpenVPN.

        Args:
            username: Username for the client
        """
        # Paths to required files
        ca_path = os.path.join(self.config_dir, "easy-rsa/pki/ca.crt")
        cert_path = os.path.join(self.config_dir, "easy-rsa/pki/issued", f"{username}.crt")
        key_path = os.path.join(self.config_dir, "easy-rsa/pki/private", f"{username}.key")
        ta_path = os.path.join(self.config_dir, "ta.key")

        # Read server configuration to extract server address and port
        server_config_path = os.path.join(self.config_dir, "server.conf")
        server_address = "your-vpn-server.com"  # Default address
        server_port = "1194"  # Default port

        if os.path.exists(server_config_path):
            with open(server_config_path, 'r') as f:
                for line in f:
                    if line.startswith("port "):
                        server_port = line.split()[1].strip()

        # Read required certificate and key files
        try:
            with open(ca_path, 'r') as f:
                ca_content = f.read()

            with open(cert_path, 'r') as f:
                cert_content = f.read()

            with open(key_path, 'r') as f:
                key_content = f.read()

            ta_content = ""
            # if os.path.exists(ta_path):
            #     with open(ta_path, 'r') as f:
            #         ta_content = f.read()

            # Generate client configuration
            client_config = f"""# Client configuration for {username}
client
dev tun
proto udp
remote {server_address} {server_port}
resolv-retry infinite
nobind
persist-key
persist-tun
cipher AES-256-CBC
auth SHA1
verb 3
key-direction 1

# CA certificate
<ca>
{ca_content}
</ca>

# Client certificate
<cert>
{cert_content}
</cert>

# Client key
<key>
{key_content}
</key>
"""

            # Add TLS auth if available
            if ta_content:
                client_config += f"""
# TLS auth key
<tls-auth>
{ta_content}
</tls-auth>
"""

            # Write client configuration to file
            client_dir = os.path.join(self.config_dir, "client-configs")
            os.makedirs(client_dir, exist_ok=True)

            config_path = os.path.join(client_dir, f"{username}.ovpn")
            with open(config_path, 'w') as f:
                f.write(client_config)

            self.logger.info(f"Client configuration created: {config_path}")
        except Exception as e:
            self.logger.error(f"Error creating client configuration: {str(e)}")

    def revoke_client(self, username: str) -> bool:
        """
        Revoke a client certificate.

        Args:
            username: Username of the client to revoke

        Returns:
            True if successful, False otherwise
        """
        if not username:
            return False

        # Change to easy-rsa directory
        easy_rsa_dir = os.path.join(self.config_dir, "easy-rsa")
        if not os.path.exists(easy_rsa_dir):
            self.logger.error(f"easy-rsa directory not found: {easy_rsa_dir}")
            return False

        try:
            # First disconnect client if connected
            self.disconnect_client(username)

            # Navigate to easy-rsa directory
            current_dir = os.getcwd()
            os.chdir(easy_rsa_dir)

            # Revoke certificate
            _, _, return_code = self._run_command([
                "./easyrsa", "revoke", username
            ])

            if return_code != 0:
                self.logger.error(f"Failed to revoke certificate for user {username}")
                return False

            # Generate new CRL
            _, _, return_code = self._run_command([
                "./easyrsa", "gen-crl"
            ])

            if return_code != 0:
                self.logger.error("Failed to generate new CRL")
                return False

            # Copy CRL to OpenVPN directory
            crl_src = os.path.join(easy_rsa_dir, "pki/crl.pem")
            crl_dst = os.path.join(self.config_dir, "crl.pem")
            _, _, return_code = self._run_command([
                "cp", crl_src, crl_dst
            ])

            if return_code != 0:
                self.logger.error("Failed to copy CRL to OpenVPN directory")
                return False

            self.logger.info(f"Successfully revoked client {username}")
            return True
        except Exception as e:
            self.logger.error(f"Error revoking client: {str(e)}")
            return False
        finally:
            # Return to original directory
            os.chdir(current_dir)

    def get_recent_logs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get recent entries from the OpenVPN log file.

        Args:
            limit: Maximum number of log entries to return

        Returns:
            List of dictionaries with log information
        """
        logs = []

        if not os.path.exists(self.log_file):
            self.logger.warning(f"Log file not found: {self.log_file}")
            return logs

        try:
            # Use tail to get the last N lines of the log file
            stdout, _, _ = self._run_command([
                "tail", "-n", str(limit * 10), self.log_file
            ])

            if not stdout:
                return logs

            lines = stdout.splitlines()

            # Process lines in reverse order to get the most recent ones first
            for line in reversed(lines):
                if len(logs) >= limit:
                    break

                # Parse log line
                try:
                    # Extract timestamp and message
                    match = re.search(r'^(.*?)\s+(\w{3}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}).*?\[(.*?)\]:\s+(.*)$', line)
                    if match:
                        hostname, timestamp_str, level, message = match.groups()

                        # Parse timestamp
                        timestamp = datetime.datetime.strptime(timestamp_str, "%a/%b/%Y:%H:%M:%S")
                        time_diff = datetime.datetime.now() - timestamp

                        if time_diff.days > 0:
                            time_ago = f"{time_diff.days} days ago"
                        elif time_diff.seconds // 3600 > 0:
                            time_ago = f"{time_diff.seconds // 3600} hours ago"
                        else:
                            time_ago = f"{time_diff.seconds // 60} minutes ago"

                        # Determine log type
                        log_type = "info"
                        if "error" in level.lower() or "critical" in level.lower() or "fatal" in level.lower():
                            log_type = "error"
                        elif "warning" in level.lower() or "warn" in level.lower():
                            log_type = "warning"
                        elif "success" in message.lower() or "connected" in message.lower():
                            log_type = "success"

                        # Extract details
                        details = ""
                        if "IP:" in message:
                            ip_match = re.search(r'IP:\s+(\d+\.\d+\.\d+\.\d+)', message)
                            if ip_match:
                                details = f"IP: {ip_match.group(1)}"
                        elif "User:" in message:
                            user_match = re.search(r'User:\s+(\w+)', message)
                            if user_match:
                                details = f"User: {user_match.group(1)}"

                        logs.append({
                            "type": log_type,
                            "message": message,
                            "details": details,
                            "time_ago": time_ago
                        })
                except Exception as e:
                    self.logger.error(f"Error parsing log line: {str(e)}")

            return logs[:limit]
        except Exception as e:
            self.logger.error(f"Error reading log file: {str(e)}")
            return logs

    def backup_config(self) -> str:
        """
        Create a backup of the OpenVPN configuration.

        Returns:
            Path to the backup file or empty string if failed
        """
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = os.path.join(self.config_dir, "backups")
            os.makedirs(backup_dir, exist_ok=True)

            backup_path = os.path.join(backup_dir, f"openvpn_config_{timestamp}.tar.gz")

            # Create tar.gz backup
            _, _, return_code = self._run_command([
                "tar", "-czf", backup_path, self.config_dir
            ])

            if return_code != 0:
                self.logger.error("Failed to create backup")
                return ""

            self.logger.info(f"Backup created: {backup_path}")
            return backup_path
        except Exception as e:
            self.logger.error(f"Error creating backup: {str(e)}")
            return ""

    def security_check(self) -> Dict[str, Any]:
        """
        Perform a security check on the OpenVPN server.

        Returns:
            Dictionary with security check results
        """
        results = {
            "outdated_packages": [],
            "firewall_issues": [],
            "certificate_expiry": "",
            "overall_status": "unknown"
        }

        try:
            # Check OpenVPN version
            stdout, _, _ = self._run_command(["openvpn", "--version"])
            if stdout:
                # Extract version number
                version_match = re.search(r'OpenVPN\s+(\d+\.\d+\.\d+)', stdout)
                if version_match:
                    version = version_match.group(1)

                    # Check if OpenVPN is outdated (example threshold)
                    if version < "2.5.0":
                        results["outdated_packages"].append(f"openvpn-{version}")

            # Check OpenSSL version
            stdout, _, _ = self._run_command(["openssl", "version"])
            if stdout:
                # Extract version number
                version_match = re.search(r'OpenSSL\s+(\d+\.\d+\.\d+[a-z]*)', stdout)
                if version_match:
                    version = version_match.group(1)

                    # Check if OpenSSL is outdated (example threshold)
                    if version < "1.1.1":
                        results["outdated_packages"].append(f"openssl-{version}")

            # Check firewall status (assuming ufw)
            stdout, _, _ = self._run_command(["ufw", "status"])
            if "inactive" in stdout.lower():
                results["firewall_issues"].append("Firewall is inactive")

            # Check if OpenVPN port is open in firewall
            if "Status: active" in stdout:
                if "1194/udp" not in stdout and "1194/tcp" not in stdout:
                    results["firewall_issues"].append("OpenVPN port may not be open in firewall")

            # Check server certificate expiry
            server_cert_path = os.path.join(self.config_dir, "easy-rsa/pki/issued/server.crt")
            if os.path.exists(server_cert_path):
                stdout, _, _ = self._run_command([
                    "openssl", "x509", "-in", server_cert_path, "-noout", "-enddate"
                ])

                if stdout:
                    # Extract expiry date
                    expiry_match = re.search(r'notAfter=(.+)', stdout)
                    if expiry_match:
                        expiry_str = expiry_match.group(1).strip()
                        try:
                            # Parse OpenSSL date format
                            expiry_date = datetime.datetime.strptime(
                                expiry_str,
                                "%b %d %H:%M:%S %Y %Z"
                            )

                            # Format as YYYY-MM-DD
                            results["certificate_expiry"] = expiry_date.strftime("%Y-%m-%d")

                            # Check if certificate is close to expiry
                            days_to_expiry = (expiry_date - datetime.datetime.now()).days
                            if days_to_expiry < 30:
                                results["firewall_issues"].append(
                                    f"Server certificate expires in {days_to_expiry} days"
                                )
                        except ValueError:
                            results["certificate_expiry"] = expiry_str

            # Determine overall status
            if results["outdated_packages"] or any(
                    "certificate expires" in issue for issue in results["firewall_issues"]):
                results["overall_status"] = "warning"
            elif results["firewall_issues"]:
                results["overall_status"] = "caution"
            else:
                results["overall_status"] = "good"

            return results
        except Exception as e:
            self.logger.error(f"Error during security check: {str(e)}")
            results["firewall_issues"].append(f"Error during security check: {str(e)}")
            results["overall_status"] = "error"
            return results

    def get_active_users_stats(self) -> Dict[str, Any]:
        """
        Get statistics about active users.

        Returns:
            Dictionary with active user statistics
        """
        users = self.get_user_list()

        # Count active users
        active_count = sum(1 for user in users if user["active"])
        total_count = len(users)

        # Calculate change (we would need historical data for this)
        # For now, we'll just return a placeholder
        change = 0

        return {
            "active_count": active_count,
            "total_count": total_count,
            "change": change
        }

    def get_data_transfer_stats(self) -> Dict[str, float]:
        """
        Get statistics about data transfer.

        Returns:
            Dictionary with data transfer statistics
        """
        # Get current client usage
        clients = self.get_active_clients()
        total_download = sum(client['download'] for client in clients)
        total_upload = sum(client['upload'] for client in clients)

        # Convert to TB
        total_transfer = (total_download + total_upload) / 1000

        # For today's transfer, we would need to filter logs for today's entries
        # For now, we'll use the current total as an approximation
        today_transfer = total_download + total_upload

        return {
            "total": round(total_transfer, 2),  # TB
            "today": round(today_transfer, 2)  # GB
        }

    def get_security_alerts(self) -> Dict[str, Any]:
        """
        Get statistics about security alerts.

        Returns:
            Dictionary with security alert statistics
        """
        # Get recent logs
        logs = self.get_recent_logs(100)  # Get a larger sample for analysis

        # Count error type logs as alerts
        alert_logs = [log for log in logs if log["type"] == "error"]
        alert_count = len(alert_logs)

        # Find most recent alert time
        time_ago = "n/a"
        if alert_logs:
            time_ago = alert_logs[0]["time_ago"]

        # Here we would usually calculate the change compared to previous period
        # For now, we'll use a placeholder
        change = 0

        return {
            "count": alert_count,
            "latest": time_ago,
            "change": change
        }

    def get_basic_info(self) -> Dict[str, Any]:
        """
        Get basic server and usage information for the dashboard.

        Returns:
            Dictionary with server status and statistics
        """
        # Get server status
        server = self.get_server_status()

        # Get active users stats
        active_users = self.get_active_users_stats()

        # Get data transfer stats
        data_transfer = self.get_data_transfer_stats()

        # Get security alerts
        security = self.get_security_alerts()

        return {
            "server": server,
            "active_users": active_users,
            "data_transfer": data_transfer,
            "security": security
        }

    def apply_and_restart(self) -> Dict:
        """Save configuration and restart the service"""
        save_result = self.config_manager.save_config_to_file()
        if save_result["status"] == "error":
            return save_result

        return self.restart_server()
