'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {
    var keyCount = 0;
    function generateRandomNumber() {
      return { key:keyCount++, value: Math.floor(Math.random() * 25) + 1};
    }

    function generateRandomDataSet() {
      var dataset = [];					//Initialize empty array
      var numDataPoints = 20;				//Number of dummy data points to create
      
      for (var i = 0; i < numDataPoints; i++) {					//Loop numDataPoints times
        dataset.push(generateRandomNumber());					//Add new number to array
      }
      return dataset;
    }
    
    $scope.data = generateRandomDataSet();
  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
