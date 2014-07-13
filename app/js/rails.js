/**
 * Class that represents the node of a graph and the edges and distance to other connected nodes
 * @param {string} label for the node, eg 'A'
 */
var Node = function(label) {
  this.label = label;
  this.edges = {};
};

/**
 * Parses an input string of edges into a dictionary of Node objects
 * @param {string} input comma seperated string of routes of the form AB#, 
 *   where A and B are start and end node label letters respectively 
 *   and # is the distance for that route
 * @return {dictionary} of node labels (eg 'A') to Node objects
 */
function parseInputEdges(input) {
  var nodes = {};
  var edgeStrings = input.split(', ');
  for(var i = 0; i < edgeStrings.length; i++) {
    var edgeString = edgeStrings[i];
    var start = edgeString[0];
    var end = edgeString[1];
    var distance = parseInt(edgeString.slice(2));
    
    if(nodes[start] == undefined) {
      nodes[start] = new Node(start);
    }
    if(nodes[end] == undefined) {
      nodes[end] = new Node(end);
    }
    nodes[start].edges[end] = {node: nodes[end], distance:distance};
  }
  return nodes;
}

/**
 * A class to store a walk of a particular set of nodes. 
 * stores the aggregate distance of said walk.
 * @param {Node} startNode to begin the walk from
 */
var Walk = function(startNode) {
  this.walkedSteps = [startNode];
  this.distance = 0;
  this.valid = true;
};

/**
 * Creates a clone of this walk. Note the actual nodes inside walked steps are not copied, 
 * just the array itself.
 */
Walk.prototype.clone = function() {
  var clone = Object.create(Walk.prototype);
  clone.walkedSteps = this.walkedSteps.slice(0);
  clone.distance = this.distance;
  clone.valid = this.valid;
  return clone;
};

/**
 * @return {Node} the current end of the walk
 */
Walk.prototype.getCurrentNode = function() {
  return this.walkedSteps[this.walkedSteps.length - 1]; 
}

/**
 * Updates the current walk with a step along the route to newNode.
 * If newNode is not a valid destination from the current end of the walk,
 * this.valid will be set to false.
 * @param {Node} newNode
 */
Walk.prototype.moveToNode = function(newNode) {
  var currentNode = this.getCurrentNode();
  var edge = currentNode.edges[newNode.label];
  if(edge != undefined) {
    this.distance += edge.distance;
  } 
  else {
    this.valid = false; // invalid route
    this.distance = 0;
  }
  this.walkedSteps.push(newNode);
  return this;
}

/**
 * @return {number|string} the current aggregate distance for the walk if it's valid, 
 *    if not valid, returns the string "NO SUCH ROUTE"
 */
Walk.prototype.reportDistance = function() {
  if(!this.valid) {
    return "NO SUCH ROUTE";
  } else {
    return this.distance;
  }
}

/**
 * Steps through every possible walk from a given starting node
 * @param {Node} nodeStart the beginning of the walks
 * @param {function(Walk)} visitFn run on every walk that hasn't been stopped. This enables saving particular walks of interest.
 * @param {function(walk)} shouldStopWalkTestFn that returns false if no further steps from the given walk should be tried. 
 *    Required, or the nodeWalker will never finish.
 */
function nodeWalker(nodeStart, visitFn, shouldStopWalkTestFn) {
  if(shouldStopWalkTestFn == null) {
    throw "No shouldStopWalkTestFn function provided, nodeWalker would never finish";
  }
  
  var currentWalks = []; // current set of active (not stopped) walks
  
  currentWalks.push(new Walk(nodeStart)); // initialize with starting node
  
  // as long as their are active walk candidates
  while(currentWalks.length > 0) { 
    var newWalks = []; // new set of active walks for the next iteration
    
    // walk through the active set of walks and expand them by each possible edge to follow
    for(var j = 0; j < currentWalks.length; j++) {
      var walk = currentWalks[j];
      var currentNode = walk.getCurrentNode();
      for(var nodeLabel in currentNode.edges) {
        // for each edge, clone the walk and add that edge's destination node to it
        var newWalk = walk.clone();
        newWalk.moveToNode(currentNode.edges[nodeLabel].node);
        
        if(!shouldStopWalkTestFn(newWalk)) {
          newWalks.push(newWalk);
          
          if(visitFn != null) {
            visitFn(newWalk);
          }
          
        }
      }
    }
    // replace the currently active walks with any newWalks added during this pass
    currentWalks = newWalks;
  }
}



// run through the 10 set of tests on the given input string and output the results to the console

var input = "AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7"

var nodes = parseInputEdges(input);

var walk1 = new Walk(nodes['A']).moveToNode(nodes['B']).moveToNode(nodes['C']);
console.log("Output #1: " + walk1.reportDistance());

var walk2 = new Walk(nodes['A']).moveToNode(nodes['D']);
console.log("Output #2: " + walk2.reportDistance());

var walk3 = new Walk(nodes['A']).moveToNode(nodes['D']).moveToNode(nodes['C']);
console.log("Output #3: " + walk3.reportDistance());

var walk4 = new Walk(nodes['A'])
  .moveToNode(nodes['E'])
  .moveToNode(nodes['B'])
  .moveToNode(nodes['C'])
  .moveToNode(nodes['D']);
console.log("Output #4: " + walk4.reportDistance());

var walk5 = new Walk(nodes['A'])
  .moveToNode(nodes['E'])
  .moveToNode(nodes['D']);
console.log("Output #5: " + walk5.reportDistance());

var walks6 = [];
nodeWalker(nodes['C'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['C']) {
      walks6.push(walk);
    }
  }, 
  function(walk) 
  {
    return walk.walkedSteps.length > 4;
  });
console.log("Output #6: " + walks6.length);

var walks7 = [];
nodeWalker(nodes['A'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['C']
      && walk.walkedSteps.length == 5) {
      walks7.push(walk);
    }
  }, 
  function(walk) 
  {
    return walk.walkedSteps.length > 5;
  });
console.log("Output #7: " + walks7.length);

var walk8 = null;
nodeWalker(nodes['A'], 
  function(walk) { 
    // if the current walk ends at the desired endpoint and it the shortest distance we've ever seen, save it
    if(walk.getCurrentNode() == nodes['C']) {
      if(walk8 == null 
        || (walk8 != null && walk8.distance > walk.distance)) {
        walk8 = walk;
      }
    }
  }, 
  function(walk) 
  {
    // stop if this walk is longer than a previous success, this route will never be viable
    if(walk8 != null && walk8.distance < walk.distance) {
      return true; 
    }
    return false;
  });
console.log("Output #8: " + (walk8 == null ? "no walk found" : walk8.reportDistance()));

var walk9 = null;
nodeWalker(nodes['B'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['B']) {
      if(walk9 == null 
        || (walk9 != null && walk9.distance > walk.distance)) {
        walk9 = walk;
      }
    }
  }, 
  function(walk) 
  {
    if(walk9 != null && walk9.distance < walk.distance) {
      return true; // stop if this walk is longer than a previous success
    }
    return false;
  });
console.log("Output #9: " + (walk9 == null ? "no walk found" :  walk9.reportDistance()));

var walks10 = [];
nodeWalker(nodes['C'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['C']
      && walk.distance < 30) {
      walks10.push(walk);
    }
  }, 
  function(walk) 
  {
    return walk.distance >= 30;
  });
console.log("Output #10: " + walks10.length);