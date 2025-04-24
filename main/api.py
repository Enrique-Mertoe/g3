# Mock database - in a real app, use a proper database
import datetime
import logging
import re
import time

import psutil
from flask import Flask, request, jsonify, Blueprint
from werkzeug.security import generate_password_hash

from main.api_handlers import parse_openvpn_config, verify_file_paths
from main.auth import login_required
from main.vpn import VpnManager

USERS_DB = {
    "admin": {
        "password": generate_password_hash("admin123"),
        "full_name": "Admin User"
    }
}

CLIENTS_DB = {
    "john_doe": {
        "full_name": "John Doe",
        "email": "john@example.com",
        "created_at": "2025-04-01T10:30:00",
        "last_connected": "2025-04-24T10:45:12",
        "active": True,
        "ip": "192.168.1.105",
        "download": 4.2,
        "upload": 1.7
    },
    "alice87": {
        "full_name": "Alice Smith",
        "email": "alice@example.com",
        "created_at": "2025-03-15T14:20:00",
        "last_connected": "2025-04-24T08:10:35",
        "active": True,
        "ip": "10.54.12.8",
        "download": 2.8,
        "upload": 0.9
    },
    "robert_j": {
        "full_name": "Robert Johnson",
        "email": "robert@example.com",
        "created_at": "2025-02-28T09:15:00",
        "last_connected": "2025-04-24T12:37:42",
        "active": True,
        "ip": "172.16.24.98",
        "download": 0.5,
        "upload": 0.2
    },
    "emma_t": {
        "full_name": "Emma Thompson",
        "email": "emma@example.com",
        "created_at": "2025-01-10T11:45:00",
        "last_connected": "2025-04-24T11:54:18",
        "active": True,
        "ip": "192.168.5.32",
        "download": 3.1,
        "upload": 1.2
    },
    "user5": {
        "full_name": "Inactive User",
        "email": "inactive@example.com",
        "created_at": "2025-01-05T16:30:00",
        "last_connected": "2025-04-20T08:15:22",
        "active": False,
        "ip": "192.168.1.120",
        "download": 1.2,
        "upload": 0.3
    }
}

LOGS_DB = [
    {
        "type": "error",
        "message": "Failed login attempt for user 'admin'",
        "details": "IP: 45.67.89.123",
        "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=14)
    },
    {
        "type": "success",
        "message": "User 'emma_t' connected successfully",
        "details": "IP: 192.168.5.32",
        "timestamp": datetime.datetime.now() - datetime.timedelta(hours=1)
    },
    {
        "type": "info",
        "message": "Server configuration updated",
        "details": "By: admin",
        "timestamp": datetime.datetime.now() - datetime.timedelta(hours=3)
    },
    {
        "type": "success",
        "message": "New client 'marketing5' created",
        "details": "By: admin",
        "timestamp": datetime.datetime.now() - datetime.timedelta(hours=5)
    },
    {
        "type": "warning",
        "message": "Server restarted successfully",
        "details": "",
        "timestamp": datetime.datetime.now() - datetime.timedelta(hours=10)
    }
]

# Server stats
SERVER_START_TIME = datetime.datetime.now() - datetime.timedelta(days=14, hours=23, minutes=42)

