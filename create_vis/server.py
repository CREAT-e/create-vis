from flask import Flask, render_template, request, current_app
from vis.network import network
from vis.shared import shared
import requests

app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")
app.register_blueprint(network, url_prefix="/network")
app.register_blueprint(shared)


def get_properties():
    url = app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/properties"
    try:
        response = requests.get(url)
        return response.json()["properties"]
    except requests.RequestException:
        abort(500)


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

    if properties:
        properties.sort()

    field = request.args.get('field')
    value = request.args.get('value')
    aggregate_on = request.args.get('aggregate_on')

    if not field:
        field = "industry"

    if not value:
        value = "Software publishing (including video games)"

    if not aggregate_on:
        aggregate_on="evidence_based_policy"

    values_response = requests.get(api_url + "/values?field=" + field)
    field_values = values_response.json()["values"]

    if field_values:
        field_values.sort()

    return render_template("chart.html",
                           properties=properties,
                           values=field_values,
                           current_field=field,
                           current_value=value,
                           current_aggregate_on=aggregate_on)


@app.route("/network")
def ref_network():
    blacklist = [
        "comparative",
        "cross_country",
        "evidence_based_policy",
        "government_or_policy",
        "literative_review",

    ]
    properties = [p for p in get_properties() if p not in blacklist]
    properties.sort()
    return render_template("network.html", properties=properties)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
