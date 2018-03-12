//jshint esversion:6
define([
    'angular'
], function(
    angular
) {
    "use strict";

    function menuDirective($compile) {
        function link(scope, element, attrs, controller) {
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'MenuController'
          , replace: false
          , scope: { /* isolate ?*/ }
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }

    menuDirective.$inject = ['$compile'];
    return menuDirective;
});
