$(document).ready(function() {
    axios.get("/refnetwork/nodes/references")
        .then(createGraph)
        .then(stopLoading);
});

function createGraph(response) {
    var graph = response.data;

    var data = {
        nodes: graph.nodes,
        edges: graph.edges
    };

    var options = {
        nodes: {
            shape: 'dot',
            scaling: {
                min: 10,
                max: 30
            },
            font: {
                size: 12,
                face: 'Tahoma'
            }
        },
        layout: {
            improvedLayout: false
        },
        edges: {
            width: 0.15,
            color: {inherit: 'from'},
            smooth: {
                type: 'continuous'
            }
        },
        physics: {
            barnesHut: {
                gravitationalConstant: -10000,
                springConstant: 0.001,
                springLength: 300
            }
        },
        interaction: {
            tooltipDelay: 100,
            hideEdgesOnDrag: true
        }
    };

    var container = document.getElementById("vis");
    var network = new vis.Network(container, data, options);
    network.fit();
    network.on("selectNode", function (params) {
        var id = params.nodes[0];
        var node = getNode(id, graph.nodes);
        if (node && node.name) {
            var wikiUrl = "http://www.copyrightevidence.org/evidence-wiki/index.php/";
            var url = wikiUrl + encodeURI(node.name);
            window.open(url);
        }
    });
}

function startLoading() {
    $(".loading-spinner").show();
    $(".load-hidden").hide();
}

function stopLoading() {
    $(".loading-spinner").hide();
    $(".load-hidden").show();
}

function getNode(id, nodes) {
    for (var i in nodes) {
        var node = nodes[i];
        if (node.id === id) {
            return node;
        }
    }
}
