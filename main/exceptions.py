class PathError(Exception):
    def __init__(self, message="Path not found!", *args, **kwargs):
        super().__init__(message, *args, *kwargs)
