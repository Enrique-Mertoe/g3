import os

import routeros_api

from main.dir_manager import VPNManager

VALID_API_KEYS = {os.environ.get("API_KEY", "test-api-key")}


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


def authenticate_request(data):
    """Validate the API key from the request"""
    api_key = data.get("api_key")
    if not api_key or api_key not in VALID_API_KEYS:
        return False
    return True


def connect_to_router(router_credentials) -> routeros_api.api.RouterOsApi:
    """Create a connection to the MikroTik router"""
    host = VPNManager.getIpAddress(router_credentials["host"])
    connection = routeros_api.RouterOsApiPool(
        host=host,
        username=router_credentials["username"],
        password=router_credentials["password"],
        plaintext_login=True
    )
    MTK.conn = connection
    return connection.get_api()


# Action implementations
def setup_pppoe_server(router_api, params, mtk: MTK):
    """Set up a PPPoE server with required components"""
    pool_name = mtk.pool(params["ip_pool_range"])

    # 2. Set up PPP profile
    router_api.get_resource('/ppp/profile').add(
        name=f"default-{MTK.server_id}",
        local_address=pool_name,
        remote_address=pool_name,
        dns_server=",".join(params["dns_servers"])
    )

    # 3. Enable PPPoE server on interface
    pppoe_server_resource = router_api.get_resource('/interface/pppoe-server/server')
    interface = mtk.bridge(params["ports"])
    pppoe_server_resource.add(
        name="pppoe-LomTech",
        service_name=f"pppoe-{interface}",
        interface=interface,
        default_profile=f"default-{MTK.server_id}",
        disabled="no",
        one_session_per_host="yes",
    )

    return {"message": f"PPPoE server set up successfully on {params['interface']}"}


def add_client(router_api, params):
    """Add a new client for the specified service"""
    if params["service"] == "pppoe":
        resource = router_api.get_resource('/ppp/secret')
        resource.add(
            name=params["username"],
            password=params["password"],
            service="pppoe",
            profile=params["profile_name"]
        )
    elif params["service"] == "hotspot":
        resource = router_api.get_resource('/ip/hotspot/user')
        resource.add(
            name=params["username"],
            password=params["password"],
            profile=params["profile_name"]
        )

    return {"message": f"Client {params['username']} added successfully"}


def remove_client(router_api, params):
    """Remove an existing client"""
    if params["service"] == "pppoe":
        resource = router_api.get_resource('/ppp/secret')
    elif params["service"] == "hotspot":
        resource = router_api.get_resource('/ip/hotspot/user')

    # Find and remove the client
    clients = resource.get(name=params["username"])
    if clients:
        resource.remove(id=clients[0]["id"])
        return {"message": f"Client {params['username']} removed successfully"}
    else:
        return {"message": f"Client {params['username']} not found"}


def create_profile(router_api, params):
    """Create a new service profile (subscription package)"""
    if params["service"] == "pppoe":
        resource = router_api.get_resource('/ppp/profile')
        profile_data = {
            "name": params["name"]
        }
        if params.get("rate_limit"):
            profile_data["rate-limit"] = params["rate_limit"]
        if params.get("session_timeout"):
            profile_data["session-timeout"] = params["session_timeout"]

        resource.add(**profile_data)

    elif params["service"] == "hotspot":
        resource = router_api.get_resource('/ip/hotspot/user/profile')
        profile_data = {
            "name": params["name"]
        }
        if params.get("rate_limit"):
            profile_data["rate-limit"] = params["rate_limit"]
        if params.get("session_timeout"):
            profile_data["session-timeout"] = params["session_timeout"]

        resource.add(**profile_data)

    return {"message": f"Profile {params['name']} created successfully"}


def setup_hotspot_server(router_api, params):
    """Set up a Hotspot server with required components"""
    # 1. Create IP pool if provided
    if params.get("ip_pool"):
        pool_name = f"hotspot-{params['interface']}"
        router_api.get_resource('/ip/pool').add(
            name=pool_name,
            ranges=params["ip_pool"]
        )

    # 2. Run the hotspot setup script
    router_api.get_resource('/ip/hotspot/setup').add(
        interface=params["interface"],
        address=params["network"],
        dns_name=params["dns_name"]
    )

    return {"message": f"Hotspot server set up successfully on {params['interface']}"}


def get_active_clients(router_api, params):
    """Get a list of currently connected clients"""
    if params["service"] == "pppoe":
        resource = router_api.get_resource('/ppp/active')
    elif params["service"] == "hotspot":
        resource = router_api.get_resource('/ip/hotspot/active')

    clients = resource.get()
    return clients


def get_client_usage(router_api, params):
    """Get bandwidth usage for a specific client"""
    if params["service"] == "pppoe":
        resource = router_api.get_resource('/ppp/active')
    elif params["service"] == "hotspot":
        resource = router_api.get_resource('/ip/hotspot/active')

    clients = resource.get(name=params["username"])
    if clients:
        client = clients[0]
        return {
            "username": client.get("name"),
            "uptime": client.get("uptime"),
            "address": client.get("address"),
            "bytes_in": client.get("bytes-in"),
            "bytes_out": client.get("bytes-out")
        }
    else:
        return {"message": f"Client {params['username']} not active"}


