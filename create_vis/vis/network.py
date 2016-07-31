import requests
from flask import Blueprint, jsonify, current_app, abort, request

network = Blueprint("network", __name__)


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


def gen_nodes(studies, prop, equality, matches):
    return [gen_node(s, studies, prop, equality, matches) for s in studies]


def gen_node(study, studies, prop, equality, matches):
    return {
        "id": study["id"],
        "name": study["name"] if "name" in study else "",
        "title": get_title(study, prop),
        "edges": gen_edges(study, studies, prop, equality, matches),
        "color": "#4582ec"
    }


def get_title(study, prop):
    title = "<strong>Title: </strong>" + study["title"]
    if prop in study:
        title += "<br>"
        title += "<strong>" + prop + ":</strong>"
        title += "<br>"
        val = study[prop]
        if isinstance(val, list):
            for p in study[prop]:
                title += p + "<br>"
        elif isinstance(val, bool):
            title += str(val)
        else:
            title += val
    return title


def get_nodes(prop, equality, matches, filter_no_edges=True):
    studies = get_studies()
    nodes = gen_nodes(studies, prop, equality, matches)
    if filter_no_edges:
        return list(filter(lambda n: len(n["edges"]) > 0, nodes))
    return nodes


def gen_edges(study, studies, prop, equality, matches):
    if prop not in study:
        return []
    edges = []
    for other_study in studies:
        if study == other_study:
            continue
        if prop not in other_study:
            continue
        x = study[prop]
        y = other_study[prop]
        if equality or not isinstance(x, list):
            if x == y:
                edges.append({
                    "id": str(study["id"]) + "_" + str(other_study["id"]),
                    "from": study["id"],
                    "to": other_study["id"]
                })
        else:
            i = set(x).intersection(y)
            if len(i) >= matches:
                edges.append({
                    "id": str(study["id"]) + "_" + str(other_study["id"]),
                    "from": study["id"],
                    "to": other_study["id"]
                })
    return edges


def get_edges(nodes):
    edges = []
    for n in nodes:
        edges += n["edges"]
    non_circular_edges = set()
    for edge in edges:
        cmp_id = str(edge["to"]) + "_" + str(edge["from"])
        if cmp_id not in non_circular_edges:
            non_circular_edges |= {edge["id"]}
    return [e for e in edges if e["id"] in non_circular_edges]


@network.route("/nodes/<prop>")
def network_nodes(prop):
    equality = request.args.get("equality") is not None
    matches = int(request.args.get("matches", 1))
    nodes = get_nodes(prop, equality, matches)
    edges = get_edges(nodes)
    return jsonify({
        "nodes": nodes,
        "edges": edges
    })
