$(document).ready(function() {
    $("#viewBtn").on("click", handleViewButtonClick);
    $("#filterBtn").on("click", handleFilterBtnClick);
    $("#advancedOptionsBtn").on("click", handleAdvancedOptionsBtnClick);
    $("#sel-property option:contains('references')").prop("selected", true);
    $("#sel-matches option:contains('1 Match')").prop("selected", true);
    $("#viewBtn").click();
});

function handleAdvancedOptionsBtnClick() {
    var el = $("#network-configuration");
    if (el.is(":visible")) {
        el.hide();
    } else {
        el.show();
    }
}

function handleFilterBtnClick() {
    startLoading();

    var str = $("#filterInput").val();
    if (!str) {
        var property = $("#sel-property").val();
        var matches = $("#sel-matches").val();
        generateGraph(property, matches, filter)
            .then(stopLoading);
        return;
    }

    var tokens = str.split("=");
    if (tokens.length !== 2) {
        stopLoading();
        return;
    }

    var key = tokens[0];
    var value = tokens[1];

    var filter = function(node) {
        if (key in node) {
            var val = node[key];
            if ($.isArray(val)) {
                return $.inArray(value, val);
            } else if (!isNaN(val)) {
                return Number(value) == val;
            }

            return node[key] == value;
        }

        return false;
    }

    var property = $("#sel-property").val();
    var matches = $("#sel-matches").val();
    generateGraph(property, matches, filter);
}

function handleViewButtonClick() {
    startLoading();
    var property = $("#sel-property").val();
    var matches = $("#sel-matches").val();
    generateGraph(property, matches);
}

function generateGraph(property, matches, filter) {
    var url = "/network/nodes/" + property;
    if (matches === "Equality") {
        url += "?equality";
    } else {
        var n = matches.substring(0, 1);
        url += "?matches=" + n;
    }

    return axios.get(url, {
        timeout: 30000
    })
    .then(function(response) {
        createGraph(response, filter);
    }, handleError)
}

function handleError() {
    stopLoading();

    $(".alert").slideDown();
    setTimeout(function() {
        $(".alert").slideUp();
    }, 5000);
}

function createGraph(response, filter) {
    var graph = response.data;

    if (filter) {
        graph.nodes = graph.nodes.filter(filter);
    }

    var dataSet = {
        nodes: new vis.DataSet(graph.nodes),
        edges: new vis.DataSet(graph.edges)
    };

    var options = {
        nodes: {
            shape: 'dot',
            color: {
                background: "#4582EC",
            },
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
        },
        configure: {
            enabled: true,
            container: document.getElementById("network-configuration"),
            filter: "nodes,edges,physics",
            showButton: false
        }
    };

    var container = document.getElementById("vis");
    var network = new vis.Network(container, dataSet, options);
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

    network.once("afterDrawing", function(params) {
        stopLoading();
    });
}

function startLoading() {
    $(".loading-spinner").show();
    $(".load-hidden").css("visibility", "hidden")
}

function stopLoading() {
    $(".loading-spinner").hide();
    $(".load-hidden").css("visibility", "visible");
}

function getNode(id, nodes) {
    for (var i in nodes) {
        var node = nodes[i];
        if (node.id === id) {
            return node;
        }
    }
}
