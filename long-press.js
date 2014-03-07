
module.exports = LongPressGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function LongPressGestureRecognizer()
{
    // FIXME: implement .numberOfTapsRequired
    this.allowableMovement = 10;
    this.minimumPressDuration = 500;
    this.numberOfTouchesRequired = 1;

    GestureRecognizer.call(this);
}

LongPressGestureRecognizer.prototype = {
    constructor: LongPressGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.currentTarget !== this.target)
            return;

        event.preventDefault();

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        if (this.numberOfTouches !== this.numberOfTouchesRequired) {
            this.enterFailedState();
            return;
        }

        this._startPoint = this.locationInElement();

        this._timerId = window.setTimeout(this.enterRecognizedState.bind(this), this.minimumPressDuration);
    },
    
    touchesMoved: function(event)
    {
        event.preventDefault();

        if (this._startPoint.distanceToPoint(this.locationInElement()) > this.allowableMovement)
            this.enterFailedState();
    },
    
    touchesEnded: function(event)
    {
        event.preventDefault();

        if (this.numberOfTouches !== this.numberOfTouchesRequired)
            this.enterFailedState();
    },
    
    reset: function()
    {
        window.clearTimeout(this._timerId);
        delete this._timerId;
    }
};
