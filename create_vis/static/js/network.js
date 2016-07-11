$(document).ready(function() {
    axios.get("/network/nodes")
        .then(function(response) {
            var graph = response.data;

            var width = 1000,
                height = 500;

            var color = d3.scale.category20();

            var force = d3.layout.force()
                .charge(-90)
                .linkDistance(10)
                .size([width, height]);

            var svg = d3.select("#vis")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            force.nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = svg.selectAll(".link")
                .data(graph.links)
                .enter()
                .append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) { return Math.sqrt(1); });

            var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("r", 5)
                .style("fill", function(d) { return color(1); })
                .call(force.drag);

            node.append("title")
                .text(function(d) { return d.title; });

            force.on("tick", function() {
              link.attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

              node.attr("cx", function(d) { return d.x; })
                  .attr("cy", function(d) { return d.y; });
            });
        })
        .then(function() {
            $("#vis-loader").hide();
            $("#vis").show("slow");
        });
});