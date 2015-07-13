function click(d) {

    console.log("click: ", d);

    currentSelectedNode = d;

    highlightSelections(d);

}

function highlightSelections(d) {

    var	highlightLinkColor = "#f03b20";
	var defaultLinkColor = "lightgray";

    var depth =  d.depth;
    var nodeColor = d.color;
    if (depth === 1) {
        nodeColor = highlightLinkColor;
    }

    var links = svg.selectAll("path.link");

    links.style("stroke",function(dd) {
        if (dd.source.depth === 0) {
            if (d.name === '') {
                return highlightLinkColor;
            }
            return defaultLinkColor;
        }

        if (dd.source.name === d.name) {
            return nodeColor;
        }else {
            return defaultLinkColor;
        }
    });

}




///////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
var rootCirleSize = 10;
var depthOneCircleSize = 6;
var depthTwoCircleSize = 7;
var depthThreeCircleSize = 4;


var radius = 900 / 2;

var cluster = d3.layout.cluster()
	.size([360, radius - 240]);

var diagonal = d3.svg.diagonal.radial()
	.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("body").append("svg")
	.attr("width", radius * 2)
	.attr("height", radius * 2)
    .append("g")
	.attr("transform", "translate(" + radius + "," + radius + ")");

d3.json("data/forestSpecies.json", function(error,root) {
  if (error) throw error;

  var nodes = cluster.nodes(root);

  var link = svg.selectAll("path.link")
	  .data(cluster.links(nodes))
	  .enter().append("path")
	  .attr("class", "link")
	  .attr("d", diagonal);

  var node = svg.selectAll("g.node")
	  .data(nodes)
	  .enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

	  //.on("mouseover", overCircle)
      //.on("mouseout", outCircle)
      .on('click', click);

  node.append("circle")
	  .attr("r", function(d){
	  	if (d.depth == 0) {
            return rootCirleSize;
        }
        else if (d.depth === 1) {
            return depthOneCircleSize;
        }
        else if (d.depth === 2) {
            return depthTwoCircleSize;
        }
        return depthThreeCircleSize;
	  })
	  .style("stroke",function(d){
	  	return "white";
	  })
	  .style("fill",function(d){
	    if(d.color) {
            return d.color;
        }else {
            if(d.depth == 1) {
                return "lightgray";
            }
            else{
                return "lightgray";
            }
        }
	  });

  node.append("text")
	  .attr("dy", ".31em")
	  .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	  .attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
	  .text(function(d) { return d.name; });
});

d3.select(self.frameElement).style("height", radius * 2 + "px");