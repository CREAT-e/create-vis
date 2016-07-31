import requests
from flask import Blueprint, jsonify, current_app, abort, request

intersection = Blueprint("intersection", __name__)


def get_valid_values(category):
    base = current_app.config["COPYRIGHT_EVIDENCE_API_URL"]

    values_response = requests.get(base + "/values?field=" + category)

    field_values = values_response.json()["values"]
    return field_values

def make_filter(category1, cat_val1, category2, cat_val2, category3, cat_val3):
    cat_val1 = category1.replace(",", "\,")
    cat_val2 = category1.replace(",", "\,")
    cat_val3 = category1.replace(",", "\,")

    blah = [category1,":", cat_val1, ",", category2, ":", ",", category3, ":", cat_val3].join()

    return "filter=" + blah


@intersection.route("/intersection")
def intersections():
    category1 = request.args.get("category1")
    category2 = request.args.get("category2")
    category3 = request.args.get("category3")

    cat1_vals = get_valid_values(category1)
    cat2_vals = get_valid_values(category2)
    cat3_vals = get_valid_values(category3)

    print(cat1_vals)
    print(cat2_vals)
    print(cat3_vals)


    return jsonify({'results' : []})