# Routes
# def init_api(app: Flask):
#     # API Endpoints
#     @bp.route('/api/basic-info', methods=["GET", "POST"])
#     # @login_required
#     def server_status():
#         # In a real app, you would check the actual OpenVPN service status
#         uptime = datetime.datetime.now() - SERVER_START_TIME
#         uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds // 60) % 60}m"
#         server = {
#             "status": "online",
#             "uptime": uptime_str,
#             "uptime_seconds": uptime.total_seconds()
#         }
#
#         # Active users
#         active_count = sum(1 for client in CLIENTS_DB.values() if client['active'])
#         total_count = len(CLIENTS_DB)
#
#         # Calculate change (mock data)
#         change = +3  # In a real app, compare to previous period
#
#         active_users = {
#             "active_count": active_count,
#             "total_count": total_count,
#             "change": change
#         }
#
#         # data_transfer
#         # Calculate total data transfer (in TB)
#         total_download = sum(client['download'] for client in CLIENTS_DB.values())
#         total_upload = sum(client['upload'] for client in CLIENTS_DB.values())
#         total_transfer = (total_download + total_upload) / 1000  # Convert to TB
#
#         # Today's transfer (mock data)
#         today_transfer = 35.5  # GB
#         data_transfer = {
#             "total": round(total_transfer, 2),
#             "today": today_transfer
#         }
#
#         # Count error type logs as security alerts
#         alert_count = sum(1 for log in LOGS_DB if log['type'] == 'error')
#
#         # Most recent alert time
#         recent_alerts = [log for log in LOGS_DB if log['type'] == 'error']
#         if recent_alerts:
#             recent_alerts.sort(key=lambda x: x['timestamp'], reverse=True)
#             latest_alert = recent_alerts[0]['timestamp']
#             time_diff = datetime.datetime.now() - latest_alert
#             if time_diff.days > 0:
#                 time_ago = f"{time_diff.days}d ago"
#             elif time_diff.seconds // 3600 > 0:
#                 time_ago = f"{time_diff.seconds // 3600}h ago"
#             else:
#                 time_ago = f"{time_diff.seconds // 60}m ago"
#         else:
#             time_ago = "n/a"
#
#         # Change (mock data)
#         change = +1
#
#         security = {
#             "count": alert_count,
#             "latest": time_ago,
#             "change": change
#         }
#         return jsonify({
#             "server": server,
#             "active_users": active_users,
#             "data_transfer": data_transfer,
#             "security": security
#         })
#
#     @bp.route('/api/traffic_data', methods=["POST"])
#     # @login_required
#     def traffic_data():
#         period = request.args.get('period', 'day')
#
#         if period == 'day':
#             labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
#             download = [2, 5, 3, 7, 9, 12, 14, 10]
#             upload = [1, 3, 2, 4, 6, 5, 8, 5]
#         elif period == 'week':
#             labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
#             download = [15, 20, 25, 22, 30, 28, 15]
#             upload = [8, 12, 15, 10, 20, 22, 10]
#         elif period == 'month':
#             labels = [f'Week {i}' for i in range(1, 5)]
#             download = [90, 110, 120, 105]
#             upload = [45, 60, 75, 55]
#
#         return jsonify({
#             "labels": labels,
#             "datasets": [
#                 {
#                     "label": "Download",
#                     "data": download
#                 },
#                 {
#                     "label": "Upload",
#                     "data": upload
#                 }
#             ]
#         })
#
#     @bp.route('/api/resource_usage',methods=["POST"])
#     # @login_required
#     def resource_usage():
#         # Get actual CPU and memory usage
#         cpu_percent = psutil.cpu_percent()
#         memory = psutil.virtual_memory()
#         memory_percent = memory.percent
#
#         # For disk and bandwidth, we'd use specific OpenVPN monitoring in real app
#         # Here we're using mock data
#         disk_percent = 23
#         bandwidth_percent = 78
#
#         return jsonify({
#             "cpu": cpu_percent,
#             "memory": memory_percent,
#             "disk": disk_percent,
#             "bandwidth": bandwidth_percent
#         })
#
#     @bp.route('/api/active_connections',methods=["POST"])
#     # @login_required
#     def active_connections():
#         active_clients = [
#             {
#                 "username": username,
#                 "full_name": client["full_name"],
#                 "ip_address": client["ip"],
#                 "connected_since": get_time_ago(client["last_connected"]),
#                 "download": client["download"],
#                 "upload": client["upload"]
#             }
#             for username, client in CLIENTS_DB.items() if client["active"]
#         ]
#
#         return jsonify(active_clients)
#
#     @bp.route('/api/disconnect_client', methods=['POST'])
#     @login_required
#     def disconnect_client():
#         username = request.json.get('username')
#
#         if username in CLIENTS_DB:
#             # In a real app, you would run a command to disconnect the client
#             CLIENTS_DB[username]['active'] = False
#
#             # Log the action
#             LOGS_DB.append({
#                 "type": "info",
#                 "message": f"User '{username}' disconnected",
#                 "details": f"By: {session['user']}",
#                 "timestamp": datetime.datetime.now()
#             })
#
#             return jsonify({"success": True})
#
#         return jsonify({"success": False, "error": "User not found"})
#
#     @bp.route('/api/recent_logs',methods=["POST"])
#     # @login_required
#     def recent_logs():
#         sorted_logs = sorted(LOGS_DB, key=lambda x: x['timestamp'], reverse=True)
#         limit = int(request.args.get('limit', 5))
#
#         logs = []
#         for log in sorted_logs[:limit]:
#             time_diff = datetime.datetime.now() - log['timestamp']
#             if time_diff.days > 0:
#                 time_ago = f"{time_diff.days} days ago"
#             elif time_diff.seconds // 3600 > 0:
#                 time_ago = f"{time_diff.seconds // 3600} hours ago"
#             else:
#                 time_ago = f"{time_diff.seconds // 60} minutes ago"
#
#             logs.append({
#                 "type": log['type'],
#                 "message": log['message'],
#                 "details": log['details'],
#                 "time_ago": time_ago
#             })
#
#         return jsonify(logs)
#
#     @bp.route('/api/restart_server', methods=['POST'])
#     @login_required
#     def restart_server():
#         # In a real app, you would run a command to restart the OpenVPN service
#         # subprocess.run(["systemctl", "restart", "openvpn"])
#
#         # Log the action
#         LOGS_DB.append({
#             "type": "warning",
#             "message": "Server restart requested",
#             "details": f"By: {session['user']}",
#             "timestamp": datetime.datetime.now()
#         })
#
#         # Simulate server restart time
#         time.sleep(1)
#
#         return jsonify({"success": True})
#
#     @bp.route('/api/add_client', methods=['POST'])
#     @login_required
#     def add_client():
#         data = request.json
#         username = data.get('username')
#
#         if not username or username in CLIENTS_DB:
#             return jsonify({"success": False, "error": "Invalid username or already exists"})
#
#         # In a real app, you would generate OpenVPN client certificates
#         # and add the client to the OpenVPN configuration
#
#         CLIENTS_DB[username] = {
#             "full_name": data.get('full_name', ''),
#             "email": data.get('email', ''),
#             "created_at": datetime.datetime.now().isoformat(),
#             "last_connected": None,
#             "active": False,
#             "ip": "",
#             "download": 0,
#             "upload": 0
#         }
#
#         # Log the action
#         LOGS_DB.append({
#             "type": "success",
#             "message": f"New client '{username}' created",
#             "details": f"By: {session['user']}",
#             "timestamp": datetime.datetime.now()
#         })
#
#         return jsonify({"success": True})
#
#     @bp.route('/api/backup_config', methods=['POST'])
#     @login_required
#     def backup_config():
#         # In a real app, you would create a backup of the OpenVPN configuration
#         # timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
#         # backup_path = f"/etc/openvpn/backup/openvpn_config_{timestamp}.tar.gz"
#         # subprocess.run(["tar", "-czf", backup_path, "/etc/openvpn"])
#
#         # Log the action
#         LOGS_DB.append({
#             "type": "info",
#             "message": "Configuration backup created",
#             "details": f"By: {session['user']}",
#             "timestamp": datetime.datetime.now()
#         })
#
#         # Simulate backup creation time
#         time.sleep(1)
#
#         return jsonify({"success": True})
#
#     @bp.route('/api/security_check', methods=['POST'])
#     @login_required
#     def security_check():
#         # In a real app, you would run a security check on the OpenVPN server
#         # For example, check for outdated packages, check firewall rules, etc.
#
#         # Log the action
#         LOGS_DB.append({
#             "type": "info",
#             "message": "Security check initiated",
#             "details": f"By: {session['user']}",
#             "timestamp": datetime.datetime.now()
#         })
#
#         # Simulate security check time
#         time.sleep(2)
#
#         # Mock security check results
#         results = {
#             "outdated_packages": ["openssl-1.1.1j", "libssl-1.1.1j"],
#             "firewall_issues": [],
#             "certificate_expiry": "2025-10-15",
#             "overall_status": "good"
#         }
#
#         return jsonify({"success": True, "results": results})
#
#     # Helper functions
#     def get_time_ago(timestamp_str):
#         if not timestamp_str:
#             return "never"
#
#         timestamp = datetime.datetime.fromisoformat(timestamp_str)
#         time_diff = datetime.datetime.now() - timestamp
#
#         if time_diff.days > 0:
#             return f"{time_diff.days}d ago"
#         elif time_diff.seconds // 3600 > 0:
#             return f"{time_diff.seconds // 3600}h {(time_diff.seconds // 60) % 60}m ago"
#         else:
#             return f"{time_diff.seconds // 60}m ago"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
vpn_manager = VpnManager(
    config_dir='/etc/openvpn',  # Adjust paths as needed for your system
    log_file='/var/log/openvpn/openvpn.log',
    status_file='/var/log/openvpn/openvpn-status.log',
    management_host='127.0.0.1',
    management_port=7505,
    service_name='openvpn-server@server'
)


