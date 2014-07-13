// Get JSON data
treeJSON = d3.json("small.json", function(error, treeData) {
  
  // used to set unique identifers on every node
  var i = 0;
  
  // dragging state variables
  var selectedNode = null;
  
  // Define the zoom function for the zoomable tree
  function zoom() {
      layoutRoot.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
      
      
  var overCircle = function(d) {
    selectedNode = d;
  };
  var outCircle = function(d) {
    selectedNode = null;
  };
 
  // Define the drag listeners for drag/drop behaviour of nodes.
  var dragBehavior = d3.behavior.drag()
    .on("dragstart", function(d) {
      d3.event.sourceEvent.stopPropagation();
      var draggingNode = d;
      var element = this;
      
      // remove parent link
      var parentLink = tree.links(tree.nodes(draggingNode.parent));
      layoutRoot.selectAll('path.link').filter(function(d, i) {
          if (d.target.id == draggingNode.id) {
              return true;
          }
          return false;
      }).remove();
    })
    .on("drag", function(d) {
      d.x0 += d3.event.dy;
      d.y0 += d3.event.dx;
      var node = d3.select(this);
      node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
    })
    .on("dragend", function(d) {
      var draggingNode = d;
      if(selectedNode) {
        // reparent node to selected node
        var index = draggingNode.parent.children.indexOf(draggingNode);
        if (index > -1) {
            draggingNode.parent.children.splice(index, 1);
        }
        selectedNode.children.push(draggingNode);
      }
      update();
    });
  
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
  
  
    
  function update() {
    // Compute the new tree layout.
    var nodes = tree.nodes(treeData),
        links = tree.links(nodes);
        
    // Set widths between levels
    nodes.forEach(function(d) {
      d.y = (d.depth * 250);
    });
    
    // Set node ids
    node = layoutRoot.selectAll("g.node")
      .data(nodes, function(d) {
          return d.id || (d.id = ++i);
      });
    
    // save positions for later
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
    
    var allPaths = layoutRoot.selectAll("path.link")
    .data(links);
    
    allPaths.enter()
    .append("svg:path")
    .attr("class", "link");
    
    allPaths.exit()
      .remove();
    
    allPaths.attr("d", link);
    
    var allNodes = layoutRoot.selectAll("g.node")
      .data(nodes);
    
    var removedNodes = allNodes
      .exit()
      .remove();
    
    var newNodes = allNodes
      .enter()
      .append("svg:g")
      .attr("class", "node");
      
    // set drag behavior on leaves
    allNodes.filter(function (d){
      return d.depth == 2;
    })
    .call(dragBehavior);
    
    newNodes.append("svg:circle")
      .attr("class", "node-dot")
      .attr("r", 4.5);
    
    newNodes.append("svg:text")
      .attr('class', 'nodeText')
      .attr("dy", ".35em")
      .style("fill-opacity", 1);
      
    var texts = layoutRoot.selectAll("text").data(nodes)
      .text(function(d) {
          return d.name;
      })
      .attr('x', function(d) {
        if(d.depth == 2) {
          return 10;
        } else {
          return -10;
        }
      })
      .attr('y', function(d) {
        if(d.depth <= 1) {
          return -10;
        } else {
          return 0;
        }
      });
      
    // move drop targets 
    allNodes.selectAll("circle.ghostCircle")
    .remove();
      
    // set drag drop targets on middle nodes
    allNodes.filter(function (d) {
      return d.depth == 1;
    })
    .append("circle")
        .attr('class', 'ghostCircle')
        .attr("r", 30)
        .attr("opacity", 0.2) // change this to zero to hide the target area
    .style("fill", "red")
        .attr('pointer-events', 'mouseover')
        .on("mouseover", function(node) {
            overCircle(node);
        })
        .on("mouseout", function(node) {
            outCircle(node);
        });
      
      
    // position nodes
    allNodes.attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    })
  }
  
  update();
});