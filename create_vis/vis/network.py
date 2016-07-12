import requests
from flask import Blueprint, jsonify, current_app, abort

network_vis = Blueprint("network_vis", __name__)


def get_studies():
    url = current_app.config["COPYRIGHT_EVIDENCE_API_URL"] + "/studies"
    try:
        response = requests.get(url)
        studies = response.json()["studies"]
        return assign_study_ids(studies)
    except requests.RequestException:
        abort(500)


def assign_study_ids(studies):
    for i, study in enumerate(studies):
        study["id"] = i
    return studies


def gen_nodes(studies):
    return [gen_node(s, studies) for s in studies]


def gen_node(study, studies):
    return {
        "id": study["id"],
        "title": get_title(study),
        "edges": gen_edges(study, studies),
        "color": "#4582ec"
    }


def get_title(study):
    title = "<strong>Title: </strong>" + study["title"]
    if "references" in study:
        title += "<br>"
        title += "<strong>References:</strong>"
        title += "<br>"
        for ref in study["references"]:
            title += ref + "<br>"
    return title


def get_nodes(filter_no_edges=True):
    studies = get_studies()
    nodes = gen_nodes(studies)
    if filter_no_edges:
        return list(filter(lambda n: len(n["edges"]) > 0, nodes))
    return nodes


def gen_edges(study, studies):
    if "references" not in study:
        return []
    edges = []
    for other_study in studies:
        if study == other_study:
            continue
        if "references" not in other_study:
            continue
        refs = study["references"]
        other_refs = other_study["references"]
        if set(refs) & set(other_refs):
            edges.append({
                "from": study["id"],
                "to": other_study["id"]
            })
    return edges


def get_edges(nodes, filter_circular=True):
    edges = []
    for n in nodes:
        edges += n["edges"]
    if filter_circular:
        non_circular_edges = []
        for edge in edges:
            comp_edge = {
                "from": edge["to"],
                "to": edge["from"]
            }
            if comp_edge not in non_circular_edges:
                non_circular_edges.append(edge)
        return non_circular_edges
    return edges


@network_vis.route("/nodes")
def network_nodes():
    nodes = get_nodes()
    edges = get_edges(nodes)
    return jsonify({
        "nodes": nodes,
        "edges": edges
    })
