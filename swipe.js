
module.exports = SwipeGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function SwipeGestureRecognizer()
{
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
        if (event.currentTarget !== this.target)
            return;

        if (this.numberOfTouchesRequired === this.numberOfTouches) {
            event.preventDefault();
            GestureRecognizer.prototype.touchesBegan.call(this, event);
            this._translationOrigin = this.locationInElement();
        } else
            this.enterFailedState();
    },
    
    touchesMoved: function(event)
    {
        if (this.numberOfTouchesRequired !== this.numberOfTouches) {
            this.enterFailedState();
            return;
        }
        
        event.preventDefault();

        var point = this.locationInElement();
        var translation = new Point(point.x - this._translationOrigin.x, point.y - this._translationOrigin.y);
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction === SwipeGestureRecognizer.Directions.Right) {
            if (translation.x > SwipeGestureRecognizer.MinimumDistance && Math.abs(translation.x) > Math.abs(translation.y))
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction === SwipeGestureRecognizer.Directions.Left) {
            if (translation.x < -SwipeGestureRecognizer.MinimumDistance && Math.abs(translation.x) > Math.abs(translation.y))
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction === SwipeGestureRecognizer.Directions.Up) {
            if (translation.y < -SwipeGestureRecognizer.MinimumDistance && Math.abs(translation.y) > Math.abs(translation.x))
                this.enterRecognizedState();
        }
        
        if (this.state !== GestureRecognizer.States.Recognized && this.direction === SwipeGestureRecognizer.Directions.Down) {
            if (translation.y > SwipeGestureRecognizer.MinimumDistance && Math.abs(translation.y) > Math.abs(translation.x))
                this.enterRecognizedState();
        }
    },
    
    touchesEnded: function(event)
    {
        this.enterFailedState();
    }
};
