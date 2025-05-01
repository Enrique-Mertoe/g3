from lom_mtk import LomTechMikrotik


class LomTechDHCPManager(LomTechMikrotik):
    """Class for managing DHCP configurations on Mikrotik."""

    def setup_dhcp_server(self, interface, address_pool, gateway, dns_servers=None, lease_time='1d'):
        """Set up a DHCP server on the specified interface.

        Args:
            interface: Interface to run DHCP server on
            address_pool: IP address pool (e.g., '192.168.1.10-192.168.1.254')
            gateway: Gateway IP address
            dns_servers: DNS servers (comma-separated string or list)
            lease_time: Lease time (default: '1d')

        Returns:
            Boolean indicating success or failure
        """
        try:
            server_name = f"{self.prefix}_dhcp"
            pool_name = f"{self.prefix}_pool"
            network = self._extract_network_from_pool(address_pool)

            self.logger.info(f"Setting up DHCP server on {interface}")

            # Format DNS servers
            if isinstance(dns_servers, list):
                dns_servers = ','.join(dns_servers)
            elif not dns_servers:
                dns_servers = gateway

            # Create address pool
            pool_params = {
                'name': pool_name,
                'ranges': address_pool,
                'comment': f"{self.prefix}_address_pool"
            }

            pools = self.api.path('/ip/pool')

            # Check if pool exists
            exists, pool_id = self._item_exists('/ip/pool', 'name', pool_name)

            if exists:
                pools.update(numbers=pool_id, **pool_params)
                self.logger.info(f"Updated DHCP pool {pool_name}")
            else:
                pools.add(**pool_params)
                self.logger.info(f"Created DHCP pool {pool_name}")

            # Create DHCP network
            network_params = {
                'address': network,
                'gateway': gateway,
                'dns-server': dns_servers,
                'domain': f"{self.prefix}.local",
                'comment': f"{self.prefix}_dhcp_network"
            }

            dhcp_networks = self.api.path('/ip/dhcp-server/network')

            # Check if network exists
            exists = False
            for net in dhcp_networks:
                if net.get('address') == network:
                    exists = True
                    dhcp_networks.update(numbers=net['.id'], **network_params)
                    self.logger.info(f"Updated DHCP network {network}")
                    break

            if not exists:
                dhcp_networks.add(**network_params)
                self.logger.info(f"Created DHCP network {network}")

            # Create DHCP server
            server_params = {
                'name': server_name,
                'interface': interface,
                'address-pool': pool_name,
                'lease-time': lease_time,
                'disabled': 'no',
                'comment': f"{self.prefix}_dhcp_server"
            }

            dhcp_servers = self.api.path('/ip/dhcp-server')

            # Check if server exists
            exists, server_id = self._item_exists('/ip/dhcp-server', 'name', server_name)

            if exists:
                dhcp_servers.update(numbers=server_id, **server_params)
                self.logger.info(f"Updated DHCP server {server_name}")
            else:
                dhcp_servers.add(**server_params)
                self.logger.info(f"Created DHCP server {server_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to set up DHCP server: {e}")
            return False

    def _extract_network_from_pool(self, address_pool):
        """Extract network address from an address pool.

        Args:
            address_pool: IP address pool (e.g., '192.168.1.10-192.168.1.254')

        Returns:
            Network address with mask (e.g., '192.168.1.0/24')
        """
        try:
            # Simple extraction - take the first IP and assume /24
            first_ip = address_pool.split('-')[0]
            network_parts = first_ip.split('.')
            network = f"{network_parts[0]}.{network_parts[1]}.{network_parts[2]}.0/24"
            return network
        except:
            return "0.0.0.0/0"  # Fallback
