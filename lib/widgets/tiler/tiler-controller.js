define([
    'Atem-Errors/errors'
  , 'angular'
], function(
    errors
  , angular
) {
    "use strict";

    function TilerController($scope) {
        this.$scope = $scope;
        // this.options: defined by directive binding
        // this.children: defined by directive binding
        this.widgets = [];
    }
    TilerController.$inject = ['$scope'];
    var _p = TilerController.prototype;
    _p.constructor = TilerController;

    Object.defineProperty(_p, 'empty', {
        get: function() {
            return !this.children.length;
        }
    });

    _p.serilalize = function() {
        return {
            type: 'atk-tiler'
          , options: angular.copy(this.options)
          , children: angular.copy(this.children)
        };
    };

    _p.getWidgetIndex = function(widgetElement) {
        var index = this.widgets.indexOf( widgetElement );
        if(index === -1)
            throw new Error('widgetElement not found');
        return index;
    };

    _p.getChildData = function(widgetElement) {
        var index = this.getWidgetIndex(widgetElement);
        return this.children[index];
    };

    Object.defineProperties(_p,{
        options: {
            get: function(){
                return this.parentCtrl.getChildData(this.$scope.element).options;
            }
        }
      , children: {
            get: function(){
                return this.parentCtrl.getChildData(this.$scope.element).children;
            }
        }
    });

    _p.insertWidget = function(insertPos, childData) {
        console.log('insertWidget', insertPos, childData);
        var oldChildren = this.children.slice();
        this.children.splice(insertPos, 0, childData);
        this.$scope.updateChildren(this.children, oldChildren);
        //this.$scope.$apply();
    };

    _p.replaceWidgetWithTiler = function(targetIndex, options, children) {
        console.log('replaceWidgetWithTiler', targetIndex, options, children);
        var oldChildren = this.children.slice();
        this.children[targetIndex] = {
            type: 'atk-tiler'
          , options: options
          , children: children
        };
        this.$scope.updateChildren(this.children, oldChildren);
        //this.$scope.$apply();
    };

    return TilerController;
});
