
module.exports = RotationGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function RotationGestureRecognizer()
{
    GestureRecognizer.call(this);
}

RotationGestureRecognizer.MaximumTimeForRecordingGestures = 100;
RotationGestureRecognizer.MaximumDecelerationTime = 500;

RotationGestureRecognizer.prototype = {
    constructor: RotationGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    get velocity()
    {
        var lastGesture = this._gestures[this._gestures.length - 1];
        if (!lastGesture)
            return this._velocity;

        var elapsedTime = Date.now() - (lastGesture.timeStamp + RotationGestureRecognizer.MaximumTimeForRecordingGestures);
        if (elapsedTime <= 0)
            return this._velocity;

        var f = Math.max((RotationGestureRecognizer.MaximumDecelerationTime - elapsedTime) / RotationGestureRecognizer.MaximumDecelerationTime, 0);
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
        this.rotation = event.rotation;
        this.enterBeganState();
    },
    
    gestureChanged: function(event)
    {
        event.preventDefault();

        this.enterChangedState();

        this._recordGesture(event);

        var oldestGesture = this._gestures[0];
        var dr = event.rotation - oldestGesture.rotation;
        var dt = event.timeStamp - oldestGesture.timeStamp;
        this._velocity = dr / dt * 1000;

        this.rotation += event.rotation - this._gestures[this._gestures.length - 2].rotation;
    },
    
    gestureEnded: function(event)
    {
        this.enterEndedState();
    },
    
    reset: function()
    {
        this.rotation = 0;
        this._velocity = 0;
        this._gestures = [];
    },
    
    // Private
    
    _recordGesture: function(event)
    {
        var currentTime = event.timeStamp;
        var count = this._gestures.push({
            rotation: event.rotation,
            timeStamp: currentTime
        });

        // We want to keep at least two gestures at all times.
        if (count <= 2)
            return;

        var rotationDirection = this._gestures[count - 1].rotation >= this._gestures[count - 2].rotation;
        for (var i = count - 3; i >= 0; --i) {
            var gesture = this._gestures[i];
            if (currentTime - gesture.timeStamp > RotationGestureRecognizer.MaximumTimeForRecordingGestures ||
                this._gestures[i + 1].rotation >= gesture.rotation !== rotationDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);
    }
};
