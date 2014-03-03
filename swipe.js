
module.exports = GestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function SwipeGestureRecognizer()
{
    this.direction = SwipeGestureRecognizer.Directions.Right;

    GestureRecognizer.call(this);
}

SwipeGestureRecognizer.NumberOfTouchesRequired = 1;
SwipeGestureRecognizer.MinimumDistance = 100;
SwipeGestureRecognizer.Directions = {
    Right : 1 << 0,
    Left  : 1 << 1,
    Up    : 1 << 2,
    Down  : 1 << 3
};

SwipeGestureRecognizer.prototype = {
    constructor: SwipeGestureRecognizer,
    __proto__: GestureRecognizer.prototype,
    
    touchstart: function(event)
    {
        var allTouches = event.allTouches();
        if (event.target == this.target) {
            if (SwipeGestureRecognizer.NumberOfTouchesRequired == allTouches.length) {
                event.preventDefault();
                GestureRecognizer.prototype.touchstart.call(this, event);
                this.startingPos = { x: allTouches[0].pageX, y: allTouches[0].pageY };
                this.distance = { x: 0, y: 0 };
            } else {
                this.fire(this.target, GestureRecognizer.States.Failed, this);
            }
        }
    },
    
    touchmove: function(event)
    {
        var allTouches = event.allTouches();
        if (event.target == this.target && SwipeGestureRecognizer.NumberOfTouchesRequired == allTouches.length) {
            event.preventDefault();
            var allTouches = event.allTouches();
            this.distance.x = allTouches[0].pageX - this.startingPos.x;
            this.distance.y = allTouches[0].pageY - this.startingPos.y;
            
            if (this.direction & SwipeGestureRecognizer.DirectionsRight) {
                if (this.distance.x > SwipeGestureRecognizer.MinimumDistance) {
                    this.fire(this.target, GestureRecognizer.States.Recognized, this);
                }
            }
            
            if (this.direction & SwipeGestureRecognizer.DirectionsLeft) {
                if (this.distance.x < -SwipeGestureRecognizer.MinimumDistance) {
                    this.fire(this.target, GestureRecognizer.States.Recognized, this);
                }
            }
            
            if (this.direction & SwipeGestureRecognizer.DirectionsUp) {
                if (this.distance.y < -SwipeGestureRecognizer.MinimumDistance) {
                    this.fire(this.target, GestureRecognizer.States.Recognized, this);
                }
            }
            
            if (this.direction & SwipeGestureRecognizer.DirectionsDown) {
                if (this.distance.y > SwipeGestureRecognizer.MinimumDistance) {
                    this.fire(this.target, GestureRecognizer.States.Recognized, this);
                }
            }
        } else {
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
    },
    
    touchend: function(event)
    {
        if (event.target == this.target) {
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
    }
};
