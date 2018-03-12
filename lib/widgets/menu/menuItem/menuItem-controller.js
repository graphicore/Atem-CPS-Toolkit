define([
    'Atem-Errors/errors'
  , 'angular'
], function(
    errors
  , angular
) {
    "use strict";

    function MenuItemController($scope) {
        this.$scope = $scope;
    }
    MenuItemController.$inject = ['$scope'];
    var _p = MenuItemController.prototype;
    _p.constructor = MenuItemController;

    return MenuItemController;
});
