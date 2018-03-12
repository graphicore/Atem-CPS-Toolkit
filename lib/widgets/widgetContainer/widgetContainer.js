define([
    'angular'
  , './widgetContainer-controller'
  , './widgetContainer-directive'
  , './menu/menu'
], function(
    angular
  , Controller
  , directive
  , menu
) {
    "use strict";
    return angular.module('atk.widgetContainer', [menu.name])
      .controller('WidgetContainerController', Controller)
      .directive('atkWidgetContainer', directive)
      ;
});
