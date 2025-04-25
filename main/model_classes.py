from dataclasses import dataclass, asdict
from typing import Dict, Any


@dataclass
class VPNUser:
    username: str
    full_name: str = ""
    email: str = ""
    created_at: str = ""
    last_connected: str = ""
    expiry_date: str = "unknown"
    active: bool = False
    ip: str = ""
    download: int = 0
    upload: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)