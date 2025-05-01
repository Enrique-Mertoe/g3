# import re
# import subprocess
# import os
# import logging
# import mysql.connector
# from flask import Flask, request, jsonify, render_template
# from functools import wraps

# logging.basicConfig(level=logging.INFO, 
#                     format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# app = Flask(__name__)

# # Configuration
# CONFIG = {
#     'radius_clients_conf': '/etc/freeradius/3.0/clients.conf',
#     'db': {
#         'host': 'localhost',
#         'user': 'radius',
#         'password': 'radiuspassword',
#         'database': 'radius'
#     }
# }

# # Helper function for DB connections
# def get_db_connection():
#     """Create and return a connection to the database."""
#     try:
#         conn = mysql.connector.connect(
#             host=CONFIG['db']['host'],
#             user=CONFIG['db']['user'],
#             password=CONFIG['db']['password'],
#             database=CONFIG['db']['database']
#         )
#         return conn
#     except mysql.connector.Error as err:
#         logger.error(f"Database connection error: {err}")
#         raise

# # Simple API key authentication
# def require_api_key(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         api_key = request.headers.get('X-API-Key')
#         if api_key != 'your_secure_api_key':  # Change this to a secure key
#             return jsonify({'error': 'Invalid API key'}), 401
#         return f(*args, **kwargs)
#     return decorated_function

# class RadiusClientManager:
#     def __init__(self, clients_conf_path=CONFIG['radius_clients_conf']):
#         self.clients_conf_path = clients_conf_path
        
#     def read_clients_conf(self):
#         """Read the clients.conf file content."""
#         with open(self.clients_conf_path, 'r') as f:
#             return f.read()
    
#     def write_clients_conf(self, content):
#         """Write content to the clients.conf file."""
#         with open(self.clients_conf_path, 'w') as f:
#             f.write(content)
    
#     def get_clients(self):
#         """Parse and return all RADIUS clients as a list of dictionaries."""
#         content = self.read_clients_conf()
#         clients = []
#         pattern = r'client\s+([^\s{]+)\s*{([^}]+)}'
        
#         for match in re.finditer(pattern, content, re.DOTALL):
#             client_name = match.group(1)
#             client_block = match.group(2)
            
#             # Extract client properties
#             ip_match = re.search(r'ipaddr\s*=\s*([^\n]+)', client_block)
#             secret_match = re.search(r'secret\s*=\s*([^\n]+)', client_block)
#             nastype_match = re.search(r'nastype\s*=\s*([^\n]+)', client_block)
            
#             client_data = {
#                 'name': client_name,
#                 'ipaddr': ip_match.group(1).strip() if ip_match else None,
#                 'secret': secret_match.group(1).strip() if secret_match else None,
#                 'nastype': nastype_match.group(1).strip() if nastype_match else 'other'
#             }
            
#             clients.append(client_data)
        
#         return clients
    
#     def add_client(self, name, ipaddr, secret, nastype='mikrotik'):
#         """Add a new RADIUS client."""
#         content = self.read_clients_conf()
        
#         # Check if client already exists
#         if re.search(rf'client\s+{re.escape(name)}\s*{{', content):
#             return False, f"Client '{name}' already exists"
        
#         # Create new client block
#         new_client = f"""
# client {name} {{
#     ipaddr = {ipaddr}
#     secret = {secret}
#     nastype = {nastype}
#     require_message_authenticator = no
# }}
# """
#         # Append to file
#         updated_content = content + "\n" + new_client
#         self.write_clients_conf(updated_content)
        
#         # Restart FreeRADIUS
#         self.restart_radius()
        
#         return True, f"Client '{name}' added successfully"
    
#     def update_client(self, name, ipaddr=None, secret=None, nastype=None):
#         """Update an existing RADIUS client."""
#         content = self.read_clients_conf()
        
#         # Find the client block
#         pattern = rf'client\s+{re.escape(name)}\s*{{([^}}]+)}}'
#         match = re.search(pattern, content, re.DOTALL)
        
#         if not match:
#             return False, f"Client '{name}' not found"
        
#         client_block = match.group(1)
#         updated_block = client_block
        
#         # Update fields
#         if ipaddr:
#             if re.search(r'ipaddr\s*=', updated_block):
#                 updated_block = re.sub(r'ipaddr\s*=\s*[^\n]+', f'ipaddr = {ipaddr}', updated_block)
#             else:
#                 updated_block += f'\n    ipaddr = {ipaddr}'
                
#         if secret:
#             if re.search(r'secret\s*=', updated_block):
#                 updated_block = re.sub(r'secret\s*=\s*[^\n]+', f'secret = {secret}', updated_block)
#             else:
#                 updated_block += f'\n    secret = {secret}'
                
#         if nastype:
#             if re.search(r'nastype\s*=', updated_block):
#                 updated_block = re.sub(r'nastype\s*=\s*[^\n]+', f'nastype = {nastype}', updated_block)
#             else:
#                 updated_block += f'\n    nastype = {nastype}'
        
