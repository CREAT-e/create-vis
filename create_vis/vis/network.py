import requests
from flask import Blueprint, jsonify, current_app

network_vis = Blueprint("network_vis", __name__)


def get_studies():
    url = current_app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/studies"
    try:
        response = requests.get(url)
        return response.json()["studies"]
    except requests.RequestException:
        return []


def get_links(studies):
    links = []
    for i, study in enumerate(studies):
        for j, other in enumerate(studies):
            if study["title"] == other["title"]:
                continue
            if "references" not in study or "references" not in other:
                continue
            study_refs = study["references"]
            other_refs = other["references"]
            if set(study_refs) & set(other_refs):
                links.append({
                    "source": i,
                    "target": j
                })
    return links


def get_nodes(studies):
    return [{"title": s["title"]} for s in studies]


@network_vis.route("/nodes")
def network_nodes():
    studies = get_studies()
    return jsonify({
        "nodes": get_nodes(studies),
        "links": get_links(studies)
    })
