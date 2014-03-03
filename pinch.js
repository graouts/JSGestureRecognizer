
module.exports = PinchGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PinchGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PinchGestureRecognizer.prototype = {
    constructor: PinchGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    gesturestart: function(event)
    {

        if (event.target == this.target) {
            var allTouches = event.allTouches();
            if (allTouches.length == 2) {
                event.preventDefault();
                GestureRecognizer.prototype.gesturestart.call(this, event);
            }
        }
    },
    
    gesturechange: function(event)
    {
        if (event.target == this.target) {
            event.preventDefault();
            if (this.beganRecognizer == false) {
                this.fire(this.target, GestureRecognizer.States.Began, this);
                this.beganRecognizer = true;
            } else {
                this.fire(this.target, GestureRecognizer.States.Changed, this);
                this.velocity = event.scale / this.scale;
                this.scale *= event.scale;
            }
        }
    },
    
    reset: function()
    {
        this.beganRecognizer = false;
        this.scale = 1;
        this.velocity = 0;
    },
    
    setScale: function(scale)
    {
        if (typeof scale == 'number') {
            this.scale = scale;
        }
    }
};
