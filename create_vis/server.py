from flask import Flask, render_template


app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
