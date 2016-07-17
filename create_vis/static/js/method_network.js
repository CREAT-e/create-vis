$(document).ready(function() {
    axios.get("/methodnetwork/nodes")
        .then(function(response) {
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
        })
        .then(function() {
            $(".loading-spinner").hide();
            $(".load-hidden").show();
        });
});
