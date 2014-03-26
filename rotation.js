
module.exports = RotationGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function RotationGestureRecognizer()
{
    GestureRecognizer.call(this);
}

RotationGestureRecognizer.MaximumTimeForRecordingGestures = 100;

RotationGestureRecognizer.prototype = {
    constructor: RotationGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    get velocity()
    {
        if (this._gestures.length < 2)
            return 0;
        
        var currentTime = Date.now();
        
        var count = this._gestures.length;
        var rotationDirection = this._gestures[count - 1].rotation >= this._gestures[count - 2].rotation;
        for (var i = count - 3; i >= 0; --i) {
            var gesture = this._gestures[i];
            if (currentTime - gesture.timeStamp > RotationGestureRecognizer.MaximumTimeForRecordingGestures ||
                this._gestures[i + 1].rotation >= gesture.rotation !== rotationDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);

        var oldestGesture = this._gestures[0];
        var dr = event.rotation - oldestGesture.rotation;
        var dt = event.timeStamp - oldestGesture.timeStamp;

        return dr / dt * 1000;
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

        this._previousGesture = this._recordGesture(event);
        this.rotation = event.rotation;
        this.enterBeganState();
    },
    
    gestureChanged: function(event)
    {
        event.preventDefault();

        this.enterChangedState();

        var gesture = this._recordGesture(event);

        this.rotation += gesture.rotation - this._previousGesture.rotation;

        this._previousGesture = gesture;
    },
    
    gestureEnded: function(event)
    {
        this.enterEndedState();
    },
    
    reset: function()
    {
        this.rotation = 0;
        this._gestures = [];
        delete this._previousGesture;
    },
    
    // Private
    
    _recordGesture: function(event)
    {
        var gesture = {
            rotation: event.rotation,
            timeStamp: Date.now()
        };
        this._gestures.push(gesture);
        return gesture;
    }
};
