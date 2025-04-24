import json

from flask import session, redirect, flash, url_for, Flask, render_template, request, send_file, jsonify, Response

from main.auth import login_required, USERS
from main.dir_manager import VPNManager


def init(app: Flask):
    @app.route('/')
    @login_required
    def index():
        clients = VPNManager.get_clients()
        connected = VPNManager.get_connected_clients()
        return render_template('index.html', clients=clients, connected=connected)

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            username = request.form.get('email').strip()
            password = request.form.get('password')

            if username in USERS and USERS[username]['password'] == password:
                print("00")
                session['username'] = username
                session['role'] = USERS[username]['role']
                return jsonify({"ok": True})
            else:
                return jsonify({"error":['Invalid credentials']})

        return render_template('index.html')

    @app.route('/logout')
    def logout():
        session.clear()
        flash('Logged out successfully', 'success')
        return redirect(url_for('login'))

    @app.route('/client/<client_name>')
    @login_required
    def client_details(client_name):
        # Get client status
        clients = VPNManager.get_clients()
        connected = VPNManager.get_connected_clients()

        if client_name not in clients:
            flash('Client not found', 'danger')
            return redirect(url_for('index'))

        client_data = {
            'name': client_name,
            'created': clients[client_name].get('created', 'Unknown'),
            'connected': client_name in connected,
            'ip': connected.get(client_name, {}).get('vpn_ip', 'Not connected'),
            'last_seen': connected.get(client_name, {}).get('last_seen', 'Never')
        }

        return render_template('client_details.html', client=client_data)

    @app.route('/create_client', methods=['GET', 'POST'])
    @login_required
    def create_client():
        if request.method == 'POST':
            client_name = request.form.get('client_name')

            if not client_name or not client_name.isalnum():
                flash('Invalid client name. Use only alphanumeric characters.', 'danger')
                return redirect(url_for('create_client'))

            # Check if client already exists
            if VPNManager.exists(client_name):
                flash('Client already exists', 'danger')
                return redirect(url_for('create_client'))

            try:
                # Create client certificate and config
                VPNManager.gen_cert(client_name)
                flash(f'Client {client_name} created successfully', 'success')
                return redirect(url_for('client_details', client_name=client_name))
            except Exception as e:
                raise
                flash(f'Error creating client: {str(e)}', 'danger')
                return redirect(url_for('create_client'))

        return render_template('create_client.html')

    @app.route('/revoke/<client_name>', methods=['POST'])
    @login_required
    def revoke_client(client_name):
        try:
            VPNManager.revoke(client_name)
            flash(f'Client {client_name} revoked successfully', 'success')
        except Exception as e:
            flash(f'Error revoking client: {str(e)}', 'danger')

        return redirect(url_for('index'))

    @app.route('/delete/<client_name>', methods=['POST'])
    @login_required
    def delete_client(client_name):
        try:
            VPNManager.delete_client(client_name)
            flash(f'Client {client_name} deleted successfully', 'success')
        except Exception as e:
            flash(f'Error deleting client: {str(e)}', 'danger')

        return redirect(url_for('index'))

    @app.route('/download/<client_name>')
    @login_required
    def download_config(client_name):
        config_path = VPNManager.get("client", client_name + ".ovpn")

        if not config_path.exists():
            flash('Client configuration not found', 'danger')
            return redirect(url_for('index'))

        return send_file(config_path, as_attachment=True)

    @app.route('/logs')
    @login_required
    def view_logs():
        # Get the last 100 lines of logs by default
        log_lines = VPNManager.get_logs(100)
        return render_template('logs.html', logs=log_lines)

    @app.route('/api/logs')
    @login_required
    def get_logs():
        lines = request.args.get('lines', 100, type=int)
        log_lines = VPNManager.get_logs(lines)
        return jsonify(log_lines)

    @app.route('/stream-logs')
    @login_required
    def stream_logs():
        def generate():
            log_generator = VPNManager.tail_logs()
            for line in log_generator:
                # Format as Server-Sent Event
                yield f"data: {json.dumps(line)}\n\n"

        return Response(generate(), mimetype="text/event-stream")
