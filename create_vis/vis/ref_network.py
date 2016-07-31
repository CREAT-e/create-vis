import requests
from flask import Blueprint, jsonify, current_app, abort

ref_network = Blueprint("ref_network", __name__)


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


def gen_nodes(studies, prop):
    return [gen_node(s, studies, prop) for s in studies]


def gen_node(study, studies, prop):
    return {
        "id": study["id"],
        "name": study["name"] if "name" in study else "",
        "title": get_title(study, prop),
        "edges": gen_edges(study, studies, prop),
        "color": "#4582ec"
    }


def get_title(study, prop):
    title = "<strong>Title: </strong>" + study["title"]
    if "references" in study:
        title += "<br>"
        title += "<strong>" + prop + ":</strong>"
        title += "<br>"
        for ref in study[prop]:
            title += ref + "<br>"
    return title


def get_nodes(prop, filter_no_edges=True):
    studies = get_studies()
    nodes = gen_nodes(studies, prop)
    if filter_no_edges:
        return list(filter(lambda n: len(n["edges"]) > 0, nodes))
    return nodes


def gen_edges(study, studies, prop):
    if prop not in study:
        return []
    edges = []
    for other_study in studies:
        if study == other_study:
            continue
        if prop not in other_study:
            continue
        refs = study[prop]
        other_refs = other_study[prop]
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


@ref_network.route("/nodes/<prop>")
def network_nodes(prop):
    nodes = get_nodes(prop)
    edges = get_edges(nodes)
    return jsonify({
        "nodes": nodes,
        "edges": edges
    })
