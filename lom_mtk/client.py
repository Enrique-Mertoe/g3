from lom_mtk import LomTechMikrotik


class LomTechClientManager(LomTechMikrotik):
    """Class for managing PPP clients and their connections."""

    def get_connected_clients(self):
        """Get all currently connected PPP clients.

        Returns:
            List of connected clients or None on failure
        """
        try:
            self.logger.info("Retrieving connected PPP clients")

            # Get active connections
            active = self.api.path('/ppp/active')

            # Format and return information
            clients = []
            for client in active:
                clients.append({
                    'name': client.get('name', 'unknown'),
                    'service': client.get('service', 'unknown'),
                    'caller-id': client.get('caller-id', 'unknown'),
                    'address': client.get('address', 'unknown'),
                    'uptime': client.get('uptime', '0s'),
                    'encoding': client.get('encoding', 'unknown'),
                    'session-id': client.get('session-id', 'unknown'),
                    'id': client.get('.id', 'unknown')
                })

            self.logger.info(f"Found {len(clients)} connected clients")
            return clients

        except Exception as e:
            self.logger.error(f"Failed to retrieve connected clients: {e}")
            return None

    def disconnect_client(self, client_id):
        """Disconnect a specific PPP client.

        Args:
            client_id: Client ID from get_connected_clients()

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Disconnecting client with ID: {client_id}")

            # Get active connections
            active = self.api.path('/ppp/active')

            # Remove client
            active.remove(client_id)

            self.logger.info(f"Successfully disconnected client with ID: {client_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to disconnect client: {e}")
            return False

    def get_client_traffic(self, client_name):
        """Get traffic information for a specific client.

        Args:
            client_name: Client username

        Returns:
            Dictionary with traffic information or None on failure
        """
        try:
            self.logger.info(f"Retrieving traffic info for client: {client_name}")

            # Get accounting information
            accounting = self.api.path('/interface/pppoe-server/active').select('user', 'address', 'uptime', 'bytes-in',
                                                                                'bytes-out')

            # Find client
            client_info = None
            for entry in accounting:
                if entry.get('user') == client_name:
                    client_info = {
                        'user': entry.get('user', 'unknown'),
                        'address': entry.get('address', 'unknown'),
                        'uptime': entry.get('uptime', '0s'),
                        'bytes_in': entry.get('bytes-in', 0),
                        'bytes_out': entry.get('bytes-out', 0),
                        'mb_in': int(entry.get('bytes-in', 0)) / (1024 * 1024),
                        'mb_out': int(entry.get('bytes-out', 0)) / (1024 * 1024)
                    }
                    break

            if client_info:
                self.logger.info(f"Found traffic info for client: {client_name}")
            else:
                self.logger.warning(f"No traffic info found for client: {client_name}")

            return client_info

        except Exception as e:
            self.logger.error(f"Failed to retrieve client traffic: {e}")
            return None

    def set_client_speed_limit(self, client_name, download_limit, upload_limit, burst_factor=2, priority=8):
        """Set speed limits for a specific client.

        Args:
            client_name: Client username
            download_limit: Download speed limit in format like '10M'
            upload_limit: Upload speed limit in format like '5M'
            burst_factor: Burst multiplier (default: 2)
            priority: Queue priority (default: 8)

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Setting speed limits for client {client_name}: {upload_limit}/{download_limit}")

            # Check if client is connected
            clients = self.get_connected_clients()
            client_found = False
            client_address = None

            if clients:
                for client in clients:
                    if client.get('name') == client_name:
                        client_found = True
                        client_address = client.get('address')
                        break

            if not client_found:
                self.logger.warning(f"Client {client_name} not found in connected clients")
                # Continue anyway to create/update the queue rule

            # Parse limits to get values without unit
            upload_value = int(upload_limit.replace('M', '').replace('k', '').replace('K', ''))
            download_value = int(download_limit.replace('M', '').replace('k', '').replace('K', ''))

            # Determine if 'M' or 'k' is used
            upload_unit = 'M' if 'M' in upload_limit else 'k'
            download_unit = 'M' if 'M' in download_limit else 'k'

            # Calculate burst limits
            burst_upload = f"{upload_value * burst_factor}{upload_unit}"
            burst_download = f"{download_value * burst_factor}{download_unit}"

            # Calculate burst thresholds (75% of max limit)
            threshold_upload = f"{int(upload_value * 0.75)}{upload_unit}"
            threshold_download = f"{int(download_value * 0.75)}{download_unit}"

            # Create queue rule
            queues = self.api.path('/queue/simple')
            queue_name = f"{self.prefix}_{client_name}"

            # Determine target - either by client name pattern or by address if known
            target = f"<pppoe-{client_name}>" if not client_address else client_address

            queue_params = {
                'name': queue_name,
                'target': target,
                'max-limit': f"{upload_limit}/{download_limit}",
                'limit-at': f"{upload_limit}/{download_limit}",
                'burst-limit': f"{burst_upload}/{burst_download}",
                'burst-threshold': f"{threshold_upload}/{threshold_download}",
                'burst-time': '15s/15s',
                'priority': str(priority),
                'parent': 'none',
                'comment': f"{self.prefix}_client_queue"
            }

            # Check if queue already exists
            exists, queue_id = self._item_exists('/queue/simple', 'name', queue_name)

            if exists:
                queues.update(numbers=queue_id, **queue_params)
                self.logger.info(f"Updated queue rule for client {client_name}")
            else:
                queues.add(**queue_params)
                self.logger.info(f"Created queue rule for client {client_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to set client speed limit: {e}")
            return False

    def remove_client_speed_limit(self, client_name):
        """Remove speed limit for a specific client.

        Args:
            client_name: Client username

        Returns:
            Boolean indicating success or failure
        """
        try:
            queue_name = f"{self.prefix}_{client_name}"
            self.logger.info(f"Removing speed limit for client: {client_name}")

            # Check if queue exists
            exists, queue_id = self._item_exists('/queue/simple', 'name', queue_name)

            if exists:
                queues = self.api.path('/queue/simple')
                queues.remove(queue_id)
                self.logger.info(f"Removed queue rule for client {client_name}")
                return True
            else:
                self.logger.warning(f"No queue rule found for client {client_name}")
                return False

        except Exception as e:
            self.logger.error(f"Failed to remove client speed limit: {e}")
            return False

    def create_temporary_local_client(self, username, password, service='pppoe',
                                      profile=None, remote_address='', local_address='',
                                      expires_after='1d'):
        """Create a temporary local PPP client (when RADIUS is unavailable).

        Args:
            username: PPP username
            password: PPP password
            service: Service type (default: 'pppoe')
            profile: Profile to use (default: None - will use prefix_radius_profile)
            remote_address: Static IP to assign (default: '' - dynamic)
            local_address: Local address (default: '' - use interface default)
            expires_after: When client expires (default: '1d')

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Creating temporary local client: {username}")

            profile_name = profile if profile else f"{self.prefix}_radius_profile"

            # Prepare expiration time
            import datetime
            if expires_after == '1d':
                expires = (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%b/%d/%Y")
            elif expires_after == '1w':
                expires = (datetime.datetime.now() + datetime.timedelta(weeks=1)).strftime("%b/%d/%Y")
            elif expires_after == '1m':
                expires = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%b/%d/%Y")
            else:
                expires = expires_after  # Use as-is if not a recognized format

            # Create secret
            secrets = self.api.path('/ppp/secret')

            secret_params = {
                'name': username,
                'password': password,
                'service': service,
                'profile': profile_name,
                'remote-address': remote_address,
                'local-address': local_address,
                'disabled': 'no',
                'comment': f"{self.prefix}_temp_client",
                'expires-after': expires
            }

            # Check if secret exists
            exists, secret_id = self._item_exists('/ppp/secret', 'name', username)

            if exists:
                secrets.update(numbers=secret_id, **secret_params)
                self.logger.info(f"Updated temporary local client: {username}")
            else:
                secrets.add(**secret_params)
                self.logger.info(f"Created temporary local client: {username}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to create temporary local client: {e}")
            return False

    def remove_temporary_client(self, username):
        """Remove a temporary local client.

        Args:
            username: PPP username

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Removing temporary local client: {username}")

            # Check if secret exists
            exists, secret_id = self._item_exists('/ppp/secret', 'name', username)

            if exists:
                secrets = self.api.path('/ppp/secret')
                secrets.remove(secret_id)
        except:
            pass
