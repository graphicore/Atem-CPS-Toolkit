//jshint esversion:6
define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    function dropHelperFactory(dragDataService, dragIndicatorService) {
        function DropHelper(
            dataTypes // array, e.g. ['cps/property', 'cps/comment']
          , indicatorId // dragIndicatorService id
          , getIndicatorPosition // fn(event, dragType, dragData) => [array:indicatorData, bool:preventDefault]
          , receiveDrop // fn(event, dragType, dragData) => bool:accepted
        ) {
            this._dataTypes = dataTypes;
            this._indicatorId = indicatorId;
            this._getIndicatorPosition = getIndicatorPosition;
            this._receiveDrop = receiveDrop;
        }

        var _p = DropHelper.prototype;

        Object.defineProperty(_p, 'dragoverHandler', {
            get: function(){ return this.dragover.bind(this); }
        });

        Object.defineProperty(_p, 'dropHandler', {
            get: function(){ return this.drop.bind(this);}
        });

        _p.dragover = function(event) {
            var dataTypes = this._dataTypes
              , indicatorId = this._indicatorId
              , getIndicatorPosition = this._getIndicatorPosition
              , dataEntry, indicatorData, preventDefault
              ;

            if(event.defaultPrevented)
                // someone below already accepted the drag
                return;

            // if there's a fitting data type, we'll have a data entry!
            dataEntry = dragDataService.getFirst(dataTypes);

            if(!dataEntry) {
                // this is not a compatible data type
                // the event will bubble and maybe show the indicator
                // somewhere else.
                dragIndicatorService.hideIndicator(indicatorId);
                return;
            }

            [indicatorData, preventDefault] = getIndicatorPosition(event, dataEntry.type, dataEntry.payload);
            // [indicatorReference, indicatorInsertPosition, indicatorClasses] = indicatorData
            if(!indicatorData) {
                if(preventDefault)
                    event.preventDefault();
                dragIndicatorService.hideIndicator(indicatorId);
                return;
            }
            // indicatorInsertPosition is "before" or "after" or "append"
            // We are now able to set special classes tot he indicator,
            // in order to make it appear right in the tiler widget!
            // That is done via a fourth argument, a list of class names.
            // The classes are unset on subsequent calls to insertIndicator,
            // i.e. classes must be re-set new for call to insertIndicator.
            dragIndicatorService.insertIndicator(indicatorId, ...indicatorData);

            // accepted
            event.preventDefault();//important
            event.dataTransfer.dropEffect = 'move';
        };

        _p.drop = function(event) {
            var dataTypes = this._dataTypes
              , dataEntry, accepted
              , receiveDrop = this._receiveDrop
              ;

            if(event.defaultPrevented)
                // someone below already accepted the drop
                return;

            dataEntry = dragDataService.getFirst(dataTypes);

            // the data type is not supported here
            if(!dataEntry)
                return;

            accepted = receiveDrop(event, dataEntry.type, dataEntry.payload);
            if(!accepted)
                return;
            // clean up
            event.preventDefault();
            // If the drag item is removed from the DOM by this drop
            // (it is for moves), we don't get a dragend event. So
            // this needs to clean up the dragDataService as well.
            // Making the execution of the move async would also help.
            dragDataService.remove(dataEntry.type);
        };

        return DropHelper;
    }

    dropHelperFactory.$inject = ['dragDataService', 'dragIndicatorService'];
    return dropHelperFactory;
});
