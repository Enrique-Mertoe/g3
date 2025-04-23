from flask import Flask

from tests import testA

app = Flask(__name__)

testA.check_dirs()


@app.route('/')
def hello_world():
    return 'Hello World!'


if __name__ == '__main__':
    app.run()
