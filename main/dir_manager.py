import datetime

import settings
from main.exceptions import PathError


class DirManager:
    BASE = settings.VPN_DIR

    @classmethod
    def get(cls, *path):
        return cls.BASE.joinpath(*path)

    @classmethod
    def save_client(cls, name: str, content: str):
        path = cls.BASE.joinpath("client")
        if not path.exists():
            raise PathError
        path = path.joinpath(name + ".ovpn")
        path.write_text(content)

    @classmethod
    def get_clients(cls):
        clients = {}
        path = cls.BASE.joinpath("client")
        if not path.exists():
            return clients
        for file in path.iterdir():
            if file.suffix == '.ovpn' and file.is_file():
                client_name = file.stem  # gets filename without extension
                stat = file.stat()
                clients[client_name] = {
                    'created': datetime.datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d %H:%M:%S'),
                    'file_size': stat.st_size
                }
        return clients
