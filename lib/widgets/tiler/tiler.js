define([
    'angular'
  , './tiler-controller'
  , './tiler-directive'
  , 'Atem-CPS-Toolkit/widgets/dragAndDrop/dragAndDrop'
], function(
    angular
  , Controller
  , directive
  , dragAndDrop // contains the mtk-drag directive
) {
    "use strict";
    return angular.module('atk.tiler', [dragAndDrop.name])
      .controller('TilerController', Controller)
      .directive('atkTiler', directive)
      ;
});
