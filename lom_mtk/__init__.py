#!/usr/bin/env python3
"""
LomTech Mikrotik Automation Package

A Python package for automating Mikrotik router configuration with:
- RADIUS authentication
- PPPoE server setup
- Custom bridge configuration
- Custom DHCP server setup
- No reliance on default Mikrotik configurations

All configurations use the 'lom_tech' prefix for easy identification.

Requirements:
pip install librouteros
"""

import logging

from lom_mtk.mtk import LomTechMikrotik
from lom_mtk.network import LomTechNetworkManager
from lom_mtk.pppoe import LomTechDynamicPPPManager
from lom_mtk.radius import LomTechRadiusManager
from lom_mtk.server import LomTechDHCPManager
from lom_mtk.utility import LomTechLogger


class LomTechPPPoEManager(LomTechMikrotik):
    """Class for managing PPPoE configurations on Mikrotik."""

    def setup_pppoe_server(self, interface, service_name=None, max_sessions=500):
        """Configure PPPoE server with RADIUS authentication.

        Args:
            interface: Ethernet interface for PPPoE server
            service_name: PPPoE service name (default: prefix_pppoe)
            max_sessions: Maximum allowed sessions (default: 500)

        Returns:
            Boolean indicating success or failure
        """
        try:
            service_name = service_name if service_name else f"{self.prefix}_pppoe"
            profile_name = f"{self.prefix}_radius_profile"

            self.logger.info(f"Setting up PPPoE server on interface {interface}")

            # Configure PPP profile to use RADIUS
            ppp_profiles = self.api.path('/ppp/profile')

            radius_profile_params = {
                'name': profile_name,
                'local-address': 'auto',
                'remote-address': 'radius',
                'dns-server': 'radius',
                'use-radius': 'yes',
                'use-ipv6': 'no',
                'only-one': 'yes',
                'comment': f"{self.prefix}_ppp_profile"
            }

            # Check if profile exists
            exists, profile_id = self._item_exists('/ppp/profile', 'name', profile_name)

            if exists:
                ppp_profiles.update(numbers=profile_id, **radius_profile_params)
                self.logger.info(f"Updated PPP profile {profile_name}")
            else:
                ppp_profiles.add(**radius_profile_params)
                self.logger.info(f"Created PPP profile {profile_name}")

            # Configure PPPoE server
            pppoe_params = {
                'service-name': service_name,
                'interface': interface,
                'default-profile': profile_name,
                'max-sessions': str(max_sessions),
                'keepalive-timeout': '30',
                'max-mru': '1480',
                'max-mtu': '1480',
                'mrru': '1600',
                'authentication': 'pap,chap,mschap1,mschap2',
                'one-session-per-host': 'yes',
                'disabled': 'no',
                'comment': f"{self.prefix}_pppoe_server"
            }

            pppoe_servers = self.api.path('/interface/pppoe-server/server')

            # Check if server exists
            exists, server_id = self._item_exists('/interface/pppoe-server/server', 'service-name', service_name)

            if exists:
                pppoe_servers.update(numbers=server_id, **pppoe_params)
                self.logger.info(f"Updated PPPoE server {service_name}")
            else:
                pppoe_servers.add(**pppoe_params)
                self.logger.info(f"Created PPPoE server {service_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to configure PPPoE server: {e}")
            return False

    def disable_local_user_services(self):
        """Disable local PPP secrets to force RADIUS authentication."""
        try:
            self.logger.info("Disabling local PPP secrets")

            # Get all PPP secrets
            ppp_secrets = self.api.path('/ppp/secret')

            # Disable all existing secrets
            for secret in ppp_secrets:
                # Skip secrets that are already disabled
                if secret.get('disabled', 'no') == 'yes':
                    continue

                ppp_secrets.update(numbers=secret['.id'], disabled='yes')
                self.logger.info(f"Disabled PPP secret: {secret.get('name', 'unknown')}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to disable local PPP secrets: {e}")
            return False


