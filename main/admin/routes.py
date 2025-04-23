from functools import wraps

from flask import session, redirect, flash, url_for, Flask, render_template, request

from main.dir_manager import VPNManager

USERS = {
    "admin": {
        "password": "admin123",  # Change this!
        "role": "admin"
    }
}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash('Please log in to access this page', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function


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
            username = request.form.get('username')
            password = request.form.get('password')

            if username in USERS and USERS[username]['password'] == password:
                session['username'] = username
                session['role'] = USERS[username]['role']
                flash('Login successful', 'success')
                return redirect(url_for('index'))
            else:
                flash('Invalid credentials', 'danger')

        return render_template('login.html')

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
            if os.path.exists(f"{CLIENT_DIR}/{client_name}.ovpn"):
                flash('Client already exists', 'danger')
                return redirect(url_for('create_client'))

            try:
                # Create client certificate and config
                create_client_certificate(client_name)
                flash(f'Client {client_name} created successfully', 'success')
                return redirect(url_for('client_details', client_name=client_name))
            except Exception as e:
                flash(f'Error creating client: {str(e)}', 'danger')
                return redirect(url_for('create_client'))

        return render_template('create_client.html')

    @app.route('/revoke/<client_name>', methods=['POST'])
    @login_required
    def revoke_client(client_name):
        try:
            revoke_client_certificate(client_name)
            flash(f'Client {client_name} revoked successfully', 'success')
        except Exception as e:
            flash(f'Error revoking client: {str(e)}', 'danger')

        return redirect(url_for('index'))

    @app.route('/delete/<client_name>', methods=['POST'])
    @login_required
    def delete_client(client_name):
        try:
            delete_client_files(client_name)
            flash(f'Client {client_name} deleted successfully', 'success')
        except Exception as e:
            flash(f'Error deleting client: {str(e)}', 'danger')

        return redirect(url_for('index'))

    @app.route('/download/<client_name>')
    @login_required
    def download_config(client_name):
        config_path = f"{CLIENT_DIR}/{client_name}.ovpn"

        if not os.path.exists(config_path):
            flash('Client configuration not found', 'danger')
            return redirect(url_for('index'))

        return send_file(config_path, as_attachment=True)

