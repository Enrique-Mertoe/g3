import logging
import os
import threading
import time
from datetime import datetime


class UserCacheRefresher:
    def __init__(self, vpn_manager, cache_manager, refresh_interval=300):  # 5 minutes default
        self.vpn_manager = vpn_manager
        self.cache_manager = cache_manager
        self.refresh_interval = refresh_interval
        self.thread = None
        self.running = False
        self.logger = logging.getLogger(__name__)

    def start(self):
        if self.thread is not None and self.thread.is_alive():
            return

        self.running = True
        self.thread = threading.Thread(target=self._refresh_loop)
        self.thread.daemon = True
        self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=1)

    def _refresh_loop(self):
        while self.running:
            try:
                self._refresh_cache()
            except Exception as e:
                self.logger.error(f"Error refreshing user cache: {str(e)}")

            # Sleep for the refresh interval
            for _ in range(self.refresh_interval):
                if not self.running:
                    break
                time.sleep(1)

    def _refresh_cache(self):
        cert_dir = os.path.join(self.vpn_manager.config_dir, "server/easy-rsa/pki/issued")
        crl_path = os.path.join(self.vpn_manager.config_dir, "server/easy-rsa/pki/crl.pem")

        # Get last refresh time
        last_refresh = self.cache_manager.get_last_refresh_time()
        if last_refresh:
            last_refresh_time = datetime.fromisoformat(last_refresh).timestamp()
        else:
            last_refresh_time = 0

        # Check if any certificate files or CRL have been modified
        needs_refresh = False

        # Check CRL file modification time
        if os.path.exists(crl_path):
            crl_mtime = os.path.getmtime(crl_path)
            if crl_mtime > last_refresh_time:
                self.logger.info("CRL file changed, refresh needed")
                needs_refresh = True

        # Check certificate files
        if not needs_refresh and os.path.exists(cert_dir):
            for cert_file in os.listdir(cert_dir):
                if cert_file.endswith('.crt'):
                    cert_path = os.path.join(cert_dir, cert_file)
                    if os.path.getmtime(cert_path) > last_refresh_time:
                        self.logger.info(f"Certificate file {cert_file} changed, refresh needed")
                        needs_refresh = True
                        break

        # Refresh only if needed
        if needs_refresh:
            self.logger.info("Refreshing user cache due to file changes...")
            users = self.vpn_manager._get_user_list_internal()
            self.cache_manager.store_users(users)
        else:
            self.logger.info("No certificate changes detected, skipping refresh")
            # Just update the timestamp
            self.cache_manager.update_refresh_timestamp()

    def force_refresh(self):
        """Manually trigger a cache refresh"""
        threading.Thread(target=self._refresh_cache).start()
