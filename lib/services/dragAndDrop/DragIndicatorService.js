// jshint esversion:6
define([
    'Atem-CPS-Toolkit/dom-tool'
], function(
    domTool
) {
    "use strict";

    /**
     * The DragIndicatorService will take care that not to many drag-indicators
     * are shown, even across documents. This is done by using just one
     * html-element per document, the browser allows this to be used just
     * once used in the dom-tree. For the management of multiple drag indicators
     * and documents, this module employs globally unique identifiers.
     */
    function DragIndicatorService() {
        this._indicators = Object.create(null);
        this._indicatorClasses = new WeakSet();
    }

    var _p = DragIndicatorService.prototype;

    _p._createIndicator = function(document) {
        var events = {'drop': null, 'dragend': null, 'dragenter': null}
          , indicator = document.createElement('indicator')
          , k
          ;
        Object.defineProperty(events, 'handler', {
            value: removeIndicator.bind(document, indicator)
          , enumerable: false
        });
        for(k in events)
            document.addEventListener(k, events.handler);
        return [
            document
          , indicator
          , events
          , null // classes
          , null // styles
        ];
    };

    _p.deleteIndicator = function(identifier) {
        var registry = this._indicators[identifier];
        if(!registry) return;


        var [document, indicator, events, classes, styles] = registry;
        removeIndicator(indicator);
        for(let k in events)
            document.removeEventListener(k, events.handler);
        delete this._indicators[identifier];
    };

    _p._resetClasses = function(indicator, oldClasses, newClasses) {
        if(oldClasses)
            indicator.classList.remove(...oldClasses);
        if(newClasses)
            indicator.classList.add(...newClasses);
    };

    _p._resetStyles = function(indicator, oldStyles, newStyles) {
        if(oldStyles)
            for(let k in oldStyles)
                // A style declaration is reset by setting it to null,
                // e.g. `elt.style.color = null`.
                indicator.style[k] = null;
        if(newStyles)
            for(let k in newStyles)
                indicator.style[k] = newStyles[k];
    };

    _p._getIndicator = function(identifier, newDocument, newClasses, newStyles) {
        var registry = this._indicators[identifier]
          , document, indicator, events, oldClasses, oldStyles
          ;
        if(registry && registry[0] !== newDocument) {
            // clean up
            this.deleteIndicator(identifier);
            registry = undefined;
        }
        if(!registry)
            // build or rebuild
            this._indicators[identifier] = registry = this._createIndicator(newDocument);

        [document, indicator, events, oldClasses, oldStyles] = registry;
        registry[3] = newClasses;
        registry[4] = newStyles;

        this._resetClasses(indicator, oldClasses, newClasses);
        this._resetStyles(indicator, oldStyles, newStyles);
        return registry[1];
    };

    function removeIndicator(indicator, event) {
        if(event && event.type === 'dragenter' && event.defaultPrevented)
            // otherwise remove the indicator, because there is no
            // target if !event.defaultPrevented
            return;

        if(indicator.parentElement)
            indicator.parentElement.removeChild(indicator);
    }

    _p.insertIndicator = function(id, element, position, classes, styles) {
        var document = element.ownerDocument
          , indicator = this._getIndicator(id, document, classes, styles)
          ;
        domTool.insert(element, position, indicator);
    };

    _p.hideIndicator = function(identifier) {
        var registry = this._indicators[identifier];
        if(registry)
            removeIndicator(registry[1]);
    };

    return DragIndicatorService;
});
