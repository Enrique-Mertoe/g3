import logging

from librouteros import connect

from lom_mtk.utility import LomTechLogger


class LomTechMikrotik:
    """Main class for LomTech Mikrotik automation."""

    def __init__(self, host, username, password, port=8728, log_level=logging.INFO):
        """Initialize the LomTech Mikrotik automation.

        Args:
            host: Mikrotik router IP address or hostname
            username: Mikrotik username
            password: Mikrotik password
            port: API port (default: 8728)
            log_level: Logging level (default: INFO)
        """
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.api = None
        self.logger = LomTechLogger(log_level)

        # Configuration prefix for all LomTech configurations
        self.prefix = "lom_tech"

    def connect(self):
        """Connect to the Mikrotik router."""
        try:
            self.logger.info(f"Connecting to Mikrotik at {self.host}:{self.port}")
            self.api = connect(
                username=self.username,
                password=self.password,
                host=self.host,
                port=self.port
            )
            self.logger.info("Connection successful")
            return True
        except Exception as e:
            self.logger.error(f"Connection failed: {e}")
            return False

    def disconnect(self):
        """Close the connection to the router."""
        if self.api:
            self.api.close()
            self.logger.info("Disconnected from Mikrotik")

    def _item_exists(self, path, field_name, field_value):
        """Check if an item exists in the specified path with matching field value.

        Args:
            path: API path to check
            field_name: Field name to match
            field_value: Value to match

        Returns:
            Tuple (exists, item_id) where exists is boolean and item_id is the ID if found
        """
        try:
            items = self.api.path(path)
            for item in items:
                if field_name in item and item[field_name] == field_value:
                    return True, item['.id']
            return False, None
        except Exception as e:
            self.logger.error(f"Error checking if item exists: {e}")
            return False, None
