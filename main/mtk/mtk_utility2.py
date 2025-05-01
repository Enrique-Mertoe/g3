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
        # host = VPNManager.getIpAddress(router_credentials["host"])
        host=router_credentials["host"]
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


def setup_pppoe_server_with_radius(router_api, params, mtk):
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
            # Correct parameters for RADIUS authentication
            profile_resource.add(
                name=profile_name,
                local_address=pool_name,
                remote_address=pool_name,
                # The correct parameter is 'use-radius' (not 'use_radius')
                # and MikroTik expects 'yes' without quotes
                **{"use-radius": "yes"},
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
                **{"service-name": f"pppoe-{bridge_name}"},  # Using dict unpacking for hyphenated params
                interface=bridge_name,
                **{"default-profile": profile_name},  # Using dict unpacking for hyphenated params
                disabled="no",
                **{"one-session-per-host": "yes"},  # Using dict unpacking for hyphenated params
                **{"use-radius": "yes"}  # Using dict unpacking for hyphenated params
            )
        
        return {"message": f"PPPoE server with RADIUS authentication set up successfully on {bridge_name}", "error": False}
    except Exception as e:
        return {"message": f"Failed to set up PPPoE server: {str(e)}", "error": True}


def setup_hotspot_server_with_radius(router_api, params, mtk):
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
        
        # First ensure the bridge has the required IP address
        ip_address_resource = router_api.get_resource('/ip/address')
        
        # Check if the IP is already assigned
        addresses = ip_address_resource.get()
        existing_address = [a for a in addresses if a.get('interface') == bridge_name and a.get('address') == params["network"]]
        
        if not existing_address:
            ip_address_resource.add(
                address=params["network"],
                interface=bridge_name
            )
        
        # Configure hotspot server using the hotspot tool
        # MikroTik uses a special command for hotspot setup
        # We need to call the proper method using the RouterOS API
        
        # The correct path for hotspot setup is '/ip/hotspot/setup'
        setup_command = router_api.path('/ip/hotspot/setup')
        
        # Prepare parameters for the command
        setup_params = {
            "interface": bridge_name,
            "address-pool": pool_name,
            "dns-name": params["dns_name"],
            "profile": f"hotspot-{bridge_name}-profile"
        }
        
        # Execute the setup command
        router_api.execute(setup_command, **setup_params)
        
        # Now configure RADIUS authentication for the hotspot
        profile_resource = router_api.get_resource('/ip/hotspot/profile')
        profiles = profile_resource.get()
        
        # Find the profile created by the setup
        target_profile_name = f"hotspot-{bridge_name}-profile"
        profile_to_update = next((p for p in profiles if p['name'] == target_profile_name), None)
        
        if profile_to_update:
            # Update the profile to use RADIUS
            profile_resource.set(
                id=profile_to_update['id'],
                **{"use-radius": "yes"}  # Using dict unpacking for hyphenated param
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
    

def get_all_clients(params=None):
    """
    Get all clients from the RADIUS database with their attributes and profile information
    
    Args:
        params (dict, optional): Parameters for filtering clients
            - username: Filter by username
            - profile: Filter by profile name
            - limit: Limit the number of results
            - offset: Offset for pagination
    
    Returns:
        dict: Dictionary containing list of clients with their attributes and profiles
    """
    try:
        conn = RadiusManager.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Start building the base query to get all users
        base_query = """
            SELECT DISTINCT rc.username
            FROM radcheck rc
        """
        
        # Add JOIN for profile filtering if requested
        if params and params.get("profile"):
            base_query += """
                JOIN radusergroup rug ON rc.username = rug.username
                WHERE rug.groupname = %s
            """
            query_params = [params.get("profile")]
        # Filter by username if requested
        elif params and params.get("username"):
            base_query += " WHERE rc.username LIKE %s"
            query_params = [f"%{params.get('username')}%"]
        else:
            base_query += " WHERE 1=1"
            query_params = []
            
        # Add limit and offset if provided
        if params and params.get("limit"):
            base_query += " LIMIT %s"
            query_params.append(int(params.get("limit")))
            
            if params.get("offset"):
                base_query += " OFFSET %s"
                query_params.append(int(params.get("offset")))
                
        # Execute the query to get all usernames
        cursor.execute(base_query, query_params)
        user_results = cursor.fetchall()
        
        # Prepare the list to store detailed user information
        users_with_details = []
        
        # For each user, fetch their full details
        for user_row in user_results:
            username = user_row["username"]
            user_info = {"username": username}
            
            # Get authentication details (password, etc)
            cursor.execute(
                "SELECT attribute, value FROM radcheck WHERE username = %s",
                (username,)
            )
            auth_details = cursor.fetchall()
            
            # Add each attribute to user info
            for detail in auth_details:
                if detail["attribute"] == "Cleartext-Password":
                    user_info["password"] = detail["value"]
                else:
                    # Add other attributes with their names
                    user_info[detail["attribute"]] = detail["value"]
            
            # Get reply attributes (rate limits, session timeout, etc.)
            cursor.execute(
                "SELECT attribute, value FROM radreply WHERE username = %s",
                (username,)
            )
            reply_attributes = cursor.fetchall()
            
            # Format and add reply attributes
            for attr in reply_attributes:
                # Format bandwidth attributes
                if attr["attribute"] == "WISPr-Bandwidth-Max-Up":
                    user_info["upload_limit"] = _format_bandwidth(attr["value"])
                elif attr["attribute"] == "WISPr-Bandwidth-Max-Down":
                    user_info["download_limit"] = _format_bandwidth(attr["value"])
                elif attr["attribute"] == "Session-Timeout":
                    user_info["session_timeout"] = _format_seconds(int(attr["value"]))
                else:
                    # Add other attributes with their names
                    user_info[attr["attribute"]] = attr["value"]
            
            # Get assigned profiles/groups
            cursor.execute(
                "SELECT groupname FROM radusergroup WHERE username = %s ORDER BY priority",
                (username,)
            )
            groups = cursor.fetchall()
            user_info["profiles"] = [g["groupname"] for g in groups]
            
            # Get current session information if available
            cursor.execute("""
                SELECT acctstarttime, acctsessiontime, framedipaddress, 
                       acctinputoctets, acctoutputoctets, nasipaddress
                FROM radacct 
                WHERE username = %s AND acctstoptime IS NULL
                ORDER BY acctstarttime DESC LIMIT 1
            """, (username,))
            
            session = cursor.fetchone()
            if session:
                # Format and add session info
                user_info["active_session"] = {
                    "start_time": session["acctstarttime"].isoformat() if session["acctstarttime"] else None,
                    "duration": _format_seconds(session["acctsessiontime"]) if session["acctsessiontime"] else "0",
                    "ip_address": session["framedipaddress"],
                    "data_in": _format_bytes(session["acctinputoctets"]) if session["acctinputoctets"] else "0",
                    "data_out": _format_bytes(session["acctoutputoctets"]) if session["acctoutputoctets"] else "0",
                    "router_ip": session["nasipaddress"]
                }
            else:
                user_info["active_session"] = None
            
            # Add user with all details to the result list
            users_with_details.append(user_info)
        
        cursor.close()
        conn.close()
        
        return {
            "clients": users_with_details,
            "count": len(users_with_details),
            "error": False
        }
        
    except Exception as e:
        return {"message": f"Failed to get clients: {str(e)}", "error": True}


def get_all_packages(params=None):
    """
    Get all packages (profiles) from the RADIUS database with their attributes
    
    Args:
        params (dict, optional): Parameters for filtering packages
            - name: Filter by package name
            - limit: Limit the number of results
            - offset: Offset for pagination
    
    Returns:
        dict: Dictionary containing list of packages with their attributes
    """
    try:
        conn = RadiusManager.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Start building the query
        query = """
            SELECT DISTINCT groupname 
            FROM radgroupreply
        """
        
        # Add WHERE clause for filtering by name if requested
        if params and params.get("name"):
            query += " WHERE groupname LIKE %s"
            query_params = [f"%{params.get('name')}%"]
        else:
            query_params = []
            
        # Add limit and offset if provided
        if params and params.get("limit"):
            query += " LIMIT %s"
            query_params.append(int(params.get("limit")))
            
            if params.get("offset"):
                query += " OFFSET %s"
                query_params.append(int(params.get("offset")))
                
        # Execute the query to get all profile names
        cursor.execute(query, query_params)
        profile_results = cursor.fetchall()
        
        # Prepare the list to store detailed profile information
        profiles_with_details = []
        
        # For each profile, fetch the details
        for profile_row in profile_results:
            profile_name = profile_row["groupname"]
            profile_info = {"name": profile_name}
            
            # Get all attributes for this profile
            cursor.execute(
                "SELECT attribute, op, value FROM radgroupreply WHERE groupname = %s",
                (profile_name,)
            )
            attributes = cursor.fetchall()
            
            # Format and add attributes
            for attr in attributes:
                if attr["attribute"] == "WISPr-Bandwidth-Max-Up":
                    profile_info["upload_limit"] = _format_bandwidth(attr["value"])
                elif attr["attribute"] == "WISPr-Bandwidth-Max-Down":
                    profile_info["download_limit"] = _format_bandwidth(attr["value"])
                elif attr["attribute"] == "Session-Timeout":
                    profile_info["session_timeout"] = _format_seconds(int(attr["value"]))
                else:
                    # Add other attributes with their names
                    profile_info[attr["attribute"]] = attr["value"]
            
            # Count users assigned to this profile
            cursor.execute(
                "SELECT COUNT(*) as user_count FROM radusergroup WHERE groupname = %s",
                (profile_name,)
            )
            count_result = cursor.fetchone()
            profile_info["assigned_users"] = count_result["user_count"] if count_result else 0
            
            # Add profile with all details to the result list
            profiles_with_details.append(profile_info)
        
        cursor.close()
        conn.close()
        
        return {
            "packages": profiles_with_details,
            "count": len(profiles_with_details),
            "error": False
        }
        
    except Exception as e:
        return {"message": f"Failed to get packages: {str(e)}", "error": True}


# Helper functions for formatting values
def _format_bandwidth(value_in_bps):
    """Format bandwidth values from bps to human-readable format"""
    try:
        bps = int(value_in_bps)
        if bps < 1000:
            return f"{bps}bps"
        elif bps < 1000000:
            return f"{bps/1000:.0f}kbps"
        else:
            return f"{bps/1000000:.1f}Mbps"
    except (ValueError, TypeError):
        return value_in_bps  # Return original if can't convert


def _format_seconds(seconds):
    """Format seconds to human-readable time duration"""
    try:
        seconds = int(seconds)
        if seconds < 60:
            return f"{seconds} seconds"
        elif seconds < 3600:
            return f"{seconds//60} minutes"
        elif seconds < 86400:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours} hours {minutes} minutes"
        elif seconds < 2592000:  # 30 days
            days = seconds // 86400
            hours = (seconds % 86400) // 3600
            return f"{days} days {hours} hours"
        elif seconds < 31536000:  # 365 days
            months = seconds // 2592000
            days = (seconds % 2592000) // 86400
            return f"{months} months {days} days"
        else:
            years = seconds // 31536000
            months = (seconds % 31536000) // 2592000
            return f"{years} years {months} months"
    except (ValueError, TypeError):
        return str(seconds) + " seconds"  # Return original if can't convert


def _format_bytes(bytes_value):
    """Format bytes to human-readable size"""
    try:
        bytes_count = int(bytes_value)
        if bytes_count < 1024:
            return f"{bytes_count}B"
        elif bytes_count < 1024 * 1024:
            return f"{bytes_count/1024:.2f}KB"
        elif bytes_count < 1024 * 1024 * 1024:
            return f"{bytes_count/(1024*1024):.2f}MB"
        else:
            return f"{bytes_count/(1024*1024*1024):.2f}GB"
    except (ValueError, TypeError):
        return str(bytes_value) + " bytes"  # Return original if can't convert


# Example API integration
def handle_client_requests(data):
    """Handle client-related API requests"""
    action = data.get("action")
    params = data.get("params", {})
    
    if action == "get_all_clients":
        return get_all_clients(params)
    elif action == "get_all_packages":
        return get_all_packages(params)
    elif action == "add_client":
        return add_client(params)
    elif action == "remove_client":
        return remove_client(params)
    elif action == "get_client_usage":
        return get_client_usage(params)
    else:
        return {"message": "Unknown action", "error": True}
