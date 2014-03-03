
module.exports = TapGestureRecognizer;

var GestureRecognizer = require("./gesture-recognizer");

function TapGestureRecognizer()
{
    GestureRecognizer.call(this);
}

TapGestureRecognizer.NumberOfTapsRequired = 1;
TapGestureRecognizer.NumberOfTouchesRequired = 1;
TapGestureRecognizer.MoveTolerance = 40;
TapGestureRecognizer.TapTimeout = 500;

TapGestureRecognizer.prototype = {
    constructor: TapGestureRecognizer,
    __proto__: GestureRecognizer.prototype,
  
    touchstart: function(event)
    {
        if (event.target == this.target) {
            event.preventDefault();
            GestureRecognizer.prototype.touchstart.call(this, event);
            this.numberOfTouches = event.allTouches().length;
            this.distance = 0;
            this.translationOrigin = this.getEventPoint(event);
        }
    },
    
    touchmove: function(event)
    {
        // move events fire even if there's no move on desktop browsers
        // the idea of a "tap" with mouse should ignore movement anyway...
        if (event.target == this.target && !GestureRecognizer.SupportsTouches) {
            event.preventDefault();
            this.removeObservers();
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
        var p = this.getEventPoint(event);
        var dx = p.x - this.translationOrigin.x,
            dy = p.y - this.translationOrigin.y;
        this.distance += Math.sqrt(dx*dx + dy*dy);
        if (this.distance > TapGestureRecognizer.MoveTolerance) {
            this.touchend();
        }
    },
    
    touchend: function(event)
    {
        if (event && event.target == this.target) {
            if (this.numberOfTouches == TapGestureRecognizer.NumberOfTouchesRequired) {
                GestureRecognizer.prototype.touchend.call(this, event);
                this.taps++;
                if (this.recognizerTimer) {
                    window.clearTimeout(this.recognizerTimer);
                    this.recognizerTimer = null;
                }
                this.recognizerTimer = window.setTimeout(function() {
                    if (this.taps == TapGestureRecognizer.NumberOfTapsRequired) {
                        this.fire(this.target, GestureRecognizer.States.Recognized, this);
                    } else {
                        this.fire(this.target, GestureRecognizer.States.Failed, this);
                    }
                }.bind(this), TapGestureRecognizer.TapTimeout);
            } else {
              this.fire(this.target, GestureRecognizer.States.Failed, this);
            }
        } else {
            this.fire(this.target, GestureRecognizer.States.Failed, this);
        }
    },
    
    reset: function()
    {
      this.taps = 0;
      this.recognizerTimer = null;
    }
};
