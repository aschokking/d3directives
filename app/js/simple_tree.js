// Get JSON data
treeJSON = d3.json("flare.json", function(error, treeData) {
  
  // Define the zoom function for the zoomable tree
  function zoom() {
      layoutRoot.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }


  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
  
  // size of the diagram
  var viewerWidth = $(document).width();
  var viewerHeight = $(document).height();
  
  var getChildren = function(d) {
    return (d.children && d.children.length > 0) ? d.children : null;
  };
  
  // computer number of child nodes
  var totalLeafs = 0;
  treeData.children.forEach(function(d) {
    totalLeafs += d.children ? d.children.length : 0;
  });
  
  var viewHieght = totalLeafs * 25;
  
  var tree = d3.layout.tree()
    .children(getChildren)
    .size([viewHieght, viewerWidth]);

  var nodes = tree.nodes(treeData);
  var links = tree.links(nodes);
  
  var layoutRoot = d3.select("#tree-container")
    .append("svg:svg").attr("width", viewerWidth).attr("height", viewerHeight)
    .attr("class", "overlay")
    .call(zoomListener)
    .append("svg:g");
    
  var link = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });
  
  // Set widths between levels based on maxLabelLength.
  nodes.forEach(function(d) {
    d.y = (d.depth * 250); //500px per level.
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
    .attr("class", "node-dot")
    .attr("r", 4.5);
    
  
});