var width = 800,
    height = 800,
    radius = Math.max(width, height) / 2;

var x = d3.scale.linear().range([0, 2* Math.PI]);
//var y = d3.scale.pow().exponent(2.2).domain([0,1]).range([0, radius]);

var y = d3.scale.linear().range([0, radius]);

var svg = d3.select(document.getElementById("vis")).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return d.depth; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y+ d.dy)); });

// Keep track of the node that is currently being displayed as the root.
var node;

d3.json("data/forestSpecies.json", function(error, root) {
  node = root;
  var g = svg.selectAll("g")
      .data(partition.nodes(root))
      .enter().append("g");

  var path = g.append("path")
    .attr("d", arc)
    .style("stroke","snow")
    .attr("class", function(d) { return "ring_" + d.depth; })
    .style("fill", function(d) {
      if(d.depth == 1){
        var woodcolor;
        if(d.name=="Hardwoods"){
          woodcolor = "#816854";
        }else{
          woodcolor = "#C3B9A0";
        }
        return woodcolor;
      }else if(d.depth>1){
        return d.color;
      }
      else{
        return "gray";
      }

    })
    //.attr("visibility",function(d) { return d.dx < 0.025? "hidden" : "visible"})
    .on("click", click);



  var text = g.append("text")
    .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
    .attr("x", function(d) { return y(d.y); })
    .attr("class","wheel-text")

    .attr("visibility",function(d) { return d.dx < 0.025? "hidden" : "visible"})
    .text(function(d) { return d.name; })

    .text(function(d)
    {
      if (d.depth == 2)
      {

        return d.alias;
      }

      return d.name;

    });





  d3.selectAll("input").on("change", function change() {
    var value = this.value === "count"
        ? function() { return 1; }
        : function(d) { return d.size; };

    path.data(partition.value(value).nodes)
        .transition()
        .duration(1000)
        .attrTween("d", arcTweenData);
  });

  function click(d) {
    /*
    // fade out all text elements
    text.transition().attr("opacity", 0);
    path.transition()
      .duration(750)
      .attrTween("d", arcTween(d))
      .each("end", function(e, i) {
          // check if the animated element's data e lies within the visible angle span given in d
          if (e.x >= d.x && e.x < (d.x + d.dx)) {
            // get a selection of the associated text element
            var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition().duration(750)
              .attr("opacity", 1)
              .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
              .attr("x", function(d) { return y(d.y); });
          }
      });
      */
       var total = d.dx;

    // fade out all text elements
    text.transition().attr("opacity", 0);

    path.transition()
       .duration(750)
       .attrTween("d", arcTween(d))
       .each("end", function(e, i) {
           // check if the animated element's data e lies within the visible angle span given in d
           if (e.x >= d.x && e.x < (d.x + d.dx)) {
           // get a selection of the associated text element
           var arcText = d3.select(this.parentNode).select("text");
            // fade in the text element and recalculate positions
            arcText.transition()
            .attr("opacity", 1)

            .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
            .attr("x", function(d) { return y(d.y); })
            .attr("visibility",function(d) { return d.dx/total < 0.01? "hidden" : "visible"});

      }


  });

  }
});

d3.select(self.frameElement).style("height", height + "px");

// When switching data: interpolate the arcs in data space.
function arcTweenData(a, i) {
  var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  function tween(t) {
    var b = oi(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  }
  if (i == 0) {
   // If we are on the first arc, adjust the x domain to match the root node
   // at the current zoom level. (We only need to do this once.)
    var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
    return function(t) {
      x.domain(xd(t));
      return tween(t);
    };
  } else {
    return tween;
  }
}

// When zooming: interpolate the scales.
function arcTween(d) {
  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, 1]),
      yr = d3.interpolate(y.range(), [d.y ? 100 : 0, radius]);
  return function(d, i) {
    return i
        ? function(t) { return arc(d); }
        : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}


function computeTextRotation(d) {
  return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}