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


docker-compose up -d
docker-compose log -f
