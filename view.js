
module.exports = GestureView;

var GestureRecognizer = require("./gesture-recognizer");

function GestureView(elementOrId)
{
    this.element = (typeof elementOrId == 'string') ? document.getElementById(elementOrId) : elementOrId;
    this.scale = 1;
    this.rotation = this.x = this.y = this.z = 0;
    this.transform = {}; // forces mobile safari to set object as accelerated.
};

GestureView.prototype = {
    constructor: GestureView,

    set transform(obj) {
        this._x        = this._getDefined(obj.x,        this._x,        this.x);
        this._y        = this._getDefined(obj.y,        this._y,        this.y);
        this._z        = this._getDefined(obj.z,        this._z,        this.z);
        this._scale    = this._getDefined(obj.scale,    this._scale,    this.scale);
        this._rotation = this._getDefined(obj.rotation, this._rotation, this.rotation);
        this.element.style.webkitTransform = "translate3d(" +
            this._x + "px, " + this._y + "px, " + this._z + ") " +
            "scale(" + this._scale + ") " +
            "rotate(" + this._rotation + "deg)";
    },

    addGestureRecognizer: function(recognizer) {
        GestureRecognizer.addGestureRecognizer(this.element, recognizer);
        recognizer.view = this;
    },

    _getDefined: function() {
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] != "undefined") return arguments[i];
        }
        return arguments[arguments.length-1];
    }
};
