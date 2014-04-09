
module.exports = PanGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer"),
    Point = require("geometry/point");

function PanGestureRecognizer()
{
    this.minimumNumberOfTouches = 1;
    this.maximumNumberOfTouches = 100000;

    this._travelledMinimumDistance = false;

    GestureRecognizer.call(this);
}

PanGestureRecognizer.MinimumDistance = 10;
PanGestureRecognizer.MaximumTimeForRecordingGestures = 100;
PanGestureRecognizer.MaximumDecelerationTime = 500;

PanGestureRecognizer.prototype = {
    constructor: PanGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    get velocity()
    {
        var lastGesture = this._gestures[this._gestures.length - 1];
        if (!lastGesture)
            return this._velocity;

        var elapsedTime = Date.now() - (lastGesture.timeStamp + PanGestureRecognizer.MaximumTimeForRecordingGestures);
        if (elapsedTime <= 0)
            return this._velocity;

        var f = Math.max((PanGestureRecognizer.MaximumDecelerationTime - elapsedTime) / PanGestureRecognizer.MaximumDecelerationTime, 0);
        return new Point(this._velocity.x * f, this._velocity.y * f);
    },

    touchesBegan: function(event)
    {
        if (event.currentTarget !== this.target)
            return;

        GestureRecognizer.prototype.touchesBegan.call(this, event);

        if (!this._numberOfTouchesIsAllowed())
            this.enterFailedState();
    },
    
    touchesMoved: function(event)
    {
        event.preventDefault();

        var location = this.locationInElement();

        var currentTime = event.timeStamp;
        this._recordGesture(location, currentTime);

        if (this._gestures.length === 1) {
            this._translationOrigin = location;
            this._travelledMinimumDistance = false;
            return;
        }

        var sliceIndexX = 0;
        var sliceIndexY = 0;

        var currentGesture = this._gestures[this._gestures.length - 1];
        var previousGesture = this._gestures[this._gestures.length - 2];

        var txDirection = currentGesture.location.x >= previousGesture.location.x;
        var tyDirection = currentGesture.location.y >= previousGesture.location.y;
        for (var i = this._gestures.length - 3; i >= 0; --i) {
            var gesture = this._gestures[i];
            if (currentTime - gesture.timeStamp > PanGestureRecognizer.MaximumTimeForRecordingGestures) {
                if (sliceIndexX === 0)
                    sliceIndexX = i + 1;
                if (sliceIndexY === 0)
                    sliceIndexY = i + 1;
                break;
            }
            
            var nextTranslation = this._gestures[i + 1].location;
            
            if (nextTranslation.x >= gesture.location.x !== txDirection)
                sliceIndexX = i + 1;
            if (nextTranslation.y >= gesture.location.y !== tyDirection)
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
        var dx = location.x - oldestGestureX.location.x;
        this._velocity.x = dx / xdt * 1000;

        var oldestGestureY = yGestures[0];
        var ydt = currentTime - oldestGestureY.timeStamp;
        var dy = location.y - oldestGestureY.location.y;
        this._velocity.y = dy / ydt * 1000;

        if (!this._travelledMinimumDistance) {
            if (this.canBeginWithTravelledDistance(new Point(location.x - this._translationOrigin.x, location.y - this._translationOrigin.y))) {
                this._travelledMinimumDistance = true;
                this.enterBeganState();
            }
        } else {            
            this.translation.x += location.x - previousGesture.location.x;
            this.translation.y += location.y - previousGesture.location.y;

            this.enterChangedState();
        }
    },

    canBeginWithTravelledDistance: function(distance)
    {
        return Math.abs(distance.x) >= PanGestureRecognizer.MinimumDistance || Math.abs(distance.y) >= PanGestureRecognizer.MinimumDistance;
    },

    touchesEnded: function(event)
    {
        if (this._numberOfTouchesIsAllowed())
            return;

        if (this._travelledMinimumDistance)
            this.enterEndedState();
        else
            this.enterFailedState();
    },
    
    reset: function()
    {
        this._gestures = [];
        this.translation = new Point;
        this._velocity = new Point;
    },
    
    // Private
    
    _recordGesture: function(location, timeStamp)
    {
        this._gestures.push({
            location: location,
            timeStamp: timeStamp
        });
    },
    
    _numberOfTouchesIsAllowed: function()
    {
        return this.numberOfTouches >= this.minimumNumberOfTouches && this.numberOfTouches <= this.maximumNumberOfTouches;
    }
};