def init_api(app: Flask):
    bp = Blueprint("api", __name__)

    # API Endpoints
    @bp.route('/api/basic-info', methods=["GET", "POST"])
    @login_required
    def basic_info():
        # Get basic server information
        info = vpn_manager.get_basic_info()
        return jsonify(info)

    @bp.route('/api/traffic_data', methods=["POST"])
    @login_required
    def traffic_data():
        period = request.args.get('period', 'day')
        data = vpn_manager.get_traffic_data(period)
        return jsonify(data)

    @bp.route('/api/resource_usage', methods=["POST"])
    @login_required
    def resource_usage():
        usage = vpn_manager.get_resource_usage()
        return jsonify(usage)

    @bp.route('/api/active_connections', methods=["POST"])
    @login_required
    def active_connections():
        clients = vpn_manager.get_active_clients()
        return jsonify(clients)

    @bp.route('/api/disconnect_client', methods=['POST'])
    @login_required
    def disconnect_client():
        username = request.json.get('username')
        success = vpn_manager.disconnect_client(username)
        return jsonify({"success": success})

    @bp.route('/api/recent_logs', methods=["POST"])
    @login_required
    def recent_logs():
        limit = int(request.args.get('limit', 5))
        logs = vpn_manager.get_recent_logs(limit)
        return jsonify(logs)

    @bp.route('/api/restart_server', methods=['POST'])
    @login_required
    def restart_server():
        success = vpn_manager.restart_server()
        return jsonify({"success": success})

    @bp.route('/api/stop_server', methods=['POST'])
    @login_required
    def stop_server():
        _, _, return_code = vpn_manager._run_command(["systemctl", "stop", vpn_manager.service_name])
        success = return_code == 0
        return jsonify({"success": success})

    @bp.route('/api/service_pid', methods=['GET'])
    @login_required
    def service_pid():
        stdout, _, _ = vpn_manager._run_command(["systemctl", "show", vpn_manager.service_name, "--property=MainPID"])
        pid = None
        if stdout:
            match = re.search(r'MainPID=(\d+)', stdout)
            if match and match.group(1) != '0':
                pid = match.group(1)
        return jsonify({"pid": pid})

    @bp.route('/api/service_status', methods=['GET'])
    @login_required
    def service_status():
        status = vpn_manager.get_server_status()
        return jsonify(status)

    @bp.route('/api/start_server', methods=['POST'])
    @login_required
    def start_server():
        _, _, return_code = vpn_manager._run_command(["systemctl", "start", vpn_manager.service_name])
        success = return_code == 0
        return jsonify({"success": success})

    @bp.route('/api/add_client', methods=['POST'])
    @login_required
    def add_client():
        data = request.json
        username = data.get('username')
        email = data.get('email', '')
        full_name = data.get('full_name', '')

        success = vpn_manager.add_client(username, email, full_name)
        return jsonify({"success": success})

    @bp.route('/api/revoke_client', methods=['POST'])
    @login_required
    def revoke_client():
        username = request.json.get('username')
        success = vpn_manager.revoke_client(username)
        return jsonify({"success": success})

    @bp.route('/api/backup_config', methods=['POST'])
    @login_required
    def backup_config():
        backup_path = vpn_manager.backup_config()
        success = bool(backup_path)
        return jsonify({
            "success": success,
            "backup_path": backup_path if success else ""
        })

    @bp.route('/api/security_check', methods=['POST'])
    @login_required
    def security_check():
        results = vpn_manager.security_check()
        return jsonify({
            "success": True,
            "results": results
        })

    @bp.route('/api/openvpn/config', methods=['GET'])
    def get_openvpn_config():
        """API endpoint to get current OpenVPN configuration"""
        try:
            config = parse_openvpn_config()
            return jsonify(config)
        except Exception as e:
            app.logger.error(f"Error in get_openvpn_config: {str(e)}")
            return jsonify({'error': str(e)}), 500

    @bp.route('/api/openvpn/config', methods=['POST'])
    def update_openvpn_config():
        """API endpoint to update OpenVPN configuration"""
        try:
            config = request.json

            # Validate required fields
            required_fields = ['caCertPath', 'serverCertPath', 'serverKeyPath',
                               'dhParamsPath', 'cipher', 'authDigest', 'tlsVersion',
                               'authType']

            for field in required_fields:
                if field not in config:
                    return jsonify({'error': f"Missing required field: {field}"}), 400

            # Verify file paths
            valid, message = verify_file_paths(config)
            if not valid:
                return jsonify({'error': message}), 400

            # Update configuration
            success, message = write_openvpn_config(config)
            if success:
                return jsonify({'message': message})
            else:
                return jsonify({'error': message}), 500

        except Exception as e:
            app.logger.error(f"Error in update_openvpn_config: {str(e)}")
            return jsonify({'error': str(e)}), 500

    app.register_blueprint(bp,url_prefix="/")
