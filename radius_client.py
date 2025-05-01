# from pyrad.client import Client
# from pyrad.dictionary import Dictionary
# import socket

# def radius_authenticate(username, password, nas_ip="127.0.0.1", secret=b"testing123", server="127.0.0.1"):
#     """
#     Authenticates a user against RADIUS server and returns session attributes
#     """
#     try:
#         # Create RADIUS client
#         client = Client(server=server,
#                        authport=1812,
#                        acctport=1813,
#                        secret=secret,
#                        dict=Dictionary("dictionary"))

#         # Create authentication request
#         req = client.CreateAuthPacket(code=1, User_Name=username)
#         req["User-Password"] = req.PwCrypt(password)
#         req["NAS-IP-Address"] = nas_ip
#         req["Service-Type"] = 2  # Framed User

#         # Send request and get response
#         reply = client.SendPacket(req)
        
#         if reply.code == 2:  # Access-Accept
#             # Extract session parameters
#             session_params = {}
#             for attr in reply.keys():
#                 session_params[attr] = reply[attr]
#             return True, session_params
#         else:
#             return False, {}
    
#     except Exception as e:
#         print(f"RADIUS authentication error: {e}")
#         return False, {}

# # Example usage
# if __name__ == "__main__":
#     success, params = radius_authenticate("testuser", "testpassword")
#     if success:
#         print("Authentication successful!")
#         print("Session parameters:")
#         for key, value in params.items():
#             print(f"  {key}: {value}")
#     else:
#         print("Authentication failed!")