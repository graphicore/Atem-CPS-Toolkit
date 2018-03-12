define([
    'angular'
], function(
    angular
) {
    "use strict";

    function PlacholderController($scope){
        this.$scope = $scope
          this.serilalize = function(asJSON) {
              var data = {
                  type: 'atk-placeholder'
                , options: angular.copy(this.options)
              // , children: angular.copy(this.children)
              };
              if(asJSON)
                return JSON.stringify(data);
              return data;
          };
    }
    PlacholderController.$inject = ['$scope'];
    PlacholderController.prototype.constructor = PlacholderController;

    Object.defineProperties(PlacholderController.prototype, {
        options: {
            get: function() {
                return this.parentCtrl.getChildData(this.$scope.element).options;
            }
        }
      , children: {
            get: function() {
                return this.parentCtrl.getChildData(this.$scope.element).children;
            }
        }
    });

    return angular.module('atk.placeholder', [])
      .controller('PlaceholderController', PlacholderController)
      .directive('atkPlaceholder', function(){
          return {
            restrict: 'E' // only matches element names
          , controller: 'PlaceholderController'
          , replace: false
          , scope: {
                      //  options: '=atkWidgetOptions'
                      //, children: '=atkWidgetChildren'
                        depth: '=atkWidgetDepth'
                      , parentCtrl: '=atkParentCtrl'
                    }
          , template: 'Hello: <div>{{ctrl.serilalize(true)}}</div>'
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: function(scope, element, attrs, controller) {
                scope.element = element[0];
                element[0].style.backgroundImage = 'url("http://via.placeholder.com/300x100?text=placeholder'
                          + (controller.options.uid) + '")';
            }
        };
      })
      ;
});
