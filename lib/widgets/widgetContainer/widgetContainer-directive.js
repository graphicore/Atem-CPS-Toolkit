//jshint esversion:6
define([
    'angular'
], function(
    angular
) {
    "use strict";

    function widgetContainerDirective($compile) {
        function link(scope, element, attrs, controller) {
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'WidgetContainerController'
          , replace: false
          , scope: { /* isolate ?*/ }
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }

    widgetContainerDirective.$inject = ['$compile'];
    return widgetContainerDirective;
});