#         # Replace the old block with updated one
#         updated_content = content.replace(f'client {name} {{{client_block}}}', 
#                                          f'client {name} {{{updated_block}}}')
        
#         self.write_clients_conf(updated_content)
#         self.restart_radius()
        
#         return True, f"Client '{name}' updated successfully"
    
#     def delete_client(self, name):
#         """Delete a RADIUS client."""
#         content = self.read_clients_conf()
        
#         # Use regex to find and remove the client block
#         pattern = rf'client\s+{re.escape(name)}\s*{{[^}}]+}}'
#         if not re.search(pattern, content):
#             return False, f"Client '{name}' not found"
            
#         updated_content = re.sub(pattern, '', content)
        
#         # Write back and restart
#         self.write_clients_conf(updated_content)
#         self.restart_radius()
        
#         return True, f"Client '{name}' deleted successfully"

#     def restart_radius(self):
#         try:
#             # For systems using systemd
#             subprocess.run(['systemctl', 'restart', 'freeradius'], check=True)
#             logger.info("FreeRADIUS restarted")
#             return True, "FreeRADIUS restarted"
#         except subprocess.CalledProcessError as e:
#             try:
#                 # Fallback to custom script if available
#                 subprocess.run(['reload_freeradius.sh'], check=True)
#                 logger.info("FreeRADIUS reloaded using script")
#                 return True, "FreeRADIUS reloaded using script"
#             except (subprocess.CalledProcessError, FileNotFoundError) as e:
#                 logger.error(f"FreeRADIUS restart failed: {e}")
#                 return False, f"FreeRADIUS restart failed: {e}"


# class RadiusUserManager:
#     """Manage RADIUS users and profiles in the MariaDB database"""
    
#     def get_all_users(self):
#         """Get all users from the radcheck table"""
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)
        
#         try:
#             cursor.execute("""
#                 SELECT DISTINCT username 
#                 FROM radcheck 
#                 ORDER BY username
#             """)
#             users = cursor.fetchall()
#             return users
#         except mysql.connector.Error as err:
#             logger.error(f"Database error: {err}")
#             return []
#         finally:
#             cursor.close()
#             conn.close()
    
#     def get_user_details(self, username):
#         """Get detailed information about a specific user"""
#         conn = get_db_connection()
#         cursor = conn.cursor(dictionary=True)
        
#         try:
#             # Get credentials
#             cursor.execute("""
#                 SELECT attribute, op, value 
#                 FROM radcheck 
#                 WHERE username = %s
#             """, (username,))
#             credentials = cursor.fetchall()
            
#             # Get profile attributes
#             cursor.execute("""
#                 SELECT attribute, op, value 
#                 FROM radreply 
#                 WHERE username = %s
#             """, (username,))
#             profile = cursor.fetchall()
            
#             return {
#                 'username': username,
#                 'credentials': credentials,
#                 'profile': profile
#             }
#         except mysql.connector.Error as err:
#             logger.error(f"Database error: {err}")
#             return None
#         finally:
#             cursor.close()
#             conn.close()
    
#     def add_user(self, username, password, profile=None):
#         """Add a new RADIUS user"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         try:
#             # Check if user already exists
#             cursor.execute("SELECT COUNT(*) FROM radcheck WHERE username = %s", (username,))
#             if cursor.fetchone()[0] > 0:
#                 return False, f"User '{username}' already exists"
            
#             # Add user credentials
#             cursor.execute("""
#                 INSERT INTO radcheck (username, attribute, op, value)
#                 VALUES (%s, 'Cleartext-Password', ':=', %s)
#             """, (username, password))
            
#             # Add profile attributes if provided
#             if profile:
#                 self.apply_profile_to_user(username, profile, cursor)
            
#             conn.commit()
#             return True, f"User '{username}' added successfully"
#         except mysql.connector.Error as err:
#             conn.rollback()
#             logger.error(f"Database error: {err}")
#             return False, f"Database error: {err}"
#         finally:
#             cursor.close()
#             conn.close()
    
#     def update_user(self, username, password=None, profile=None):
#         """Update an existing RADIUS user"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         try:
#             # Check if user exists
#             cursor.execute("SELECT COUNT(*) FROM radcheck WHERE username = %s", (username,))
#             if cursor.fetchone()[0] == 0:
#                 return False, f"User '{username}' doesn't exist"
            
#             # Update password if provided
#             if password:
#                 cursor.execute("""
#                     UPDATE radcheck 
#                     SET value = %s 
#                     WHERE username = %s AND attribute = 'Cleartext-Password'
#                 """, (password, username))
                
#                 # If no rows affected (password attribute doesn't exist), create it
#                 if cursor.rowcount == 0:
#                     cursor.execute("""
#                         INSERT INTO radcheck (username, attribute, op, value)
#                         VALUES (%s, 'Cleartext-Password', ':=', %s)
#                     """, (username, password))
            
#             # Update profile if provided
#             if profile:
#                 # First remove existing profile attributes
#                 cursor.execute("DELETE FROM radreply WHERE username = %s", (username,))
#                 # Then apply new profile
#                 self.apply_profile_to_user(username, profile, cursor)
            
