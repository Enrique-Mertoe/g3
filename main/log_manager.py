import json
import logging
import os
import queue
import re
import threading
import time
import uuid
from datetime import datetime

from flask import Flask, request, jsonify, Response, stream_with_context

# Path to the OpenVPN log file
OPENVPN_LOG_PATH = "/var/log/openvpn/openvpn-status.log"
# For development/testing, you can use a different path
# OPENVPN_LOG_PATH = "mock_openvpn.log"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Regular expressions for parsing different log entry types
LOG_PATTERNS = {
    'connection': r'.*Client (connected|disconnected).*',
    'authentication': r'.*(authentication|auth) (successful|failed).*',
    'error': r'.*(Error|ERROR|Failed|FAILED).*',
    'warning': r'.*(Warning|WARNING).*',
    'system': r'.*(OpenVPN service|daemon|process).*',
    'network': r'.*(route|subnet|topology|gateway|DNS).*',
    # 'info' will be the default for entries that don't match other patterns
}

# Keep track of file position
last_position = 0
# Store processed log entries to avoid duplicates
processed_entries = set()
# Message queue for new logs - thread-safe communication
log_queue = queue.Queue()
# Flag to stop the background thread
stop_thread = False


def parse_log_entry(line):
    """Parse a single log line into a structured log entry"""
    # Example Apache access log pattern: 127.0.0.1 - - [29/Apr/2025:23:54:11 +0000] "GET /api/openvpn/logs/stream HTTP/1.0" 200 39
    # Example OpenVPN log pattern: 2025-04-30 10:15:22 Client connected from 192.168.1.100:52364

    # Try to extract timestamp in OpenVPN format
    timestamp_match = re.search(r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', line)

    # If not found, try to extract timestamp in Apache access log format
    if not timestamp_match:
        timestamp_match = re.search(r'\[(\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4})\]', line)
        if timestamp_match:
            # Convert Apache timestamp format to our standard format
            try:
                timestamp_str = timestamp_match.group(1)
                parsed_time = datetime.strptime(timestamp_str, "%d/%b/%Y:%H:%M:%S %z")
                timestamp = parsed_time.strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        else:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    else:
        timestamp = timestamp_match.group(1)

    # Extract IP address if present
    ip_match = re.search(r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})', line)
    ip_address = ip_match.group(1) if ip_match else None

    # Extract username if present
    username_match = re.search(r'user[:\s]([a-zA-Z0-9_-]+)', line, re.IGNORECASE)
    username = username_match.group(1) if username_match else None

    # Determine log type based on patterns
    log_type = 'info'  # Default type
    for type_name, pattern in LOG_PATTERNS.items():
        if re.search(pattern, line, re.IGNORECASE):
            log_type = type_name
            break

    # Create log entry object
    log_entry = {
        'id': str(uuid.uuid4()),
        'timestamp': timestamp,
        'type': log_type,
        'message': line.strip(),
    }

    # Add optional fields if they exist
    if ip_address:
        log_entry['ipAddress'] = ip_address
    if username:
        log_entry['username'] = username

    return log_entry


def read_openvpn_logs(from_beginning=False):
    """Read and parse the OpenVPN log file"""
    global last_position
    logs = []

    try:
        # Check if file exists
        if not os.path.exists(OPENVPN_LOG_PATH):
            return {"error": f"Log file not found at {OPENVPN_LOG_PATH}"}, 404

        # Open file and read from last position or from beginning
        with open(OPENVPN_LOG_PATH, 'r') as f:
            if not from_beginning:
                # Only read new lines
                f.seek(last_position)

            lines = f.readlines()
            # Update last position
            last_position = f.tell()

        # Parse each line
        for line in lines:
            if line.strip():  # Skip empty lines
                # Create unique hash for the line to avoid duplicates
                line_hash = hash(line.strip())
                if line_hash not in processed_entries:
                    log_entry = parse_log_entry(line)
                    logs.append(log_entry)
                    processed_entries.add(line_hash)

                    # Limit the size of processed_entries to avoid memory issues
                    if len(processed_entries) > 1000:
                        # Remove oldest entries
                        processed_entries.clear()
                        processed_entries.update([hash(l["message"]) for l in logs[-500:]])

        return logs

    except Exception as e:
        logger.error(f"Failed to read log file: {str(e)}")
        return {"error": f"Failed to read log file: {str(e)}"}, 500


