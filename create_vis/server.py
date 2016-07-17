from flask import Flask, render_template, request, current_app
import requests
from vis.ref_network import ref_network
from vis.shared import shared

app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")
app.register_blueprint(ref_network, url_prefix="/refnetwork")
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

    response = requests.get(api_url + "/aggregatable_properties")
    properties = response.json()["properties"]

    field = request.args.get('field')

    if field:
        values_response = requests.get(api_url + "/values?field=" + field)

        field_values = values_response.json()["values"]
        return render_template("chart.html", properties=properties,
                               values=field_values, current_field=field)
    return render_template("chart.html", properties=properties, values=[],
                           current_field=None)


@app.route("/refnetwork")
def network():
    return render_template("ref_network.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
