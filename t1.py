import requests

# Change to the actual IP of the VM or host running the Flask app
API_BASE_URL = "https://isp3.lomtechnology.com/mtk/console"

# Common headers
HEADERS = {
    "Content-Type": "application/json"
}

# Replace with your actual API key and router details
COMMON_DATA = {
    "api_key": "YOUR_API_KEY",  # must match what authenticate_request expects
    "router": {
        "host": "10.8.0.35",  # or your OpenVPN-assigned router IP
        "username": "lom_tech_user",
        "password": "vuiSoZAK561IXk3k"
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
    send_request("add_client", {
        "username": "testuser",
        "password": "testpass",
        "profile": "basic"
    })

    # Create a PPPoE profile
    send_request("create_profile", {
        "name": "basic",
        "local_address": "10.0.0.1",
        "remote_address": "10.0.0.100-10.0.0.200",
        "rate_limit": "1M/1M"
    })

    # Setup PPPoE Server
    send_request("setup_pppoe_server", {
        "interface": "ether1",
        "service_name": "pppoe-service",
        "default_profile": "basic"
    })

    # Generate Hotspot Vouchers
    send_request("generate_hotspot_vouchers", {
        "profile": "hotspot-basic",
        "count": 5
    })

    # Get active RADIUS clients
    send_request("get_active_clients", {})

    # Get usage of a specific client
    send_request("get_client_usage", {
        "username": "testuser"
    })

    # Get router resource usage
    send_request("get_router_resource_usage", {})

    # Get DHCP leases
    send_request("get_dhcp_leases", {})

    # Disconnect a hotspot user
    send_request("disconnect_hotspot_user", {
        "username": "testuser"
    })