#             conn.commit()
#             return True, f"User '{username}' updated successfully"
#         except mysql.connector.Error as err:
#             conn.rollback()
#             logger.error(f"Database error: {err}")
#             return False, f"Database error: {err}"
#         finally:
#             cursor.close()
#             conn.close()
    
#     def delete_user(self, username):
#         """Delete a RADIUS user"""
#         conn = get_db_connection()
#         cursor = conn.cursor()
        
#         try:
#             # Check if user exists
#             cursor.execute("SELECT COUNT(*) FROM radcheck WHERE username = %s", (username,))
#             if cursor.fetchone()[0] == 0:
#                 return False, f"User '{username}' doesn't exist"
            
#             # Delete from radcheck and radreply
#             cursor.execute("DELETE FROM radcheck WHERE username = %s", (username,))
#             cursor.execute("DELETE FROM radreply WHERE username = %s", (username,))
            
#             conn.commit()
#             return True, f"User '{username}' deleted successfully"
#         except mysql.connector.Error as err:
#             conn.rollback()
#             logger.error(f"Database error: {err}")
#             return False, f"Database error: {err}"
#         finally:
#             cursor.close()
#             conn.close()
    
#     def apply_profile_to_user(self, username, profile_name, cursor=None):
#         """Apply a predefined profile to a user"""
#         close_conn = False
#         if cursor is None:
#             conn = get_db_connection()
#             cursor = conn.cursor()
#             close_conn = True
        
#         try:
#             # Load profile attributes based on profile name
#             attributes = self.get_profile_attributes(profile_name)
            
#             if not attributes:
#                 return False, f"Profile '{profile_name}' not found"
            
#             # Apply each attribute to the user
#             for attr in attributes:
#                 cursor.execute("""
#                     INSERT INTO radreply (username, attribute, op, value)
#                     VALUES (%s, %s, %s, %s)
#                 """, (username, attr['attribute'], attr['op'], attr['value']))
            
#             if close_conn:
#                 conn.commit()
#             return True, f"Profile '{profile_name}' applied to user '{username}'"
#         except mysql.connector.Error as err:
#             if close_conn:
#                 conn.rollback()
#             logger.error(f"Database error: {err}")
#             return False, f"Database error: {err}"
#         finally:
#             if close_conn:
#                 cursor.close()
#                 conn.close()
    
#     def get_profile_attributes(self, profile_name):
#         """Get attributes for a specific profile"""
#         # Define common profiles
#         profiles = {
#             'basic': [
#                 {'attribute': 'Session-Timeout', 'op': ':=', 'value': '3600'},
#                 {'attribute': 'Acct-Interim-Interval', 'op': ':=', 'value': '300'},
#                 {'attribute': 'Idle-Timeout', 'op': ':=', 'value': '600'}
#             ],
#             'premium': [
#                 {'attribute': 'Session-Timeout', 'op': ':=', 'value': '86400'},
#                 {'attribute': 'Acct-Interim-Interval', 'op': ':=', 'value': '300'},
#                 {'attribute': 'Idle-Timeout', 'op': ':=', 'value': '1800'},
#                 {'attribute': 'WISPr-Bandwidth-Max-Down', 'op': ':=', 'value': '10240'},
#                 {'attribute': 'WISPr-Bandwidth-Max-Up', 'op': ':=', 'value': '2048'}
#             ],
#             'hotspot': [
#                 {'attribute': 'Session-Timeout', 'op': ':=', 'value': '3600'},
#                 {'attribute': 'Acct-Interim-Interval', 'op': ':=', 'value': '300'},
#                 {'attribute': 'WISPr-Bandwidth-Max-Down', 'op': ':=', 'value': '2048'},
#                 {'attribute': 'WISPr-Bandwidth-Max-Up', 'op': ':=', 'value': '1024'},
#                 {'attribute': 'Idle-Timeout', 'op': ':=', 'value': '600'}
#             ],
#             'pppoe': [
#                 {'attribute': 'Session-Timeout', 'op': ':=', 'value': '86400'},
#                 {'attribute': 'Acct-Interim-Interval', 'op': ':=', 'value': '300'},
#                 {'attribute': 'Framed-Protocol', 'op': ':=', 'value': 'PPP'},
#                 {'attribute': 'Service-Type', 'op': ':=', 'value': 'Framed-User'},
#                 {'attribute': 'Framed-Compression', 'op': ':=', 'value': 'Van-Jacobson-TCP-IP'},
#                 {'attribute': 'Framed-MTU', 'op': ':=', 'value': '1500'},
#                 {'attribute': 'Framed-IP-Address', 'op': ':=', 'value': '255.255.255.254'}, # Dynamic IP
#                 {'attribute': 'Idle-Timeout', 'op': ':=', 'value': '1800'}
#             ]
#         }
        
#         return profiles.get(profile_name.lower(), [])
        
#     def get_all_profiles(self):
#         """Get all available profiles"""
#         return ['basic', 'premium', 'hotspot', 'pppoe']

