
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
TapGestureRecognizer.TapTimeout = 500;

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

        event.preventDefault();
    },

    touchesMoved: function(event)
    {
        if (event.target === this.target && !GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.enteredFailedState();
        }

        var p = Point.fromEvent(event);
        var dx = p.x - this.translationOrigin.x,
            dy = p.y - this.translationOrigin.y;
        this.distance += Math.sqrt(dx*dx + dy*dy);
        if (this.distance > TapGestureRecognizer.MoveTolerance)
            this.enteredFailedState();
    },

    touchesEnded: function(event)
    {
        if (event.target !== this.target)
            return;

        if (this.numberOfTouches === this.numberOfTouchesRequired) {
            GestureRecognizer.prototype.touchesEnded.call(this, event);

            this.taps++;

            if (this._timerId) {
                window.clearTimeout(this._timerId);
                delete this._timerId;
            }

            this._timerId = window.setTimeout(this._timerFired.bind(this), TapGestureRecognizer.TapTimeout);
        } else
            this.enteredFailedState();
    },

    reset: function()
    {
        this.taps = 0;
        delete this._timerId;
    },

    // Private

    _timerFired: function()
    {
        if (this.taps === this.numberOfTapsRequired) {
            this.enteredRecognizedState();
            this.reset();
        } else
            this.enteredFailedState();
    }
};
