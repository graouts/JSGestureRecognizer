
module.exports = PanGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function PanGestureRecognizer()
{
    GestureRecognizer.call(this);
}

PanGestureRecognizer.MaximumNumberOfTouches = 100000;
PanGestureRecognizer.MinimumNumberOfTouches = 1;

PanGestureRecognizer.prototype = {
    constructor: PanGestureRecognizer,
    __proto__: GestureRecognizer.prototype,

    touchstart: function(event)
    {
        if (event.target == this.target) {
            GestureRecognizer.prototype.touchstart.call(this, event);
            var allTouches = event.allTouches();
            if (allTouches.length > PanGestureRecognizer.MaximumNumberOfTouches ||
                allTouches.length < PanGestureRecognizer.MinimumNumberOfTouches)
                this.touchend(event);
        }
    },
    
    touchmove: function(event)
    {
        var allTouches = event.allTouches();
        if (allTouches.length >= PanGestureRecognizer.MinimumNumberOfTouches &&
            allTouches.length <= PanGestureRecognizer.MaximumNumberOfTouches) {
            if (MobileSafari) {
                if (event.target != this.target) {
                    this.touchend(event);
                    return;
                }
            }
            event.preventDefault();
            if (this.beganRecognizer == false) {
                this.fire(this.target, GestureRecognizer.States.Began, this);
                this.beganRecognizer = true;
                this.translationOrigin = this.getEventPoint(event);
            } else {
                this.fire(this.target, GestureRecognizer.States.Changed, this);
                var p = this.getEventPoint(event);
                
                this.velocity.x = p.x - this.translation.x;
                this.velocity.y = p.y - this.translation.y;
                
                this.translation.x += p.x - this.translationOrigin.x;
                this.translation.y += p.y - this.translationOrigin.y;
            }
        }
    },
    
    touchend: function(event)
    {
        if (event.target == this.target || !MobileSafari) {
            GestureRecognizer.prototype.touchend.call(this, event);
            if (this.beganRecognizer) {
                this.fire(this.target, GestureRecognizer.States.Ended, this);
            } else {
                this.fire(this.target, GestureRecognizer.States.Failed, this);
            }
        }
    },
    
    gesturestart: function(event)
    {
        if (event.target == this.target) {
            var allTouches = event.allTouches();
            if (allTouches.length > PanGestureRecognizer.MaximumNumberOfTouches) {
                this.fire(this.target, GestureRecognizer.States.Failed, this);
            }
        }
    },
    
    reset: function()
    {
        this.beganRecognizer = false;
        this.translation = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
    },
    
    setTranslation: function(translation)
    {
        if (typeof translation.x != 'undefined' &&
            typeof translation.y != 'undefined') {
            this.translation = { x: translation.x, y: translation.y };
        }
    }
};
