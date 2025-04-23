from flask import Flask

from main.admin.routes import init
from tests import testA

app = Flask(__name__)

testA.check_dirs()

init(app)

if __name__ == '__main__':
    app.run()
