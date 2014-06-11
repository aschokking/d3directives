
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

var Route = function(steps) {
  this.currentCost = 0;
  this.pendingSteps = steps;
  this.currentNode = nodes[steps.pop()];
}

function calculateDistanceForRoute(route) {
  while(route.pendingSteps.length > 0) {
    var nextStep = route.pendingSteps.pop();
    var cost = route.currentNode.edges[nextStep];
    if(cost == null) {
      route.currentCost = -1;
      return;
    } else {
      route.currentCost += cost;
      route.currentNode = nodes[nextStep];
    }
  }
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

function routeCalculator(nodeStart, recordCondition, stopCondition) {
  var recordedWalks = []; // any successful walks of the graph
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
        
        if(recordCondition(newWalk)) {
          recordedWalks.push(newWalk);
        }
        
        if(!stopCondition(newWalk, recordedWalks)) {
          newWalks.push(newWalk);
        }
      }
    }
    currentWalks = newWalks;
  }
  
  return recordedWalks;
}

var walk1 = new Walk(nodes['A']).moveToNode(nodes['B']).moveToNode(nodes['C']);
console.log("Output #1: " + walk1.distance);

var walk2 = new Walk(nodes['A']).moveToNode(nodes['D']);
console.log("Output #2: " + walk2.distance);

var walk3 = new Walk(nodes['A']).moveToNode(nodes['D']).moveToNode(nodes['C']);
console.log("Output #3: " + walk3.distance);

var walk4 = new Walk(nodes['A'])
  .moveToNode(nodes['E'])
  .moveToNode(nodes['B'])
  .moveToNode(nodes['C'])
  .moveToNode(nodes['D']);
console.log("Output #4: " + walk4.distance);

var walks6 = [];
routeCalculator(nodes['C'], 
  function(walk) { 
    return walk.walkedSteps.length > 1 && walk.getCurrentNode() == nodes['C'];
  }, 
  function(walk) 
  {
    return walk.walkedSteps.length > 3;
  });
console.log("Output #6: " + walks6.length);

var walks7 = routeCalculator(nodes['A'], 
  function(walk) { 
    return walk.walkedSteps.length > 1 
      && walk.getCurrentNode() == nodes['C']
      && walk.walkedSteps.length == 5;
  }, 
  function(walk) 
  {
    return walk.walkedSteps.length > 5;
  });
console.log("Output #7: " + walks7.length);

var walks8 = routeCalculator(nodes['A'], 
  function(walk) { 
    return walk.walkedSteps.length > 1 
      && walk.getCurrentNode() == nodes['C'];
  }, 
  function(walk, recordedWalks) 
  {
    for(var i = 0; i < recordedWalks.length; i++) {
      if(recordedWalks[i].distance < walk.distance) {
        return true; // stop if this walk is longer than a previous success
      }
    }
    return walk.walkedSteps.length > 5;
  });
console.log("Output #8: " + walks8[0].distance);