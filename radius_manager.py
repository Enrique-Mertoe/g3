import re
import subprocess
import os
import logging

logging.basicConfig(level=logging.INFO)


class RadiusClientManager:
    def __init__(self, clients_conf_path='/etc/freeradius/3.0/clients.conf'):
        self.clients_conf_path = clients_conf_path
        
    def read_clients_conf(self):
        """Read the clients.conf file content."""
        with open(self.clients_conf_path, 'r') as f:
            return f.read()
    
    def write_clients_conf(self, content):
        """Write content to the clients.conf file."""
        with open(self.clients_conf_path, 'w') as f:
            f.write(content)
    
    def get_clients(self):
        """Parse and return all RADIUS clients as a list of dictionaries."""
        content = self.read_clients_conf()
        clients = []
        pattern = r'client\s+([^\s{]+)\s*{([^}]+)}'
        
        for match in re.finditer(pattern, content, re.DOTALL):
            client_name = match.group(1)
            client_block = match.group(2)
            
            # Extract client properties
            ip_match = re.search(r'ipaddr\s*=\s*([^\n]+)', client_block)
            secret_match = re.search(r'secret\s*=\s*([^\n]+)', client_block)
            nastype_match = re.search(r'nastype\s*=\s*([^\n]+)', client_block)
            
            client_data = {
                'name': client_name,
                'ipaddr': ip_match.group(1).strip() if ip_match else None,
                'secret': secret_match.group(1).strip() if secret_match else None,
                'nastype': nastype_match.group(1).strip() if nastype_match else 'other'
            }
            
            clients.append(client_data)
        
        return clients
    
    def add_client(self, name, ipaddr, secret, nastype='other'):
        """Add a new RADIUS client."""
        content = self.read_clients_conf()
        
        # Check if client already exists
        if re.search(rf'client\s+{re.escape(name)}\s*{{', content):
            return False, f"Client '{name}' already exists"
        
        # Create new client block
        new_client = f"""
client {name} {{
    ipaddr = {ipaddr}
    secret = {secret}
    nastype = {nastype}
}}
"""
        # Append to file
        updated_content = content + "\n" + new_client
        self.write_clients_conf(updated_content)
        
        # Restart FreeRADIUS
        self.restart_radius()
        
        return True, f"Client '{name}' added successfully"
    
    def update_client(self, name, ipaddr=None, secret=None, nastype=None):
        """Update an existing RADIUS client."""
        content = self.read_clients_conf()
        
        # Find the client block
        pattern = rf'client\s+{re.escape(name)}\s*{{([^}}]+)}}'
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            return False, f"Client '{name}' not found"
        
        client_block = match.group(1)
        updated_block = client_block
        
        # Update fields
        if ipaddr:
            if re.search(r'ipaddr\s*=', updated_block):
                updated_block = re.sub(r'ipaddr\s*=\s*[^\n]+', f'ipaddr = {ipaddr}', updated_block)
            else:
                updated_block += f'\n    ipaddr = {ipaddr}'
                
        if secret:
            if re.search(r'secret\s*=', updated_block):
                updated_block = re.sub(r'secret\s*=\s*[^\n]+', f'secret = {secret}', updated_block)
            else:
                updated_block += f'\n    secret = {secret}'
                
        if nastype:
            if re.search(r'nastype\s*=', updated_block):
                updated_block = re.sub(r'nastype\s*=\s*[^\n]+', f'nastype = {nastype}', updated_block)
            else:
                updated_block += f'\n    nastype = {nastype}'
        
        # Replace the old block with updated one
        updated_content = content.replace(f'client {name} {{{client_block}}}', 
                                         f'client {name} {{{updated_block}}}')
        
        self.write_clients_conf(updated_content)
        self.restart_radius()
        
        return True, f"Client '{name}' updated successfully"
    
    def delete_client(self, name):
        """Delete a RADIUS client."""
        content = self.read_clients_conf()
        
        # Use regex to find and remove the client block
        pattern = rf'client\s+{re.escape(name)}\s*{{[^}}]+}}'
        if not re.search(pattern, content):
            return False, f"Client '{name}' not found"
            
        updated_content = re.sub(pattern, '', content)
        
        # Write back and restart
        self.write_clients_conf(updated_content)
        self.restart_radius()
        
        return True, f"Client '{name}' deleted successfully"


    def restart_radius(self):
        try:
            subprocess.run(['reload_freeradius.sh'], check=True)
            logging.info("FreeRADIUS reloaded")
            return True, "FreeRADIUS reloaded"
        except subprocess.CalledProcessError as e:
            logging.error(f"Reload failed: {e}")
            return False, f"Reload failed: {e}"
        except FileNotFoundError:
            logging.error("reload_freeradius.sh not found")
            return False, "reload_freeradius.sh not found"

