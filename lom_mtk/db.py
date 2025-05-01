import datetime
import json
import logging
import uuid
from typing import Optional, List, Dict
import pymysql
from pymysql.cursors import DictCursor
from lom_mtk.models import LomTechClient, LomTechPackage


class LomTechDatabaseManager:
    """Class for managing the LomTech database."""

    def __init__(self,
                 host: str = "localhost",
                 user: str = "root",
                 password: str = "",
                 database: str = "lom_tech_isp",
                 port: int = 3306):
        """Initialize the database manager.

        Args:
            host: Database host
            user: Database user
            password: Database password
            database: Database name
            port: Database port
        """
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.connection = None
        self.logger = logging.getLogger('lom_tech.db')

    def connect(self) -> bool:
        """Connect to the database."""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset='utf8mb4',
                cursorclass=DictCursor
            )
            self.logger.info(f"Connected to database {self.database}")
            return True
        except Exception as e:
            self.logger.error(f"Database connection failed: {e}")
            return False

    def disconnect(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
            self.logger.info("Disconnected from database")

    def initialize_database(self) -> bool:
        """Create database tables if they don't exist."""
        try:
            with self.connection.cursor() as cursor:
                # Create packages table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS packages (
                    package_id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    download_speed INT NOT NULL,
                    upload_speed INT NOT NULL,
                    data_quota INT NOT NULL DEFAULT 0,
                    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                    duration INT NOT NULL DEFAULT 30,
                    burst_enabled BOOLEAN NOT NULL DEFAULT FALSE,
                    burst_threshold INT NOT NULL DEFAULT 0,
                    burst_time INT NOT NULL DEFAULT 0,
                    description TEXT,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
                """)

                # Create clients table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS clients (
                    client_id VARCHAR(36) PRIMARY KEY,
                    username VARCHAR(64) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    phone VARCHAR(20),
                    address TEXT,
                    package_id VARCHAR(36),
                    start_date TIMESTAMP,
                    expiry_date TIMESTAMP,
                    status ENUM('active', 'suspended', 'expired') DEFAULT 'active',
                    used_data DECIMAL(10, 2) DEFAULT 0.00,
                    notes TEXT,
                    custom_attributes JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (package_id) REFERENCES packages(package_id)
                )
                """)

                # Create payments table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    payment_id VARCHAR(36) PRIMARY KEY,
                    client_id VARCHAR(36) NOT NULL,
                    amount DECIMAL(10, 2) NOT NULL,
                    package_id VARCHAR(36),
                    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    payment_method VARCHAR(50),
                    reference_number VARCHAR(100),
                    notes TEXT,
                    FOREIGN KEY (client_id) REFERENCES clients(client_id),
                    FOREIGN KEY (package_id) REFERENCES packages(package_id)
                )
                """)

                # Create usage_logs table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS usage_logs (
                    log_id VARCHAR(36) PRIMARY KEY,
                    client_id VARCHAR(36) NOT NULL,
                    session_id VARCHAR(100),
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    upload_bytes BIGINT DEFAULT 0,
                    download_bytes BIGINT DEFAULT 0,
                    ip_address VARCHAR(45),
                    nas_identifier VARCHAR(100),
                    FOREIGN KEY (client_id) REFERENCES clients(client_id)
                )
                """)

            self.connection.commit()
            self.logger.info("Database initialized successfully")
            return True

        except Exception as e:
            self.logger.error(f"Database initialization failed: {e}")
            return False

    # Package CRUD operations
    def create_package(self, package: LomTechPackage) -> bool:
        """Create a new package in the database."""
        try:
            with self.connection.cursor() as cursor:
                package_dict = package.to_dict()
                columns = ', '.join(package_dict.keys())
                placeholders = ', '.join(['%s'] * len(package_dict))
                sql = f"INSERT INTO packages ({columns}) VALUES ({placeholders})"
                cursor.execute(sql, list(package_dict.values()))

            self.connection.commit()
            self.logger.info(f"Created package: {package.name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create package: {e}")
            return False

    def get_package(self, package_id: str) -> Optional[LomTechPackage]:
        """Get a package by ID."""
        try:
            with self.connection.cursor() as cursor:
                sql = "SELECT * FROM packages WHERE package_id = %s"
                cursor.execute(sql, (package_id,))
                data = cursor.fetchone()

                if data:
                    return LomTechPackage.from_dict(data)
                return None

        except Exception as e:
            self.logger.error(f"Failed to get package: {e}")
            return None

    def update_package(self, package: LomTechPackage) -> bool:
        """Update a package in the database."""
        try:
            with self.connection.cursor() as cursor:
                package_dict = package.to_dict()
                package_id = package_dict.pop("package_id")

                # Build SET clause for SQL
                set_clause = ', '.join([f"{key} = %s" for key in package_dict.keys()])
                sql = f"UPDATE packages SET {set_clause} WHERE package_id = %s"

                # Add package_id to the end of values for WHERE clause
                cursor.execute(sql, list(package_dict.values()) + [package_id])

            self.connection.commit()
            self.logger.info(f"Updated package: {package.name}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to update package: {e}")
            return False

    def delete_package(self, package_id: str) -> bool:
        """Delete a package by ID."""
        try:
            with self.connection.cursor() as cursor:
                # First check if any clients are using this package
                sql = "SELECT COUNT(*) as count FROM clients WHERE package_id = %s"
                cursor.execute(sql, (package_id,))
                result = cursor.fetchone()

                if result and result['count'] > 0:
                    self.logger.error(f"Cannot delete package: {package_id} - it is assigned to clients")
                    return False

                # Delete the package
                sql = "DELETE FROM packages WHERE package_id = %s"
                cursor.execute(sql, (package_id,))

            self.connection.commit()
            self.logger.info(f"Deleted package: {package_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to delete package: {e}")
            return False

    def list_packages(self, active_only: bool = False) -> List[LomTechPackage]:
        """List all packages, optionally filtering for active only."""
        try:
            with self.connection.cursor() as cursor:
                if active_only:
                    sql = "SELECT * FROM packages WHERE active = TRUE ORDER BY name"
                else:
                    sql = "SELECT * FROM packages ORDER BY name"

                cursor.execute(sql)
                packages = []

                for data in cursor.fetchall():
                    packages.append(LomTechPackage.from_dict(data))

                return packages

        except Exception as e:
            self.logger.error(f"Failed to list packages: {e}")
            return []

    # Client CRUD operations
    def create_client(self, client: LomTechClient) -> bool:
        """Create a new client in the database."""
        try:
            with self.connection.cursor() as cursor:
                client_dict = client.to_dict()

                # Convert custom_attributes to JSON string
                if isinstance(client_dict['custom_attributes'], dict):
                    client_dict['custom_attributes'] = json.dumps(client_dict['custom_attributes'])

                columns = ', '.join(client_dict.keys())
                placeholders = ', '.join(['%s'] * len(client_dict))
                sql = f"INSERT INTO clients ({columns}) VALUES ({placeholders})"
                cursor.execute(sql, list(client_dict.values()))

            self.connection.commit()
            self.logger.info(f"Created client: {client.username}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to create client: {e}")
            return False

    def get_client(self, client_id: str = None, username: str = None) -> Optional[LomTechClient]:
        """Get a client by ID or username."""
        try:
            with self.connection.cursor() as cursor:
                if client_id:
                    sql = "SELECT * FROM clients WHERE client_id = %s"
                    cursor.execute(sql, (client_id,))
                elif username:
                    sql = "SELECT * FROM clients WHERE username = %s"
                    cursor.execute(sql, (username,))
                else:
                    self.logger.error("Must provide either client_id or username")
                    return None

                data = cursor.fetchone()

                if data:
                    # Parse JSON string back to dict
                    if isinstance(data['custom_attributes'], str):
                        data['custom_attributes'] = json.loads(data['custom_attributes'])

                    return LomTechClient.from_dict(data)
                return None

        except Exception as e:
            self.logger.error(f"Failed to get client: {e}")
            return None

    def update_client(self, client: LomTechClient) -> bool:
        """Update a client in the database."""
        try:
            with self.connection.cursor() as cursor:
                client_dict = client.to_dict()
                client_id = client_dict.pop("client_id")

                # Convert custom_attributes to JSON string
                if isinstance(client_dict['custom_attributes'], dict):
                    client_dict['custom_attributes'] = json.dumps(client_dict['custom_attributes'])

                # Build SET clause for SQL
                set_clause = ', '.join([f"{key} = %s" for key in client_dict.keys()])
                sql = f"UPDATE clients SET {set_clause} WHERE client_id = %s"

                # Add client_id to the end of values for WHERE clause
                cursor.execute(sql, list(client_dict.values()) + [client_id])

            self.connection.commit()
            self.logger.info(f"Updated client: {client.username}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to update client: {e}")
            return False

    def delete_client(self, client_id: str) -> bool:
        """Delete a client by ID."""
        try:
            with self.connection.cursor() as cursor:
                # Delete the client
                sql = "DELETE FROM clients WHERE client_id = %s"
                cursor.execute(sql, (client_id,))

            self.connection.commit()
            self.logger.info(f"Deleted client: {client_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to delete client: {e}")
            return False

    def list_clients(self, status: str = None) -> List[LomTechClient]:
        """List all clients, optionally filtering by status."""
        try:
            with self.connection.cursor() as cursor:
                if status:
                    sql = "SELECT * FROM clients WHERE status = %s ORDER BY username"
                    cursor.execute(sql, (status,))
                else:
                    sql = "SELECT * FROM clients ORDER BY username"
                    cursor.execute(sql)

                clients = []

                for data in cursor.fetchall():
                    # Parse JSON string back to dict
                    if isinstance(data['custom_attributes'], str):
                        data['custom_attributes'] = json.loads(data['custom_attributes'])

                    clients.append(LomTechClient.from_dict(data))

                return clients

        except Exception as e:
            self.logger.error(f"Failed to list clients: {e}")
            return []

    def record_payment(self, client_id: str, amount: float, package_id: str = None,
                       payment_method: str = "cash", reference_number: str = "", notes: str = "") -> bool:
        """Record a payment from a client."""
        try:
            payment_id = str(uuid.uuid4())

            with self.connection.cursor() as cursor:
                sql = """
                INSERT INTO payments 
                (payment_id, client_id, amount, package_id, payment_method, reference_number, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    payment_id, client_id, amount, package_id,
                    payment_method, reference_number, notes
                ))

            self.connection.commit()
            self.logger.info(f"Recorded payment of {amount} for client {client_id}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to record payment: {e}")
            return False

    def get_client_payments(self, client_id: str) -> List[Dict]:
        """Get all payments for a client."""
        try:
            with self.connection.cursor() as cursor:
                sql = """
                SELECT p.*, c.username, pkg.name as package_name 
                FROM payments p
                JOIN clients c ON p.client_id = c.client_id
                LEFT JOIN packages pkg ON p.package_id = pkg.package_id
                WHERE p.client_id = %s
                ORDER BY p.payment_date DESC
                """
                cursor.execute(sql, (client_id,))
                return cursor.fetchall()

        except Exception as e:
            self.logger.error(f"Failed to get client payments: {e}")
            return []

    def record_usage(self, client_id: str, session_id: str,
                     upload_bytes: int, download_bytes: int,
                     start_time: str = None, end_time: str = None,
                     ip_address: str = "", nas_identifier: str = "") -> bool:
        """Record client usage data."""
        try:
            log_id = str(uuid.uuid4())
            start_time = start_time or datetime.datetime.now().isoformat()

            with self.connection.cursor() as cursor:
                sql = """
                INSERT INTO usage_logs 
                (log_id, client_id, session_id, start_time, end_time, 
                upload_bytes, download_bytes, ip_address, nas_identifier)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    log_id, client_id, session_id, start_time, end_time,
                    upload_bytes, download_bytes, ip_address, nas_identifier
                ))

                # Update total data used by the client
                total_bytes = upload_bytes + download_bytes
                total_gb = total_bytes / (1024 * 1024 * 1024)  # Convert to GB

                update_sql = """
                UPDATE clients 
                SET used_data = used_data + %s
                WHERE client_id = %s
                """
                cursor.execute(update_sql, (total_gb, client_id))

            self.connection.commit()
            self.logger.info(f"Recorded usage for client {client_id}: {total_gb:.2f}GB")
            return True

        except Exception as e:
            self.logger.error(f"Failed to record usage: {e}")
            return False

    def get_client_usage(self, client_id: str, days: int = 30) -> Dict:
        """Get client usage summary for the specified period."""
        try:
            with self.connection.cursor() as cursor:
                # Calculate date range
                end_date = datetime.datetime.now()
                start_date = end_date - datetime.timedelta(days=days)

                # Get total usage for the period
                sql = """
                SELECT 
                    SUM(upload_bytes) as total_upload,
                    SUM(download_bytes) as total_download,
                    COUNT(DISTINCT session_id) as session_count
                FROM usage_logs
                WHERE client_id = %s
                AND start_time BETWEEN %s AND %s
                """
                cursor.execute(sql, (client_id, start_date, end_date))
                totals = cursor.fetchone() or {
                    'total_upload': 0,
                    'total_download': 0,
                    'session_count': 0
                }

                # Get daily usage
                daily_sql = """
                SELECT 
                    DATE(start_time) as date,
                    SUM(upload_bytes) as upload,
                    SUM(download_bytes) as download
                FROM usage_logs
                WHERE client_id = %s
                AND start_time BETWEEN %s AND %s
                GROUP BY DATE(start_time)
                ORDER BY date
                """
                cursor.execute(daily_sql, (client_id, start_date, end_date))
                daily = cursor.fetchall()

                # Convert bytes to more readable format
                result = {
                    'total_upload_gb': totals['total_upload'] / (1024 ** 3) if totals['total_upload'] else 0,
                    'total_download_gb': totals['total_download'] / (1024 ** 3) if totals['total_download'] else 0,
                    'total_gb': (totals['total_upload'] + totals['total_download']) / (1024 ** 3)
                    if (totals['total_upload'] and totals['total_download']) else 0,
                    'session_count': totals['session_count'] or 0,
                    'daily_usage': [{
                        'date': day['date'].strftime('%Y-%m-%d') if isinstance(day['date'], datetime.date) else day[
                            'date'],
                        'upload_gb': day['upload'] / (1024 ** 3) if day['upload'] else 0,
                        'download_gb': day['download'] / (1024 ** 3) if day['download'] else 0,
                        'total_gb': (day['upload'] + day['download']) / (1024 ** 3)
                        if (day['upload'] and day['download']) else 0
                    } for day in daily]
                }

                return result

        except Exception as e:
            self.logger.error(f"Failed to get client usage: {e}")
            return {
                'total_upload_gb': 0,
                'total_download_gb': 0,
                'total_gb': 0,
                'session_count': 0,
                'daily_usage': []
            }
