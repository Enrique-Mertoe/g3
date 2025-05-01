from flask import Flask, request, jsonify

from helpers import logger
from main.mtk.mtk_utility2 import authenticate_request,get_all_clients,get_all_packages, setup_pppoe_server_with_radius, add_client, remove_client, create_profile,setup_radius_client,setup_hotspot_server_with_radius, get_active_clients, get_client_usage,get_dhcp_leases,get_interface_statistics,get_router_resource_usage, connect_to_router, customize_hotspot_login_page,generate_hotspot_vouchers,add_walled_garden_site, remove_walled_garden_site, list_walled_garden_sites, disconnect_hotspot_user, get_hotspot_usage_report, MTK,remove_profile
get_all_clients
def init_mtk(app: Flask):
    @app.route("/mtk/console", methods=["POST"])
    def mikrotik_command():
        data = request.json
        print(data)

        # Authenticate the request
        if not authenticate_request(data):
            return jsonify({"success": False, "error": "Invalid API key"}), 401

        try:
            # Add server_id if missing
            if "server_id" not in data:
                    # Option 1: Use router IP as identifier
                    router_ip = data["router"]["host"].replace(".", "-")
                    data["server_id"] = f"router-{router_ip}"
                    
                    # Option 2: Use action type + router IP
                    data["server_id"] = f"{data['action']}-{router_ip}"
                    
                    # Option 3: If there's a service name in params
                    if "service_name" in data["params"]:
                        data["server_id"] = data["params"]["service_name"]
            mtk = MTK(data)
            # Get the router connection
            router_api = connect_to_router(data["router"])

            # Dispatch to the appropriate handler based on the action
            action = data["action"]
            params = data.get("params", None)


            # Core router actions that require direct API access
            if action == "setup_radius_client":
                 result = setup_radius_client(router_api, params)
            elif action == "setup_pppoe_server":
                result = setup_pppoe_server_with_radius(router_api, params, mtk)
            elif action == "setup_hotspot_server":
                result = setup_hotspot_server_with_radius(router_api, params, mtk)
            elif action == "customize_hotspot_login_page":
                result = customize_hotspot_login_page(router_api, params)
            
            # Walled Garden Management
            elif action == "add_walled_garden_site":
                result = add_walled_garden_site(router_api, params)
            elif action == "remove_walled_garden_site":
                result = remove_walled_garden_site(router_api, params)
            elif action == "list_walled_garden_sites":
                result = list_walled_garden_sites(router_api)
                
            # Hotspot User Management
            elif action == "disconnect_hotspot_user":
                result = disconnect_hotspot_user(router_api, params)
                
            # Reporting Functions
            elif action == "get_hotspot_usage_report":
                result = get_hotspot_usage_report(router_api, params)
            elif action == "get_router_resource_usage":
                result = get_router_resource_usage(router_api)
            elif action == "get_interface_statistics":
                result = get_interface_statistics(router_api, params)
            elif action == "get_dhcp_leases":
                result = get_dhcp_leases(router_api)
                
            # RADIUS database operations - don't need router API
            elif action == "add_client":
                result = add_client(params)
            elif action == "remove_client":
                result = remove_client(params)
            elif action == "create_profile":
                result = create_profile(params)
            elif action == "remove_profile":
                result = remove_profile(params)
            elif action == "get_active_clients":
                result = get_active_clients(params)
            elif action == "get_client_usage":
                result = get_client_usage(params)
            elif action == "generate_hotspot_vouchers":
                result = generate_hotspot_vouchers(params)
            elif action == "get_all_clients":
                result = get_all_clients()
            elif action == "get_all_packages":
                result = get_all_packages()
            elif action == "get_all_clients_by_profile":
                result = get_all_clients({"profile": "basic_package"})

            else:
                return jsonify({"success": False, "error": f"Unknown action: {action}"}), 400

            return jsonify({"success": True, "result": result})

        except Exception as e:
            logger.exception("Server error")
            return jsonify({"success": False, "error": str(e)}), 500
        finally:
            # Close the connection to the router
            if MTK.conn:
                MTK.conn.disconnect()
                MTK.conn = None
    
