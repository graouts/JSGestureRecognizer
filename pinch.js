
module.exports = PinchGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PinchGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PinchGestureRecognizer.MaximumTimeForRecordingGestures = 100;
PinchGestureRecognizer.MaximumDecelerationTime = 500;

PinchGestureRecognizer.prototype = {
    constructor: PinchGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    get velocity()
    {
        var lastGesture = this._gestures[this._gestures.length - 1];
        if (!lastGesture)
            return this._velocity;

        var elapsedTime = Date.now() - (lastGesture.timeStamp + PinchGestureRecognizer.MaximumTimeForRecordingGestures);
        if (elapsedTime <= 0)
            return this._velocity;

        var f = Math.max((PinchGestureRecognizer.MaximumDecelerationTime - elapsedTime) / PinchGestureRecognizer.MaximumDecelerationTime, 0);
        return this._velocity * f;
    },

    touchesBegan: function(event)
    {
        if (event.currentTarget !== this.target || this.numberOfTouches !== 2)
            return;

        event.preventDefault();
        GestureRecognizer.prototype.touchesBegan.call(this, event);
    },
    
    gestureBegan: function(event)
    {
        GestureRecognizer.prototype.gestureBegan.call(this, event);

        this._recordGesture(event);
        this.scale = event.scale;
        this.enterBeganState();
    },
    
    gestureChanged: function(event)
    {
        event.preventDefault();

        this.enterChangedState();

        this._recordGesture(event);

        var oldestGesture = this._gestures[0];
        var ds = event.scale / oldestGesture.scale;
        var dt = event.timeStamp - oldestGesture.timeStamp;
        this._velocity = ds / dt * 1000;

        this.scale *= event.scale / this._gestures[this._gestures.length - 2].scale;
    },
    
    gestureEnded: function(event)
    {
        this.enterEndedState();
    },
    
    reset: function()
    {
        this.scale = 1;
        this._velocity = 0;
        this._gestures = [];
    },
    
    // Private
    
    _recordGesture: function(event)
    {
        var currentTime = event.timeStamp;
        var count = this._gestures.push({
            scale: event.scale,
            timeStamp: currentTime
        });

        // We want to keep at least two gestures at all times.
        if (count <= 2)
            return;

        var scaleDirection = this._gestures[count - 1].scale >= this._gestures[count - 2].scale;
        for (var i = count - 3; i >= 0; --i) {
            var gesture = this._gestures[i];
            if (currentTime - gesture.timeStamp > PinchGestureRecognizer.MaximumTimeForRecordingGestures ||
                this._gestures[i + 1].scale >= gesture.scale !== scaleDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);
    }
};