class LomTechFirewallManager(LomTechMikrotik):
    """Class for managing firewall configurations on Mikrotik."""

    def setup_firewall_rules(self):
        """Set up firewall rules to allow RADIUS and PPPoE traffic."""
        try:
            self.logger.info("Setting up firewall rules for RADIUS and PPPoE")

            firewall = self.api.path('/ip/firewall/filter')

            # Rule to allow RADIUS traffic
            radius_rule_params = {
                'chain': 'input',
                'protocol': 'udp',
                'dst-port': '1812,1813',
                'action': 'accept',
                'comment': f"{self.prefix}_radius_rule"
            }

            # Rule to allow PPPoE traffic
            pppoe_rule_params = {
                'chain': 'input',
                'protocol': 'tcp',
                'dst-port': '8081',  # PPPoE discovery protocol
                'action': 'accept',
                'comment': f"{self.prefix}_pppoe_rule"
            }

            # Check if rules exist
            exists, radius_id = self._item_exists('/ip/firewall/filter', 'comment', f"{self.prefix}_radius_rule")

            if exists:
                firewall.update(numbers=radius_id, **radius_rule_params)
                self.logger.info("Updated RADIUS firewall rule")
            else:
                firewall.add(**radius_rule_params)
                self.logger.info("Created RADIUS firewall rule")

            exists, pppoe_id = self._item_exists('/ip/firewall/filter', 'comment', f"{self.prefix}_pppoe_rule")

            if exists:
                firewall.update(numbers=pppoe_id, **pppoe_rule_params)
                self.logger.info("Updated PPPoE firewall rule")
            else:
                firewall.add(**pppoe_rule_params)
                self.logger.info("Created PPPoE firewall rule")

            return True

        except Exception as e:
            self.logger.error(f"Failed to configure firewall rules: {e}")
            return False


