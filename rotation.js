
module.exports = RotationGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function RotationGestureRecognizer()
{
    GestureRecognizer.call(this);
}

RotationGestureRecognizer.prototype = {
    constructor: RotationGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchesBegan: function(event)
    {
        if (event.target !== this.target || event.targetTouches !== 2)
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
        if (event.target !== this.target)
            return;

        event.preventDefault();

        this.enterChangedState();

        this._recordGesture(event);

        var oldestGesture = this._gestures[0];
        var dr = event.rotation - oldestGesture.rotation;
        var dt = event.timeStamp - oldestGesture.timeStamp;
        this.velocity = dr / dt * 1000;

        this.rotation += event.rotation - this._gestures[this._gestures.length - 2].rotation;
    },
    
    reset: function()
    {
        this.rotation = 0;
        this.velocity = 0;
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
            if (currentTime - gesture.timeStamp > 1000 || this._gestures[i + 1].rotation >= gesture.rotation !== rotationDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);
    }
};
