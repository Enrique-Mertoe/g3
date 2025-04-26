import logging
import os

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from flask import Flask, send_file, make_response, jsonify
from io import StringIO
import socket
import settings
from helpers import validate_command, execute_routeros_command, require_api_key, logger
from main.admin.routes import init
from main.api import init_api
from main.command import CommandExecutor
from main.dir_manager import VPNManager
from main.middleware import init_middleware

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'frontend', "dist"),
            static_folder=os.path.join(os.path.dirname(__file__), 'frontend', "dist", "static")
            )
app.secret_key = "sdkajsdlka sdalskdnlaskdn"
CORS(app, resources={r"/*": {"origins": settings.CORS_TRUSTED_ORIGINS}}, supports_credentials=True)
init(app)
init_api(app)

init_middleware(app)


@app.route("/settings")
def settings_view():
    return render_template("index.html")


@app.route("/security")
def security_view():
    return render_template("index.html")


@app.route("/clients/create")
def client_create():
    return render_template("index.html")


@app.route("/client/<name>")
def client_view(name):
    return render_template("index.html")


@app.route("/clients")
def clients():
    return render_template("index.html")


@app.route('/mikrotik/openvpn/create_provision/<provision_identity>', methods=["POST"])
def mtk_create_new_provision(provision_identity):
    """Create a new openVPN client with given name.
    provision_identity: its just like name instance  (e.g client1,client2,...)
    """
    # with REQUEST_LATENCY.labels(endpoint='/create_provision').time():
    try:
        if VPNManager.exists(provision_identity):
            # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='400').inc()
            print(f"Checking if client {provision_identity} exists")
            return jsonify({"error": "Client already exists"}), 400
        print(f"Generating certificate for {provision_identity}")
        VPNManager.gen_cert(provision_identity)

        hostname = socket.gethostname()
        server_ip = socket.gethostbyname(hostname)
        print(f"Server IP: {server_ip}")

        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='202').inc()
        return jsonify({
            "status": "processing",
            "task_id": "123",  # task.id
            "provision_identity": provision_identity,
            "secret": "123",  # secret
            "ip_address": server_ip
        }), 202

    except ValueError as e:
        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='400').inc()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='500').inc()
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


def run_host_command(command):
    executor = CommandExecutor(private_key_path='/app/ssh/id_host_access')
    try:
        if executor.connect():
            result = executor.execute_command(command)
            return result
        return {"success": False, "error": "Failed to connect to host"}
    finally:
        executor.close()


@app.route('/mikrotik/openvpn/<client_name>')
def get_client_config(client_name):
    return VPNManager.download_client_config(client_name)


@app.route('/mikrotik/openvpn/client_ip/<client_name>')
def get_client_ip(client_name):
    try:
        ip = VPNManager.getIpAddress(client_name)
        if ip:
            return ip
        else:
            return None  # or raise ValueError("Client not connected")
    except Exception as e:
        # Handle or re-raise the exception as needed
        print(f"Error getting client IP: {str(e)}")
        return None  # or raise


@app.route('/api/routeros', methods=['POST'])
@require_api_key
def routeros_api_endpoint():
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                "status": "error",
                "error": "invalid_request",
                "message": "Request must be in JSON format"
            }), 400

        # Parse request data
        data = request.json

        # Validate required fields
        required_fields = ["credentials", "command"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "status": "error",
                    "error": "missing_field",
                    "message": f"Required field '{field}' is missing"
                }), 400

        # Extract credentials
        credentials = data.get("credentials", {})
        username = credentials.get("username")
        password = credentials.get("password")

        # Validate credentials
        if not username or not password:
            return jsonify({
                "status": "error",
                "error": "invalid_credentials",
                "message": "Username and password are required"
            }), 400

        # Extract command and parameters
        command = data.get("command")
        parameters = data.get("parameters", {})

        # Validate command
        is_valid, error_message = validate_command(command)
        if not is_valid:
            return jsonify({
                "status": "error",
                "error": "invalid_command",
                "message": error_message
            }), 400

        # Execute command
        host = VPNManager.getIpAddress(data.get("host"))

        logger.info(f"Executing command: {command}")
        result = execute_routeros_command(
            host=host,
            username=username,
            password=password,
            command=command,
            parameters=parameters
        )

        # Return the result
        if result["status"] == "success":
            return jsonify(result)
        else:
            logger.warning(f"Command execution failed: {result['error']} - {result['message']}")
            return jsonify(result), 500

    except Exception as e:
        logger.exception("Server error")
        return jsonify({
            "status": "error",
            "error": "server_error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run()
