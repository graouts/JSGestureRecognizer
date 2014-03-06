
module.exports = GestureRecognizer;

var DOM = require("dom-events"),
    Point = require("geometry/point");

function GestureRecognizer()
{
    DOM.EventTarget.call(this);

    this._target = null;
    this.view = null;
    this.state = GestureRecognizer.States.Possible;
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
    GestureStart   : "gesturestart",
    GestureChange  : "gesturechange",
    GestureEnd     : "gestureend",
    StateChange    : "statechange"
};

GestureRecognizer.addGestureRecognizer = function(target, gestureRecognizer) {
    gestureRecognizer.target = target;
}

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
        this.initRecognizer();
    },

    initRecognizer: function()
    {
        if (this._target === null)
            throw new Error("Failed to initialize gesture recognizer, `this.target` is `null` but must be a DOM element.");

        this.reset();
        this.state = GestureRecognizer.States.Possible;

        this._target.addEventListener(GestureRecognizer.Events.TouchStart, this);
        if (GestureRecognizer.SupportsTouches)
            this._target.addEventListener(GestureRecognizer.Events.GestureStart, this);
    },

    reset: function()
    {
        // …
    },

    // Touch and gesture event handling

    handleEvent: function(event)
    {
        if (!GestureRecognizer.SupportsTouches)
            event.targetTouches = [event];
            
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

        // FIXME: deal with touchcancel as well.
        window.addEventListener(GestureRecognizer.Events.TouchMove, this, true);
        window.addEventListener(GestureRecognizer.Events.TouchEnd, this, true);
        this.enterPossibleState();
    },
    
    touchesMoved: function(event)
    {
        // …
    },

    touchesEnded: function(event)
    {
        // …
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
        // …
    },

    gestureEnded: function(event)
    {
        this.enterEndedState();
    },

    // State changes

    enterPossibleState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Possible);
    },

    enterBeganState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Began);
    },

    enterEndedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Ended);
        this._removeObservers();
        this.reset();
    },

    enterCancelledState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Cancelled);
        this._removeObservers();
        this.reset();
    },

    enterFailedState: function()
    {
        this._setStateAndNotifyOfChange(GestureRecognizer.States.Failed);
        this._removeObservers();
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

    _removeObservers: function()
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
    }
};
