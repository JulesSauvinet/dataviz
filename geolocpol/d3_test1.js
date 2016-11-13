    var svg = d3.select("body").append("svg")
      .attr("width", 960)
      .attr("height", 500)

    var data = [10,30,15,20,100];

    svg.selectAll("rect").data(data).enter().append("rect")
      .attr("y", function(d) { return 120-d ;})
      .attr("x", function(d, i) { return i*90 ;})
      .style("font-size", 36)
      .style("font-family", "monospace")

    svg.selectAll("text").data(data).enter().append("text")
      .text(function(d){ return d;})
      .attr("y", function (d) { return 120-d;})
      .attr("x", function(d,i){return i*90;})
      .style("font-size", 36)
      .style("font-family", "monospace")