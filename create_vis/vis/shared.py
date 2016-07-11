from flask import Blueprint, current_app, jsonify, request
import requests


shared = Blueprint("shared", __name__)

@shared.route("/studies")
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
