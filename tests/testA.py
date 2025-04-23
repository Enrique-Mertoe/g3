import subprocess

import settings


def check_dirs():
    print("BASE_PATH: ", settings.BASE_PATH)
    print("VPN_PATH: ", settings.VPN_DIR)

    #vpn items
    vpn = settings.VPN_DIR
    if vpn.exists():
        directories = [p for p in vpn.iterdir()]
        print("VPN_DIR_ITEMS: ",directories)
    else:
        print("VPN_PATH doesnt exist")
