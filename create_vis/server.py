from flask import Flask, render_template, request, current_app, jsonify
import requests
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

@app.route("/studies")
def filtered_studies():
    # To avoid having to set up a reverse proxy to deal with CORS,
    # we just proxy requests to the /studies API endpoint in-app for
    # any javascript files to call

    filter_param = request.args.get("filter")
    fields_param = request.args.get("fields")

    url = current_app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/studies?filter=" + filter_param + "&fields=" + fields_param
    try:
        response = requests.get(url)
        response_json = response.json()
        return jsonify(response_json)
    except requests.RequestException:
        return []

@app.route("/bar_chart")
def chart_test():
    #TODO: Parameterise API url via config files
    response = requests.get(current_app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/properties")
    properties = response.json()["properties"]

    field = request.args.get('field')

    if field:
        values_response = requests.get("http://localhost:4000/values?field=" + field)

        field_values = values_response.json()["values"]
        return render_template("chart.html", properties=properties, values=field_values, current_field=field)
    else:
        return render_template("chart.html", properties=properties, values = [])


@app.route("/network")
def network():
    return render_template("network.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=app.config["PORT"])
