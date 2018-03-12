define([
    'angular'
  , './menu-controller'
  , './menu-directive'
], function(
    angular
  , Controller
  , directive
  , menuItem
) {
    "use strict";
    return angular.module('atk.menu', [menuItem.name])
      .controller('MenuController', Controller)
      .directive('atkMenu', directive)
      ;
});
