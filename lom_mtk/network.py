from lom_mtk import LomTechMikrotik


class LomTechNetworkManager(LomTechMikrotik):
    """Class for managing network configurations on Mikrotik."""

    def create_bridge(self, name=None, vlan_filtering=False, protocol_mode='rstp'):
        """Create a new bridge interface.

        Args:
            name: Bridge name (default: prefix_bridge)
            vlan_filtering: Enable VLAN filtering (default: False)
            protocol_mode: Bridge protocol mode (default: rstp)

        Returns:
            Tuple (success, bridge_name) where success is boolean and bridge_name is the created name
        """
        try:
            bridge_name = name if name else f"{self.prefix}_bridge"
            self.logger.info(f"Creating bridge interface {bridge_name}")

            # Bridge parameters
            bridge_params = {
                'name': bridge_name,
                'protocol-mode': protocol_mode,
                'vlan-filtering': 'yes' if vlan_filtering else 'no',
                'comment': f"{self.prefix}_managed_bridge"
            }

            bridges = self.api.path('/interface/bridge')

            # Check if bridge already exists
            exists, bridge_id = self._item_exists('/interface/bridge', 'name', bridge_name)

            if exists:
                bridges.update(numbers=bridge_id, **bridge_params)
                self.logger.info(f"Updated existing bridge {bridge_name}")
            else:
                bridges.add(**bridge_params)
                self.logger.info(f"Created new bridge {bridge_name}")

            return True, bridge_name

        except Exception as e:
            self.logger.error(f"Failed to create bridge: {e}")
            return False, None

    def add_port_to_bridge(self, bridge_name, interface):
        """Add a port to the bridge.

        Args:
            bridge_name: Name of the bridge
            interface: Interface to add to the bridge

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Adding interface {interface} to bridge {bridge_name}")

            # Port parameters
            port_params = {
                'interface': interface,
                'bridge': bridge_name,
                'comment': f"{self.prefix}_bridge_port"
            }

            bridge_ports = self.api.path('/interface/bridge/port')

            # Check if port already exists in bridge
            exists = False
            for port in bridge_ports:
                if port.get('interface') == interface and port.get('bridge') == bridge_name:
                    exists = True
                    bridge_ports.update(numbers=port['.id'], **port_params)
                    self.logger.info(f"Updated existing bridge port for {interface}")
                    break

            if not exists:
                bridge_ports.add(**port_params)
                self.logger.info(f"Added interface {interface} to bridge {bridge_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to add port to bridge: {e}")
            return False

    def configure_ip_address(self, interface, address, comment=None):
        """Configure IP address on an interface.

        Args:
            interface: Interface name
            address: IP address with netmask (e.g., '192.168.1.1/24')
            comment: Optional comment

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Configuring IP address {address} on {interface}")

            # IP address parameters
            ip_params = {
                'address': address,
                'interface': interface,
                'comment': comment if comment else f"{self.prefix}_ip_address"
            }

            ip_addresses = self.api.path('/ip/address')

            # Check if IP already exists on interface
            exists = False
            for ip in ip_addresses:
                if ip.get('interface') == interface:
                    exists = True
                    ip_addresses.update(numbers=ip['.id'], **ip_params)
                    self.logger.info(f"Updated existing IP address on {interface}")
                    break

            if not exists:
                ip_addresses.add(**ip_params)
                self.logger.info(f"Added IP address {address} to {interface}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to configure IP address: {e}")
            return False
