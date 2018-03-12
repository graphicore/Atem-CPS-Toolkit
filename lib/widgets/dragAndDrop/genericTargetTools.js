//jshint esversion:6
define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    // Note the angularJS usage and the expectation of `index` at the isolateScope!
    // MAYBE we could set index to a neutral place, like "data-index" attribute?
    // Right now every directives scope has `index`, so, that may be OK so far
    function getInsertPositionVertical(event, targetElement) {
        // FIXME: only knows column top/bottom directions :-O for a tiler
        // it also should know  row left/right directions
        // and in a tiler, this would then be sufficient, but for a grid
        // it's still not good enough.
        var insertBefore = true
          , elementBBox = targetElement.getBoundingClientRect()
          , elementHeight = elementBBox.bottom - elementBBox.top
          , tippingPointY =  elementBBox.top + elementHeight / 2
          ;

        if (event.clientY > tippingPointY)
            insertBefore = false;
        return insertBefore ? 'before' : 'after';
    }

    function getTargetData(targetElement, event) {
        return {
            // we probably want some better way to get index
            // with less under-specifed properties, or at least better
            // naming!
            index: angular.element(targetElement).isolateScope().index
          , insertPosition: getInsertPositionVertical(event, targetElement)
          , element: targetElement
        };
    }
    return {
      , getTargetData: getTargetData
    };
});
