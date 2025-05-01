import datetime
import hashlib
import logging
import time
from typing import Dict, List, Optional

import requests

from lom_mtk import LomTechMikrotik, LomTechLogger, LomTechManager
from lom_mtk.db import LomTechDatabaseManager
from lom_mtk.models import LomTechClient, LomTechPackage


class LomTechRadiusManager(LomTechMikrotik):
    """Class for managing RADIUS configuration on Mikrotik."""

    def setup_radius(self, radius_server_ip, radius_secret,
                     radius_auth_port=1812, radius_acct_port=1813):
        """Configure RADIUS settings for authentication and accounting.

        Args:
            radius_server_ip: IP address of the RADIUS server
            radius_secret: Shared secret between Mikrotik and RADIUS server
            radius_auth_port: RADIUS authentication port (default: 1812)
            radius_acct_port: RADIUS accounting port (default: 1813)

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Setting up RADIUS with server {radius_server_ip}")

            # Configure RADIUS server
            radius_params = {
                'address': radius_server_ip,
                'secret': radius_secret,
                'service': 'ppp',
                'authentication-port': radius_auth_port,
                'accounting-port': radius_acct_port,
                'timeout': '3s',
                'comment': f"{self.prefix}_radius_server",
                'domain': ''
            }

            radius_servers = self.api.path('/radius')

            # Check if radius server already exists
            exists, server_id = self._item_exists('/radius', 'comment', f"{self.prefix}_radius_server")

            if exists:
                radius_servers.update(numbers=server_id, **radius_params)
                self.logger.info("Updated existing RADIUS server configuration")
            else:
                radius_servers.add(**radius_params)
                self.logger.info("Added new RADIUS server configuration")

            # Configure RADIUS accounting
            radius_accounting = self.api.path('/radius/incoming')
            radius_accounting.update(numbers='*', accept='yes')

            return True

        except Exception as e:
            self.logger.error(f"Failed to configure RADIUS server: {e}")
            return False


class LomTechRadiusAPIManager:
    """Class for interacting with the RADIUS server API."""

    def __init__(self, api_url: str, api_key: str = None, api_secret: str = None):
        """Initialize RADIUS API manager.

        Args:
            api_url: URL of the RADIUS API
            api_key: API key for authentication (if required)
            api_secret: API secret for authentication (if required)
        """
        self.api_url = api_url
        self.api_key = api_key
        self.api_secret = api_secret
        self.logger = logging.getLogger('lom_tech.radius_api')

    def _get_auth_headers(self):
        """Get authentication headers for API requests."""
        headers = {'Content-Type': 'application/json'}

        if self.api_key and self.api_secret:
            # Create signature using HMAC
            timestamp = str(int(time.time()))
            message = f"{self.api_key}:{timestamp}"
            signature = hashlib.sha256(f"{message}:{self.api_secret}".encode()).hexdigest()

            headers.update({
                'X-API-Key': self.api_key,
                'X-Timestamp': timestamp,
                'X-Signature': signature
            })

        return headers

    def add_user(self, username: str, password: str, client_id: str = None,
                 rate_limit: str = None, data_quota: float = None) -> bool:
        """Add a user to the RADIUS server.

        Args:
            username: PPPoE username
            password: PPPoE password
            client_id: Optional client ID for reference
            rate_limit: Optional rate limit (format: "download/upload")
            data_quota: Optional data quota in GB

        Returns:
            Boolean indicating success or failure
        """
        try:
            payload = {
                'username': username,
                'password': password,
                'attributes': {
                    'Client-Id': client_id or "",
                    'Rate-Limit': rate_limit or "",
                    'Data-Quota': str(data_quota) if data_quota else ""
                }
            }

            headers = self._get_auth_headers()
            response = requests.post(
                f"{self.api_url}/users",
                json=payload,
                headers=headers
            )

            if response.status_code in (200, 201):
                self.logger.info(f"Added user {username} to RADIUS")
                return True
            else:
                self.logger.error(f"Failed to add user {username} to RADIUS: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"RADIUS API error when adding user: {e}")
            return False

    def update_user(self, username: str, password: str = None, active: bool = True,
                    rate_limit: str = None, data_quota: float = None) -> bool:
        """Update an existing RADIUS user.

        Args:
            username: PPPoE username
            password: Optional new password
            active: Whether user should be active
            rate_limit: Optional new rate limit
            data_quota: Optional new data quota in GB

        Returns:
            Boolean indicating success or failure
        """
        try:
            payload = {
                'active': active,
                'attributes': {}
            }

            if password:
                payload['password'] = password

            if rate_limit:
                payload['attributes']['Rate-Limit'] = rate_limit

            if data_quota is not None:
                payload['attributes']['Data-Quota'] = str(data_quota)

            headers = self._get_auth_headers()
            response = requests.put(
                f"{self.api_url}/users/{username}",
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                self.logger.info(f"Updated user {username} in RADIUS")
                return True
            else:
                self.logger.error(f"Failed to update user {username} in RADIUS: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"RADIUS API error when updating user: {e}")
            return False

    def delete_user(self, username: str) -> bool:
        """Delete a user from the RADIUS server.

        Args:
            username: PPPoE username

        Returns:
            Boolean indicating success or failure
        """
        try:
            headers = self._get_auth_headers()
            response = requests.delete(
                f"{self.api_url}/users/{username}",
                headers=headers
            )

            if response.status_code in (200, 204):
                self.logger.info(f"Deleted user {username} from RADIUS")
                return True
            else:
                self.logger.error(f"Failed to delete user {username} from RADIUS: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"RADIUS API error when deleting user: {e}")
            return False

    def get_user(self, username: str) -> Dict:
        """Get user details from RADIUS server.

        Args:
            username: PPPoE username

        Returns:
            Dict with user details or empty dict if not found
        """
        try:
            headers = self._get_auth_headers()
            response = requests.get(
                f"{self.api_url}/users/{username}",
                headers=headers
            )

            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get user {username} from RADIUS: {response.status_code}")
                return {}

        except Exception as e:
            self.logger.error(f"RADIUS API error when getting user: {e}")
            return {}

    def get_user_sessions(self, username: str) -> List[Dict]:
        """Get active sessions for a user.

        Args:
            username: PPPoE username

        Returns:
            List of active sessions
        """
        try:
            headers = self._get_auth_headers()
            response = requests.get(
                f"{self.api_url}/sessions",
                params={'username': username},
                headers=headers
            )

            if response.status_code == 200:
                return response.json().get('sessions', [])
            else:
                self.logger.error(f"Failed to get sessions for {username}: {response.status_code}")
                return []

        except Exception as e:
            self.logger.error(f"RADIUS API error when getting sessions: {e}")
            return []

    def disconnect_user(self, username: str) -> bool:
        """Force disconnect all sessions for a user.

        Args:
            username: PPPoE username

        Returns:
            Boolean indicating success or failure
        """
        try:
            headers = self._get_auth_headers()
            response = requests.post(
                f"{self.api_url}/disconnect",
                json={'username': username},
                headers=headers
            )

            if response.status_code == 200:
                self.logger.info(f"Disconnected user {username}")
                return True
            else:
                self.logger.error(f"Failed to disconnect user {username}: {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"RADIUS API error when disconnecting user: {e}")
            return False


class LomTechSubscriptionManager:
    """Class for managing client subscriptions and package assignments."""

    def __init__(self, db_manager: LomTechDatabaseManager, radius_api: LomTechRadiusAPIManager):
        """Initialize the subscription manager.

        Args:
            db_manager: Database manager instance
            radius_api: RADIUS API manager instance
        """
        self.db = db_manager
        self.radius = radius_api
        self.logger = logging.getLogger('lom_tech.subscription')

    def assign_package(self, client_id: str, package_id: str,
                       duration: int = None, start_date: str = None) -> bool:
        """Assign a package to a client and set up RADIUS attributes.

        Args:
            client_id: Client ID
            package_id: Package ID
            duration: Optional override for package duration (in days)
            start_date: Optional start date (ISO format)

        Returns:
            Boolean indicating success or failure
        """
        try:
            # Get client and package info
            client = self.db.get_client(client_id)
            package = self.db.get_package(package_id)

            if not client or not package:
                self.logger.error(f"Client or package not found")
                return False

            # Calculate expiry date
            if not start_date:
                start_date = datetime.datetime.now().isoformat()

            start_datetime = datetime.datetime.fromisoformat(start_date)
            pkg_duration = duration or package.duration
            expiry_date = (start_datetime + datetime.timedelta(days=pkg_duration)).isoformat()

            # Update client record with new package and dates
            client.package_id = package_id
            client.start_date = start_date
            client.expiry_date = expiry_date
            client.status = "active"

            # Update client in database
            if not self.db.update_client(client):
                return False

            # Update RADIUS user with rate limit
            rate_limit = package.get_rate_limit()
            data_quota = package.data_quota if package.data_quota > 0 else None

            if not self.radius.update_user(
                    username=client.username,
                    active=True,
                    rate_limit=rate_limit,
                    data_quota=data_quota
            ):
                self.logger.warning(f"Failed to update RADIUS for client {client.username}")

            self.logger.info(f"Assigned package {package.name} to client {client.username}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to assign package: {e}")
            return False

    def renew_subscription(self, client_id: str, duration: int = None) -> bool:
        """Renew a client subscription.

        Args:
            client_id: Client ID
            duration: Optional duration in days (otherwise uses package default)

        Returns:
            Boolean indicating success or failure
        """
        try:
            # Get client info
            client = self.db.get_client(client_id)

            if not client:
                self.logger.error(f"Client not found")
                return False

            if not client.package_id:
                self.logger.error(f"Client has no assigned package")
                return False

            # Get package info
            package = self.db.get_package(client.package_id)

            if not package:
                self.logger.error(f"Package not found")
                return False

            # Calculate new expiry date
            # If expired, start from current date, otherwise extend from current expiry
            now = datetime.datetime.now()
            expiry = datetime.datetime.fromisoformat(client.expiry_date)

            if expiry < now:
                start_date = now
            else:
                start_date = expiry

            pkg_duration = duration or package.duration
            new_expiry = (start_date + datetime.timedelta(days=pkg_duration)).isoformat()

            # Update client record
            client.expiry_date = new_expiry
            client.status = "active"

            # Update client in database
            if not self.db.update_client(client):
                return False

            # Ensure client is active in RADIUS
            if not self.radius.update_user(username=client.username, active=True):
                self.logger.warning(f"Failed to update RADIUS for client {client.username}")

            self.logger.info(f"Renewed subscription for client {client.username} until {new_expiry}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to renew subscription: {e}")
            return False

    def suspend_client(self, client_id: str, reason: str = "") -> bool:
        """Suspend a client's service.

        Args:
            client_id: Client ID
            reason: Optional reason for suspension

        Returns:
            Boolean indicating success or failure
        """
        try:
            # Get client info
            client = self.db.get_client(client_id)

            if not client:
                self.logger.error(f"Client not found")
                return False

            # Update client record
            client.status = "suspended"
            if reason:
                client.notes = f"{client.notes}\nSuspended: {reason} ({datetime.datetime.now().isoformat()})"

            # Update client in database
            if not self.db.update_client(client):
                return False

            # Suspend in RADIUS and disconnect active sessions
            self.radius.update_user(username=client.username, active=False)
            self.radius.disconnect_user(username=client.username)

            self.logger.info(f"Suspended client {client.username}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to suspend client: {e}")
            return False

    def activate_client(self, client_id: str) -> bool:
        """Activate a suspended client.

        Args:
            client_id: Client ID

        Returns:
            Boolean indicating success or failure
        """
        try:
            # Get client info
            client = self.db.get_client(client_id)

            if not client:
                self.logger.error(f"Client not found")
                return False

            # Check if client has an assigned package
            if not client.package_id:
                self.logger.error(f"Client has no assigned package")
                return False

            # Check if client subscription has expired
            if client.is_expired():
                self.logger.error(f"Client subscription has expired")
                return False

            # Update client record
            client.status = "active"
            client.notes = f"{client.notes}\nActivated: ({datetime.datetime.now().isoformat()})"

            # Update client in database
            if not self.db.update_client(client):
                return False

            # Activate in RADIUS
            self.radius.update_user(username=client.username, active=True)

            self.logger.info(f"Activated client {client.username}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to activate client: {e}")
            return False

    def check_expirations(self) -> Dict:
        """Check for expired or expiring client subscriptions.

        Returns:
            Dict with lists of expired and expiring clients
        """
        try:
            all_clients = self.db.list_clients(status="active")
            now = datetime.datetime.now()

            expired = []
            expiring_7days = []
            expiring_3days = []

            for client in all_clients:
                if not client.expiry_date:
                    continue

                expiry = datetime.datetime.fromisoformat(client.expiry_date)

                # Check if expired
                if expiry < now:
                    expired.append(client)
                    continue

                # Check if expiring soon
                days_left = (expiry - now).days

                if days_left <= 3:
                    expiring_3days.append(client)
                elif days_left <= 7:
                    expiring_7days.append(client)

            # Automatic suspension of expired clients
            for client in expired:
                self.suspend_client(client.client_id, reason="Subscription expired")

            return {
                'expired': expired,
                'expiring_3days': expiring_3days,
                'expiring_7days': expiring_7days
            }

        except Exception as e:
            self.logger.error(f"Failed to check expirations: {e}")
            return {'expired': [], 'expiring_3days': [], 'expiring_7days': []}


class LomTechISPManager:
    """Main ISP management class that integrates all LomTech functionality."""

    def __init__(self,
                 mikrotik_host: str,
                 mikrotik_user: str,
                 mikrotik_password: str,
                 db_config: Dict = None,
                 radius_api_url: str = None,
                 radius_api_key: str = None,
                 radius_api_secret: str = None,
                 log_level: int = logging.INFO,
                 log_file: str = None):
        """Initialize the ISP Manager.

        Args:
            mikrotik_host: Mikrotik router IP or hostname
            mikrotik_user: Mikrotik username
            mikrotik_password: Mikrotik password
            db_config: Database configuration dict
            radius_api_url: RADIUS API URL
            radius_api_key: RADIUS API key
            radius_api_secret: RADIUS API secret
            log_level: Logging level
            log_file: Log file path
        """
        # Initialize logger
        self.logger = LomTechLogger(log_level, log_file).logger

        # Default database config
        default_db_config = {
            'host': 'localhost',
            'user': 'root',
            'password': '',
            'database': 'lom_tech_isp',
            'port': 3306
        }

        # Use provided DB config or default
        self.db_config = db_config or default_db_config

        # Initialize router manager
        self.router = LomTechManager(
            host=mikrotik_host,
            username=mikrotik_user,
            password=mikrotik_password,
            log_level=log_level
        )

        # Initialize database manager
        self.db = LomTechDatabaseManager(
            host=self.db_config.get('host'),
            user=self.db_config.get('user'),
            password=self.db_config.get('password'),
            database=self.db_config.get('database'),
            port=self.db_config.get('port')
        )

        # Initialize RADIUS API manager if provided
        self.radius_api = None
        if radius_api_url:
            self.radius_api = LomTechRadiusAPIManager(
                api_url=radius_api_url,
                api_key=radius_api_key,
                api_secret=radius_api_secret
            )

            # Initialize subscription manager if both DB and RADIUS are available
            self.subscription = LomTechSubscriptionManager(self.db, self.radius_api)

    def initialize(self) -> bool:
        """Initialize the ISP management system.

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info("Initializing LomTech ISP Manager")

            # Connect to database
            if not self.db.connect():
                self.logger.error("Failed to connect to database")
                return False

            # Initialize database tables
            if not self.db.initialize_database():
                self.logger.error("Failed to initialize database tables")
                return False

            self.logger.info("LomTech ISP Manager initialized successfully")
            return True

        except Exception as e:
            self.logger.error(f"Initialization failed: {e}")
            return False

    def setup_new_router(self, wan_interface: str, lan_interface: str,
                         radius_ip: str, radius_secret: str) -> bool:
        """Set up a new router with LomTech configuration.

        Args:
            wan_interface: WAN interface name
            lan_interface: LAN interface name
            radius_ip: RADIUS server IP
            radius_secret: RADIUS shared secret

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Setting up new router at {self.router.radius.host}")

            # Set up infrastructure
            result = self.router.setup_complete_infrastructure(
                wan_interface=wan_interface,
                lan_interface=lan_interface,
                radius_ip=radius_ip,
                radius_secret=radius_secret
            )

            if result:
                self.logger.info("Router setup completed successfully")
            else:
                self.logger.error("Router setup failed")

            return result

        except Exception as e:
            self.logger.error(f"Router setup failed: {e}")
            return False

    def create_new_client(self, username: str, password: str, full_name: str,
                          email: str = "", phone: str = "", address: str = "",
                          package_id: str = None) -> Optional[LomTechClient]:
        """Create a new client and set up RADIUS account.

        Args:
            username: PPPoE username
            password: PPPoE password
            full_name: Client's full name
            email: Client's email
            phone: Client's phone
            address: Client's address
            package_id: Optional package ID to assign

        Returns:
            LomTechClient object if successful, None if failed
        """
        try:
            self.logger.info(f"Creating new client: {username}")

            # Create client object
            client = LomTechClient(
                username=username,
                password=password,
                full_name=full_name,
                email=email,
                phone=phone,
                address=address,
                package_id=package_id
            )

            # Add client to database
            if not self.db.create_client(client):
                self.logger.error(f"Failed to create client in database")
                return None

            # Add client to RADIUS server if available
            if self.radius_api:
                # Get package info if assigned
                rate_limit = None
                data_quota = None

                if package_id:
                    package = self.db.get_package(package_id)
                    if package:
                        rate_limit = package.get_rate_limit()
                        data_quota = package.data_quota if package.data_quota > 0 else None

                # Add to RADIUS
                self.radius_api.add_user(
                    username=username,
                    password=password,
                    client_id=client.client_id,
                    rate_limit=rate_limit,
                    data_quota=data_quota
                )

            self.logger.info(f"Client {username} created successfully")
            return client

        except Exception as e:
            self.logger.error(f"Failed to create client: {e}")
            return None

    def create_package(self, name: str, download_speed: int, upload_speed: int,
                       data_quota: int = 0, price: float = 0.0, duration: int = 30,
                       burst_enabled: bool = False, burst_threshold: int = 0,
                       burst_time: int = 0, description: str = "") -> Optional[LomTechPackage]:
        """Create a new internet package/plan.

        Args:
            name: Package name
            download_speed: Download speed in Mbps
            upload_speed: Upload speed in Mbps
            data_quota: Data quota in GB (0 for unlimited)
            price: Package price
            duration: Subscription duration in days
            burst_enabled: Whether burst is enabled
            burst_threshold: Burst threshold percentage
            burst_time: Burst time in seconds
            description: Package description

        Returns:
            LomTechPackage object if successful, None if failed
        """
        try:
            self.logger.info(f"Creating new package: {name}")

            # Create package object
            package = LomTechPackage(
                name=name,
                download_speed=download_speed,
                upload_speed=upload_speed,
                data_quota=data_quota,
                price=price,
                duration=duration,
                burst_enabled=burst_enabled,
                burst_threshold=burst_threshold,
                burst_time=burst_time,
                description=description
            )

            # Add package to database
            if not self.db.create_package(package):
                self.logger.error(f"Failed to create package in database")
                return None

            self.logger.info(f"Package {name} created successfully")
            return package

        except Exception as e:
            self.logger.error(f"Failed to create package: {e}")
            return None

    def process_payment(self, client_id: str, amount: float, payment_method: str = "cash",
                        reference_number: str = "", notes: str = "",
                        renew: bool = True) -> bool:
        """Process a payment from a client.

        Args:
            client_id: Client ID
            amount: Payment amount
            payment_method: Payment method
            reference_number: Reference number
            notes: Payment notes
            renew: Whether to automatically renew subscription

        Returns:
            Boolean indicating success or failure
        """
        try:
            self.logger.info(f"Processing payment of {amount} for client {client_id}")

            # Get client info
            client = self.db.get_client(client_id)
            if not client:
                self.logger.error(f"Client not found")
                return False

            # Record payment in database
            if not self.db.record_payment(
                    client_id=client_id,
                    amount=amount,
                    package_id=client.package_id,
                    payment_method=payment_method,
                    reference_number=reference_number,
                    notes=notes
            ):
                self.logger.error(f"Failed to record payment")
                return False

            # Renew subscription if requested
            if renew and self.subscription and client.package_id:
                self.subscription.renew_subscription(client_id)

            self.logger.info(f"Payment processed successfully")
            return True

        except Exception as e:
            self.logger.error(f"Failed to process payment: {e}")
            return False

    def run_expiration_check(self) -> Dict:
        """Run expiration check and return results.

        Returns:
            Dict with lists of expired and expiring clients
        """
        if not self.subscription:
            self.logger.error("Subscription manager not available")
            return {'expired': [], 'expiring_3days': [], 'expiring_7days': []}

        return self.subscription.check_expirations()

    def generate_report(self, report_type: str, start_date: str = None, end_date: str = None) -> Dict:
        """Generate various reports.

        Args:
            report_type: Type of report ('revenue', 'clients', 'usage')
            start_date: Optional start date (ISO format)
            end_date: Optional end date (ISO format)

        Returns:
            Dict with report data
        """
        try:
            # Calculate date range if not provided
            if not end_date:
                end_date = datetime.datetime.now().isoformat()

            if not start_date:
                # Default to 30 days before end date
                end_dt = datetime.datetime.fromisoformat(end_date)
                start_date = (end_dt - datetime.timedelta(days=30)).isoformat()

            # Format for SQL queries
            start_sql = start_date.split('T')[0]
            end_sql = end_date.split('T')[0] + ' 23:59:59'

            if not self.db.connection:
                self.db.connect()

            result = {}

            if report_type == 'revenue':
                # Revenue report
                with self.db.connection.cursor() as cursor:
                    # Total revenue in period
                    cursor.execute("""
                    SELECT SUM(amount) as total_revenue
                    FROM payments
                    WHERE payment_date BETWEEN %s AND %s
                    """, (start_sql, end_sql))
                    revenue = cursor.fetchone()
                    result['total_revenue'] = revenue['total_revenue'] if revenue and revenue['total_revenue'] else 0

                    # Revenue by package
                    cursor.execute("""
                    SELECT p.package_id, pkg.name, COUNT(*) as payment_count, SUM(p.amount) as revenue
                    FROM payments p
                    JOIN packages pkg ON p.package_id = pkg.package_id
                    WHERE p.payment_date BETWEEN %s AND %s
                    GROUP BY p.package_id, pkg.name
                    ORDER BY revenue DESC
                    """, (start_sql, end_sql))
                    result['revenue_by_package'] = cursor.fetchall()

                    # Revenue by day
                    cursor.execute("""
                    SELECT DATE(payment_date) as date, SUM(amount) as revenue
                    FROM payments
                    WHERE payment_date BETWEEN %s AND %s
                    GROUP BY DATE(payment_date)
                    ORDER BY date
                    """, (start_sql, end_sql))
                    result['revenue_by_day'] = cursor.fetchall()

            elif report_type == 'clients':
                # Client report
                with self.db.connection.cursor() as cursor:
                    # Total clients
                    cursor.execute("SELECT COUNT(*) as total FROM clients")
                    result['total_clients'] = cursor.fetchone()['total']

                    # Clients by status
                    cursor.execute("""
                    SELECT status, COUNT(*) as count
                    FROM clients
                    GROUP BY status
                    """)
                    result['clients_by_status'] = cursor.fetchall()

                    # Clients by package
                    cursor.execute("""
                    SELECT p.package_id, p.name, COUNT(*) as client_count
                    FROM clients c
                    JOIN packages p ON c.package_id = p.package_id
                    GROUP BY p.package_id, p.name
                    ORDER BY client_count DESC
                    """)
                    result['clients_by_package'] = cursor.fetchall()

                    # New clients in period
                    cursor.execute("""
                    SELECT COUNT(*) as new_clients
                    FROM clients
                    WHERE created_at BETWEEN %s AND %s
                    """, (start_sql, end_sql))
                    result['new_clients'] = cursor.fetchone()['new_clients']

            # elif report_type == 'usage':
            #     # Usage report
            #     with self.db.connection.cursor() as cursor:
            #         # Total data usage
            #         cursor.execute("""
            #         SELECT
            #             SUM(upload_bytes) as total_upload,
            #             SUM(download_bytes) as total_download
            #         FROM usage_logs
            #         WHERE start_time BETWEEN %s AND %s
            #         """, (start_sql, end_sql))
        except:
            ...
