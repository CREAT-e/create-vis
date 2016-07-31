import requests
from flask import Blueprint, jsonify, current_app, abort, request

intersection = Blueprint("intersection", __name__)


@intersection.route("/intersection")
def intersection():
    field1 = request.args.get("field1")
    field2 = request.args.get("field2")
    field3 = request.args.get("field3")

    print(field1)
    print(field2)
    print(field3)

    return []
