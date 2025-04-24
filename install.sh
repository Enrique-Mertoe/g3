#!/bin/bash
# install.sh
# Create necessary directories
mkdir -p /data/lomtechvpnaccess/ssh/keys
chmod 700 /data/lomtechvpnaccess/ssh

# Generate SSH key
ssh-keygen -t ed25519 -a 100 -f /data/lomtechvpnaccess/ssh/keys/id_host_access -q -N "" -C "lomtechvpnaccess-host-access"

# Add to authorized_keys
if [ ! -f ~/.ssh/authorized_keys ]; then
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
fi

# Remove any previous entries
sed -i "/lomtechvpnaccess-host-access/d" ~/.ssh/authorized_keys

# Add the new key
cat /data/lomtechvpnaccess/ssh/keys/id_host_access.pub >> ~/.ssh/authorized_keys

# Set appropriate permissions for container access
chown -R 1000:1000 /data/lomtechvpnaccess
chmod 600 /data/lomtechvpnaccess/ssh/keys/id_host_access

# Optional: Remove public key as it's no longer needed
rm /data/lomtechvpnaccess/ssh/keys/id_host_access.pub

# Check SSH daemon configuration
SSH_CONFIG="/etc/ssh/sshd_config"

# Check PermitRootLogin setting
ROOT_LOGIN_CONFIG=$(grep "^PermitRootLogin" $SSH_CONFIG 2>/dev/null)
if [ -z "$ROOT_LOGIN_CONFIG" ]; then
    echo "Current configuration: PermitRootLogin setting not found or commented out"
else
    echo "Current configuration: $ROOT_LOGIN_CONFIG"
fi

# Check PubkeyAuthentication setting
PUBKEY_CONFIG=$(grep "^PubkeyAuthentication" $SSH_CONFIG 2>/dev/null)
if [ -z "$PUBKEY_CONFIG" ]; then
    echo "Current configuration: PubkeyAuthentication setting not found or commented out"
else
    echo "Current configuration: $PUBKEY_CONFIG"
fi

# Ask for confirmation to modify configuration
echo ""
echo "Recommended settings for container-to-host SSH access:"
echo "  PermitRootLogin prohibit-password"
echo "  PubkeyAuthentication yes"
echo ""
read -p "Do you want to update SSH configuration with these settings? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    # Comment out any existing PermitRootLogin lines
    sed -i 's/^PermitRootLogin/#PermitRootLogin/' $SSH_CONFIG
    # Add our configuration
    echo "PermitRootLogin prohibit-password" >> $SSH_CONFIG

    # Comment out any existing PubkeyAuthentication lines
    sed -i 's/^PubkeyAuthentication/#PubkeyAuthentication/' $SSH_CONFIG
    # Add our configuration
    echo "PubkeyAuthentication yes" >> $SSH_CONFIG

    echo "SSH configuration updated. Restarting sshd..."
    # Check for systemd or alternative service managers
    if command -v systemctl >/dev/null 2>&1; then
        systemctl restart sshd
    elif command -v service >/dev/null 2>&1; then
        service sshd restart
    else
        echo "Warning: Could not restart sshd automatically. Please restart it manually."
    fi
else
    echo "SSH configuration unchanged."
fi

cat > config.sh << 'EOF'
#!/bin/bash

CONFIG_FILE="/etc/openvpn/server/server.conf"
TA_KEY_PATH="/etc/openvpn/server/ta.key"
STATUS_LINE="status /var/log/openvpn/openvpn-status.log 1"

# Check if the configuration file exists.
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: OpenVPN server configuration file not found at $CONFIG_FILE"
  exit 1
fi

# Backup original config
cp "$CONFIG_FILE" "$CONFIG_FILE.bak"

# Function to safely remove a line matching a pattern
remove_line_matching() {
  sed -i "/$1/d" "$CONFIG_FILE"
}

# Remove unsupported options for MikroTik
remove_line_matching "tls-crypt"
remove_line_matching "block-outside-dns"
remove_line_matching "ignore-unknown-option"

# Generate ta.key if not present
if [ ! -f "$TA_KEY_PATH" ]; then
  echo "Generating ta.key for tls-auth..."
  openvpn --genkey --secret "$TA_KEY_PATH"
else
  echo "ta.key already exists at $TA_KEY_PATH"
fi

# Ensure tls-auth is configured
if ! grep -q "^tls-auth" "$CONFIG_FILE"; then
  echo "tls-auth ta.key 0" >> "$CONFIG_FILE"
  echo "Added 'tls-auth ta.key 0' to config."
fi

# Ensure status line exists
if ! grep -qF "$STATUS_LINE" "$CONFIG_FILE"; then
  echo "$STATUS_LINE" >> "$CONFIG_FILE"
  echo "Added status line to config."
else
  echo "Status line already present."
fi

# Restart OpenVPN server
echo "Restarting OpenVPN server..."
systemctl restart openvpn-server@server

echo "Configuration updated and TLS auth key ready."
exit 0
EOF

chmod +x ./config.sh
sudo ./config.sh

docker-compose down
docker-compose up -d
docker-compose logs -f
