'use strict';

/* Directives */


var directives = angular.module('myApp.directives', ['d3']);

directives
  .directive('d3test', ['d3Service', '$window', function(d3Service, $window) {
    return {
      restrict: 'EA',
      scope: {
        dataset: '='
      },
      link: function(scope, element, attrs) {
        d3Service.d3().then(function(d3) {
          var dataset = scope.dataset;
        
          var padding = parseInt(attrs.margin) || 50,
          h = parseInt(attrs.height) || 300,
          w = parseInt(attrs.width) || 600;

        
          var svg = d3.select(element[0])
            .append("svg");
            
          w = svg.node().offsetWidth;
          h = svg.node().offsetHeight;  
          
          svg.attr({
            width: "100%",
            height: h
          });
          
          // Browser onresize event
          window.onresize = function() {
            scope.$apply();
          };
          
          // Watch for resize event
          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            scope.render(scope.data);
          });

          scope.render = function(data) {
            w = svg.node().offsetWidth;
            h = svg.node().offsetHeight;  
            
            xScale
            .rangeRoundBands([0, w - 2 * padding],  0.1);
            
            recomputePositions();
          }

          var barPadding = 2;
          
          var key = function(d) { return d.key; }
          var value = function(d) { return d.value; }
          
          var xScale = d3.scale
            .ordinal()
            .domain(d3.range(dataset.length))
            .rangeRoundBands([0, w - 2 * padding],  0.1);
            
          var yScale = d3.scale
            .linear()
            .domain([0, d3.max(dataset, value)])
            .range([0, h - 2 * padding]);
            
          var yScaleI = d3.scale
            .linear()
            .domain([0, d3.max(dataset, value)])
            .range([h - padding, padding]);

          var colorYScale = d3.scale
            .linear()
            .domain([0, d3.max(dataset, value)])
            .rangeRound([0, 255]);
            
          var yAxis = d3.svg.axis()
            .scale(yScaleI)
            .orient("left");

          var axis = svg.append("g")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
            
          var barsRoot = svg.append("g");
          var bars = barsRoot.selectAll("rect").data(dataset, key).enter()
            .append("rect")
            .attr({
              height: function(d) { return yScale(d.value) },
              width: function() { return xScale.rangeBand() },
              x: function(d, i) { return xScale(i) + padding; },
              y: function(d) { return h - yScale(d.value) - padding; },
              fill: function(d) { return "rgb(0,0," + colorYScale(d.value) + ")"; }
            });
            
          var labelsRoot = svg.append("g");
          var labels = labelsRoot.selectAll("text").data(dataset, key).enter()
            .append("text")
            .text(function (d) {return d.value;})
            .attr({
              x: function(d, i) { return xScale(i) + 0.5 * xScale.rangeBand() + padding; },
              y: function(d) { return h - yScale(d.value) + 20 - padding;},
              fill: "white",
              "font-size" : "11pt",
              "text-anchor": "middle"
            });
           
           barsRoot.selectAll("rect").on("click", function(d) {
            // find that element in the dataset and remove it
            var index = dataset.indexOf(d);
            dataset.splice(index, 1);
            recomputePositions();
           });
           
            function recomputePositions() {
              xScale.domain(d3.range(dataset.length));
                
              yScale.domain([0, d3.max(dataset, value)]);
                
              yScaleI.domain([0, d3.max(dataset, value)]);

              colorYScale.domain([0, d3.max(dataset, value)]);
              //Select…
              var bars = barsRoot.selectAll("rect")
                    .data(dataset, key);
              bars
                .enter()
                .append("rect")
                .attr({
                  height: function(d) { return yScale(d.value) },
                  width: function() { return xScale.rangeBand() },
                  x: function(d, i) { return xScale(i) + 3 * padding; },
                  y: function(d) { return h - yScale(d.value) - padding; },
                  fill: function(d) { return "rgb(0,0," + colorYScale(d.value) + ")"; }
                });
         
              bars
                .transition()
                .delay(function (d, i) { return i * 25; })
                .duration(500)
                .attr({
                  height: function(d) { return yScale(d.value) },
                  y: function(d) { return h - yScale(d.value) - padding; },
                  x: function(d, i) { return xScale(i) + padding; },
                  width: function() { return xScale.rangeBand() },
                  fill: function(d) { return "rgb(0,0," + colorYScale(d.value) + ")"; }
                });
                
              bars
                .exit()
                .transition()
                .duration(500)
                .attr({
                  y: function(d, i) { return 0; }
                })
                .style("opacity", 0)
                .remove();
                
              var labels = labelsRoot.selectAll("text").data(dataset, key);
               
              labels
                .enter()
                .append("text")
                .text(function (d) {return d.value;})
                .attr({
                  x: function(d, i) { return xScale(i) + 0.5 * xScale.rangeBand() + 3 * padding; },
                  y: function(d) { return h - yScale(d.value) + 20 - padding;},
                  fill: "white",
                  "font-size" : "11pt",
                  "text-anchor": "middle"
                });
               
              labels
                .text(function (d) {return d.value;})
                .transition()
                .delay(function (d, i) { return i * 25; })
                .duration(500)
                .attr({
                  x: function(d, i) { return xScale(i) + 0.5 * xScale.rangeBand() + padding; },
                  y: function(d) { return h - yScale(d.value) + 20 - padding;},
                });
                
              labels
                .exit()
                .remove();
                
              axis.transition().delay(200).duration(750).call(yAxis);
              
              svg.selectAll("rect").on("click", function(d) {
                // find that element in the dataset and remove it
                var index = dataset.indexOf(d);
                dataset.splice(index, 1);
                recomputePositions();
               });
            };
            
          d3.select("#shuffle")
            .on("click", function() {
              dataset = generateRandomDataSet();
              
              recomputePositions();
              
            });
            
          d3.select("#add")
            .on("click", function() {
              dataset.push(generateRandomNumber());					//Add new number to array
              recomputePositions();
            });
        });
      }}
  }]);

directives.
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
