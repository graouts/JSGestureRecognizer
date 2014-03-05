
module.exports = SwipeGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function SwipeGestureRecognizer()
{
    // FIXME: expose a way to detect which direction the swipe was recognized.
    this.numberOfTouchesRequired = 1;
    this.direction = SwipeGestureRecognizer.Directions.Right;

    GestureRecognizer.call(this);
}

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
    
    touchesBegan: function(event)
    {
        if (event.target !== this.target)
            return;

        var touches = event.targetTouches;
        if (this.numberOfTouchesRequired === touches.length) {
            event.preventDefault();
            GestureRecognizer.prototype.touchesBegan.call(this, event);
            this.startingPos = new Point(touches[0].pageX, touches[0].pageY);
            this.distance = new Point;
        } else
            this.enterFailedState();
    },
    
    touchesMoved: function(event)
    {
        var touches = event.targetTouches;
        if (event.target !== this.target || this.numberOfTouchesRequired !== touches.length) {
            this.enterFailedState();
            return;
        }
        
        event.preventDefault();

        // FIXME: we should take into account velocity and angle here.
        this.distance.x = touches[0].pageX - this.startingPos.x;
        this.distance.y = touches[0].pageY - this.startingPos.y;
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction & SwipeGestureRecognizer.Directions.Right) {
            if (this.distance.x > SwipeGestureRecognizer.MinimumDistance)
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction & SwipeGestureRecognizer.Directions.Left) {
            if (this.distance.x < -SwipeGestureRecognizer.MinimumDistance)
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction & SwipeGestureRecognizer.Directions.Up) {
            if (this.distance.y < -SwipeGestureRecognizer.MinimumDistance)
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction & SwipeGestureRecognizer.Directions.Down) {
            if (this.distance.y > SwipeGestureRecognizer.MinimumDistance)
                this.enterRecognizedState();
        }
    },
    
    touchesEnded: function(event)
    {
        if (event.target === this.target)
            this.enterFailedState();
    }
};
