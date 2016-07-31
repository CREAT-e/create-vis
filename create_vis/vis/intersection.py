import requests
from flask import Blueprint, jsonify, current_app, abort, request

intersection = Blueprint("intersection", __name__)

def get_all_studies():
    base = current_app.config["COPYRIGHT_EVIDENCE_API_URL"]
    studies_response = requests.get(base + "/studies")
    print(studies_response)

    return studies_response.json()["studies"]

def study_has_value(study, field, val):
    value = study.get(field)
    if value:
        if isinstance(value, list):
            return val in value
        else:
            return value == val


def count_studies_matching(studies, cat1, cat2, cat3, x, y, z):
    count = 0

    for study in studies:
        if study_has_value(study, cat1, x) and study_has_value(study, cat2, y) and study_has_value(study, cat3, z):
            count = count + 1

    return count



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
                count = count_studies_matching(all_studies, category1, category2, category3, cat1_val, cat2_val, cat3_val)
                data_obj = {'x' : cat1_val, 'y': cat2_val, 'z': cat3_val, 'count': count}
                data.append(data_obj)

    data.sort(key=lambda a : a['count'], reverse=True)
    data = filter(data, lambda a : a['count'] > 0)

    return jsonify({'results' : data})
