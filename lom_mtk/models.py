import datetime
import uuid
from typing import Dict


class LomTechPackage:
    """Class representing an internet service package/plan."""

    def __init__(self,
                 package_id: str = None,
                 name: str = "",
                 download_speed: int = 1,  # in Mbps
                 upload_speed: int = 1,  # in Mbps
                 data_quota: int = 0,  # in GB, 0 means unlimited
                 price: float = 0.0,
                 duration: int = 30,  # in days
                 burst_enabled: bool = False,
                 burst_threshold: int = 0,  # percentage of limit before burst
                 burst_time: int = 0,  # in seconds
                 description: str = "",
                 active: bool = True):
        """Initialize a new internet package.

        Args:
            package_id: Unique ID for the package (generated if None)
            name: Name of the package
            download_speed: Download speed in Mbps
            upload_speed: Upload speed in Mbps
            data_quota: Data quota in GB (0 for unlimited)
            price: Price of the package
            duration: Duration in days
            burst_enabled: Whether burst is enabled
            burst_threshold: Burst threshold (percentage)
            burst_time: Burst time in seconds
            description: Package description
            active: Whether package is active
        """
        self.package_id = package_id or str(uuid.uuid4())
        self.name = name
        self.download_speed = download_speed
        self.upload_speed = upload_speed
        self.data_quota = data_quota
        self.price = price
        self.duration = duration
        self.burst_enabled = burst_enabled
        self.burst_threshold = burst_threshold
        self.burst_time = burst_time
        self.description = description
        self.active = active
        self.created_at = datetime.datetime.now().isoformat()

    def to_dict(self) -> Dict:
        """Convert package to dictionary."""
        return {
            "package_id": self.package_id,
            "name": self.name,
            "download_speed": self.download_speed,
            "upload_speed": self.upload_speed,
            "data_quota": self.data_quota,
            "price": self.price,
            "duration": self.duration,
            "burst_enabled": self.burst_enabled,
            "burst_threshold": self.burst_threshold,
            "burst_time": self.burst_time,
            "description": self.description,
            "active": self.active,
            "created_at": self.created_at
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'LomTechPackage':
        """Create package from dictionary."""
        return cls(
            package_id=data.get("package_id"),
            name=data.get("name", ""),
            download_speed=data.get("download_speed", 1),
            upload_speed=data.get("upload_speed", 1),
            data_quota=data.get("data_quota", 0),
            price=data.get("price", 0.0),
            duration=data.get("duration", 30),
            burst_enabled=data.get("burst_enabled", False),
            burst_threshold=data.get("burst_threshold", 0),
            burst_time=data.get("burst_time", 0),
            description=data.get("description", ""),
            active=data.get("active", True)
        )

    def get_rate_limit(self) -> str:
        """Get Mikrotik-compatible rate limit string."""
        if not self.burst_enabled:
            return f"{self.download_speed}M/{self.upload_speed}M"

        # Calculate burst rates (50% higher for example)
        burst_download = int(self.download_speed * 1.5)
        burst_upload = int(self.upload_speed * 1.5)

        # Format: max-download/max-upload burst-download/burst-upload burst-threshold-percent/burst-time
        return f"{self.download_speed}M/{self.upload_speed}M {burst_download}M/{burst_upload}M {self.burst_threshold}/{self.burst_time}"


class LomTechClient:
    """Class representing an ISP client."""

    def __init__(self,
                 client_id: str = None,
                 username: str = "",
                 password: str = "",
                 full_name: str = "",
                 email: str = "",
                 phone: str = "",
                 address: str = "",
                 package_id: str = "",
                 start_date: str = None,
                 expiry_date: str = None,
                 status: str = "active",
                 used_data: float = 0.0,  # in GB
                 notes: str = "",
                 custom_attributes: Dict = None):
        """Initialize a new client.

        Args:
            client_id: Unique ID for the client (generated if None)
            username: Client's PPPoE username
            password: Client's PPPoE password
            full_name: Client's full name
            email: Client's email address
            phone: Client's phone number
            address: Client's physical address
            package_id: ID of the assigned package
            start_date: Start date of service (ISO format)
            expiry_date: Expiry date of service (ISO format)
            status: Client status (active, suspended, expired)
            used_data: Data used by client in GB
            notes: Additional notes
            custom_attributes: Custom client attributes
        """
        self.client_id = client_id or str(uuid.uuid4())
        self.username = username
        self.password = password
        self.full_name = full_name
        self.email = email
        self.phone = phone
        self.address = address
        self.package_id = package_id

        # Set dates
        now = datetime.datetime.now()
        self.start_date = start_date or now.isoformat()

        if expiry_date:
            self.expiry_date = expiry_date
        else:
            # Default expiry is 30 days from now
            self.expiry_date = (now + datetime.timedelta(days=30)).isoformat()

        self.status = status
        self.used_data = used_data
        self.notes = notes
        self.custom_attributes = custom_attributes or {}
        self.created_at = now.isoformat()

    def to_dict(self) -> Dict:
        """Convert client to dictionary."""
        return {
            "client_id": self.client_id,
            "username": self.username,
            "password": self.password,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "package_id": self.package_id,
            "start_date": self.start_date,
            "expiry_date": self.expiry_date,
            "status": self.status,
            "used_data": self.used_data,
            "notes": self.notes,
            "custom_attributes": self.custom_attributes,
            "created_at": self.created_at
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'LomTechClient':
        """Create client from dictionary."""
        return cls(
            client_id=data.get("client_id"),
            username=data.get("username", ""),
            password=data.get("password", ""),
            full_name=data.get("full_name", ""),
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            address=data.get("address", ""),
            package_id=data.get("package_id", ""),
            start_date=data.get("start_date"),
            expiry_date=data.get("expiry_date"),
            status=data.get("status", "active"),
            used_data=data.get("used_data", 0.0),
            notes=data.get("notes", ""),
            custom_attributes=data.get("custom_attributes", {})
        )

    def is_expired(self) -> bool:
        """Check if client subscription has expired."""
        if not self.expiry_date:
            return False

        now = datetime.datetime.now()
        expiry = datetime.datetime.fromisoformat(self.expiry_date)
        return now > expiry
