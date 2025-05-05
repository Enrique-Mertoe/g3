import socket
import subprocess
def test_router_connectivity(host, port=8728):
    """Test if the router is reachable and the API port is open"""
    try:
        # Try to create a socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"Connection to {host}:{port} succeeded!")
            return True
        else:
            print(f"Connection to {host}:{port} failed with error code {result}")
            
            # Try pinging the host
            try:
                ping_result = subprocess.run(
                    ["ping", "-c", "3", host], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    timeout=10
                )
                if ping_result.returncode == 0:
                    print(f"Host {host} is pingable, but port {port} is not open.")
                else:
                    print(f"Host {host} is not pingable.")
            except Exception as e:
                print(f"Error while trying to ping {host}: {str(e)}")
                
            return False
            
    except socket.error as e:
        print(f"Socket error when connecting to {host}:{port} - {str(e)}")
        return False
    except Exception as e:
        print(f"Unexpected error when testing connection to {host}:{port} - {str(e)}")
        return False

# Example usage
test_router_connectivity("10.8.0.41")