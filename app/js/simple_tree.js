"use strict";
var data = { name:"root", children: []};

$.ajax({
  url: "DisplayCategories.xml",
  dataType: "xml",
  error: function(err) {
	alert(err);
  }
})
.done(function( xml ) {
  $(xml).find("displayCategory").each(function(cat) {
    data.children.push({
      name: $(this).text(), 
      pid: $(this).attr("id"), 
      children: []});
  });
  
  $.ajax({
    url: "UIFContext.xml",
    dataType: "xml",
    error: function(err) {
      alert(err);
    }
  })
  .done(function( xml ) {
    $(xml).find("uifContext").each(function(context) {
      var that = this;
      
      var contextId = $(that).attr("id");
      var label = $($(that).find("displayFeature")[0]).text();
      
      var parent = $($(that).find("displayCategoryId")[0]).text();
      
      // find the parent display category and add child
      data.children.forEach(function(child) {
        if(child.pid == parent) {
          child.children.push({
          name: label,
          id: contextId});
        }
      });
    });
  
    createTree(data);
  });
});

// Get JSON data
var createTree = function(treeData) {
  
  // used to set unique identifers on every node
  var i = 0;
  
  var verticalSpacing = 30; // px
  var panningBoundary = 50; // px
  var panSpeed = 20; // px
  
  // dragging state variables
  var selectedNode = null;
  var dragging = false;
  
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
      if(d.depth != 2) {
        return;
      }
      dragging = true;
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
      d3.select(this).attr('pointer-events', 'none');
    })
    .on("drag", function(d) {
      if(dragging) {
      
        // get coords of mouseEvent relative to svg container to allow for panning
        var svgHeight = $('svg').height();
        var svgWidth = $('svg').width();
        var relCoords = d3.mouse($('svg').get(0));
        
        var panning = false;
        var current = zoomListener.translate();
        var scale = zoomListener.scale();
        console.log(relCoords);
        if(relCoords[0] < panningBoundary) {
          panning = true;
          current[0] += panSpeed
        } else if(relCoords[0] > svgWidth - panningBoundary) {
          panning = true;
          current[0] -= panSpeed
        } else if (relCoords[1] < panningBoundary) {
          panning = true;
          current[1] += panSpeed
        } else if (relCoords[1] > svgHeight - panningBoundary) {
          panning = true;
          current[1] -= panSpeed
        }
        if(panning) {
          zoomListener.translate(current);
          d3.select('g')
            .attr("transform", "translate(" + current[0] + "," + current[1] + ")scale(" + scale + ")");
        }
        
      
        d.x0 += d3.event.dy;
        d.y0 += d3.event.dx;
        var node = d3.select(this);
        node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
      }
    })
    .on("dragend", function(d) {
      if(dragging) {
        var draggingNode = d;
        if(selectedNode) {
          // reparent node to selected node
          var index = draggingNode.parent.children.indexOf(draggingNode);
          if (index > -1) {
              draggingNode.parent.children.splice(index, 1);
          }
          if(!selectedNode.children) {
            selectedNode.children = [];
          }
          selectedNode.children.push(draggingNode);
        }
        update();
        d3.select(this).attr('pointer-events', 'auto');
        dragging = false;
      }
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
    totalLeafs += (d.children && d.children.length > 1) ? d.children.length : 1;
  });
  
  var viewHieght = totalLeafs * verticalSpacing;
  
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
    
   var linksRoot = layoutRoot.append("svg:g");
    
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
    
    var allPaths = linksRoot.selectAll("path.link")
    .data(links);
    
    allPaths.enter()
    .append("svg:path")
    .attr("class", "link")
    .attr("opacity", 0)
    .transition()
    .duration(500)
    .attr("opacity", 1);
    
    allPaths.exit()
      .remove();
    
    allPaths
      .attr("d", link);
    
    var allNodes = layoutRoot.selectAll("g.node")
      .data(nodes);
    
    var removedNodes = allNodes
      .exit()
      .remove();
    
    var newNodes = allNodes
      .enter()
      .append("svg:g")
      .attr("class", "node");
      
    newNodes.append("circle")
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
        }).call(dragBehavior);;

    newNodes.append("svg:circle")
      .attr("class", "node-dot")
      .attr("r", 4.5);
    
    newNodes.append("svg:text")
      .attr('class', 'nodeText')
      .attr("dy", ".35em")
      .style("fill-opacity", 1);
      
    newNodes.append("svg:circle")
      .attr("class", "expansion")
      .attr("r", 4.5)
      .attr("transform", "translate(0, 10)");
      
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
      .classed("cat", false)
      .attr("text-anchor", "start");
      
    texts
      .filter(function(d) {
        return d.depth != 2;
      })
      .classed("cat", true)
      .attr("text-anchor", "end");
      
    // set drag drop targets on middle nodes
    layoutRoot.selectAll('.ghostCircle')
      .data(nodes)
      .attr('class', function(d) {
        if(d.depth == 1) {
          return 'ghostCircle show';
        } else {
          return 'ghostCircle'
        }
      });
    
    layoutRoot.selectAll('.expansion')
      .data(nodes)
      .attr("class", "expansion")
      .filter(function(d) {
        return d.depth === 1;
      })
      .attr("class", "expansion show")
      .on("click", function(d) {
        if(d._children) {
          d.children = d._children;
          delete d._children;
        } else {
          d._children = d.children;
          d.children = [];
        }
        update();
      }).filter(function(d) {
        return d._children;
      })
      .classed("collapsed", true);
    
    // set drag behavior on leaves
    allNodes.filter(function (d){
      return d.depth == 2;
    })
    .call(dragBehavior);  
      
    // position nodes
    allNodes
      .attr("transform", function (d) {
        return "translate(" + d.y0 + "," + d.x0 + ")";
      })
      .transition()
      .duration(500)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });
      
    // save positions for later
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
  }
  
  d3.select("#save").on("click", function() {
    $.ajax({
      url: "UIFContext.xml",
      dataType: "xml",
      error: function(err) {
        alert(err);
      }
    })
    .done(function( xml ) {
      $(xml).find("uifContext").each(function(context) {
        var that = this;
        
        var contextId = $(that).attr("id");
        
        treeData.children.forEach(function(category) {
          // in case any are collapsed, look through those nodes
          var children = category._children ? category._children : category.children;
          if(children) {
            category.children.forEach(function(leaf) {
              if(leaf.id === contextId) {
                $($(that).find("displayCategoryId")[0]).text(leaf.parent.pid);
              }
            });
          }
        });
        
        var xmlString = (new XMLSerializer()).serializeToString(xml);
        $("#output").text(xmlString); 
      });
    });
  });
  
  update();
}