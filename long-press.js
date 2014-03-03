
module.exports = LongPressGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function LongPressGestureRecognizer()
{
    GestureRecognizer.call(this);
}

LongPressGestureRecognizer.MinimumPressDuration = 400;
LongPressGestureRecognizer.NumberOfTouchesRequired = 1;

LongPressGestureRecognizer.prototype = {
    constructor: LongPressGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchstart: function(event)
    {
        if (event.target == this.target) {
            event.preventDefault();
            GestureRecognizer.prototype.touchstart.call(this, event);
            if (LongPressGestureRecognizer.NumberOfTouchesRequired == event.allTouches().length) {
                this.recognizerTimer = window.setTimeout(function() {
                    this.fire(this.target, GestureRecognizer.States.Recognized, this);
                }.bind(this), LongPressGestureRecognizer.MinimumPressDuration);
            }
        }
    },
    
    touchmove: function(event)
    {
        // FIXME: allow some tolerance here.
        if (event.target == this.target && GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
    },
    
    touchend: function(event)
    {
        if (event.target == this.target) {
            event.preventDefault();
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
    },
    
    gesturestart: function(event)
    {
        if (event.target == this.target) {
            event.preventDefault();
            this.fire(this.target, GestureRecognizer.States.Failed);
        }
    },
    
    reset: function()
    {
        if (this.recognizerTimer) {
            window.clearTimeout(this.recognizerTimer);
        }
        this.recognizerTimer = null;
    }
};
