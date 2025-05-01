import os
import time
import mysql.connector
from typing import Dict, List, Optional, Any
from helpers import logger

import routeros_api

from main.dir_manager import VPNManager

VALID_API_KEYS = {os.environ.get("API_KEY", "test-api-key")}

# RADIUS database configuration
RADIUS_DB = {
    "host": os.environ.get("RADIUS_DB_HOST", "localhost"),
    "user": os.environ.get("RADIUS_DB_USER", "radius"),
    "password": os.environ.get("RADIUS_DB_PASSWORD", "radiuspassword"),
    "database": os.environ.get("RADIUS_DB_NAME", "radius")
}


class RadiusManager:
    """Manages RADIUS server interactions through database operations"""
    
    @staticmethod
    def get_db_connection():
        """Create a connection to the RADIUS database"""
        return mysql.connector.connect(
            host=RADIUS_DB["host"],
            user=RADIUS_DB["user"],
            password=RADIUS_DB["password"],
            database=RADIUS_DB["database"]
        )
    
    @staticmethod
    def add_user(username: str, password: str, service_type: str, rate_limit: Optional[str] = None,
                 session_timeout: Optional[int] = None) -> Dict[str, Any]:
        """Add a user to the RADIUS database"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor()
            
            # Add user authentication credentials
            cursor.execute(
                "INSERT INTO radcheck (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                (username, "Cleartext-Password", ":=", password)
            )
            
            # Add service type if specified
            if service_type:
                cursor.execute(
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (username, "Service-Type", ":=", service_type)
                )
            
            # Add rate limit if specified (format: "512k/1M" for 512kbps up, 1Mbps down)
            if rate_limit:
                up_rate, down_rate = rate_limit.split("/")
                cursor.execute(
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (username, "WISPr-Bandwidth-Max-Up", ":=", up_rate.replace("k", "000").replace("M", "000000"))
                )
                cursor.execute(
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (username, "WISPr-Bandwidth-Max-Down", ":=", down_rate.replace("k", "000").replace("M", "000000"))
                )
            
            # Add session timeout if specified (in seconds)
            if session_timeout:
                cursor.execute(
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (username, "Session-Timeout", ":=", str(session_timeout))
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {"message": f"User {username} added to RADIUS successfully", "error": False}
        except Exception as e:
            raise
            return {"message": f"Failed to add user {username} to RADIUS: {str(e)}", "error": True}
    
    @staticmethod
    def remove_user(username: str) -> Dict[str, Any]:
        """Remove a user from the RADIUS database"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor()
            
            # Delete from radcheck
            cursor.execute("DELETE FROM radcheck WHERE username = %s", (username,))
            
            # Delete from radreply
            cursor.execute("DELETE FROM radreply WHERE username = %s", (username,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {"message": f"User {username} removed from RADIUS successfully", "error": False}
        except Exception as e:
            return {"message": f"Failed to remove user {username} from RADIUS: {str(e)}", "error": True}
    
    @staticmethod
    def create_profile(name: str, rate_limit: Optional[str] = None,
                      session_timeout: Optional[int] = None) -> Dict[str, Any]:
        """
        Create a profile in the RADIUS database
        Profiles in RADIUS are implemented as group attributes
        """
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor()
            
            # Create a group entry by adding attributes to radgroupreply
            if rate_limit:
                up_rate, down_rate = rate_limit.split("/")
                cursor.execute(
                    "INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (name, "WISPr-Bandwidth-Max-Up", ":=", up_rate.replace("k", "000").replace("M", "000000"))
                )
                cursor.execute(
                    "INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (name, "WISPr-Bandwidth-Max-Down", ":=", down_rate.replace("k", "000").replace("M", "000000"))
                )
            
            if session_timeout:
                cursor.execute(
                    "INSERT INTO radgroupreply (groupname, attribute, op, value) VALUES (%s, %s, %s, %s)",
                    (name, "Session-Timeout", ":=", str(session_timeout))
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {"message": f"Profile {name} created in RADIUS successfully", "error": False}
        except Exception as e:
            raise
            return {"message": f"Failed to create profile {name} in RADIUS: {str(e)}", "error": True}
    
    @staticmethod
    def remove_profile(name: str) -> Dict[str, Any]:
        """Remove a profile from the RADIUS database"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor()
            
            # Delete profile (group) entries
            cursor.execute("DELETE FROM radgroupreply WHERE groupname = %s", (name,))
            cursor.execute("DELETE FROM radgroupcheck WHERE groupname = %s", (name,))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {"message": f"Profile {name} removed from RADIUS successfully", "error": False}
        except Exception as e:
            return {"message": f"Failed to remove profile {name} from RADIUS: {str(e)}", "error": True}
    
    @staticmethod
    def assign_user_to_profile(username: str, profile_name: str) -> Dict[str, Any]:
        """Assign a user to a profile (group) in RADIUS"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor()
            
            # Add user to group
            cursor.execute(
                "INSERT INTO radusergroup (username, groupname, priority) VALUES (%s, %s, %s)",
                (username, profile_name, 1)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {"message": f"User {username} assigned to profile {profile_name}", "error": False}
        except Exception as e:
            return {"message": f"Failed to assign user {username} to profile {profile_name}: {str(e)}", "error": True}
    
    @staticmethod
    def get_active_sessions() -> List[Dict[str, Any]]:
        """Get currently active user sessions from the RADIUS database"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Select active sessions (those with no acctstoptime)
            cursor.execute("""
                SELECT username, acctstarttime, acctsessiontime, framedipaddress, 
                       acctinputoctets, acctoutputoctets, nasipaddress
                FROM radacct 
                WHERE acctstoptime IS NULL
            """)
            
            active_sessions = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return active_sessions
        except Exception as e:
            print(f"Error getting active sessions: {str(e)}")
            return []
    
    @staticmethod
    def get_user_usage(username: str) -> Dict[str, Any]:
        """Get usage statistics for a specific user"""
        try:
            conn = RadiusManager.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Get user's current session if active
            cursor.execute("""
                SELECT username, acctstarttime, acctsessiontime, framedipaddress, 
                       acctinputoctets, acctoutputoctets, nasipaddress
                FROM radacct 
                WHERE username = %s AND acctstoptime IS NULL
                ORDER BY acctstarttime DESC LIMIT 1
            """, (username,))
            
            current_session = cursor.fetchone()
            
            # Get total usage statistics (sum of all sessions)
            cursor.execute("""
                SELECT SUM(acctinputoctets) as total_input, 
                       SUM(acctoutputoctets) as total_output,
                       SUM(acctsessiontime) as total_time,
                       COUNT(*) as total_sessions
                FROM radacct 
                WHERE username = %s
            """, (username,))
            
            total_usage = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            result = {
                "username": username,
                "current_session": current_session if current_session else None,
                "total_usage": total_usage,
            }
            
            return result
        except Exception as e:
            return {"message": f"Failed to get usage for user {username}: {str(e)}", "error": True}


class MTK:
    conn: None | routeros_api.RouterOsApiPool = None
    server_id: str

    def __init__(self, data):
        self.data = data
        self.api = connect_to_router(data["router"])
        MTK.server_id = data["server_id"]

    def bridge(self, lan_interfaces: list = None):
        bridge_name = f"bridge-{self.server_id}"
        # Fetch bridges
        bridge_resource = self.api.get_resource('/interface/bridge')
        bridges = bridge_resource.get()
        existing = [b for b in bridges if b['name'] == bridge_name]
        if existing:
            return bridge_name

        if lan_interfaces is None:
            lan_interfaces = ["ether2", "ether3", "ether4"]
        bridge_resource.add(name=bridge_name, protocol_mode="rstp",
                            comment=f"Default bridge for {self.server_id}")
        irs = self.api.get_resource("/interface/bridge/port")
        for interface in lan_interfaces:
            if not irs.get(interface=interface):
                irs.add(
                    interface=interface,
                    bridge=bridge_name
                )

        # Set IP on bridge
        iip = self.api.get_resource("/ip/address")
        iip.add(
            address="192.168.88.1/24",
            interface=bridge_name
        )
        return bridge_name

    def pool(self, ranges=None):
        pool_name = f"pool-{MTK.server_id}"
        pool_range = ranges or "192.168.100.10-192.168.100.100"
        ip_pool_resource = self.api.get_resource('/ip/pool')
        pools = ip_pool_resource.get()
        # Check if pool exists
        existing_pool = [p for p in pools if p['name'] == pool_name]
        if existing_pool:
            return pool_name
        ip_pool_resource.add(name=pool_name, ranges=pool_range)
        return pool_name


def convert_to_seconds(time_str):
    """
    Convert a time string in format like "30 days", "45 minutes", "2 months" to seconds.
    
    Args:
        time_str (str): Time string in format " " where unit can be
                       "minute(s)", "day(s)", or "month(s)"
    
    Returns:
        int: Time converted to seconds
    """
    if not time_str or not isinstance(time_str, str):
        return 0
    
    # Split the string to get the number and unit
    parts = time_str.strip().split()
    if len(parts) < 2:
        return 0
    
    try:
        value = float(parts[0])
        unit = parts[1].lower()
        
        # Normalize unit (handle both singular and plural)
        if unit.startswith('minute') or unit == 'min' or unit == 'mins':
            # 1 minute = 60 seconds
            return int(value * 60)
        elif unit.startswith('hour') or unit == 'hr' or unit == 'hrs':
            # 1 hour = 3600 seconds (60 * 60)
            return int(value * 3600)
        elif unit.startswith('day'):
            # 1 day = 86400 seconds (24 * 60 * 60)
            return int(value * 86400)
        elif unit.startswith('week'):
            # 1 week = 604800 seconds (7 * 24 * 60 * 60)
            return int(value * 604800)
        elif unit.startswith('month'):
            # 1 month ≈ 30 days = 2592000 seconds (30 * 24 * 60 * 60)
            return int(value * 2592000)
        elif unit.startswith('year'):
            # 1 year ≈ 365 days = 31536000 seconds (365 * 24 * 60 * 60)
            return int(value * 31536000)
        else:
            # Default to seconds if unit is not recognized
            return int(value)
    except (ValueError, IndexError):
        return 0


def authenticate_request(data):
    """Validate the API key from the request"""
    api_key = data.get("api_key")
    if not api_key or api_key not in VALID_API_KEYS:
        return False
    return True

def connect_to_router(router_credentials) -> routeros_api.api.RouterOsApi:
    """Create a connection to the MikroTik router with better error handling"""
    try:
        host = VPNManager.getIpAddress(router_credentials["host"])
        logger.info(f"Attempting to connect to router at {host}")
        
        # Add timeout for connection attempts
        connection = routeros_api.RouterOsApiPool(
            host=host,
            username=router_credentials["username"],
            password=router_credentials["password"],
            plaintext_login=True,
            port=router_credentials.get("port", 8728),  # Default port is 8728 for API
            use_ssl=router_credentials.get("use_ssl", False),
            ssl_verify=router_credentials.get("ssl_verify", True),
            # timeout=5  # Add a timeout of 5 seconds
        )
        MTK.conn = connection
        api = connection.get_api()
        logger.info(f"Successfully connected to router at {host}")
        return api
        
    except routeros_api.exceptions.RouterOsApiConnectionError as e:
        logger.error(f"Failed to connect to router at {host}: {str(e)}")
        raise Exception(f"Could not connect to router at {host}. Please check if the router is online and reachable.")
    except Exception as e:
        logger.error(f"Unexpected error connecting to router: {str(e)}")
        raise


# def connect_to_router(router_credentials) -> routeros_api.api.RouterOsApi:
#     """Create a connection to the MikroTik router"""
#     host = VPNManager.getIpAddress(router_credentials["host"])
#     connection = routeros_api.RouterOsApiPool(
#         host=host,
#         username=router_credentials["username"],
#         password=router_credentials["password"],
#         plaintext_login=True
#     )
#     MTK.conn = connection
#     return connection.get_api()


def setup_radius_client(router_api, params):
    """Configure the MikroTik router to use a RADIUS server for authentication"""
    try:
        # Add RADIUS server for authentication
        radius_resource = router_api.get_resource('/radius')
        radius_resource.add(
            address=params["radius_server_ip"],
            secret=params["radius_secret"],
            service="ppp,hotspot",
            timeout="2s",
            comment=f"RADIUS server for {params.get('service', 'all services')}"
        )
        
        return {"message": "RADIUS server configured successfully", "error": False}
    except Exception as e:
        return {"message": f"Failed to configure RADIUS server: {str(e)}", "error": True}


def setup_pppoe_server_with_radius(router_api, params, mtk: MTK):
    """Set up a PPPoE server that uses RADIUS for authentication"""
    try:
        pool_name = mtk.pool(params["ip_pool_range"])
        
        # Set up PPP profile for RADIUS authentication
        profile_resource = router_api.get_resource('/ppp/profile')
        profile_name = f"radius-pppoe-{mtk.server_id}"
        
        # Check if profile already exists
        profiles = profile_resource.get()
        existing = [p for p in profiles if p['name'] == profile_name]
        
        if not existing:
            profile_resource.add(
                name=profile_name,
                local_address=pool_name,
                remote_address=pool_name,
                use_radius="yes",
                dns_server=",".join(params["dns_servers"]),
                comment="Profile for RADIUS authentication"
            )
        
        # Enable PPPoE server on interface
        bridge_name = mtk.bridge(params["ports"])
        pppoe_server_resource = router_api.get_resource('/interface/pppoe-server/server')
        
        # Check if server already exists
        servers = pppoe_server_resource.get()
        existing_server = [s for s in servers if s['service-name'] == f"pppoe-{bridge_name}"]
        
        if not existing_server:
            pppoe_server_resource.add(
                service_name=f"pppoe-{bridge_name}",
                interface=bridge_name,
                default_profile=profile_name,
                disabled="no",
                one_session_per_host="yes",
                use_radius="yes"
            )
        
        return {"message": f"PPPoE server with RADIUS authentication set up successfully on {bridge_name}", "error": False}
    except Exception as e:
        return {"message": f"Failed to set up PPPoE server: {str(e)}", "error": True}


def setup_hotspot_server_with_radius(router_api, params, mtk: MTK):
    """Set up a Hotspot server that uses RADIUS for authentication"""
    try:
        # Create bridge interface if needed
        bridge_name = mtk.bridge(params["ports"])
        
        # Create IP pool if provided
        if params.get("ip_pool"):
            pool_name = f"hotspot-{bridge_name}"
            ip_pool_resource = router_api.get_resource('/ip/pool')
            
            # Check if pool already exists
            pools = ip_pool_resource.get()
            existing_pool = [p for p in pools if p['name'] == pool_name]
            
            if not existing_pool:
                ip_pool_resource.add(
                    name=pool_name,
                    ranges=params["ip_pool"]
                )
        
        # Configure hotspot server
        server_resource = router_api.get_resource('/ip/hotspot')
        
        # Check if hotspot server already exists
        servers = server_resource.get()
        existing_server = [s for s in servers if s['interface'] == bridge_name]
        
        if not existing_server:
            # Run the hotspot setup
            setup_resource = router_api.get_resource('/ip/hotspot/setup')
            setup_resource.add(
                interface=bridge_name,
                address=params["network"],
                dns_name=params["dns_name"]
            )
        
        # Configure RADIUS authentication for hotspot
        server_profile_resource = router_api.get_resource('/ip/hotspot/profile')
        profiles = server_profile_resource.get()
        
        # Find the default profile for our hotspot
        default_profile = next((p for p in profiles if p['hotspot'] == bridge_name), None)
        
        if default_profile:
            # Update the profile to use RADIUS
            server_profile_resource.set(
                id=default_profile['id'],
                use_radius="yes"
            )
        
        return {"message": f"Hotspot server with RADIUS authentication set up successfully on {bridge_name}", "error": False}
    except Exception as e:
        return {"message": f"Failed to set up Hotspot server: {str(e)}", "error": True}


def add_client(params):
    """Add a new client to the RADIUS database"""
    try:
        service_type = "Framed-User" if params["service"] == "pppoe" else "Login-User"
        
        # Set rate limit if provided in profile
        rate_limit = None
        session_timeout = None
        
        # Get profile information if needed (optional)
        if params.get("profile_name"):
            # Here you could query the profile to get rate limits, etc.
            # For now we'll just use any directly provided values
            pass
        
        result = RadiusManager.add_user(
            username=params["username"],
            password=params["password"],
            service_type=service_type,
            rate_limit=rate_limit,
            session_timeout=session_timeout
        )
        
        # Assign user to profile if specified
        if params.get("profile_name") and not result.get("error", False):
            RadiusManager.assign_user_to_profile(params["username"], params["profile_name"])
        
        return result
    except Exception as e:
        return {"message": f"Failed to add client: {str(e)}", "error": True}


def remove_client(params):
    """Remove a client from the RADIUS database"""
    try:
        result = RadiusManager.remove_user(params["username"])
        return result
    except Exception as e:
        return {"message": f"Failed to remove client: {str(e)}", "error": True}


def create_profile(params):
    """Create a new profile in the RADIUS database"""
    try:
        # Convert session timeout to seconds if provided
        session_timeout = None
        if params.get("session_timeout"):
            session_timeout = convert_to_seconds(params["session_timeout"])
        
        result = RadiusManager.create_profile(
            name=params["name"],
            rate_limit=params.get("rate_limit"),
            session_timeout=session_timeout
        )
        
        return result
    except Exception as e:
        return {"message": f"Failed to create profile: {str(e)}", "error": True}


def remove_profile(params):
    """Remove a profile from the RADIUS database"""
    try:
        result = RadiusManager.remove_profile(params["name"])
        return result
    except Exception as e:
        return {"message": f"Failed to remove profile: {str(e)}", "error": True}


def get_active_clients(params):
    """Get all active clients from the RADIUS database"""
    try:
        active_sessions = RadiusManager.get_active_sessions()
        
        # Filter by service type if specified
        if params.get("service"):
            if params["service"] == "pppoe":
                # Filter for PPPoE sessions (could be refined based on your RADIUS setup)
                active_sessions = [s for s in active_sessions if s.get("service_type") == "Framed-User"]
            elif params["service"] == "hotspot":
                # Filter for Hotspot sessions
                active_sessions = [s for s in active_sessions if s.get("service_type") == "Login-User"]
        
        return active_sessions
    except Exception as e:
        return {"message": f"Failed to get active clients: {str(e)}", "error": True}


def get_client_usage(params):
    """Get usage statistics for a specific client"""
    try:
        usage = RadiusManager.get_user_usage(params["username"])
        return usage
    except Exception as e:
        return {"message": f"Failed to get client usage: {str(e)}", "error": True}


def generate_hotspot_vouchers(params):
    """Generate multiple hotspot voucher users in the RADIUS database"""
    import random
    import string
    
    try:
        profile_name = params["profile_name"]
        count = params["count"]
        prefix = params.get("prefix", "")
        length = params.get("length", 6)
        uptime_limit = params.get("uptime_limit")
        
        # Convert uptime limit to seconds if provided
        session_timeout = None
        if uptime_limit:
            session_timeout = convert_to_seconds(uptime_limit)
        
        vouchers = []
        
        for _ in range(count):
            # Generate a random code
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
            full_code = f"{prefix}{code}"
            
            # Add user to RADIUS
            result = RadiusManager.add_user(
                username=full_code,
                password=full_code,  # Use the same code as password
                service_type="Login-User",  # For hotspot
                session_timeout=session_timeout
            )
            
            # Assign to profile if specified
            if not result.get("error", False):
                RadiusManager.assign_user_to_profile(full_code, profile_name)
                vouchers.append(full_code)
        
        return {"message": f"Generated {len(vouchers)} vouchers", "vouchers": vouchers, "error": False}
    except Exception as e:
        return {"message": f"Failed to generate vouchers: {str(e)}", "error": True}


def customize_hotspot_login_page(router_api, params):
    """Customize the hotspot login page appearance - unchanged from original"""
    # Access and modify the hotspot HTML files
    # This is a simplified implementation - in reality, you would need to modify HTML files
    resource = router_api.get_resource('/file')
    html_files = resource.get(where='.html')

    # In a real implementation, you would download the login page HTML,
    # modify it with the custom title, background color, logo, etc.,
    # and then upload it back to the router

    return {"message": "Hotspot login page customized successfully"}

# Additional MikroTik functions to integrate with the RADIUS implementation

def add_walled_garden_site(router_api, params):
    """Add a site to the walled garden (accessible without login)"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')

    # Format: Creating a rule for the domain
    resource.add(
        dst_host=params["domain"],
        action="allow"
    )

    return {"message": f"Added {params['domain']} to walled garden", "error": False}


def remove_walled_garden_site(router_api, params):
    """Remove a site from the walled garden"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')
    entries = resource.get(dst_host=params["domain"])

    if entries:
        resource.remove(id=entries[0]["id"])
        return {"message": f"Removed {params['domain']} from walled garden", "error": False}
    else:
        return {"message": f"Domain {params['domain']} not found in walled garden", "error": True}


def list_walled_garden_sites(router_api):
    """List all walled garden entries"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')
    entries = resource.get()
    return {"entries": entries, "error": False}


def disconnect_hotspot_user(router_api, params):
    """Force disconnect a currently connected hotspot user"""
    resource = router_api.get_resource('/ip/hotspot/active')
    users = resource.get(user=params["username"])

    if users:
        resource.remove(id=users[0]["id"])
        return {"message": f"Disconnected hotspot user {params['username']}", "error": False}
    else:
        return {"message": f"Active session for {params['username']} not found", "error": True}


def get_hotspot_usage_report(router_api, params):
    """Get usage statistics for the hotspot"""
    try:
        period = params.get("period", "daily")
        
        # Get all active hotspot users
        active_resource = router_api.get_resource('/ip/hotspot/active')
        active_users = active_resource.get()
        
        # Get hotspot host data for traffic stats
        host_resource = router_api.get_resource('/ip/hotspot/host')
        hosts = host_resource.get()
        
        # Calculate total data used
        total_bytes_in = sum(int(host.get('bytes-in', 0)) for host in hosts)
        total_bytes_out = sum(int(host.get('bytes-out', 0)) for host in hosts)
        
        # Calculate average session time from active sessions
        if active_users:
            total_uptime = sum(convert_to_seconds(user.get('uptime', '0s')) for user in active_users)
            avg_session_time = total_uptime / len(active_users)
        else:
            avg_session_time = 0
        
        # Format results in human-readable format
        def format_bytes(bytes_count):
            """Convert bytes to human readable format"""
            if bytes_count < 1024:
                return f"{bytes_count}B"
            elif bytes_count < 1024 * 1024:
                return f"{bytes_count/1024:.2f}KB"
            elif bytes_count < 1024 * 1024 * 1024:
                return f"{bytes_count/(1024*1024):.2f}MB"
            else:
                return f"{bytes_count/(1024*1024*1024):.2f}GB"
        
        def format_time(seconds):
            """Convert seconds to human readable format"""
            if seconds < 60:
                return f"{seconds}s"
            elif seconds < 3600:
                return f"{seconds//60}m {seconds%60}s"
            else:
                hours = seconds // 3600
                minutes = (seconds % 3600) // 60
                return f"{hours}h {minutes}m"
        
        return {
            "period": period,
            "total_users": len(hosts),
            "active_sessions": len(active_users),
            "data_in": format_bytes(total_bytes_in),
            "data_out": format_bytes(total_bytes_out),
            "data_total": format_bytes(total_bytes_in + total_bytes_out),
            "average_session_time": format_time(int(avg_session_time)),
            "error": False
        }
    except Exception as e:
        return {"message": f"Failed to generate hotspot usage report: {str(e)}", "error": True}


def get_router_resource_usage(router_api):
    """Get resource usage statistics from the router (CPU, memory, etc.)"""
    try:
        # Get system resource data
        resource = router_api.get_resource('/system/resource')
        data = resource.get()[0]  # Get the first (and only) entry
        
        # Format storage data (convert bytes to human readable)
        free_memory_mb = int(data.get('free-memory', 0)) / (1024 * 1024)
        total_memory_mb = int(data.get('total-memory', 0)) / (1024 * 1024)
        free_hdd_mb = int(data.get('free-hdd-space', 0)) / (1024 * 1024)
        total_hdd_mb = int(data.get('total-hdd-space', 0)) / (1024 * 1024)
        
        return {
            "uptime": data.get('uptime', 'Unknown'),
            "cpu_load": data.get('cpu-load', 'Unknown'),
            "free_memory": f"{free_memory_mb:.2f} MB",
            "total_memory": f"{total_memory_mb:.2f} MB",
            "memory_usage": f"{(1 - free_memory_mb/total_memory_mb) * 100:.1f}%" if total_memory_mb > 0 else "Unknown",
            "free_storage": f"{free_hdd_mb:.2f} MB",
            "total_storage": f"{total_hdd_mb:.2f} MB",
            "storage_usage": f"{(1 - free_hdd_mb/total_hdd_mb) * 100:.1f}%" if total_hdd_mb > 0 else "Unknown",
            "board_name": data.get('board-name', 'Unknown'),
            "version": data.get('version', 'Unknown'),
            "error": False
        }
    except Exception as e:
        return {"message": f"Failed to get router resource usage: {str(e)}", "error": True}


def get_interface_statistics(router_api, params=None):
    """Get traffic statistics for network interfaces"""
    try:
        # Get interface data
        resource = router_api.get_resource('/interface')
        interfaces = resource.get()
        
        # Filter by specific interface name if provided
        if params and params.get("interface"):
            interfaces = [i for i in interfaces if i.get('name') == params.get("interface")]
        
        result = []
        for interface in interfaces:
            # Skip interfaces with no traffic stats
            if 'name' not in interface:
                continue
                
            # Format bytes into human readable format
            rx_bytes = int(interface.get('rx-byte', 0))
            tx_bytes = int(interface.get('tx-byte', 0))
            
            result.append({
                "name": interface.get('name'),
                "type": interface.get('type', 'Unknown'),
                "enabled": interface.get('disabled', 'true') != 'true',
                "running": interface.get('running', 'false') == 'true',
                "rx_bytes": format_bytes(rx_bytes),
                "tx_bytes": format_bytes(tx_bytes),
                "rx_packets": interface.get('rx-packet', '0'),
                "tx_packets": interface.get('tx-packet', '0'),
                "rx_errors": interface.get('rx-error', '0'),
                "tx_errors": interface.get('tx-error', '0'),
                "last_link_up": interface.get('last-link-up-time', 'Unknown')
            })
        
        return {"interfaces": result, "error": False}
    except Exception as e:
        return {"message": f"Failed to get interface statistics: {str(e)}", "error": True}


def get_dhcp_leases(router_api):
    """Get all current DHCP leases"""
    try:
        resource = router_api.get_resource('/ip/dhcp-server/lease')
        leases = resource.get()
        
        result = []
        for lease in leases:
            result.append({
                "mac_address": lease.get('mac-address', 'Unknown'),
                "address": lease.get('address', 'Unknown'),
                "host_name": lease.get('host-name', 'Unknown'),
                "client_id": lease.get('client-id', 'Unknown'),
                "status": lease.get('status', 'Unknown'),
                "expires_after": lease.get('expires-after', 'Unknown')
            })
        
        return {"leases": result, "error": False}
    except Exception as e:
        return {"message": f"Failed to get DHCP leases: {str(e)}", "error": True}


def format_bytes(bytes_count):
    """Convert bytes to human readable format"""
    if bytes_count < 1024:
        return f"{bytes_count}B"
    elif bytes_count < 1024 * 1024:
        return f"{bytes_count/1024:.2f}KB"
    elif bytes_count < 1024 * 1024 * 1024:
        return f"{bytes_count/(1024*1024):.2f}MB"
    else:
        return f"{bytes_count/(1024*1024*1024):.2f}GB"