class LomTechManager:
    """Main management class that combines all LomTech functionality."""

    def __init__(self, host, username, password, port=8728, log_level=logging.INFO, log_file=None):
        """Initialize the LomTech Manager.

        Args:
            host: Mikrotik router IP address or hostname
            username: Mikrotik username
            password: Mikrotik password
            port: API port (default: 8728)
            log_level: Logging level (default: INFO)
            log_file: Optional file path for logging (default: None)
        """
        # Initialize logger
        self.logger = LomTechLogger(log_level, log_file).logger

        # Initialize managers
        self.radius = LomTechRadiusManager(host, username, password, port, log_level)
        self.network = LomTechNetworkManager(host, username, password, port, log_level)
        self.dhcp = LomTechDHCPManager(host, username, password, port, log_level)
        self.pppoe = LomTechPPPoEManager(host, username, password, port, log_level)
        self.firewall = LomTechFirewallManager(host, username, password, port, log_level)
        self.dynamic_ppp = LomTechDynamicPPPManager(host, username, password, port, log_level)

    def connect(self):
        """Connect all managers to the Mikrotik router."""
        result = self.radius.connect()

        # Share the API connection with other managers
        if result:
            self.network.api = self.radius.api
            self.dhcp.api = self.radius.api
            self.pppoe.api = self.radius.api
            self.firewall.api = self.radius.api
            self.dynamic_ppp.api = self.radius.api

        return result

    def disconnect(self):
        """Disconnect from the Mikrotik router."""
        self.radius.disconnect()

    def setup_complete_infrastructure(self, wan_interface, lan_interface, radius_ip, radius_secret):
        """Set up complete infrastructure with bridge, DHCP, RADIUS, and PPPoE.

        Args:
            wan_interface: WAN interface name
            lan_interface: LAN interface name
            radius_ip: RADIUS server IP address
            radius_secret: RADIUS shared secret

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info("Starting complete LomTech infrastructure setup")

            # Connect to router
            if not self.connect():
                self.logger.error("Could not connect to the router. Exiting.")
                return False

            # Create bridge
            bridge_result, bridge_name = self.network.create_bridge()
            if not bridge_result:
                return False

            # Add LAN interface to bridge
            bridge_port_result = self.network.add_port_to_bridge(bridge_name, lan_interface)
            if not bridge_port_result:
                return False

            # Configure IP on bridge
            ip_result = self.network.configure_ip_address(bridge_name, "10.10.10.1/24", "LomTech Bridge IP")
            if not ip_result:
                return False

            # Set up DHCP server
            dhcp_result = self.dhcp.setup_dhcp_server(
                interface=bridge_name,
                address_pool="10.10.10.100-10.10.10.200",
                gateway="10.10.10.1",
                dns_servers=["8.8.8.8", "8.8.4.4"]
            )
            if not dhcp_result:
                return False

            # Configure RADIUS
            radius_result = self.radius.setup_radius(
                radius_server_ip=radius_ip,
                radius_secret=radius_secret
            )
            if not radius_result:
                return False

            # Set up PPPoE server on LAN interface
            pppoe_result = self.pppoe.setup_pppoe_server(bridge_name)
            if not pppoe_result:
                return False

            # Set up dynamic PPP handling
            dynamic_ppp_result = self.dynamic_ppp.setup_dynamic_ppp_handler(interface=bridge_name)
            if not dynamic_ppp_result:
                return False

            # Create default queue rule for PPP connections
            queue_result = self.dynamic_ppp.create_default_dynamic_queue_rule()
            if not queue_result:
                return False

            # Create monitoring script for PPP connections
            script_result = self.dynamic_ppp.create_ppp_monitoring_script()
            if not script_result:
                return False

            # Disable local user services
            disable_result = self.pppoe.disable_local_user_services()
            if not disable_result:
                return False

            # Set up firewall rules
            firewall_result = self.firewall.setup_firewall_rules()
            if not firewall_result:
                return False

            self.logger.info("Complete LomTech infrastructure setup successful!")
            return True

        except Exception as e:
            self.logger.error(f"Failed to set up infrastructure: {e}")
            return False

        finally:
            # Disconnect from router
            self.disconnect()

    def get_ppp_status(self):
        """Get status of PPP connections and related configurations.

        Returns:
            Dictionary with PPP status information or None on failure
        """
        try:
            if not self.connect():
                return None

            result = {
                "active_connections": self.dynamic_ppp.monitor_active_ppp_connections(),
                "queue_rules": self.dynamic_ppp.get_dynamic_queue_rules(),
                "interfaces": self.dynamic_ppp.get_ppp_interfaces()
            }

            return result

        except Exception as e:
            self.logger.error(f"Failed to get PPP status: {e}")
            return None

        finally:
            self.disconnect()


# Example usage
def main():
    """Example of how to use the LomTech Manager."""
    # Configuration parameters (replace with actual values)
    MIKROTIK_IP = "192.168.88.1"  # Mikrotik router IP
    MIKROTIK_USER = "admin"  # Mikrotik username
    MIKROTIK_PASSWORD = "1"  # Mikrotik password

    WAN_INTERFACE = "ether1"  # WAN interface
    LAN_INTERFACE = "ether3"  # LAN interface

    RADIUS_SERVER_IP = "10.8.0.2"  # RADIUS server IP (on VPN network)
    RADIUS_SECRET = "radiussecret"  # Shared secret

    # Create manager
    manager = LomTechManager(
        host=MIKROTIK_IP,
        username=MIKROTIK_USER,
        password=MIKROTIK_PASSWORD,
        log_file="lom_tech_setup.log"
    )

    # Set up complete infrastructure
    result = manager.setup_complete_infrastructure(
        wan_interface=WAN_INTERFACE,
        lan_interface=LAN_INTERFACE,
        radius_ip=RADIUS_SERVER_IP,
        radius_secret=RADIUS_SECRET
    )

    if result:
        print("LomTech infrastructure setup completed successfully!")
    else:
        print("LomTech infrastructure setup failed. Check logs for details.")


if __name__ == "__main__":
    main()
