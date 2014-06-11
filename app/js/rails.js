
var input = "AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7"

var nodes = {};

var Node = function(label) {
  this.label = label;
  this.edges = {};
};

for(var i = 65; i < 70; i++) {
  var node = new Node(String.fromCharCode(i));
  nodes[node.label] = node;
}

var edgeStrings = input.split(', ');
for(var i = 0; i < edgeStrings.length; i++) {
  var edgeString = edgeStrings[i];
  var start = edgeString[0];
  var end = edgeString[1];
  var cost = parseInt(edgeString.slice(2));
  
  nodes[start].edges[end] = cost;
}

var Walk = function(startNode) {
  this.walkedSteps = [startNode];
  this.distance = 0;
};

Walk.prototype.clone = function() {
  var clone = Object.create(Walk.prototype);
  clone.walkedSteps = this.walkedSteps.slice(0);
  clone.distance = this.distance;
  return clone;
};

Walk.prototype.getCurrentNode = function() {
  return this.walkedSteps[this.walkedSteps.length - 1]; 
}

Walk.prototype.moveToNode = function(newNode) {
  var currentNode = this.getCurrentNode();
  this.distance += currentNode.edges[newNode.label];
  this.walkedSteps.push(newNode);
  return this;
}

Walk.prototype.reportDistance = function() {
  if(isNaN(this.distance)) {
    return "NO SUCH ROUTE";
  } else {
    return this.distance;
  }
}

function routeCalculator(nodeStart, visitFn, shouldStopWalkTestFn) {
  var currentWalks = []; // current set of active (not stopped) walks
  
  currentWalks.push(new Walk(nodeStart)); // initialize with starting node
  
  // as long as their are active walk candidates
  while(currentWalks.length > 0) { 
    var newWalks = []; // new set of active walks for the next iteration
    
    // walk through the active set of walks and expand them by each possible edge to follow
    for(var j = 0; j < currentWalks.length; j++) {
      var walk = currentWalks[j];
      var currentNode = walk.getCurrentNode();
      for(var node in currentNode.edges) {
        var newWalk = walk.clone();
        newWalk.moveToNode(nodes[node]);
        
        visitFn(newWalk);
        
        if(!shouldStopWalkTestFn(newWalk)) {
          newWalks.push(newWalk);
        }
      }
    }
    currentWalks = newWalks;
  }
}

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
routeCalculator(nodes['C'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['C']) {
      walks6.push(walk);
    }
  }, 
  function(walk) 
  {
    return walk.walkedSteps.length > 3;
  });
console.log("Output #6: " + walks6.length);

var walks7 = [];
routeCalculator(nodes['A'], 
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
routeCalculator(nodes['A'], 
  function(walk) { 
    if(walk.getCurrentNode() == nodes['C']) {
      if(walk8 == null 
        || (walk8 != null && walk8.distance > walk.distance)) {
        walk8 = walk;
      }
    }
  }, 
  function(walk) 
  {
    if(walk8 != null && walk8.distance < walk.distance) {
      return true; // stop if this walk is longer than a previous success
    }
    return false;
  });
console.log("Output #8: " + walk8.reportDistance());

var walk9 = null;
routeCalculator(nodes['B'], 
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
console.log("Output #9: " + walk9.reportDistance());

var walks10 = [];
routeCalculator(nodes['C'], 
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