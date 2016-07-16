from flask import Flask, render_template, request, current_app
import requests
from vis.network import network_vis
from vis.shared import shared

app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")
app.register_blueprint(network_vis, url_prefix="/network")
app.register_blueprint(shared)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/chart")
def chart_test():
    api_url = current_app.config["COPYRIGHT_EVIDENCE_API_URL"]

    response = requests.get(api_url + "/properties")
    properties = response.json()["properties"]

    field = request.args.get('field')

    if field:
        values_response = requests.get(api_url + "/values?field=" + field)

        field_values = values_response.json()["values"]
        return render_template("chart.html", properties=properties,
                               values=field_values, current_field=field)
    return render_template("chart.html", properties=properties, values=[],
                           current_field=None)


@app.route("/network")
def network():
    return render_template("network.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
