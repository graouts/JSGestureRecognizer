
module.exports = LongPressGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function LongPressGestureRecognizer()
{
    // FIXME: implement and expose .allowableMovement and .numberOfTapsRequired
    this.minimumPressDuration = 500;
    this.numberOfTouchesRequired = 1;

    GestureRecognizer.call(this);
}

LongPressGestureRecognizer.prototype = {
    constructor: LongPressGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.target !== this.target)
            return;

        event.preventDefault();

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        if (this.numberOfTouchesRequired === event.targetTouches.length)
            this._timerId = window.setTimeout(this.enterRecognizedState.bind(this), this.minimumPressDuration);
    },
    
    touchesMoved: function(event)
    {
        if (event.target === this.target && GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.enterFailedState();
        }
    },
    
    touchesEnded: function(event)
    {
        if (event.target === this.target) {
            event.preventDefault();
            this.enterFailedState();
        }
    },
    
    reset: function()
    {
        if (this._timerId) {
            window.clearTimeout(this._timerId);
        }
        delete this._timerId;
    }
};
