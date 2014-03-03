
var GestureRecognizer = require("./GestureRecognizer");

function RotationGestureRecognizer()
{
    GestureRecognizer.call(this);
}

RotationGestureRecognizer.prototype = {
    constructor: RotationGestureRecognizer,
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
                this.velocity = event.rotation - this.rotation;
                this.rotation += event.rotation;
            }
        }
    },
    
    reset: function()
    {
        this.beganRecognizer = false;
        this.rotation = 0;
        this.velocity = 0;
    },
    
    setRotation: function(rot)
    {
        if (typeof rot == 'number') {
            this.rotation = rot;
        }
    }
};
