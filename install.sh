cat > config << 'EOF'
#!/bin/bash

# Define the OpenVPN server configuration file path.  Change this if needed.
CONFIG_FILE="/etc/openvpn/server/server.conf"

# Define the line to add.
STATUS_LINE="status /var/log/openvpn-status.log 1"

# Check if the configuration file exists.
if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: OpenVPN server configuration file not found at $CONFIG_FILE"
  exit 1
fi

# Check if the line already exists in the configuration file.
if grep -q "$STATUS_LINE" "$CONFIG_FILE"; then
  echo "The line '$STATUS_LINE' already exists in $CONFIG_FILE"
  exit 0
fi

# Add the line to the configuration file.
echo "$STATUS_LINE" >> "$CONFIG_FILE"
echo "The line '$STATUS_LINE' has been added to $CONFIG_FILE"

# OPTIONAL: Restart the OpenVPN server to apply the changes.
#  Uncomment the following lines if you want to include a restart.
#  You might need to adjust the service name (e.g., 'openvpn@server')
#  depending on your system.
#echo "Restarting OpenVPN server..."
#systemctl restart openvpn

exit 0
EOF

chmod +x ./config.sh
sudo ./config.sh