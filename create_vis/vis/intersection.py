import requests
from flask import Blueprint, jsonify, current_app, abort, request

intersection = Blueprint("intersection", __name__)


@intersection.route("/intersection")
def intersections():
    field1 = request.args.get("category1")
    field2 = request.args.get("category2")
    field3 = request.args.get("category3")

    print(field1)
    print(field2)
    print(field3)

    return jsonify({'results' : []})
