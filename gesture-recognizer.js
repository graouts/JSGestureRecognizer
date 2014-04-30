
module.exports = GestureRecognizer;

var DOM = require("dom-events"),
    Point = require("geometry/point.js");

function GestureRecognizer()
{
    DOM.EventTarget.call(this);

    this._targetTouches = [];

    this._enabled = true;
    this._target = null;
    this.view = null;
    this.state = GestureRecognizer.States.Possible;
    this.delegate = null;
}

GestureRecognizer.SupportsTouches = "createTouch" in document;

GestureRecognizer.States = {
    Possible   : "possible",
    Began      : "began",
    Changed    : "changed",
    Ended      : "ended",
    Cancelled  : "cancelled",
    Failed     : "failed",
    Recognized : "ended"
};

GestureRecognizer.Events = {
    TouchStart     : GestureRecognizer.SupportsTouches ? "touchstart" : "mousedown",
    TouchMove      : GestureRecognizer.SupportsTouches ? "touchmove" : "mousemove",
    TouchEnd       : GestureRecognizer.SupportsTouches ? "touchend" : "mouseup",
    TouchCancel    : "touchcancel",
    GestureStart   : "gesturestart",
    GestureChange  : "gesturechange",
    GestureEnd     : "gestureend",
    StateChange    : "statechange"
};

