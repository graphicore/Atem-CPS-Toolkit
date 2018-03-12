define([
    'Atem-Errors/errors'
  , 'angular'
], function(
    errors
  , angular
) {
    "use strict";

    function MenuController($scope) {
        this.$scope = $scope;
    }
    MenuController.$inject = ['$scope'];
    var _p = MenuController.prototype;
    _p.constructor = MenuController;

    return MenuController;
});
