from flask import Flask, render_template, request, abort
from vis.network import network
from vis.shared import shared
import requests
import logging

app = Flask(__name__)
app.config.from_envvar("CREATE_VIS_CFG")
app.register_blueprint(network, url_prefix="/network")
app.register_blueprint(shared)


@app.before_first_request
def setup_logging():
    if not app.debug:
        app.logger.addHandler(logging.StreamHandler())
        app.logger.setLevel(logging.INFO)


def get_properties():
    url = app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/properties"
    try:
        response = requests.get(url)
        return response.json()["properties"]
    except requests.RequestException:
        abort(500)


@app.route("/")
def index():
    app.logger.info("/")
    return render_template("index.html")


@app.route("/about")
def about():
    app.logger.info("/about")
    return render_template("about.html")


@app.route("/status")
def server_status():
    url = app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/status"
    status_info = requests.get(url).json()
    return render_template("status.html", status=status_info)


@app.route("/chart")
def chart():
    app.logger.info("/chart")
    api_url = app.config["COPYRIGHT_EVIDENCE_API_URL"]

    response = requests.get(api_url + "/aggregatable_properties")
    properties = response.json()["properties"]

    if properties:
        properties.sort()

    field = request.args.get('field')
    value = request.args.get('value')
    aggregate_on = request.args.get('aggregateOn')

    if not field:
        field = "industry"

    if not value:
        value = "Software publishing (including video games)"

    if not aggregate_on:
        aggregate_on = "evidence_based_policy"

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
    app.logger.info("/network")
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


@app.errorhandler(Exception)
def unhandled_exception(e):
    """Log unexcepted exceptions."""
    app.logger.error("Unhandled exception: %s", (e))
    return abort(500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
