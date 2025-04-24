import logging
import threading
import time


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
        self.logger.info("Refreshing user cache...")
        users = self.vpn_manager._get_user_list_internal()
        self.cache_manager.store_users(users)
        self.logger.info(f"User cache refreshed with {len(users)} users")

    def force_refresh(self):
        """Manually trigger a cache refresh"""
        threading.Thread(target=self._refresh_cache).start()
