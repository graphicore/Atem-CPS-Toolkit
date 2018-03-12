//jshint esversion:6
define([
    'Atem-Math-Tools/Vector'
  , 'angular'
  , 'Atem-CPS-Toolkit/dom-tool'
], function(
    Vector
  , angular
  , domTool
) {
    "use strict";



    function TagsSet(...tags) {
        return new Set(tags.map(s => s.toUpperCase()));
    }

    //
    // /**
    //  *  It is 0 on the line, and +1 on one side, -1 on the other side.
    //  */
    // function position(a, b, p) {
    //     return Math.sign((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x));
    // }
    //
    // /**
    //  * return true if point p is left of the line a->b;
    //  * Left is the side of the point (a.x-1, a.y)
    //  */
    // function isLeftOfLine(a, b, p) {
    //     position =  position(a, b, p)
    //                                       // x-1 is always left of line
    //     refPos = position(a, b, new Vector(a.x-1, a.y));
    //     return position === refPos;
    // }

    // stack overflow ...
    function isRightOfLine(a, b, p) {
        return (b.x - a.x) * (p.y - a.y) > (b.y - a.y) * (p.x - a.x);
    }

    /**
     * returns one of: "top", "right", "bottom", "left" depending
     * on where the event coordinates are.
     *     a       b
     *      ┌─────┐
     *      │╲ T ╱│  T = "top"
     *      │ ╲ ╱ │  R = "right"
     *      │L ╳ R│  B = "bottom"
     *      │ ╱ ╲ │  L = "left"
     *      │╱ B ╲│
     *      └─────┘
     *     c       d
     *
     */
    function getEventPositionQuadrant(event, targetElement) {
        var elementBBox = targetElement.getBoundingClientRect()
          , a = new Vector(elementBBox.left, elementBBox.top)
          , b = new Vector(elementBBox.right, elementBBox.top)
          , c = new Vector(elementBBox.left, elementBBox.bottom)
          , d = new Vector(elementBBox.right, elementBBox.bottom)
          , p = new Vector(event.clientX, event.clientY)
          // Hehe, function was originally called `isLeftOfLine` but did
          // the opposite (because screen coordinates originate at the
          // top of the screen not at the bottom).
          , isLeftOfAD = !isRightOfLine(a, d, p)
          , isLeftOfCB = !isRightOfLine(c, b, p)
          ;
        if(isLeftOfAD)
            return isLeftOfCB ? 'top' : 'right';
        return isLeftOfCB ? 'left' : 'bottom';
    }

    // A dragover/drop target can be deeper in the hierarchy than the
    // actual element we're interested in. This walks up the tree until
    // it finds a element of interest, which must have a tag in "searchedTagsSet"
    // This function varies strongly with the directive template structure.
    function findElement(validTargetTagsSet, eventTargtElement, parent) {
        var current
        // , children = parent.children
        // , allowedParents = new Set()
        // , i, l, child
          ;

        //for(i=0,l=children.length;i<l;i++) {
        //    child = children[i];
        //    if(child.tagName.toLowerCase() === 'mtk-cps-collection-li')
        //        allowedParents.add(child);
        //}

        //if(allowedParents.has(eventTargtElement))
        //    current = eventTargtElement.firstElementChild;
        //else
        //    current = eventTargtElement;
        current = eventTargtElement;
        do {
            if(current === parent)
                // break;// don't accept parent or above
                return parent;// accept parent
            if(validTargetTagsSet.has(current.tagName))// && allowedParents.has(current.parentElement))
                return current;
        } while((current = current.parentElement));
        return undefined;
    }

    // findElement // fn (element, parentLimit)
    // getIndicatorReference // fn (boolean:empty, element, parentStopElement)
    // controller // provides: property bool empty, fn acceptMoveCPSElement and fn moveCPSElement
    // element // DOM-Element
    function getIndicatorSetup(findElement, controller, element
                            // these are the parameters expected by DropHelper
                            , event, dragType, dragData) {
        //jshint unused:vars
        var targetElement
          , indicatorData = null
          , preventDefault = false
          ;

        // figure out where after the drop the result will go
        // and move an indicator to there
        if(controller.empty)
            // In fact, a tiler with just one child may be a candidate for
            // this error, too. But since it can also just act to provide
            // a scrollbar for it's widget children we may now pass on this!
            // (well, widget containers should themselves display scrollbars)
            throw new Error('An empty tiler should have been garbage collected');

        targetElement = findElement(event.target, element);
        // This is right now only concerned with creating new widgets
        // to be able to move a widget from one container to another, we'll
        // also have to inform the source directive/controller,
        // i.e. sourceController.delete(widgetId)
        // a move should be implemented as a source.delete() target.add()
        // combination. We won't transport any state that is not in the
        // dragData. Thus, a copy is the same as an add.
        // See the other d'n'd examples how moves are implemented
        if(!targetElement) {
            // pass
            // in case of a MOVE:
            // if this is an identity move
            //      preventDefault = true
            return [indicatorData, preventDefault];
        }
        // place the indicator:
        // this really determines where to place the  indicator!

        // the indicator may be placed into targetElement
        // i.e. the widget itself, that way, we should be able to
        // still receive drag events from the widget itself (BUT!) what
        // about nested widgets within the widget? ... have to figure
        // a way ...
        // Starting with element as it is easier to handle
        let indicatorReference = element// element
            // append may spare us from having to set a z-index
          , indicatorInsertPosition = 'append'

          , elementRect = element.getBoundingClientRect()
          , targetRect = targetElement.getBoundingClientRect()
          , top = targetRect.y - elementRect.y + element.scrollTop
          , left = targetRect.x - elementRect.x + element.scrollLeft
          , width = targetRect.width
          , height = targetRect.height
          //, bottom = elementRect.height - (targetRect.height + top)
          //, right = elementRect.width - (targetRect.width + left)
          , eventPosition = getEventPositionQuadrant(event, targetElement)
          , styles
          ;

        if(eventPosition === 'top' || eventPosition === 'bottom')
            // bottom += targetRect.height / 2;
            height = height / 2;
        else if(eventPosition === 'right' || eventPosition === 'left')
            width = width / 2;
            //left += targetRect.width / 2;

        if(eventPosition === 'bottom')
            top += targetRect.height / 2;
        else if(eventPosition === 'right')
            left += targetRect.width / 2;

        styles = {
            // To place the indicator exactly, element is expected to
            // have its own coordinate system, be the "Containing Block"
            // for the indicator. ("relative" or "absolute" position; never "static")
            // https://developer.mozilla.org/en-US/docs/Web/CSS/All_About_The_Containing_Block
            position: 'absolute' // need to factor in scroll position of the element
          , top: top + 'px'
          , left: left + 'px'
          , width: width + 'px'
          , height: height + 'px'

          , background: 'rgba(200,255,255,.3)'
          // important, otherwise, the indicator blocks the drag events
          // should always be set for indicators, maybe include into the
          // service.
          , pointerEvents: 'none'
        };

        //indicatorReference = getIndicatorReference(controller.empty, target.element, element);
        //indicatorInsertPosition = controller.empty
        //    ? 'append'
        //    : target.insertPosition
        //    ;
        indicatorData = [indicatorReference, indicatorInsertPosition, null, styles];

        return [indicatorData, preventDefault];
    }

    var uid = 0;
    // findElement // fn (element, parentLimit)
    // controller // provides: property bool empty, fn acceptMoveCPSElement and fn moveCPSElement
    // element // DOM-Element
    function receiveDrop(findElement, controller, element
                            // these are the parameters expected by DropHelper
                            , event, dragType, dragData) {
        //jshint unused:vars
        var targetElement
          , accepted = false
          ;
        console.log('receiveDrop!', dragType, dragData);

        // figure out where after the drop the result will go
        // and move an indicator to there
        if(controller.empty)
            // In fact, a tiler with just one child may be a candidate for
            // this error, too. But since it can also just act to provide
            // a scrollbar for it's widget children we may now pass on this!
            // (well, widget containers should themselves display scrollbars)
            throw new Error('An empty tiler should have been garbage collected');

        targetElement = findElement(event.target, element);
        if(!targetElement) {
            // || !controller.acceptMoveCPSElement(
            // no identity drop possible/dectectablesnow, just ADD

    //            || !controller.acceptMoveCPSElement(sourcePropertyDict, sourceIndex
    //                                , target.index, target.insertPosition)) {
    //
    //        if(target && controller.isIdentityMoveCPSElement(sourcePropertyDict, sourceIndex
    //                                , target.index, target.insertPosition))
    //            // accept if this is an identity-drop but do nothing
    //            // i.e. just end the event bubbling and clean up.
    //            accepted = true;
    //        // not accepted
            accepted = false;
        }
        else {
            // ADD

            // eventPosition is one of top, right, bottom, left
            // and targetElement is the widget
            // so depending on the widget axis (and direction, but we do
            // only LTR and TTB for now)
            // row: left, right => becomes before, after
            // row: top, bottom => becomes a new column tiler with the targetElement widget and the new widget
            // column: top, bottom => becomes before, after
            // column: left, right => becomes a new row tiler with the targetElement widget and the new widget
            let eventPosition = getEventPositionQuadrant(event, targetElement)
              , targetCtrl// = angular.element(targetElement).isolateScope().ctrl
              // FUCKING binding of shit:
              // controller needs to be aware of it's index OR better
              // just ask parent! So, in here, we ask
              , targetIndex// = controller.getWidgetIndex(targetElement)
              //, targetIndex = parseInt(targetElement.getAttribute('atk-widget-index'), 10)
              , sameDir = controller.options.dir === 'column'
                       && (eventPosition === 'top' || eventPosition === 'bottom')
                       || controller.options.dir === 'row'
                       && (eventPosition === 'left' || eventPosition === 'right')
              , before = eventPosition === 'top' || eventPosition === 'left'
              ;
            console.log('targetElement', targetElement);
            console.log('sameDir', sameDir, controller.options.dir, eventPosition);
            var dragData_ = angular.copy(dragData);
            if(!('uid' in dragData_.options))
                dragData_.options.uid = uid++;// FIXME: remove this line again

            dragData_ = JSON.parse(JSON.stringify(dragData_));

            if(targetElement === element) {
                targetIndex = before
                                ? 0
                                : controller.widgets.length-1
                                ;
            }
            else {
                targetIndex = controller.getWidgetIndex(targetElement);

            }

            if(sameDir) {
                let insertPos = targetIndex + (before ? 0 : 1);
                controller.$scope.$apply(()=>
                    controller.insertWidget(insertPos, dragData_));
            }
            else {
                // this works also if targetElement === element
                // otherwise, this is equivalent to:
                // targetCtrl = angular.element(targetElement).isolateScope().ctrl
                targetCtrl = angular.element(controller.widgets[targetIndex]).isolateScope().ctrl;
            /**
                in case of targetElement === element this always runs
                only for the first element, but the drag position (of the
                mouse) may be over another element, in the tiler direction.
                Further, this enables putting e.g. vertical tilers into
                vertical tilers, which is not necessarily what we want.
                on the other hand, tilers should be configurable, thus
                in a later step the user can change the direction anyways.
                maybe, here, it could be an option to try to figure a
                a good new configuration.
                NEXT: add a simple menu to configure tilers:
                - dir: row | column
                - mode: grow | fit
                - close (close all widgets and the tiler)
                - a drag handle
                also, widgets will need menus, especially:
                - close
                - a drag handle
                interesting enough, the tiler is also a widget, thus
                close/drag can be the same and
                dir/mode are special.

                the first widget in a tiler should probably share the
                same menu icon with the tiler. This seems like the hardest
                part:
                A: where to put the Menu Bar"
                B: how to share the Menu Bar
                C: Maybe: how to share the same menu.

                I lean towards hiding all of the Menu Bar behind a
                single symbol (gear? ⚙ \u2699) pop up.
                though, this implies a layer between tiler element and
                widgetElement, that then contains the menu and the widget
                and the widget, somehow has to expose it's menu entries.
                universal menu entries like close/drag handle could still
                be controlled by the tiler/parent, but specific options
                should be given by the widget. Also, the widget should
                be able to inject labels and nested (sub-) menus
                a sub-menu is a menu that is an item in another menu
                ideally there's no extra <sub-menu> ... but the menu item
                needs to know what it is, so does a drag-handle!.

                different menu item types so far
                    label + action
                    separator
                    separator + a label (maybe bold) (separates to the top
                            thus a separating line, if any may be better
                            over the label, than under.
                    sub menu
                        a label + an indicator that it is a submenu (▶)
                        on click/hover: toggle the submenu (try to position
                                this nicely)
                    special:
                        drag-handle is very special so far
                        may need an own label to make sure we know
                        what we are going to drag.

                    all of the above should allow html title attributes
                    as tooltips.

                    labels sould allow icon + text

                <menu>
                    <item>label</item>
                    <item>label</item>
                    <item>label</item>
                    <item>label
                        <menu>
                            <item>label</item>
                            <item>label</item>
                            <item>label</item>
                        </menu>
                    <item>
                </menu>


                so, a controller can have a "menu" getter, which returns
                a description of


            <tiler>
                <tiler-widget>
                    <menu></menu>
                    <actual-widget></actual-widget>
                </tiler-widget>
            </tiler>

            Menu should contain items from
                    - tiler (move, close, tiler widget options)
                    - tiler widget (move, close)
                    - actual widget (widget options

            The first menu is special, as it contains the tiler widget menu:
                move
                close
                ---
                own options
            and the first child widget menu
                move
                close
                ---
                own options



            given that a tiler within a tiler would be organized like this:

            <atk-widget-tiler> -- passes (close, move handle, tiler#1_options to widget container)

                <widget-container>// first child
                    <menu #1></menu> <-- this menu is not displayed!
                                         that must be somehow a property
                                         of the child, which states it
                                         will take care of that
                    <atk-widget-tiler>  passes (close, move handle, tiler#1_options
                                             , close, move handle, tiler#2_options
                                        to widget container)

                        <widget-container>// first child
                            <menu #2></menu> displays (close, move handle, tiler#1_options
                                             , close, move handle, tiler#2_options
                                             + widget options
                                             (the widget does not state it takes
                                             care of displaying the menu)
                            <widget></widget>

                        </widget-container>

                        <widget-container>// second child
                            <menu #3></menu>
                            <widget></widget>

                        </widget-container>

                    </atk-widget-tiler>

                </widget-container>

            </atk-widget-tiler>

            - It boils down to that all first children in a row should
              merge their menus.
            - It will be forbidden to have a tiler without at least one child.
              Thus, a tiler (mauybe broader "container widget" a widget that
              contains other widgets, like possibly in the future a tabs-widget
              or a grid-widget) should pass its own menu options down to its
              first child.

            one question:
                is <widget-container> a directive of it's own? channeling
                parent data to the actual widget
                and the menu data as well to menu.
                also, creating the actual widget element
                - lots of boilerplate
                + better separation of concerns

            each widget-container can ask parent if it should display
            menu items, but parent will only return its items for the
            first item.
            the widget container can also ask it's only widget child for
            menu items AND it can add it's own items ...

            Since close/move are not inherent to the widget itself, rather
            to the way it is managed, those two should also be injected
            by the means of asking "parent" for the menu. So here, tiler
            should inject close and move, because tiler will have to control
            these actions as well.
        */

                // these details should be handled by the controller
                // creating
                // let newWidetData = {
                //    type: 'atk-tiler'
                let options = {
                        dir: controller.options.dir === 'column' ? 'row' : 'column'// || column horizontal
                      , mode: 'fit' //'grow' // not yet
                    }
                  , children = [
                        // order counts!
                        targetCtrl.serilalize()
                      , dragData_
                    ]
                  ;
                console.log('serialized:', targetCtrl.constructor.name,
                        children[0].type, children[0], children[0].options.uid);
                if(before) children.reverse();
                // rather
                controller.$scope.$apply(()=>
                    controller.replaceWidgetWithTiler(targetIndex, options, children));
            }
            accepted = true;
        }
        return accepted;
    }

    // Live cycle considerations:
    // some tilers will be pre-set to be unchangable
    // so these are build initially from their data, but won't unlock
    // the ui-actions to change their data.
    // That way, some parts of the ui can be fixed and other parts can
    // be changeable. Also, hopefully, compound widgets can be created
    // that themselves consist of some tilers and other widgets.
    //
    // To create a new tiler, a widget must be dropped onto a widget of
    // a tiler. Depending on the direction, and where the widget is dropped\
    // the parent tiler can decide whether to create a new tiler or to
    // add the widget to its children directly. E.g. same direction for
    // drop and parent indicates a direct child. Other direction indicates
    // a new tiler containing the drop-zone widget and the droped widget.
    // This is not capable of creating all configurations, so at that point
    // we must re-evaluate ...
    //
    // there are 4 configurations regarding the layout:
    //      {dir: 'row', mode: 'fit'}
    //      {dir: 'column', mode: 'fit'}
    //      {dir: 'row', mode: 'grow'}
    //      {dir: 'column', mode: 'grow'}


    function tilerDirective($compile, DropHelper) {
        function link(scope, element, attrs, controller) {
            //jshint unused: vars
            scope.element = element[0];
            // TODO: figure how to auto-update changed data
            //          - what to do so that we don't need to call $apply
            //          - when is $apply needed
            //              -> when the change is initiated by angular,
            //                 there should be no need to call $apply
            //       we should probably do a lot on destruct:
            //              - inform children
            //              - garbage collect unneeded atk-tiler widgetes

            // how to keep track of these?

            // TODO:
            //
            // we need actions, accessible via the ui
            //      add a new widget
            //      remove (close) a widget
            //      move a widget (drag and drop?)
            //          this should do smart things, like removing a
            //          tiler if it has only one widget left
            //          and adding a tiler, depending on the drop position
            //      resize: between two widgets in a fit-mode tiler
            // to not overload the tilers with all the same menu items,
            // maybe one central/top level menu could be included. This,
            // however, sounds like adding an extra action to perform layout
            // changes, and for resizing, it's customary to just have "active"
            // borders (the only reasion here for a border).
            // alternatively, the actions menu could integrate with the
            // widgets menus, as a first item, behind a gear symbol.
            // Also possible, add to the right click menu, but: touch problems
            // and the browser menu is lost.
            //
            var i, l
              , dom = element[0]
              , doc = dom.ownerDocument
              , widgetElement
              , widgets = []
              ;
            element.append(
                  '<div class="info"><h3>'
                + dom.tagName+' '+ controller.depth
                + '</h3><pre>' + JSON.stringify(controller.options)
                + '</pre></div>');

            var dir2Atrr = {
                row: {
                    crossDimension: 'height'
                  , dimension: 'width'
                  , overflowCrossDimension: 'overflowY'
                }
              , column: {
                    crossDimension: 'width'
                  , dimension: 'height'
                  , overflowCrossDimension: 'overflowX'
                }
            };

            function setStyle (dom, dir, name, value) {
                var attr = dir2Atrr[dir][name];
                dom.style[attr] = value;
            }

            var dir = controller.options.dir;
            if(controller.options.mode === 'fit') {
                // width | height
                // this is probably a bad choice!; made a scrollbar
                // where none was expected.
                setStyle(dom, dir, 'crossDimension', '100%');
                // overflowY | overflowX
                // FIXME: parent has to control overflow behavior!
                // so this is the wrong place!
                setStyle(dom, dir, 'overflowCrossDimension', 'auto');
                dom.style.display = 'flex';
                dom.style.flexFlow = dir + ' nowrap';
                dom.style.alignItems = 'stretch';//'start'; //'stretch'
            }
            else if(controller.options.mode === 'grow') {
                // FIXME: parent has to control if the child can grow
                // as it wishes or if it has to use scrollbars when getting
                // to big. E.g. if a widget is in a vertically unrestrained
                // parent, overflow can be 'visible', the default
                setStyle(dom, dir, 'overflowCrossDimension', 'auto');
                dom.style.display = 'flex';
                dom.style.flexFlow = dir + ' nowrap';

                dom.style.alignItems = 'stretch';//'start'; //'stretch'
            }
            //if(scope.options.dir === 'x') {
            //    dom.style.height = '100%';
            //    dom.style.overflowY = 'auto';
            //    dom.style.display = 'flex';
            //    dom.style.flexFlow = 'row nowrap';
            //    // dom.style.alignItems = 'stretch'; //'start'
            //    dom.style.alignItems = 'start';
            //}
            //if(scope.options.dir === 'y') {
            //    // FIXME: parent has to control if the child can grow
            //    // as it wishes or if it has to use scrollbars when getting
            //    // to big. E.g. if a widget is in a vertically unrestrained
            //    // parent, overflow can be 'visible', the default
            //    dom.style.overflowX = 'auto';
            //}

            var unit = 100/controller.children.length;

            for(i=0,l=controller.children.length;i<l;i++) {
                widgetElement = doc.createElement(controller.children[i].type);
                if(controller.options.mode === 'fit') {

                    widgetElement.style.outline = '1px solid red';
                    // no grow or shrink, it's managed in here.
                    // this way having a sum bigger than 100% will make
                    // the parent grow beyond the screen/parent viewport
                    // by that amount, very predictable!
                    widgetElement.style.flex = '0 0 '+ unit + '%';
                    // widgetElement.style.position = 'absolute';
                    // widgetElement.style.left = (unit*i) + '%';
                    // widgetElement.style.right = (unit*right_i) + '%';
                }
                else if(controller.options.mode === 'grow') {
                    widgetElement.style.outline = '1px solid green';
                    widgetElement.style.flex = '0 0 auto';
                    // widgetElement.style.height = '300px' // height in => column/y
                    // width | height
                    // setStyle(widgetElement , dir, 'dimension', '300px');
                    // to make grow work in row direction, children must be
                    // display: inline-block; and parent must be
                    // white-space: nowrap;
                    // that can be done with flexbox as well, the one question
                    // is how to make the sizing right.
                }

                for(let attr of [
                    //  ['atk-widget-options', 'ctrl.children[' + i +'].options']
                    //, ['atk-widget-children', 'ctrl.children[' + i +'].children']
                    ['atk-widget-depth', 'depth + 1']
                  , ['atk-parent-ctrl', 'ctrl']
                ])
                    widgetElement.setAttribute(...attr);
                widgets.push(widgetElement);
            }
            controller.widgets = widgets;
            element.append(widgets);
            $compile(widgets/*element.contents()*/)(scope);

            console.log('controller', controller);

            // it has some suckiness to check for changes here, after
            // we already know what we did in the actual action ...
            // how to know which item needs to be created/deleted???

            function updateChildren(newCollection, oldCollection) {
                //if(newCollection === oldCollection)
                //    return;
                console.log('watchCollection', newCollection, oldCollection);

                var oldMap  = new Map()
                  , newMap = new Map()
                  // let's see how solid this is
                  // note the odd reference `validTargetTagsSet` for cleanup later
                  , oldWidgets = controller.widgets
                  , newWidgets = [] // widgets who's elements are created in here
                  , widgets = [] // all widgets in order eventually
                  ;
                console.log('oldWidgets', oldWidgets, 'Array.from(element.contents())', Array.from(element.contents()));
                // this is already kind of flawed, the items in the collections
                // could just have been moved thus, they may be at new positions
                // do we know which collection belongs to which element????
                // we'll, we have the `atk-widget-index` attribute, which
                // maps to `oldCollection`
                //
                for(let i=0,l=newCollection.length;i<l;i++)
                    newMap.set(newCollection[i], i);

                for(let i=0,l=oldCollection.length;i<l;i++) {
                    // delete all elements that are not in newMap
                    let oldChildData = oldCollection[i]
                      , oldWidget = oldWidgets[i]
                      ;
                    if(!newMap.has(oldChildData)) {
                        console.log('deleting', oldWidget);
                        angular.element(oldWidget).isolateScope().$destroy();
                        oldWidget.parentElement.removeChild(oldWidget);
                        continue;
                    }
                    oldMap.set(oldChildData, i);
                    widgets.push(oldWidget);
                    // assert oldWidgets[i] is the widget of oldCollection[i];
                    // hmm maybe: assert(oldWidgets[i].getAttribute('atk-widget-index') === i
                    // the bottom line is that we expect the elements in
                    // oldWidgets are in the order of oldCollection!
                }

                var unit = 100/newCollection.length; // COPY PASTA
                for(let i=0,l=newCollection.length;i<l;i++) {
                    // update the element order by walking newCollection

                    // if(has no element)
                    let newChildData = newCollection[i]
                      , widgetElement
                      ;

                    let oldIndex = oldMap.get(newChildData);
                        widgetElement = oldWidgets[oldIndex];

                    // initially  oldMap.has(newChildData) is true
                    // but there's no widgetElement yet created
                    // which is a bit strange, because before this listener
                    // is even registered, the elements are created!
                    if(!widgetElement) {
                        widgetElement = doc.createElement(newChildData.type);
                        newWidgets.push(widgetElement);
                    }

                    // update these for oldElements as well (!?)
                    // we don't want to re-evaluate so far ...
                    // maybe, we should set the values directly to the
                    // isolate scope, that way angular can't do any fishy
                    // thing via the data bindings.
                    // ALSO: COPY PASTA!

                    for(let attr of [
                        //  ['atk-widget-options', 'ctrl.children[' + i +'].options']
                        //, ['atk-widget-children', 'ctrl.children[' + i +'].children']
                          ['atk-widget-depth', 'depth + 1']
                        , ['atk-parent-ctrl', 'ctrl']
                        ])
                        widgetElement.setAttribute(...attr);

                    console.log('widgetElement', widgetElement, oldMap.has(newChildData));
                    // widgetElement is not at right place in DOM
                    if(widgets[i] !== widgetElement) {
                        widgets.splice(i, 0, widgetElement);
                        if(i===0) {
                            console.log('prepend', dom, widgetElement);
                            domTool.insert(dom, 'prepend', widgetElement);

                        }
                        else {
                            console.log('after', widgets[i-1], widgetElement);
                            domTool.insert(widgets[i-1], 'after', widgetElement);
                        }
                    }
                    // update

                    // COPY PASTA
                    if(controller.options.mode === 'fit') {
                        widgetElement.style.outline = '1px solid red';
                        widgetElement.style.flex = '0 0 '+ unit + '%';
                    }
                    else if(controller.options.mode === 'grow') {
                        widgetElement.style.outline = '1px solid green';
                        widgetElement.style.flex = '0 0 auto';
                    }
                }
                controller.widgets = widgets;
                $compile(newWidgets)(scope);

                // TODO:
                // actually, maybe this is the standard thing to do
                // it's called initially anyways.
                // when we remove widgets they must be $destroyed!
                // In another pass, we must reset all attributes/styles
                // set before, so that we are up to date, as when built
                // anew. Let's hope that all these atk-attributes are
                // updated automatikally (the index in children[i] will
                // be different, so that may become nasty.
                //
                // HERE's a wild guess:
                // the attributes will never change once set ... references
                // are made during the initial $evaluate, and that's it.
                // if that's the case, it should be just enough to compile
                // the new elements.
                // though! in "ctrl.children[0]" the identity of the child
                // at i = 0 will change, let's just hope that's not magically
                // updated. It would be good if we could just add/remove
                // changed objects.

            }
            scope.updateChildren = updateChildren;
            // scope.$watchCollection('ctrl.children', updateChildren, true);


            // there is also a dragenter and dragleave event, but they
            // are not necessary for the most simple usage
            var indicatorId = 'atk-widget-drop-indicator'
              , dataTypes = ['atk/widget']
                // maybe we can identify these differently, i.e. must be
                // direct children of the widgets-list container and that's
                // it. It's bad to have to know all child types here in advance.
              , validTargetTagsSet = new TagsSet('atk-tiler', 'atk-placeholder')
              , findElement_ = findElement.bind(null, validTargetTagsSet)
              // , container = element[0].getElementsByClassName('container')[0]
              , dropHelper = new DropHelper(
                    dataTypes
                  , indicatorId
                  , getIndicatorSetup.bind(null, findElement_, controller, element[0])
                  , receiveDrop.bind(null, findElement_, controller, element[0])
                )
                ;
            element[0].addEventListener('dragover', dropHelper.dragoverHandler);
            element[0].addEventListener('drop', dropHelper.dropHandler);
        }


        // on mouse/drag over
        // in  a drag and drop situation
        // with a widget data type
        //      show a ghost/drop indicator
        //      consume the event

        // on drop
        // in  a drag and drop situation
        // with a widget data type
        //      insert the widget "data" into the scope/change the scope accordingly
        //      consume the event
        //      update the widgets (important and not straight forward because of
        //      our link functions, we'll probably have to keep track on what to
        //      update ourselves.)
        //
        // -> create a simple drag source for "widget data types" (Done widget-source)

        return {
            restrict: 'E' // only matches element names
          , controller: 'TilerController'
          , replace: false
          , scope: {
                      //  options: '=atkWidgetOptions'
                      //, children: '=atkWidgetChildren'
                        depth: '=atkWidgetDepth'
                      , parentCtrl: '=atkParentCtrl'
                    }
          , controllerAs: 'ctrl'
          , bindToController: true
          , link: link
        };
    }
    tilerDirective.$inject = ['$compile', 'DropHelper'];
    return tilerDirective;
});
