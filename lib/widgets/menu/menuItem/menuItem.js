define([
    'angular'
  , './menuItem-controller'
  , './menuItem-directive'
], function(
    angular
  , Controller
  , directive
) {
    "use strict";
    return angular.module('atk.menuItem', [])
      .controller('MenuItemController', Controller)
      .directive('atkMenuItem', directive)
      ;
});
