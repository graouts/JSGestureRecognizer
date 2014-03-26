
module.exports = PinchGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PinchGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PinchGestureRecognizer.MaximumTimeForRecordingGestures = 100;

PinchGestureRecognizer.prototype = {
    constructor: PinchGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    get velocity()
    {
        if (this._gestures.length < 2)
            return 0;
        
        var currentTime = Date.now();
        
        var count = this._gestures.length;
        var scaleDirection = this._gestures[count - 1].scale >= this._gestures[count - 2].scale;
        for (var i = count - 3; i >= 0; --i) {
            var gesture = this._gestures[i];
            if (currentTime - gesture.timeStamp > PinchGestureRecognizer.MaximumTimeForRecordingGestures ||
                this._gestures[i + 1].scale >= gesture.scale !== scaleDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);

        var oldestGesture = this._gestures[0];
        var ds = event.scale / oldestGesture.scale;
        var dt = event.timeStamp - oldestGesture.timeStamp;

        return ds / dt * 1000;
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
        this.scale = event.scale;
        this.enterBeganState();
    },
    
    gestureChanged: function(event)
    {
        event.preventDefault();

        this.enterChangedState();

        var gesture = this._recordGesture(event);

        this.scale *= gesture.scale / this._previousGesture.scale;

        this._previousGesture = gesture;
    },
    
    gestureEnded: function(event)
    {
        this.enterEndedState();
    },
    
    reset: function()
    {
        this.scale = 1;
        this._gestures = [];
        delete this._previousGesture;
    },
    
    // Private
    
    _recordGesture: function(event)
    {
        var gesture = {
            scale: event.scale,
            timeStamp: Date.now()
        };
        this._gestures.push(gesture);
        return gesture;
    }
};
