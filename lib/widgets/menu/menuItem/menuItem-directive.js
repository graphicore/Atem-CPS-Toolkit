//jshint esversion:6
define([
    'angular'
], function(
    angular
) {
    "use strict";

    function menuItemDirective($compile) {
        function link(scope, element, attrs, controller) {
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'MenuItemController'
          , replace: false
          , scope: { /* isolate ?*/ }
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }

    menuItemDirective.$inject = ['$compile'];
    return menuItemDirective;
});
