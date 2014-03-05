
module.exports = PinchGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PinchGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PinchGestureRecognizer.prototype = {
    constructor: PinchGestureRecognizer,
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
        this.scale = event.scale;
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
        var ds = event.scale / oldestGesture.scale;
        var dt = event.timeStamp - oldestGesture.timeStamp;
        this.velocity = ds / dt * 1000;

        this.scale *= event.scale / this._gestures[this._gestures.length - 2].scale;
    },
    
    reset: function()
    {
        this.scale = 1;
        this.velocity = 0;
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
            if (currentTime - gesture.timeStamp > 1000 || this._gestures[i + 1].scale >= gesture.scale !== scaleDirection)
                break;
        }

        if (i > 0)
            this._gestures = this._gestures.slice(i + 1);
    }
};
