
module.exports = RotationGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function RotationGestureRecognizer()
{
    GestureRecognizer.call(this);
}

RotationGestureRecognizer.prototype = {
    constructor: RotationGestureRecognizer,
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
        if (this.beganRecognizer == false) {
            this.enterBeganState();
            this.beganRecognizer = true;
        } else {
            this.enterChangedState();
            this.velocity = event.rotation - this.rotation;
            this.rotation = event.rotation;
        }
    },
    
    reset: function()
    {
        this.beganRecognizer = false;
        this.rotation = 0;
        this.velocity = 0;
    }
};
