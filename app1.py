# app.py
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
import psutil
import time
import datetime
import os
import json
import random
import subprocess
import ipaddress
import re
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# # Mock database - in a real app, use a proper database
# USERS_DB = {
#     "admin": {
#         "password": generate_password_hash("admin123"),
#         "full_name": "Admin User"
#     }
# }
#
# CLIENTS_DB = {
#     "john_doe": {
#         "full_name": "John Doe",
#         "email": "john@example.com",
#         "created_at": "2025-04-01T10:30:00",
#         "last_connected": "2025-04-24T10:45:12",
#         "active": True,
#         "ip": "192.168.1.105",
#         "download": 4.2,
#         "upload": 1.7
#     },
#     "alice87": {
#         "full_name": "Alice Smith",
#         "email": "alice@example.com",
#         "created_at": "2025-03-15T14:20:00",
#         "last_connected": "2025-04-24T08:10:35",
#         "active": True,
#         "ip": "10.54.12.8",
#         "download": 2.8,
#         "upload": 0.9
#     },
#     "robert_j": {
#         "full_name": "Robert Johnson",
#         "email": "robert@example.com",
#         "created_at": "2025-02-28T09:15:00",
#         "last_connected": "2025-04-24T12:37:42",
#         "active": True,
#         "ip": "172.16.24.98",
#         "download": 0.5,
#         "upload": 0.2
#     },
#     "emma_t": {
#         "full_name": "Emma Thompson",
#         "email": "emma@example.com",
#         "created_at": "2025-01-10T11:45:00",
#         "last_connected": "2025-04-24T11:54:18",
#         "active": True,
#         "ip": "192.168.5.32",
#         "download": 3.1,
#         "upload": 1.2
#     },
#     "user5": {
#         "full_name": "Inactive User",
#         "email": "inactive@example.com",
#         "created_at": "2025-01-05T16:30:00",
#         "last_connected": "2025-04-20T08:15:22",
#         "active": False,
#         "ip": "192.168.1.120",
#         "download": 1.2,
#         "upload": 0.3
#     }
# }
#
# LOGS_DB = [
#     {
#         "type": "error",
#         "message": "Failed login attempt for user 'admin'",
#         "details": "IP: 45.67.89.123",
#         "timestamp": datetime.datetime.now() - datetime.timedelta(minutes=14)
#     },
#     {
#         "type": "success",
#         "message": "User 'emma_t' connected successfully",
#         "details": "IP: 192.168.5.32",
#         "timestamp": datetime.datetime.now() - datetime.timedelta(hours=1)
#     },
#     {
#         "type": "info",
#         "message": "Server configuration updated",
#         "details": "By: admin",
#         "timestamp": datetime.datetime.now() - datetime.timedelta(hours=3)
#     },
#     {
#         "type": "success",
#         "message": "New client 'marketing5' created",
#         "details": "By: admin",
#         "timestamp": datetime.datetime.now() - datetime.timedelta(hours=5)
#     },
#     {
#         "type": "warning",
#         "message": "Server restarted successfully",
#         "details": "",
#         "timestamp": datetime.datetime.now() - datetime.timedelta(hours=10)
#     }
# ]
#
# # Server stats
# SERVER_START_TIME = datetime.datetime.now() - datetime.timedelta(days=14, hours=23, minutes=42)
#
#
# # Authentication decorator
# def login_required(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         if 'user' not in session:
#             return redirect(url_for('login'))
#         return f(*args, **kwargs)
#
#     return decorated_function
#
#
# # Routes
# @app.route('/')
# @login_required
# def index():
#     return render_template('dashboard.html')
#
#
# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
#
#         if username in USERS_DB and check_password_hash(USERS_DB[username]['password'], password):
#             session['user'] = username
#             return redirect(url_for('index'))
#
#         return render_template('login.html', error="Invalid credentials")
#
#     return render_template('login.html')
#
#
# @app.route('/logout')
# def logout():
#     session.pop('user', None)
#     return redirect(url_for('login'))
#
#
# # API Endpoints
# @app.route('/api/server_status')
# @login_required
# def server_status():
#     # In a real app, you would check the actual OpenVPN service status
#     uptime = datetime.datetime.now() - SERVER_START_TIME
#     uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds // 60) % 60}m"
#
#     return jsonify({
#         "status": "online",
#         "uptime": uptime_str,
#         "uptime_seconds": uptime.total_seconds()
#     })
#
#
# @app.route('/api/active_users')
# @login_required
# def active_users():
#     active_count = sum(1 for client in CLIENTS_DB.values() if client['active'])
#     total_count = len(CLIENTS_DB)
#
#     # Calculate change (mock data)
#     change = +3  # In a real app, compare to previous period
#
#     return jsonify({
#         "active_count": active_count,
#         "total_count": total_count,
#         "change": change
#     })
#
#
# @app.route('/api/data_transfer')
# @login_required
# def data_transfer():
#     # Calculate total data transfer (in TB)
#     total_download = sum(client['download'] for client in CLIENTS_DB.values())
#     total_upload = sum(client['upload'] for client in CLIENTS_DB.values())
#     total_transfer = (total_download + total_upload) / 1000  # Convert to TB
#
#     # Today's transfer (mock data)
#     today_transfer = 35.5  # GB
#
#     return jsonify({
#         "total": round(total_transfer, 2),
#         "today": today_transfer
#     })
#
#
# @app.route('/api/security_alerts')
# @login_required
# def security_alerts():
#     # Count error type logs as security alerts
#     alert_count = sum(1 for log in LOGS_DB if log['type'] == 'error')
#
#     # Most recent alert time
#     recent_alerts = [log for log in LOGS_DB if log['type'] == 'error']
#     if recent_alerts:
#         recent_alerts.sort(key=lambda x: x['timestamp'], reverse=True)
#         latest_alert = recent_alerts[0]['timestamp']
#         time_diff = datetime.datetime.now() - latest_alert
#         if time_diff.days > 0:
#             time_ago = f"{time_diff.days}d ago"
#         elif time_diff.seconds // 3600 > 0:
#             time_ago = f"{time_diff.seconds // 3600}h ago"
#         else:
#             time_ago = f"{time_diff.seconds // 60}m ago"
#     else:
#         time_ago = "n/a"
#
#     # Change (mock data)
#     change = +1
#
#     return jsonify({
#         "count": alert_count,
#         "latest": time_ago,
#         "change": change
#     })
#
#
# @app.route('/api/traffic_data')
# @login_required
# def traffic_data():
#     period = request.args.get('period', 'day')
#
#     if period == 'day':
#         labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
#         download = [2, 5, 3, 7, 9, 12, 14, 10]
#         upload = [1, 3, 2, 4, 6, 5, 8, 5]
#     elif period == 'week':
#         labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
#         download = [15, 20, 25, 22, 30, 28, 15]
#         upload = [8, 12, 15, 10, 20, 22, 10]
#     elif period == 'month':
#         labels = [f'Week {i}' for i in range(1, 5)]
#         download = [90, 110, 120, 105]
#         upload = [45, 60, 75, 55]
#
#     return jsonify({
#         "labels": labels,
#         "datasets": [
#             {
#                 "label": "Download",
#                 "data": download
#             },
#             {
#                 "label": "Upload",
#                 "data": upload
#             }
#         ]
#     })
#
#
# @app.route('/api/resource_usage')
# @login_required
# def resource_usage():
#     # Get actual CPU and memory usage
#     cpu_percent = psutil.cpu_percent()
#     memory = psutil.virtual_memory()
#     memory_percent = memory.percent
#
#     # For disk and bandwidth, we'd use specific OpenVPN monitoring in real app
#     # Here we're using mock data
#     disk_percent = 23
#     bandwidth_percent = 78
#
#     return jsonify({
#         "cpu": cpu_percent,
#         "memory": memory_percent,
#         "disk": disk_percent,
#         "bandwidth": bandwidth_percent
#     })
#
#
# @app.route('/api/active_connections')
# @login_required
# def active_connections():
#     active_clients = [
#         {
#             "username": username,
#             "full_name": client["full_name"],
#             "ip_address": client["ip"],
#             "connected_since": get_time_ago(client["last_connected"]),
#             "download": client["download"],
#             "upload": client["upload"]
#         }
#         for username, client in CLIENTS_DB.items() if client["active"]
#     ]
#
#     return jsonify(active_clients)
#
#
# @app.route('/api/disconnect_client', methods=['POST'])
# @login_required
# def disconnect_client():
#     username = request.json.get('username')
#
#     if username in CLIENTS_DB:
#         # In a real app, you would run a command to disconnect the client
#         CLIENTS_DB[username]['active'] = False
#
#         # Log the action
#         LOGS_DB.append({
#             "type": "info",
#             "message": f"User '{username}' disconnected",
#             "details": f"By: {session['user']}",
#             "timestamp": datetime.datetime.now()
#         })
#
#         return jsonify({"success": True})
#
#     return jsonify({"success": False, "error": "User not found"})
#
#
# @app.route('/api/recent_logs')
# @login_required
# def recent_logs():
#     sorted_logs = sorted(LOGS_DB, key=lambda x: x['timestamp'], reverse=True)
#     limit = int(request.args.get('limit', 5))
#
#     logs = []
#     for log in sorted_logs[:limit]:
#         time_diff = datetime.datetime.now() - log['timestamp']
#         if time_diff.days > 0:
#             time_ago = f"{time_diff.days} days ago"
#         elif time_diff.seconds // 3600 > 0:
#             time_ago = f"{time_diff.seconds // 3600} hours ago"
#         else:
#             time_ago = f"{time_diff.seconds // 60} minutes ago"
#
#         logs.append({
#             "type": log['type'],
#             "message": log['message'],
#             "details": log['details'],
#             "time_ago": time_ago
#         })
#
#     return jsonify(logs)
#
#
# @app.route('/api/restart_server', methods=['POST'])
# @login_required
# def restart_server():
#     # In a real app, you would run a command to restart the OpenVPN service
#     # subprocess.run(["systemctl", "restart", "openvpn"])
#
#     # Log the action
#     LOGS_DB.append({
#         "type": "warning",
#         "message": "Server restart requested",
#         "details": f"By: {session['user']}",
#         "timestamp": datetime.datetime.now()
#     })
#
#     # Simulate server restart time
#     time.sleep(1)
#
#     return jsonify({"success": True})
#
#
# @app.route('/api/add_client', methods=['POST'])
# @login_required
# def add_client():
#     data = request.json
#     username = data.get('username')
#
#     if not username or username in CLIENTS_DB:
#         return jsonify({"success": False, "error": "Invalid username or already exists"})
#
#     # In a real app, you would generate OpenVPN client certificates
#     # and add the client to the OpenVPN configuration
#
#     CLIENTS_DB[username] = {
#         "full_name": data.get('full_name', ''),
#         "email": data.get('email', ''),
#         "created_at": datetime.datetime.now().isoformat(),
#         "last_connected": None,
#         "active": False,
#         "ip": "",
#         "download": 0,
#         "upload": 0
#     }
#
#     # Log the action
#     LOGS_DB.append({
#         "type": "success",
#         "message": f"New client '{username}' created",
#         "details": f"By: {session['user']}",
#         "timestamp": datetime.datetime.now()
#     })
#
#     return jsonify({"success": True})
#
#
# @app.route('/api/backup_config', methods=['POST'])
# @login_required
# def backup_config():
#     # In a real app, you would create a backup of the OpenVPN configuration
#     # timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
#     # backup_path = f"/etc/openvpn/backup/openvpn_config_{timestamp}.tar.gz"
#     # subprocess.run(["tar", "-czf", backup_path, "/etc/openvpn"])
#
#     # Log the action
#     LOGS_DB.append({
#         "type": "info",
#         "message": "Configuration backup created",
#         "details": f"By: {session['user']}",
#         "timestamp": datetime.datetime.now()
#     })
#
#     # Simulate backup creation time
#     time.sleep(1)
#
#     return jsonify({"success": True})
#
#
# @app.route('/api/security_check', methods=['POST'])
# @login_required
# def security_check():
#     # In a real app, you would run a security check on the OpenVPN server
#     # For example, check for outdated packages, check firewall rules, etc.
#
#     # Log the action
#     LOGS_DB.append({
#         "type": "info",
#         "message": "Security check initiated",
#         "details": f"By: {session['user']}",
#         "timestamp": datetime.datetime.now()
#     })
#
#     # Simulate security check time
#     time.sleep(2)
#
#     # Mock security check results
#     results = {
#         "outdated_packages": ["openssl-1.1.1j", "libssl-1.1.1j"],
#         "firewall_issues": [],
#         "certificate_expiry": "2025-10-15",
#         "overall_status": "good"
#     }
#
#     return jsonify({"success": True, "results": results})
#
#
# # Helper functions
# def get_time_ago(timestamp_str):
#     if not timestamp_str:
#         return "never"
#
#     timestamp = datetime.datetime.fromisoformat(timestamp_str)
#     time_diff = datetime.datetime.now() - timestamp
#
#     if time_diff.days > 0:
#         return f"{time_diff.days}d ago"
#     elif time_diff.seconds // 3600 > 0:
#         return f"{time_diff.seconds // 3600}h {(time_diff.seconds // 60) % 60}m ago"
#     else:
#         return f"{time_diff.seconds // 60}m ago"


if __name__ == '__main__':
    app.run(debug=True)