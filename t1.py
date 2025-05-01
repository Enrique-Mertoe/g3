import requests

# Change to the actual IP of the VM or host running the Flask app
API_BASE_URL = "https://isp3.lomtechnology.com/mtk/console"

# Common headers
HEADERS = {
    "Content-Type": "application/json"
}

# Replace with your actual API key and router details
COMMON_DATA = {
    "api_key": "test-api-key",  # must match what authenticate_request expects
    "router": {
        "host": "10.8.0.35",  # or your OpenVPN-assigned router IP
        "username": "lom_tech_user",
        "password": "Y7QH5Xo4oS37buaz"
    }
}

def send_request(action, params=None):
    payload = {
        **COMMON_DATA,
        "action": action,
        "params": params or {}
    }
    response = requests.post(API_BASE_URL, json=payload, headers=HEADERS)
    print(f"--- {action} ---")
    print("Status:", response.status_code)
    print("Response:", response.json())
    print()

# Examples of API requests:
if __name__ == "__main__":
    # Add a RADIUS client to the database
    # send_request("add_client", {
    #     "username": "testuser",
    #     "password": "testpass",
    #     "profile": "basic",
    #     "service": "pppoe",  # Specify 'pppoe' or 'hotspot'

    # })

    # # Create a PPPoE profile
    # send_request("create_profile", {
    #     "name": "basic",
    #     "local_address": "10.0.0.1",
    #     "remote_address": "10.0.0.100-10.0.0.200",
    #     "rate_limit": "1M/1M"
    # })

    # # Setup PPPoE Server
    # send_request("setup_pppoe_server", {
    #     "interface": "ether1",
    #     "service_name": "pppoe-service",
    #     "default_profile": "basic"
    # })

    # # Generate Hotspot Vouchers
    # send_request("generate_hotspot_vouchers", {
    #     "profile": "hotspot-basic",
    #     "count": 5
    # })

    # # Get active RADIUS clients
    # send_request("get_active_clients", {})

    # # Get usage of a specific client
    # send_request("get_client_usage", {
    #     "username": "testuser"
    # })

    # # Get router resource usage
    # send_request("get_router_resource_usage", {})

    # # Get DHCP leases
    # send_request("get_dhcp_leases", {})

    # # Disconnect a hotspot user
    # send_request("disconnect_hotspot_user", {
    #     "username": "testuser"
    # })
    send_request("add_client", {
        "username": "testuser",
        "password": "testpass",
        "service": "pppoe",  # Specify 'pppoe' or 'hotspot'
        "profile_name": "basic"  # If you want to assign the user to a profile
    })

    # Create a PPPoE profile
    send_request("create_profile", {
        "name": "basic",
        "rate_limit": "1M/1M",  # Format: "upload/download" (e.g., "1M/1M")
        "session_timeout": "30 days"  # Optional: session timeout
    })

    # Setup a PPPoE server
    send_request("setup_pppoe_server", {
        "ip_pool_range": "10.0.0.100-10.0.0.200",
        "dns_servers": ["8.8.8.8", "8.8.4.4"],
        "ports": ["ether2", "ether3", "ether4"]
    })

    # Generate hotspot vouchers
    send_request("generate_hotspot_vouchers", {
        "profile_name": "basic",
        "count": 5,
        "prefix": "WIFI-",
        "length": 6,
        "uptime_limit": "1 day"
    })

    # Setup hotspot server
    send_request("setup_hotspot_server", {
        "ports": ["ether2", "ether3"],
        "network": "192.168.10.0/24",
        "dns_name": "hotspot.local",
        "ip_pool": "192.168.10.10-192.168.10.254"
    })

    # Setup RADIUS client on the router
    send_request("setup_radius_client", {
        "radius_server_ip": "192.168.88.2",  # IP of your RADIUS server
        "radius_secret": "mysecretkey",  # Shared secret between RADIUS and router
        "service": "pppoe"  # Service type: 'pppoe', 'hotspot', or both
    })

    # Get active clients
    send_request("get_active_clients", {
        "service": "pppoe"  # Optional: filter by service type
    })

    # Get client usage
    send_request("get_client_usage", {
        "username": "testuser"
    })

    # Get router resource usage
    send_request("get_router_resource_usage", {})

    # Disconnect a hotspot user
    send_request("disconnect_hotspot_user", {
        "username": "testuser"
    })
