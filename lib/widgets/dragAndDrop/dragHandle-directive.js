define([], function() {
    "use strict";

    /**
     * This directive is really only needed to set the html 5
     * attribute draggable="true" to the element. But also the directive
     * tag/attribute name is used as a marker in dragstartHandler of
     * drag-directive.
     *
     * used like this
     * <a-tag atk-drag-handle></a-tag>
     * or
     * <atk-drag-handle>my drag handle</atk-drag-handle>
     *
     */
    function dragHandleDirective() {
        function link(scope, element, attrs) {
            // jshint unused: vars
            element.attr('draggable', 'true');
        }
        return {
            restrict: 'EA' // only matches attribute names
          , link: link
        };
    }
    return dragHandleDirective;
});
