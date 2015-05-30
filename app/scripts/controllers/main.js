'use strict';

/**
 * @ngdoc function
 * @name aanestApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the aanestApp
 */
var app = angular.module('graphApp', ['ngAnimate', 'mgcrea.ngStrap']);

String.prototype.startsWith = function (str) {
  return this.indexOf(str) === 0;
};

app.controller('GraphCtrl', function ($scope, $http) {
    
});
