class PathError(Exception):
    def __init__(self):
        super().__init__("Path not found!")