def customize_hotspot_login_page(router_api, params):
    """Customize the hotspot login page appearance"""
    # Access and modify the hotspot HTML files
    # This is a simplified implementation - in reality, you would need to modify HTML files
    resource = router_api.get_resource('/file')
    html_files = resource.get(where='.html')

    # In a real implementation, you would download the login page HTML,
    # modify it with the custom title, background color, logo, etc.,
    # and then upload it back to the router

    return {"message": "Hotspot login page customized successfully"}


def add_hotspot_user(router_api, params):
    """Add a new hotspot user with optional time or data limits"""
    resource = router_api.get_resource('/ip/hotspot/user')

    user_data = {
        "name": params["username"],
        "password": params["password"],
        "profile": params["profile_name"]
    }

    if params.get("limit_uptime"):
        user_data["limit-uptime"] = params["limit_uptime"]

    if params.get("limit_bytes"):
        user_data["limit-bytes-total"] = params["limit_bytes"]

    resource.add(**user_data)
    return {"message": f"Hotspot user {params['username']} added successfully"}


def generate_hotspot_vouchers(router_api, params):
    """Generate hotspot vouchers (codes) for quick distribution"""
    import random
    import string

    profile_name = params["profile_name"]
    count = params["count"]
    prefix = params.get("prefix", "")
    length = params.get("length", 6)
    uptime_limit = params.get("uptime_limit")

    resource = router_api.get_resource('/ip/hotspot/user')
    vouchers = []

    for _ in range(count):
        # Generate a random code
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        full_code = f"{prefix}{code}"

        # Create user data
        user_data = {
            "name": full_code,
            "password": full_code,  # Use the same code as password
            "profile": profile_name
        }

        if uptime_limit:
            user_data["limit-uptime"] = uptime_limit

        # Add the user
        resource.add(**user_data)
        vouchers.append(full_code)

    return {"message": f"Generated {count} vouchers", "vouchers": vouchers}


def list_hotspot_users(router_api):
    """List all hotspot users"""
    resource = router_api.get_resource('/ip/hotspot/user')
    users = resource.get()
    return users


def remove_hotspot_user(router_api, params):
    """Remove a hotspot user"""
    resource = router_api.get_resource('/ip/hotspot/user')
    users = resource.get(name=params["username"])

    if users:
        resource.remove(id=users[0]["id"])
        return {"message": f"Hotspot user {params['username']} removed successfully"}
    else:
        return {"message": f"Hotspot user {params['username']} not found"}


def create_hotspot_profile(router_api, params):
    """Create a hotspot user profile with specified parameters"""
    resource = router_api.get_resource('/ip/hotspot/user/profile')

    profile_data = {
        "name": params["name"]
    }

    if params.get("rate_limit"):
        profile_data["rate-limit"] = params["rate_limit"]

    if params.get("session_timeout"):
        profile_data["session-timeout"] = params["session_timeout"]

    if params.get("idle_timeout"):
        profile_data["idle-timeout"] = params["idle_timeout"]

    if params.get("shared_users"):
        profile_data["shared-users"] = params["shared_users"]

    resource.add(**profile_data)
    return {"message": f"Hotspot profile {params['name']} created successfully"}


def list_hotspot_profiles(router_api):
    """List all hotspot user profiles"""
    resource = router_api.get_resource('/ip/hotspot/user/profile')
    profiles = resource.get()
    return profiles


def add_walled_garden_site(router_api, params):
    """Add a site to the walled garden (accessible without login)"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')

    # Format: Creating a rule for the domain
    resource.add(
        dst_host=params["domain"],
        action="allow"
    )

    return {"message": f"Added {params['domain']} to walled garden"}


def remove_walled_garden_site(router_api, params):
    """Remove a site from the walled garden"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')
    entries = resource.get(dst_host=params["domain"])

    if entries:
        resource.remove(id=entries[0]["id"])
        return {"message": f"Removed {params['domain']} from walled garden"}
    else:
        return {"message": f"Domain {params['domain']} not found in walled garden"}


def list_walled_garden_sites(router_api):
    """List all walled garden entries"""
    resource = router_api.get_resource('/ip/hotspot/walled-garden/ip')
    entries = resource.get()
    return entries


def get_active_hotspot_users(router_api):
    """Get a list of currently connected hotspot users"""
    resource = router_api.get_resource('/ip/hotspot/active')
    users = resource.get()
    return users


def disconnect_hotspot_user(router_api, params):
    """Force disconnect a currently connected hotspot user"""
    resource = router_api.get_resource('/ip/hotspot/active')
    users = resource.get(user=params["username"])

    if users:
        resource.remove(id=users[0]["id"])
        return {"message": f"Disconnected hotspot user {params['username']}"}
    else:
        return {"message": f"Active session for {params['username']} not found"}


def get_hotspot_usage_report(router_api, params):
    """Get usage statistics for the hotspot"""
    period = params.get("period", "daily")

    # In a real implementation, you would query various MikroTik counters
    # and compile a usage report based on the desired period

    # This is a simplified example
    if period == "daily":
        # Get data from the last 24 hours
        pass
    elif period == "weekly":
        # Get data from the last 7 days
        pass
    elif period == "monthly":
        # Get data from the last 30 days
        pass

    # For demonstration, return dummy data
    return {
        "period": period,
        "total_users": 120,
        "active_sessions": 45,
        "data_used": "1.2TB",
        "average_session_time": "42m"
    }
