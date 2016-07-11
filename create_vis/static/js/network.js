$(document).ready(function() {
    axios.get("/network/nodes")
        .then(function(response) {
            var graph = response.data;
            var nodes = graph.nodes;
            var edges = graph.links;

            var container = document.getElementById("vis");
            
            var data = {
                nodes: nodes,
                edges: edges
            };
            
            var options = {
                nodes: {
                    shape: 'dot',
                    scaling: {
                        min: 10,
                        max: 30,
                        label: {
                            min: 8,
                            max: 30,
                            drawThreshold: 12,
                            maxVisible: 20
                        }
                    },
                    font: {
                        size: 12,
                        face: 'Tahoma'
                    }
                },
                edges: {
                    width: 0.15,
                    color: {inherit: 'from'},
                    smooth: {
                        type: 'continuous'
                    }
                },
                interaction: {
                    tooltipDelay: 200,
                    hideEdgesOnDrag: true
                },
                physics: {
                    repulsion: {
                        springLength: 1000,
                        nodeDistance: 1000
                    }
                }
            };
            
            var network = new vis.Network(container, data, options);
        })
        .then(function() {
            $(".loading-spinner").hide();
            $(".load-hidden").slideDown("slow");                                                
        });
});
