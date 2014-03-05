
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
        if (event.target !== this.target)
            return;

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        this.numberOfTouches = event.targetTouches.length;
        this.translationOrigin = Point.fromEvent(event);
        this.distance = 0;

        this._rewindTimer(TapGestureRecognizer.WaitingForTapCompletionTimeout);

        event.preventDefault();
    },

    touchesMoved: function(event)
    {
        if (event.target === this.target && !GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.enterFailedState();
        }

        var p = Point.fromEvent(event);
        var dx = p.x - this.translationOrigin.x,
            dy = p.y - this.translationOrigin.y;
        this.distance += Math.sqrt(dx*dx + dy*dy);
        if (this.distance > TapGestureRecognizer.MoveTolerance)
            this.enterFailedState();
    },

    touchesEnded: function(event)
    {
        if (event.target !== this.target)
            return;

        if (this.numberOfTouches === this.numberOfTouchesRequired) {
            GestureRecognizer.prototype.touchesEnded.call(this, event);

            this._taps++;

            if (this._taps === this.numberOfTapsRequired) {
                this.enterRecognizedState();
                this.reset();
            }

            this._rewindTimer(TapGestureRecognizer.WaitingForNextTapToStartTimeout);
        } else
            this.enterFailedState();
    },

    reset: function()
    {
        this._taps = 0;
        this._clearTimer();
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
