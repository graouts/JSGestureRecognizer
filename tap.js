
module.exports = TapGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function TapGestureRecognizer()
{
    this.numberOfTapsRequired = 1;
    this.numberOfTouchesRequired = 1;
    
    GestureRecognizer.call(this);
}

TapGestureRecognizer.MoveTolerance = 40;
TapGestureRecognizer.WaitingForNextTapToStartTimeout = 350;
TapGestureRecognizer.WaitingForTapCompletionTimeout = 750;

TapGestureRecognizer.prototype = {
    constructor: TapGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.currentTarget !== this.target)
            return;

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        if (this.numberOfTouches !== this.numberOfTouchesRequired) {
            this.enterFailedState();
            return;
        }

        this._startPoint = GestureRecognizer.prototype.locationInElement.call(this);

        this._rewindTimer(TapGestureRecognizer.WaitingForTapCompletionTimeout);

        event.preventDefault();
    },

    touchesMoved: function(event)
    {
        if (!GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.enterFailedState();
            return;
        }

        if (this._startPoint.distanceToPoint(this.locationInElement()) > TapGestureRecognizer.MoveTolerance)
            this.enterFailedState();
    },

    touchesEnded: function(event)
    {
        this._taps++;

        if (this._taps === this.numberOfTapsRequired) {
            this.enterRecognizedState();
            this.reset();
        }

        this._rewindTimer(TapGestureRecognizer.WaitingForNextTapToStartTimeout);
    },

    reset: function()
    {
        this._taps = 0;
        this._clearTimer();
    },

    locationInElement: function(element)
    {
        var p = this._startPoint || new Point;

        if (!element)
            return p;

        var wkPoint = window.webkitConvertPointFromPageToNode(element, new WebKitPoint(p.x, p.y));
        return new Point(wkPoint.x, wkPoint.y);
    },

    // Private

    _clearTimer: function()
    {
        window.clearTimeout(this._timerId);
        delete this._timerId;
    },

    _rewindTimer: function(timeout)
    {
        this._clearTimer();
        this._timerId = window.setTimeout(this._timerFired.bind(this), timeout);
    },

    _timerFired: function()
    {
        this.enterFailedState();
    }
};
