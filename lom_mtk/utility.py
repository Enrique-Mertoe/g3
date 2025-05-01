import logging


class LomTechLogger:
    """Logger class for LomTech Mikrotik automation package."""

    def __init__(self, log_level=logging.INFO, log_file=None):
        """Initialize the logger.

        Args:
            log_level: Logging level (default: INFO)
            log_file: Optional file path to write logs (default: None, console only)
        """
        self.logger = logging.getLogger('lom_tech')
        self.logger.setLevel(log_level)

        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

        # Create console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

        # Create file handler if log_file is specified
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def info(self, message):
        """Log an info message."""
        self.logger.info(message)

    def error(self, message):
        """Log an error message."""
        self.logger.error(message)

    def warning(self, message):
        """Log a warning message."""
        self.logger.warning(message)

    def debug(self, message):
        """Log a debug message."""
        self.logger.debug(message)
