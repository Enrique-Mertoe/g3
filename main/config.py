import json
import os
from typing import Dict, List


class ConfigManager:
    """Manages OpenVPN configuration storage and retrieval"""

    def __init__(self, config_path: str = '/etc/openvpn/server'):
        self.config_path = config_path
        self.config_file = os.path.join(config_path, 'server.conf')
        self.settings_db = os.path.join(config_path, 'settings.json')
        self.templates_db = os.path.join(config_path, 'templates.json')

        # Initialize storage if not exists
        if not os.path.exists(self.settings_db):
            self._initialize_settings()

        if not os.path.exists(self.templates_db):
            self._initialize_templates()

    def _initialize_settings(self):
        """Create initial settings structure"""
        default_settings = {
            "general": {
                "server_name": "OpenVPN Server",
                "port": 1194,
                "protocol": "udp",
                "device": "tun",
                "cipher": "AES-256-GCM",
                "auth": "SHA256"
            },
            "network": {
                "server_network": "10.8.0.0",
                "netmask": "255.255.255.0",
                "dns_servers": ["8.8.8.8", "8.8.4.4"],
                "push_dns": True,
                "duplicate_cn": False
            },
            "routing": {
                "push_redirect_gateway": True,
                "client_to_client": False,
                "routes": []
            },
            "advanced": {
                "keepalive": "10 120",
                "max_clients": 100,
                "user": "nobody",
                "group": "nogroup",
                "custom_directives": []
            }
        }

        os.makedirs(os.path.dirname(self.settings_db), exist_ok=True)
        with open(self.settings_db, 'w') as f:
            json.dump(default_settings, f, indent=2)

    def _initialize_templates(self):
        """Create initial templates structure"""
        default_templates = {
            "templates": [
                {
                    "name": "Default Server",
                    "description": "Standard OpenVPN server configuration",
                    "compatible_clients": ["Windows", "Linux", "MacOS", "Android", "iOS"],
                    "settings": {
                        "general": {
                            "port": 1194,
                            "protocol": "udp"
                        },
                        "network": {
                            "server_network": "10.8.0.0",
                            "netmask": "255.255.255.0"
                        },
                        "routing": {
                            "client_to_client": False
                        }
                    }
                },
                {
                    "name": "MikroTik Compatible",
                    "description": "Optimized for MikroTik routers as clients",
                    "compatible_clients": ["MikroTik RouterOS"],
                    "settings": {
                        "general": {
                            "port": 1194,
                            "protocol": "tcp",
                            "cipher": "AES-256-CBC",
                            "auth": "SHA1"
                        },
                        "network": {
                            "duplicate_cn": True
                        },
                        "advanced": {
                            "fragment": 1400
                        }
                    }
                }
            ]
        }

        os.makedirs(os.path.dirname(self.templates_db), exist_ok=True)
        with open(self.templates_db, 'w') as f:
            json.dump(default_templates, f, indent=2)

    def get_all_settings(self) -> Dict:
        """Get all OpenVPN settings"""
        with open(self.settings_db, 'r') as f:
            return json.load(f)

    def get_section_settings(self, section: str) -> Dict:
        """Get settings for a specific section"""
        all_settings = self.get_all_settings()
        return all_settings.get(section, {})

    def update_section_settings(self, section: str, settings: Dict) -> Dict:
        """Update settings for a specific section only"""
        all_settings = self.get_all_settings()

        # Update only the specified section
        if section in all_settings:
            all_settings[section] = settings

            with open(self.settings_db, 'w') as f:
                json.dump(all_settings, f, indent=2)

            return {"status": "success", "message": f"{section} settings updated"}
        else:
            return {"status": "error", "message": f"Invalid section: {section}"}

    def get_templates(self) -> List[Dict]:
        """Get all configuration templates"""
        with open(self.templates_db, 'r') as f:
            data = json.load(f)
            return data.get("templates", [])

    def apply_template(self, template_name: str) -> Dict:
        """Apply a configuration template"""
        templates = self.get_templates()
        all_settings = self.get_all_settings()

        for template in templates:
            if template["name"] == template_name:
                # Update settings with template values
                for section, settings in template["settings"].items():
                    if section in all_settings:
                        # Update only specified fields, not the entire section
                        all_settings[section].update(settings)

                # Save updated settings
                with open(self.settings_db, 'w') as f:
                    json.dump(all_settings, f, indent=2)

                return {"status": "success", "message": f"Template '{template_name}' applied"}

        return {"status": "error", "message": f"Template not found: {template_name}"}

    def generate_openvpn_config(self) -> str:
        """Generate OpenVPN server.conf from settings"""
        settings = self.get_all_settings()
        config_lines = []

        # General settings
        general = settings["general"]
        config_lines.append(f"port {general['port']}")
        config_lines.append(f"proto {general['protocol']}")
        config_lines.append(f"dev {general['device']}")
        config_lines.append(f"cipher {general['cipher']}")
        config_lines.append(f"auth {general['auth']}")

        # Certificates
        config_lines.append("ca ca.crt")
        config_lines.append("cert server.crt")
        config_lines.append("key server.key")
        config_lines.append("dh dh.pem")

        # Network settings
        network = settings["network"]
        config_lines.append(f"server {network['server_network']} {network['netmask']}")

        if network.get("duplicate_cn", False):
            config_lines.append("duplicate-cn")

        for dns in network.get("dns_servers", []):
            if network.get("push_dns", False):
                config_lines.append(f"push \"dhcp-option DNS {dns}\"")

        # Routing settings
        routing = settings["routing"]
        if routing.get("push_redirect_gateway", False):
            config_lines.append("push \"redirect-gateway def1 bypass-dhcp\"")

        if routing.get("client_to_client", False):
            config_lines.append("client-to-client")

        for route in routing.get("routes", []):
            config_lines.append(f"push \"route {route['network']} {route['netmask']}\"")

        # Advanced settings
        advanced = settings["advanced"]
        config_lines.append(f"keepalive {advanced['keepalive']}")
        config_lines.append(f"max-clients {advanced['max_clients']}")
        config_lines.append(f"user {advanced['user']}")
        config_lines.append(f"group {advanced['group']}")

        # Add custom directives last (so they can override previous settings if needed)
        for directive in advanced.get("custom_directives", []):
            config_lines.append(directive)

        # Common settings
        config_lines.append("persist-key")
        config_lines.append("persist-tun")
        config_lines.append("status /var/log/openvpn/openvpn-status.log")
        config_lines.append("verb 3")

        return "\n".join(config_lines)

    def save_config_to_file(self) -> Dict:
        """Save generated config to the server.conf file"""
        config_content = self.generate_openvpn_config()

        try:
            with open(self.config_file, 'w') as f:
                f.write(config_content)
            return {"status": "success", "message": "Configuration saved"}
        except Exception as e:
            return {"status": "error", "message": f"Failed to save configuration: {str(e)}"}
