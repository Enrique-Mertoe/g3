from lom_mtk import LomTechMikrotik


class LomTechDynamicPPPManager(LomTechMikrotik):
    """Class for managing dynamic PPP connections on Mikrotik."""

    def setup_dynamic_ppp_handler(self, service_name=None, default_profile=None, interface=None):
        """Configure PPP to dynamically handle connections.

        Args:
            service_name: PPPoE service name (default: prefix_pppoe)
            default_profile: Default profile name (default: prefix_radius_profile)
            interface: Interface to bind PPPoE to (if None, uses existing settings)

        Returns:
            Boolean indicating success or failure
        """
        try:
            service_name = service_name if service_name else f"{self.prefix}_pppoe"
            profile_name = default_profile if default_profile else f"{self.prefix}_radius_profile"

            self.logger.info("Setting up dynamic PPP handling")

            # Configure PPP settings to handle dynamic connections
            ppp_settings = self.api.path('/ppp/aaa')

            # Configure AAA settings
            aaa_params = {
                'use-radius': 'yes',
                'accounting': 'yes',
                'interim-update': '5m',
                'dynamic-sessions': 'yes'  # Important for dynamic sessions
            }

            # There's only one AAA settings entry, so update it
            ppp_settings.update(numbers='*', **aaa_params)
            self.logger.info("Updated PPP AAA settings for dynamic connections")

            # Update PPPoE server settings if interface is specified
            if interface:
                pppoe_servers = self.api.path('/interface/pppoe-server/server')

                # Check if server exists
                exists, server_id = self._item_exists('/interface/pppoe-server/server', 'service-name', service_name)

                if exists:
                    pppoe_params = {
                        'interface': interface,
                        'default-profile': profile_name,
                        'one-session-per-host': 'yes',
                        'authentication': 'pap,chap,mschap1,mschap2',
                        'comment': f"{self.prefix}_pppoe_server"
                    }

                    pppoe_servers.update(numbers=server_id, **pppoe_params)
                    self.logger.info(f"Updated PPPoE server {service_name} for dynamic connections")

            return True

        except Exception as e:
            self.logger.error(f"Failed to configure dynamic PPP handling: {e}")
            return False

    def monitor_active_ppp_connections(self):
        """Get all active PPP connections.

        Returns:
            List of active PPP connections or None on failure
        """
        try:
            self.logger.info("Retrieving active PPP connections")

            # Get active connections
            active = self.api.path('/ppp/active')

            # Format and return information
            connections = []
            for conn in active:
                connections.append({
                    'name': conn.get('name', 'unknown'),
                    'service': conn.get('service', 'unknown'),
                    'caller-id': conn.get('caller-id', 'unknown'),
                    'address': conn.get('address', 'unknown'),
                    'uptime': conn.get('uptime', '0s'),
                    'encoding': conn.get('encoding', 'unknown'),
                    'session-id': conn.get('session-id', 'unknown'),
                    'radius': conn.get('radius', False)
                })

            self.logger.info(f"Found {len(connections)} active PPP connections")
            return connections

        except Exception as e:
            self.logger.error(f"Failed to retrieve active PPP connections: {e}")
            return None

    def get_dynamic_queue_rules(self):
        """Get all dynamic queue rules created for PPP connections.

        Returns:
            List of queue rules or None on failure
        """
        try:
            self.logger.info("Retrieving dynamic queue rules")

            # Get queue rules
            queues = self.api.path('/queue/simple')

            # Filter for dynamic PPP queues
            dynamic_queues = []
            for queue in queues:
                # Check if target looks like a dynamic PPP connection
                target = queue.get('target', '')
                if '<pppoe-' in target or target.startswith('<ppp-'):
                    dynamic_queues.append({
                        'name': queue.get('name', 'unknown'),
                        'target': target,
                        'max-limit': queue.get('max-limit', 'unknown'),
                        'burst-limit': queue.get('burst-limit', 'unknown'),
                        'burst-threshold': queue.get('burst-threshold', 'unknown'),
                        'burst-time': queue.get('burst-time', 'unknown'),
                        'priority': queue.get('priority', 'unknown'),
                        'parent': queue.get('parent', 'none')
                    })

            self.logger.info(f"Found {len(dynamic_queues)} dynamic queue rules")
            return dynamic_queues

        except Exception as e:
            self.logger.error(f"Failed to retrieve dynamic queue rules: {e}")
            return None

    def create_default_dynamic_queue_rule(self, upload_limit='20M', download_limit='20M', priority=8):
        """Create a default queue rule for dynamic PPP connections.

        Args:
            upload_limit: Upload speed limit (default: 20M)
            download_limit: Download speed limit (default: 20M)
            priority: Queue priority (default: 8)

        Returns:
            Boolean indicating success or failure
        """
        try:
            rule_name = f"{self.prefix}_default_ppp_rule"
            self.logger.info(f"Creating default queue rule for dynamic PPP connections: {rule_name}")

            # Queue parameters
            queue_params = {
                'name': rule_name,
                'target': 'ppp-*',  # Target all PPP interfaces
                'max-limit': f"{upload_limit}/{download_limit}",
                'limit-at': f"{upload_limit}/{download_limit}",
                'priority': str(priority),
                'burst-time': '15/15',
                'burst-threshold': f"{int(upload_limit.replace('M', '')) // 2}M/{int(download_limit.replace('M', '')) // 2}M",
                'burst-limit': f"{2 * int(upload_limit.replace('M', ''))}M/{2 * int(download_limit.replace('M', ''))}M",
                'parent': 'none',
                'comment': f"{self.prefix}_default_dynamic_ppp_queue"
            }

            queues = self.api.path('/queue/simple')

            # Check if rule exists
            exists, rule_id = self._item_exists('/queue/simple', 'name', rule_name)

            if exists:
                queues.update(numbers=rule_id, **queue_params)
                self.logger.info(f"Updated default queue rule for dynamic PPP connections: {rule_name}")
            else:
                queues.add(**queue_params)
                self.logger.info(f"Created default queue rule for dynamic PPP connections: {rule_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to create default queue rule: {e}")
            return False

    def get_ppp_interfaces(self):
        """Get all PPP interfaces.

        Returns:
            List of PPP interfaces or None on failure
        """
        try:
            self.logger.info("Retrieving PPP interfaces")

            # Get interfaces
            interfaces = self.api.path('/interface')

            # Filter for PPP interfaces
            ppp_interfaces = []
            for interface in interfaces:
                if interface.get('type') == 'pppoe-in' or interface.get('type').startswith('ppp-'):
                    ppp_interfaces.append({
                        'name': interface.get('name', 'unknown'),
                        'type': interface.get('type', 'unknown'),
                        'mtu': interface.get('mtu', 'default'),
                        'actual-mtu': interface.get('actual-mtu', 'unknown'),
                        'running': interface.get('running', 'unknown'),
                        'disabled': interface.get('disabled', 'unknown')
                    })

            self.logger.info(f"Found {len(ppp_interfaces)} PPP interfaces")
            return ppp_interfaces

        except Exception as e:
            self.logger.error(f"Failed to retrieve PPP interfaces: {e}")
            return None

    def create_ppp_monitoring_script(self, script_name=None):
        """Create a script to monitor PPP connections.

        Args:
            script_name: Script name (default: prefix_monitor_ppp)

        Returns:
            Boolean indicating success or failure
        """
        try:
            script_name = script_name if script_name else f"{self.prefix}_monitor_ppp"
            self.logger.info(f"Creating PPP monitoring script: {script_name}")

            # Script content
            script_source = """
            # LomTech PPP Monitoring Script
            # Logs active PPP connections to syslog every 5 minutes
            :local activeCount [/ppp active print count-only];
            :local queueCount [/queue simple print count-only where target~"ppp-"];
            :log info "PPP Monitor: $activeCount active connections, $queueCount queue rules";

            # Log details of each connection
            :foreach conn in=[/ppp active find] do={
                :local connData [/ppp active get $conn];
                :local name [/ppp active get $conn name];
                :local addr [/ppp active get $conn address];
                :local uptime [/ppp active get $conn uptime];
                :log info "PPP Connection: $name, Address: $addr, Uptime: $uptime";
            }
            """

            # Script parameters
            script_params = {
                'name': script_name,
                'owner': 'admin',
                'policy': 'read,write,policy,test',
                'source': script_source,
                'comment': f"{self.prefix}_ppp_monitoring_script"
            }

            scripts = self.api.path('/system/script')

            # Check if script exists
            exists, script_id = self._item_exists('/system/script', 'name', script_name)

            if exists:
                scripts.update(numbers=script_id, **script_params)
                self.logger.info(f"Updated PPP monitoring script: {script_name}")
            else:
                scripts.add(**script_params)
                self.logger.info(f"Created PPP monitoring script: {script_name}")

            # Create scheduler to run the script
            scheduler_name = f"{self.prefix}_ppp_monitor_scheduler"
            scheduler_params = {
                'name': scheduler_name,
                'start-date': 'jan/01/2000',
                'start-time': '00:00:00',
                'interval': '5m',
                'on-event': script_name,
                'disabled': 'no',
                'comment': f"{self.prefix}_ppp_monitor_scheduler"
            }

            schedulers = self.api.path('/system/scheduler')

            # Check if scheduler exists
            exists, scheduler_id = self._item_exists('/system/scheduler', 'name', scheduler_name)

            if exists:
                schedulers.update(numbers=scheduler_id, **scheduler_params)
                self.logger.info(f"Updated scheduler for PPP monitoring: {scheduler_name}")
            else:
                schedulers.add(**scheduler_params)
                self.logger.info(f"Created scheduler for PPP monitoring: {scheduler_name}")

            return True

        except Exception as e:
            self.logger.error(f"Failed to create PPP monitoring script: {e}")
            return False
