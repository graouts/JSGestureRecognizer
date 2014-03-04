
module.exports = PinchGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PinchGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PinchGestureRecognizer.prototype = {
    constructor: PinchGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.target !== this.target || event.targetTouches !== 2)
            return;

        event.preventDefault();
        GestureRecognizer.prototype.touchesBegan.call(this, event);
    },
    
    gestureChanged: function(event)
    {
        if (event.target !== this.target)
            return;

        event.preventDefault();
        if (!this._beganRecognizer) {
            this.enteredBeganState();
            this._beganRecognizer = true;
        } else {
            this.enteredChangedState();
            this.velocity = event.scale / this.scale;
            this.scale = event.scale;
        }
    },
    
    reset: function()
    {
        this._beganRecognizer = false;
        this.scale = 1;
        this.velocity = 0;
    }
};
