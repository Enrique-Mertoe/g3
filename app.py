import os

from flask import Flask, jsonify
from flask_cors import CORS

import settings
from main.admin.routes import init
from main.api import init_api
from main.command import CommandExecutor
from main.dir_manager import VPNManager
from main.middleware import init_middleware

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), 'frontend', "dist"),
            static_folder=os.path.join(os.path.dirname(__file__), 'frontend', "dist", "static")
            )
app.secret_key = "sdkajsdlka sdalskdnlaskdn"
CORS(app, resources={r"/*": {"origins": settings.CORS_TRUSTED_ORIGINS}},supports_credentials=True)
init(app)
init_api(app)

init_middleware(app)


@app.route('/mikrotik/openvpn/create_provision/<provision_identity>', methods=["POST"])
def mtk_create_new_provision(provision_identity):
    """Create a new openVPN client with given name.
    provision_identity: its just like name instance  (e.g client1,client2,...)
    """
    # with REQUEST_LATENCY.labels(endpoint='/create_provision').time():
    try:
        if VPNManager.exists(provision_identity):
            # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='400').inc()
            return jsonify({"error": "Client already exists"}), 400

        VPNManager.gen_cert(provision_identity)

        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='202').inc()
        return jsonify({
            "status": "processing",
            "task_id": task.id,
            "provision_identity": provision_identity,
            "secret": secret
        }), 202

    except ValueError as e:
        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='400').inc()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # REQUEST_COUNT.labels(method='POST', endpoint='/create_provision', status='500').inc()
        return jsonify({"error": "Internal server error"}), 500





def run_host_command(command):
    executor = CommandExecutor(private_key_path='/app/ssh/id_host_access')
    try:
        if executor.connect():
            result = executor.execute_command(command)
            return result
        return {"success": False, "error": "Failed to connect to host"}
    finally:
        executor.close()

# # Example usage in your app
# def restart_nginx():
#     return run_host_command("systemctl restart nginx")
#
# def check_ssl_cert(domain):
#     return run_host_command(f"openssl x509 -text -noout -in /etc/ssl/{domain}.crt")
#
# print("-------------- text -------------------")
# print(restart_nginx(),
# check_ssl_cert("isp3.lomtechnology.com"))
# print("---------------------- end test ------------------")
if __name__ == '__main__':
    app.run()