def background_log_monitor():
    """Background thread that monitors the log file for changes"""
    global stop_thread

    logger.info("Starting background log monitor thread")

    while not stop_thread:
        try:
            # Check file size
            if os.path.exists(OPENVPN_LOG_PATH):
                new_logs = read_openvpn_logs()

                # If we got new logs, add them to the queue
                if isinstance(new_logs, list) and len(new_logs) > 0:
                    log_queue.put(new_logs)
        except Exception as e:
            logger.error(f"Error in log monitor: {str(e)}")

        # Sleep for a short time before checking again
        time.sleep(1)

    logger.info("Background log monitor thread stopped")


# Create and start the log monitor thread
monitor_thread = threading.Thread(target=background_log_monitor, daemon=True)
monitor_thread.start()


# Register signal handlers to properly stop the thread
def signal_handler(sig, frame):
    global stop_thread
    logger.info(f"Received signal {sig}, stopping background thread")
    stop_thread = True
    monitor_thread.join(timeout=5)
    logger.info("Exiting")
    exit(0)


def init_logger(app: Flask):
    @app.route('/api/openvpn/logs', methods=['GET'])
    def get_openvpn_logs():
        """API endpoint to fetch OpenVPN logs (non-streaming)"""
        # You might want to add authentication here
        # if not authenticated:
        #     return jsonify({"error": "Unauthorized"}), 401

        # Parse query parameters for filtering
        type_filter = request.args.get('type', '')
        search_term = request.args.get('search', '')
        limit = request.args.get('limit', 100, type=int)

        # Get logs from the beginning
        logs = read_openvpn_logs(from_beginning=True)

        # Handle error case
        if isinstance(logs, tuple) and len(logs) == 2 and isinstance(logs[0], dict) and 'error' in logs[0]:
            return jsonify(logs[0]), logs[1]

        # Apply filters if provided
        if type_filter:
            types = type_filter.split(',')
            logs = [log for log in logs if log['type'] in types]

        if search_term:
            logs = [log for log in logs if (
                    search_term.lower() in log['message'].lower() or
                    (log.get('username') and search_term.lower() in log['username'].lower()) or
                    (log.get('ipAddress') and search_term in log['ipAddress'])
            )]

        # Sort logs by timestamp (newest first)
        logs.sort(key=lambda x: x['timestamp'], reverse=True)

        # Limit number of logs returned
        logs = logs[:limit]

        return jsonify(logs)

    @app.route('/api/openvpn/logs/stream', methods=['GET'])
    def stream_openvpn_logs():
        """API endpoint to stream OpenVPN logs using SSE, compatible with Gunicorn"""
        # Parse query parameters for filtering
        type_filter = request.args.get('type', '')
        search_term = request.args.get('search', '')

        @stream_with_context
        def generate():
            """Generator function for SSE stream that works with Gunicorn"""
            # Initial logs
            logs = read_openvpn_logs(from_beginning=True)
            if isinstance(logs, list):
                # Apply filters if provided
                if type_filter:
                    types = type_filter.split(',')
                    logs = [log for log in logs if log['type'] in types]

                if search_term:
                    logs = [log for log in logs if (
                            search_term.lower() in log['message'].lower() or
                            (log.get('username') and search_term.lower() in log['username'].lower()) or
                            (log.get('ipAddress') and search_term in log['ipAddress'])
                    )]

                # Sort logs by timestamp (oldest first for initial load)
                logs.sort(key=lambda x: x['timestamp'])

                # Send initial logs
                yield f"data: {json.dumps({'type': 'initial', 'logs': logs})}\n\n"

            # Create a client-specific queue for this connection
            client_queue = queue.Queue()

            # Function to check for new logs without blocking
            def check_queue():
                # Non-blocking - just check if there are new logs
                try:
                    # Check our client queue first (any logs filtered for this client)
                    if not client_queue.empty():
                        return client_queue.get_nowait()

                    # Then check the main queue
                    if not log_queue.empty():
                        # Get new logs from the main queue
                        new_logs = log_queue.get_nowait()

                        # Apply filters if provided
                        if type_filter:
                            types = type_filter.split(',')
                            new_logs = [log for log in new_logs if log['type'] in types]

                        if search_term:
                            new_logs = [log for log in new_logs if (
                                    search_term.lower() in log['message'].lower() or
                                    (log.get('username') and search_term.lower() in log['username'].lower()) or
                                    (log.get('ipAddress') and search_term in log['ipAddress'])
                            )]

                        return new_logs
                except queue.Empty:
                    pass

                return None

            # Send keepalive and check for new logs in short intervals to avoid worker timeout
            last_msg_time = time.time()

            while True:
                # Check for new logs
                new_logs = check_queue()

                # If we have new logs, send them
                if new_logs and len(new_logs) > 0:
                    # Sort logs by timestamp
                    new_logs.sort(key=lambda x: x['timestamp'])

                    # Send new logs
                    yield f"data: {json.dumps({'type': 'update', 'logs': new_logs})}\n\n"
                    last_msg_time = time.time()

                # Send keepalive every 15 seconds to avoid timeouts
                current_time = time.time()
                if current_time - last_msg_time > 15:
                    yield ": keepalive\n\n"
                    last_msg_time = current_time

                # Sleep briefly to prevent high CPU usage
                # This is a critical change - we don't block with .wait() anymore
                time.sleep(0.5)

        response = Response(generate(), mimetype="text/event-stream")
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Accel-Buffering'] = 'no'  # Disable buffering in Nginx
        return response

    # Function to generate mock logs for testing purposes
    @app.route('/api/openvpn/mock-logs/stream', methods=['GET'])
    def stream_mock_logs():
        """Generate streaming mock logs for testing"""

        @stream_with_context
        def generate():
            # Send initial batch
            initial_logs = [
                {
                    'id': '1',
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'type': 'connection',
                    'message': 'Client connected from 192.168.1.100:52364',
                    'ipAddress': '192.168.1.100',
                    'username': 'user1'
                },
                {
                    'id': '2',
                    'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'type': 'authentication',
                    'message': 'user1 authentication successful',
                    'username': 'user1'
                }
            ]

            yield f"data: {json.dumps({'type': 'initial', 'logs': initial_logs})}\n\n"

            # Generate new logs periodically
            log_types = ['connection', 'authentication', 'error', 'warning', 'info', 'system', 'network']
            user_count = 1

            start_time = time.time()
            last_msg_time = start_time

            # Generate logs for up to 5 minutes
            while time.time() - start_time < 300:  # 5 minutes
                # Generate a new log every 3 seconds
                current_time = time.time()
                if current_time - last_msg_time >= 3:
                    user_count += 1

                    # Random log type
                    log_type = log_types[int(current_time) % len(log_types)]

                    # Create mock log
                    mock_log = {
                        'id': str(uuid.uuid4()),
                        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        'type': log_type,
                        'message': f'Mock {log_type} event generated for testing',
                        'username': f'user{user_count % 5 + 1}'
                    }

                    if log_type in ['connection', 'error', 'warning']:
                        mock_log['ipAddress'] = f'192.168.1.{user_count % 254 + 1}'

                    # Send new log
                    yield f"data: {json.dumps({'type': 'update', 'logs': [mock_log]})}\n\n"
                    last_msg_time = current_time

                # Send keepalive every 15 seconds
                if current_time - last_msg_time > 15:
                    yield ": keepalive\n\n"
                    last_msg_time = current_time

                # Short sleep to prevent high CPU
                time.sleep(0.5)  # Non-blocking sleep

        response = Response(generate(), mimetype="text/event-stream")
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['X-Accel-Buffering'] = 'no'  # Disable buffering in Nginx
        return response
