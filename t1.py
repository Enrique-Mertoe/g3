from flask import Flask

app = Flask(__name__)


@app.route("/")
def f():
    return None


app.run(port=9000)
