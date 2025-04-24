from functools import wraps

from flask import session, flash, redirect, url_for

USERS = {
    "abutimartin778@gmail.com": {
        "password": "admin123",  # Change this!
        "role": "admin"
    }
}


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            flash('Please log in to access this page', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function
