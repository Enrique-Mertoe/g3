import json
import os
import re
import shutil
import subprocess

OPENVPN_CONFIG_DIR = '/etc/openvpn'
OPENVPN_SERVER_CONFIG = '/etc/openvpn/server/server.conf'
CONFIG_CACHE_FILE = '/tmp/openvpn/openvpn_config_cache.json'


def parse_openvpn_config():
    """Parse the OpenVPN server configuration file to extract settings"""
    # Default values
    config = {
        'caCertPath': '/etc/openvpn/server/ca.crt',
        'serverCertPath': '/etc/openvpn/server/server.crt',
        'serverKeyPath': '/etc/openvpn/server/server.key',
        'dhParamsPath': '/etc/openvpn/server/dh.pem',
        'cipher': 'AES-256-GCM',
        'authDigest': 'SHA512',
        'tlsVersion': '1.2',
        'authType': 'cert',
        'authScriptPath': '/etc/openvpn/auth-user-pass.sh'
    }

    # Try to read from cache first for faster loading
    if os.path.exists(CONFIG_CACHE_FILE):
        try:
            with open(CONFIG_CACHE_FILE, 'r') as f:
                return json.load(f)
        except:
            pass  # Fall back to parsing the actual config file

    # Parse the actual OpenVPN config file
    try:
        with open(OPENVPN_SERVER_CONFIG, 'r') as f:
            content = f.read()

            # Extract certificate paths
            ca_match = re.search(r'ca\s+([^\s]+)', content)
            if ca_match:
                config['caCertPath'] = ca_match.group(1)

            cert_match = re.search(r'cert\s+([^\s]+)', content)
            if cert_match:
                config['serverCertPath'] = cert_match.group(1)

            key_match = re.search(r'key\s+([^\s]+)', content)
            if key_match:
                config['serverKeyPath'] = key_match.group(1)

            dh_match = re.search(r'dh\s+([^\s]+)', content)
            if dh_match:
                config['dhParamsPath'] = dh_match.group(1)

            # Extract cipher
            cipher_match = re.search(r'cipher\s+([^\s]+)', content)
            if cipher_match:
                config['cipher'] = cipher_match.group(1)

            # Extract auth digest
            auth_match = re.search(r'auth\s+([^\s]+)', content)
            if auth_match:
                config['authDigest'] = auth_match.group(1)

            # Extract TLS version
            tls_match = re.search(r'tls-version-min\s+([^\s]+)', content)
            if tls_match:
                config['tlsVersion'] = tls_match.group(1).replace('TLSv', '')

            # Determine auth type
            if 'auth-user-pass-verify' in content:
                if 'client-cert-not-required' in content:
                    config['authType'] = 'pass'
                else:
                    config['authType'] = 'cert-pass'
            else:
                config['authType'] = 'cert'

            # Extract auth script path
            auth_script_match = re.search(r'auth-user-pass-verify\s+([^\s]+)', content)
            if auth_script_match:
                config['authScriptPath'] = auth_script_match.group(1)

        # Cache the config for faster future access
        with open(CONFIG_CACHE_FILE, 'w') as f:
            json.dump(config, f)

        return config
    except Exception as e:
        # app.logger.error(f"Error parsing OpenVPN config: {str(e)}")
        return config


def verify_file_paths(config):
    """Verify that all certificate and key files exist"""
    for key in ['caCertPath', 'serverCertPath', 'serverKeyPath', 'dhParamsPath']:
        if not os.path.exists(config[key]):
            return False, f"File not found: {config[key]}"
    return True, "All files verified"

def write_openvpn_config(config):
    """Write OpenVPN configuration to the server config file"""
    # First, backup the existing config
    backup_path = f"{OPENVPN_SERVER_CONFIG}.bak"
    try:
        shutil.copy2(OPENVPN_SERVER_CONFIG, backup_path)
    except Exception as e:
        # app.logger.error(f"Error backing up config: {str(e)}")
        return False, f"Failed to backup existing configuration: {str(e)}"

    try:
        # Read the existing config
        with open(OPENVPN_SERVER_CONFIG, 'r') as f:
            content = f.read()

        # Update certificate paths
        content = re.sub(r'ca\s+[^\s]+', f"ca {config['caCertPath']}", content)
        content = re.sub(r'cert\s+[^\s]+', f"cert {config['serverCertPath']}", content)
        content = re.sub(r'key\s+[^\s]+', f"key {config['serverKeyPath']}", content)
        content = re.sub(r'dh\s+[^\s]+', f"dh {config['dhParamsPath']}", content)

        # Update cipher
        cipher_pattern = r'cipher\s+[^\s]+'
        if re.search(cipher_pattern, content):
            content = re.sub(cipher_pattern, f"cipher {config['cipher']}", content)
        else:
            content += f"\ncipher {config['cipher']}"

        # Update auth digest
        auth_pattern = r'auth\s+[^\s]+'
        if re.search(auth_pattern, content):
            content = re.sub(auth_pattern, f"auth {config['authDigest']}", content)
        else:
            content += f"\nauth {config['authDigest']}"

        # Update TLS version
        tls_pattern = r'tls-version-min\s+[^\s]+'
        tls_value = f"TLSv{config['tlsVersion']}"
        if re.search(tls_pattern, content):
            content = re.sub(tls_pattern, f"tls-version-min {tls_value}", content)
        else:
            content += f"\ntls-version-min {tls_value}"

        # Update auth type and script
        auth_script_pattern = r'auth-user-pass-verify\s+[^\s]+'
        client_cert_pattern = r'client-cert-not-required'

        # Remove existing auth settings that we'll update
        if re.search(auth_script_pattern, content):
            content = re.sub(auth_script_pattern, "", content)
        if re.search(client_cert_pattern, content):
            content = re.sub(client_cert_pattern, "", content)

        # Add auth settings based on selected type
        if config['authType'] == 'cert-pass' or config['authType'] == 'pass':
            content += f"\nauth-user-pass-verify {config['authScriptPath']} script"
            if config['authType'] == 'pass':
                content += "\nclient-cert-not-required"

        # Clean up multiple newlines
        content = re.sub(r'\n+', '\n', content)

        # Write the updated config
        with open(OPENVPN_SERVER_CONFIG, 'w') as f:
            f.write(content)

        # Update the cache
        with open(CONFIG_CACHE_FILE, 'w') as f:
            json.dump(config, f)

        # Restart OpenVPN service
        try:
            subprocess.run(['systemctl', 'restart', 'openvpn-server@server'], check=True)
        except subprocess.CalledProcessError as e:
            # app.logger.error(f"Error restarting OpenVPN: {str(e)}")
            return False, "Configuration updated but failed to restart OpenVPN service."

        return True, "Configuration updated and OpenVPN service restarted."

    except Exception as e:
        # app.logger.error(f"Error updating config: {str(e)}")
        # Try to restore the backup
        try:
            shutil.copy2(backup_path, OPENVPN_SERVER_CONFIG)
        except:
            pass
        return False, f"Failed to update configuration: {str(e)}"
