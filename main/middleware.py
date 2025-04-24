from flask import Flask, request, abort

import settings


def init_middleware(app: Flask):
    @app.before_request
    def check_origin():
        allowed_origins = settings.ALLOWED_ORIGINS
        origin = request.headers.get('Origin')
        if origin and origin not in allowed_origins:
            abort(403, description="Origin not allowed")
