define([
    'Atem-Errors/errors'
  , 'angular'
], function(
    errors
  , angular
) {
    "use strict";

    function WidgetContainerController($scope) {
        this.$scope = $scope;
    }
    WidgetContainerController.$inject = ['$scope'];
    var _p = WidgetContainerController.prototype;
    _p.constructor = WidgetContainerController;

    return WidgetContainerController;
});
