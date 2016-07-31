import requests
from flask import Blueprint, jsonify, current_app, abort, request

intersection = Blueprint("intersection", __name__)

def get_all_studies():
    base = current_app.config["COPYRIGHT_EVIDENCE_API_URL"]
    studies_response = requests.get(base + "/studies")
    print(studies_response)

    return studies_response.json()["studies"]

def count_studies_matching(studies, x, y, z):
    return 0


def get_valid_values(category):
    base = current_app.config["COPYRIGHT_EVIDENCE_API_URL"]

    values_response = requests.get(base + "/values?field=" + category)

    field_values = values_response.json()["values"]
    return field_values

@intersection.route("/intersection")
def intersections():
    data = []

    category1 = request.args.get("category1")
    category2 = request.args.get("category2")
    category3 = request.args.get("category3")

    cat1_vals = get_valid_values(category1)
    cat2_vals = get_valid_values(category2)
    cat3_vals = get_valid_values(category3)

    all_studies = get_all_studies()

    for cat1_val in cat1_vals:
        for cat2_val in cat2_vals:
            for cat3_val in cat3_vals:
                data_obj = {'x' : cat1_val, 'y': cat2_val, 'z': cat3_val}

    return jsonify({'results' : []})
