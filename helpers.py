import logging
import re
from functools import wraps
from typing import Dict, Any, Tuple, Optional, List

import librouteros
from flask import request, jsonify

from settings import CONFIG

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("mikrotik_api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def require_api_key(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not CONFIG["require_api_key"]:
            return func(*args, **kwargs)

        api_key = request.json.get("api_key", "")
        if api_key not in CONFIG["api_keys"]:
            return jsonify({
                "status": "error",
                "error": "authentication_failed",
                "message": "Invalid or missing API key"
            }), 401
        return func(*args, **kwargs)

    return decorated_function


# Validate if command is allowed
def validate_command(command: str) -> Tuple[bool, Optional[str]]:
    # Basic command format validation
    command_pattern = re.compile(r'^/[a-zA-Z0-9/\-_]+$')
    if not command_pattern.match(command):
        return False, "Invalid command format"

    # Command whitelist validation
    if CONFIG["command_whitelist"] is not None:
        if command not in CONFIG["command_whitelist"]:
            return False, "Command not allowed"

    return True, None


# Parse command string into path components
def parse_command(command: str) -> List[str]:
    # Remove leading slash and split by slashes
    parts = command.lstrip('/').split('/')
    return parts


# Execute RouterOS command
def execute_routeros_command(
        host: str,
        username: str,
        password: str,
        command: str,
        parameters: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        # Connect to RouterOS API
        connection = librouteros.connect(
            host=host,
            username=username,
            password=password,
            port=CONFIG["router_port"],
            timeout=CONFIG["connection_timeout"]
        )

        # Parse command into path components
        command_parts = parse_command(command)

        # Get the API path
        api_path = '/'.join(command_parts[:-1]) if len(command_parts) > 1 else ''

        # Get the operation (last part of the command)
        operation = command_parts[-1] if command_parts else "print"

        # Get the API endpoint
        api = connection.path(api_path) if api_path else connection.path()
        print(api,'onnection established')
        # Execute the operation
        if operation == "print":
            # For print operations, we might need to filter
            if parameters:
                result = list(api.select(**parameters))
            else:
                result = list(api)
        elif operation == "add":
            # For add operations, pass parameters as kwargs
            result = api.add(**parameters)
        elif operation == "set" or operation == "edit":
            # For set operations, we need the .id parameter
            if ".id" not in parameters:
                return {
                    "status": "error",
                    "error": "missing_id",
                    "message": "The .id parameter is required for set operations"
                }

            item_id = parameters.pop(".id")
            api_item = api.get(id=item_id)[0]

            # Update the item with new parameters
            for key, value in parameters.items():
                api_item[key] = value

            # Call the update method
            api_item.update()
            result = {"updated": True, "id": item_id}
        elif operation == "remove":
            # For remove operations, we need the .id parameter
            if ".id" not in parameters:
                return {
                    "status": "error",
                    "error": "missing_id",
                    "message": "The .id parameter is required for remove operations"
                }

            item_id = parameters[".id"]
            api.remove(id=item_id)
            result = {"removed": True, "id": item_id}
        else:
            # For other operations (enable, disable, etc.)
            # We might need special handling based on the API
            return {
                "status": "error",
                "error": "unsupported_operation",
                "message": f"Operation '{operation}' is not supported"
            }

        # Close the connection
        connection.close()

        # Return the result
        return {
            "status": "success",
            "data": result
        }

    except librouteros.exceptions.ConnectionClosed as e:
        logger.error(f"Connection error: {str(e)}")
        return {
            "status": "error",
            "error": "connection_error",
            "message": f"Failed to connect to RouterOS: {str(e)}"
        }
    except librouteros.exceptions.FatalError as e:
        logger.error(f"Fatal error: {str(e)}")
        return {
            "status": "error",
            "error": "fatal_error",
            "message": f"RouterOS fatal error: {str(e)}"
        }
    except Exception as e:
        raise
        logger.exception("Unexpected error")
        return {
            "status": "error",
            "error": "execution_error",
            "message": str(e)
        }
