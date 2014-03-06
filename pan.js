
module.exports = PanGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function PanGestureRecognizer()
{
    console.log("PanGestureRecognizer");
    this.minimumNumberOfTouches = 1;
    this.maximumNumberOfTouches = 100000;

    GestureRecognizer.call(this);
}

PanGestureRecognizer.prototype = {
    constructor: PanGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.currentTarget !== this.target)
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

        event.preventDefault();

        var p = Point.fromEvent(event);
        var currentTime = event.timeStamp;
        this._recordGesture(p, currentTime);

        if (this._gestures.length === 1) {
            this.enterBeganState();
            this._translationOrigin = p;
        } else {
            this.enterChangedState();

            var sliceIndexX = 0;
            var sliceIndexY = 0;

            var currentGesture = this._gestures[this._gestures.length - 1];
            var previousGesture = this._gestures[this._gestures.length - 2];

            var txDirection = currentGesture.translation.x >= previousGesture.translation.x;
            var tyDirection = currentGesture.translation.y >= previousGesture.translation.y;
            for (var i = this._gestures.length - 3; i >= 0; --i) {
                var gesture = this._gestures[i];
                if (currentTime - gesture.timeStamp) {
                    if (sliceIndexX === 0)
                        sliceIndexX = i + 1;
                    if (sliceIndexY === 0)
                        sliceIndexY = i + 1;
                    break;
                }
                
                var nextTranslation = this._gestures[i + 1].translation;
                
                if (nextTranslation.x >= gesture.translation.x !== txDirection)
                    sliceIndexX = i + 1;
                if (nextTranslation.y >= gesture.translation.y !== tyDirection)
                    sliceIndexY = i + 1;
                
                if (sliceIndexX > 0 && sliceIndexY > 0) 
                    break;
            }

            var xGestures = this._gestures,
                yGestures = this._gestures;

            if (sliceIndexX === sliceIndexY && sliceIndexX > 0)
                this._gestures = this._gestures.slice(sliceIndexX);
            else {
                if (sliceIndexX > 0)
                    xGestures = this._gestures.slice(sliceIndexX);
                if (sliceIndexY > 0)
                    yGestures = this._gestures.slice(sliceIndexY);
            } 

            var oldestGestureX = xGestures[0];
            var xdt = currentTime - oldestGestureX.timeStamp;
            var dx = p.x - oldestGestureX.translation.x;
            this.velocity.x = dx / xdt * 1000;

            var oldestGestureY = yGestures[0];
            var ydt = currentTime - oldestGestureY.timeStamp;
            var dy = p.y - oldestGestureY.translation.y;
            this.velocity.y = dy / ydt * 1000;
            
            this.translation.x += p.x - previousGesture.translation.x;
            this.translation.y += p.y - previousGesture.translation.y;
        }
    },
    
    touchesEnded: function(event)
    {
        if (this._gestures.length > 0)
            this.enterEndedState();
        else
            this.enterFailedState();
    },
    
    reset: function()
    {
        this._gestures = [];
        this.translation = new Point;
        this.velocity = new Point;
    },
    
    // Private
    
    _recordGesture: function(translation, timeStamp)
    {
        this._gestures.push({
            translation: translation,
            timeStamp: timeStamp
        });
    }
};