GestureRecognizer.prototype = {
    constructor: GestureRecognizer,
    __proto__: DOM.EventTarget.prototype,

    get target()
    {
        return this._target;
    },

    set target(target)
    {
        if (!target || this._target === target)
            return;

        this._target = target;
        this._initRecognizer();
    },

    get numberOfTouches()
    {
        return this._targetTouches.length;
    },

    get enabled()
    {
        return this._enabled;
    },

    set enabled(enabled)
    {
        if (this._enabled === enabled)
            return;

        this._enabled = enabled;

        if (!enabled) {
            if (this.numberOfTouches === 0) {
                this._removeTrackingListeners();
                this.reset();
            } else
                this.enterCancelledState();
        }

        this._updateBaseListeners();
    },

    reset: function()
    {
        // Implemented by subclasses.
    },

    locationInElement: function(element)
    {
        var p = new Point;
        var touches = this._targetTouches;
        for (var i = 0, count = touches.length; i < count; ++i) {
            var touch = touches[i];
            p.x += touch.pageX;
            p.y += touch.pageY;
        }
        p.x /= count;
        p.y /= count;

        if (!element)
            return p;

        var wkPoint = window.webkitConvertPointFromPageToNode(element, new WebKitPoint(p.x, p.y));
        return new Point(wkPoint.x, wkPoint.y);
    },

    locationOfTouchInElement: function(touchIndex, element)
    {
        var touch = this._targetTouches[touchIndex];
        if (!touch)
            return new Point;

        if (!element)
            return new Point(touch.pageX, touch.pageY);

        var wkPoint = window.webkitConvertPointFromPageToNode(element, new WebKitPoint(touch.pageX, touch.pageY));
        return new Point(wkPoint.x, wkPoint.y);
    },

    // Touch and gesture event handling

    handleEvent: function(event)
    {
        this._updateTargetTouches(event);

        switch (event.type) {
        case GestureRecognizer.Events.TouchStart:
            this.touchesBegan(event);
            break;
        case GestureRecognizer.Events.TouchMove:
            this.touchesMoved(event);
            break;
        case GestureRecognizer.Events.TouchEnd:
            this.touchesEnded(event);
            break;
        case GestureRecognizer.Events.TouchCancel:
            this.touchesCancelled(event);
            break;
        case GestureRecognizer.Events.GestureStart:
            this.gestureBegan(event);
            break;
        case GestureRecognizer.Events.GestureChange:
            this.gestureChanged(event);
            break;
        case GestureRecognizer.Events.GestureEnd:
            this.gestureEnded(event);
            break;
        }
    },
    
    touchesBegan: function(event)
    {
        if (event.currentTarget !== this._target)
            return;

        window.addEventListener(GestureRecognizer.Events.TouchMove, this, true);
        window.addEventListener(GestureRecognizer.Events.TouchEnd, this, true);
        window.addEventListener(GestureRecognizer.Events.TouchCancel, this, true);
        this.enterPossibleState();
    },
    
    touchesMoved: function(event)
    {
        // Implemented by subclasses.
    },

    touchesEnded: function(event)
    {
        // Implemented by subclasses.
    },

    touchesCancelled: function(event)
    {
        // Implemented by subclasses.
    },

    gestureBegan: function(event)
    {
        if (event.currentTarget !== this._target)
            return;

        window.addEventListener(GestureRecognizer.Events.GestureChange, this, true);
        window.addEventListener(GestureRecognizer.Events.GestureEnd, this, true);
        this.enterPossibleState();
    },

    gestureChanged: function(event)
    {
        // Implemented by subclasses.
    },

    gestureEnded: function(event)
    {
        // Implemented by subclasses.
    },

    // State changes

    enterPossibleState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Possible);
    },

    enterBeganState: function()
    {
        if (this.delegate && typeof this.delegate.gestureRecognizerShouldBegin === "function" && !this.delegate.gestureRecognizerShouldBegin(this)) {
            this.enterFailedState();
            return;
        }
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Began);
    },

    enterEndedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Ended);
        this._removeTrackingListeners();
        this.reset();
    },

    enterCancelledState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Cancelled);
        this._removeTrackingListeners();
        this.reset();
    },

    enterFailedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Failed);
        this._removeTrackingListeners();
        this.reset();
    },

    enterChangedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Changed);
    },

    enterRecognizedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Recognized);
    },

    // Private

    _initRecognizer: function()
    {
        this.reset();
        this.state = GestureRecognizer.States.Possible;

        this._updateBaseListeners();
    },

    _updateBaseListeners: function()
    {
        if (!this._target)
            return;

        if (this._enabled) {
            this._target.addEventListener(GestureRecognizer.Events.TouchStart, this);
            if (GestureRecognizer.SupportsTouches)
                this._target.addEventListener(GestureRecognizer.Events.GestureStart, this);
        } else {
            this._target.removeEventListener(GestureRecognizer.Events.TouchStart, this);
            if (GestureRecognizer.SupportsTouches)
                this._target.removeEventListener(GestureRecognizer.Events.GestureStart, this);
        }
    },

    _removeTrackingListeners: function()
    {
        window.removeEventListener(GestureRecognizer.Events.TouchMove, this, true);
        window.removeEventListener(GestureRecognizer.Events.TouchEnd, this, true);
        window.removeEventListener(GestureRecognizer.Events.GestureChange, this, true);
        window.removeEventListener(GestureRecognizer.Events.GestureEnd, this, true);
    },

    _setStateAndNotifyOfChange: function(state)
    {
        this.state = state;
        this.dispatchEvent(new DOM.Event(GestureRecognizer.Events.StateChange));
    },

    _updateTargetTouches: function(event)
    {
        if (!GestureRecognizer.SupportsTouches) {
            if (event.type === GestureRecognizer.Events.TouchEnd)
                this._targetTouches = [];
            else
                this._targetTouches = [event]
            return;
        }

        if (!(event instanceof TouchEvent))
            return;

        // With a touchstart event, event.targetTouches is accurate so 
        // we simply add all of those.
        if (event.type === GestureRecognizer.Events.TouchStart) {
            this._targetTouches = [];
            var touches = event.targetTouches;
            for (var i = 0, count = touches.length; i < count; ++i)
                this._targetTouches.push(touches[i]);
            return;
        }

        // With a touchmove event, the target is window so event.targetTouches is
        // inaccurate so we add all touches that we knew about previously.
        if (event.type === GestureRecognizer.Events.TouchMove) {
            var targetIdentifiers = this._targetTouches.map(function(touch) {
                return touch.identifier;
            });

            this._targetTouches = [];
            var touches = event.touches;
            for (var i = 0, count = touches.length; i < count; ++i) {
                var touch = touches[i];
                if (targetIdentifiers.indexOf(touch.identifier) !== -1)
                    this._targetTouches.push(touch);
            }
            return;
        }

        // With a touchend or touchcancel event, we only keep the existing touches
        // that are also found in event.touches.
        var allTouches = event.touches;
        var existingIdentifiers = [];
        for (var i = 0, count = allTouches.length; i < count; ++i)
            existingIdentifiers.push(allTouches[i].identifier);

        this._targetTouches = this._targetTouches.filter(function(touch) {
            return existingIdentifiers.indexOf(touch.identifier) !== -1;
        });
        
    }
};
