define([
    'angular'
  , './drag-directive'
  , './dragHandle-directive'
  , './dragover-autoscroll-directive'
  , './dropHelperFactory'
], function(
    angular
  , dragDirective
  , dragHandleDirective
  , dragoverAutoscrollDirective
  , dropHelperFactory
) {
    "use strict";
    return angular.module('atk.dragAndDrop', [])
      .directive('atkDrag', dragDirective)
      .directive('atkDragHandle', dragHandleDirective)
      .directive('atkDragoverAutoscroll', dragoverAutoscrollDirective)
      .factory('DropHelper', dropHelperFactory)
      ;
});
