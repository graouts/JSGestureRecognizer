
module.exports = PanGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function PanGestureRecognizer()
{
    this.minimumNumberOfTouches = 1;
    this.maximumNumberOfTouches = 100000;

    GestureRecognizer.call(this);
}

PanGestureRecognizer.prototype = {
    constructor: PanGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.target !== this.target)
            return;

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        var touches = event.targetTouches;
        if (touches.length < this.minimumNumberOfTouches || touches.length > this.maximumNumberOfTouches)
            this.enterFailedState();
    },
    
    touchesMoved: function(event)
    {
        var touches = event.targetTouches;
        if (touches.length < this.minimumNumberOfTouches || touches.length > this.maximumNumberOfTouches)
            return;

        if (GestureRecognizer.SupportsTouches) {
            if (event.target !== this.target) {
                this.touchesEnded(event);
                return;
            }
        }

        event.preventDefault();

        if (!this._beganRecognizer) {
            this.enterBeganState();
            this._beganRecognizer = true;
            this._translationOrigin = Point.fromEvent(event);
        } else {
            this.enterChangedState();
            var p = Point.fromEvent(event);
            
            this.velocity.x = p.x - this.translation.x;
            this.velocity.y = p.y - this.translation.y;
            
            this.translation.x = p.x - this._translationOrigin.x;
            this.translation.y = p.y - this._translationOrigin.y;
        }
    },
    
    touchesEnded: function(event)
    {
        if (event.target === this.target || !GestureRecognizer.SupportsTouches) {
            GestureRecognizer.prototype.touchesEnded.call(this, event);
            if (this.beganRecognizer)
                this.enterEndedState();
            else
                this.enterFailedState();
        }
    },
    
    reset: function()
    {
        this._beganRecognizer = false;
        this.translation = new Point;
        this.velocity = new Point;
    }
};
