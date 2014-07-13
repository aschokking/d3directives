// Get JSON data
treeJSON = d3.json("flare.json", function(error, treeData) {
  var size = [800, 400];
  
  var tree = d3.layout.tree()
    .children(function(d) {
      return (d.children && d.children.length > 0) ? d.children : null;
    })
    .size(size);

  var nodes = tree.nodes(treeData);
  var links = tree.links(nodes);
  
  var layoutRoot = d3.select("#tree-container")
    .append("svg:svg").attr("width", size.width).attr("height", size.height)
    .append("svg:g");
    
  var link = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });
    
  layoutRoot.selectAll("path.link")
    .data(links)
    .enter()
    .append("svg:path")
    .attr("class", "link")
    .attr("d", link);
    
  var nodeGroup = layoutRoot.selectAll("g.node")
    .data(nodes)
    .enter()
    .append("svg:g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });
    
  nodeGroup.append("svg:circle")
    .attr("class", "node-dot");
});