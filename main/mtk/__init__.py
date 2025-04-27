from flask import Flask, request, jsonify

from helpers import logger
from main.mtk.mtk_utility import authenticate_request, setup_pppoe_server, add_client, remove_client, create_profile, \
    setup_hotspot_server, get_active_clients, get_client_usage, connect_to_router, customize_hotspot_login_page, \
    add_hotspot_user, generate_hotspot_vouchers, list_hotspot_users, remove_hotspot_user, create_hotspot_profile, \
    list_hotspot_profiles, add_walled_garden_site, remove_walled_garden_site, list_walled_garden_sites, \
    get_active_hotspot_users, disconnect_hotspot_user, get_hotspot_usage_report


def init_mtk(app: Flask):
    @app.route("/mtk/console", methods=["POST"])
    def mikrotik_command():
        data = request.json

        # Authenticate the request
        if not authenticate_request(data):
            return jsonify({"success": False, "error": "Invalid API key"}), 401

        try:
            # Get the router connection
            router_api = connect_to_router(data["router"])

            # Dispatch to the appropriate handler based on the action
            action = data["action"]
            params = data["params"]

            if action == "setup_pppoe_server":
                result = setup_pppoe_server(router_api, params)

            elif action == "customize_hotspot_login_page":
                result = customize_hotspot_login_page(router_api, params)
            elif action == "add_hotspot_user":
                result = add_hotspot_user(router_api, params)
            elif action == "generate_hotspot_vouchers":
                result = generate_hotspot_vouchers(router_api, params)
            elif action == "list_hotspot_users":
                result = list_hotspot_users(router_api)
            elif action == "remove_hotspot_user":
                result = remove_hotspot_user(router_api, params)
            elif action == "create_hotspot_profile":
                result = create_hotspot_profile(router_api, params)
            elif action == "list_hotspot_profiles":
                result = list_hotspot_profiles(router_api)
            elif action == "add_walled_garden_site":
                result = add_walled_garden_site(router_api, params)
            elif action == "remove_walled_garden_site":
                result = remove_walled_garden_site(router_api, params)
            elif action == "list_walled_garden_sites":
                result = list_walled_garden_sites(router_api)
            elif action == "get_active_hotspot_users":
                result = get_active_hotspot_users(router_api)
            elif action == "disconnect_hotspot_user":
                result = disconnect_hotspot_user(router_api, params)
            elif action == "get_hotspot_usage_report":
                result = get_hotspot_usage_report(router_api, params)
            elif action == "add_client":
                result = add_client(router_api, params)
            elif action == "remove_client":
                result = remove_client(router_api, params)
            elif action == "create_profile":
                result = create_profile(router_api, params)
            elif action == "setup_hotspot_server":
                result = setup_hotspot_server(router_api, params)
            elif action == "get_active_clients":
                result = get_active_clients(router_api, params)
            elif action == "get_client_usage":
                result = get_client_usage(router_api, params)
            else:
                return jsonify({"success": False, "error": f"Unknown action: {action}"}), 400

            return jsonify({"success": True, "result": result})

        except Exception as e:
            logger.exception("Server error")
            return jsonify({"success": False, "error": str(e)}), 500
        finally:
            # Close the connection to the router
            if 'router_api' in locals():
                router_api.disconnect()
