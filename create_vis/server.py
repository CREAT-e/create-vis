from flask import Flask, render_template
from vis.network import network_vis


app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")
app.register_blueprint(network_vis, url_prefix="/network")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/network")
def network():
    return render_template("network.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
