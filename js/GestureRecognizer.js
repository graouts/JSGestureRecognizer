
function GestureRecognizer()
{
    this._target = null;
}

GestureRecognizer.States = {
    Possible   : 'possible',
    Began      : 'began',
    Changed    : 'changed',
    Ended      : 'ended',
    Cancelled  : 'cancelled',
    Failed     : 'failed',
    Recognized : "ended"
};

GestureRecognizer.Events = {
    TouchStart     : 'touchstart',
    TouchMove      : 'touchmove',
    TouchEnd       : 'touchend',
    GestureStart   : 'gesturestart',
    GestureChange  : 'gesturechange',
    GestureEnd     : 'gestureend'
};

GestureRecognizer.addGestureRecognizer = function(target, gestureRecognizer) {
    gestureRecognizer.target = target;
}

GestureRecognizer.prototype = {
    constructor: GestureRecognizer,

    get target()
    {
        return this._target;
    },

    set target(target)
    {
        var target = (target.view) ? target.view : target;
        if (target !== null && this._target != target) {
            this._target = target;
            this.view = target;
            this.initRecognizer();
        }
    },

    initWithCallback: function(callback)
    {
        if (typeof callback == 'function')
            this.callback = callback;
        else
            throw new Error("Callback must be set otherwise this won't do anything!");
    },

    initRecognizer: function()
    {
        if (this._target === null)
            throw new Error("this._target is null, must be a DOM element.");

        this.reset();
        this.state = GestureRecognizer.States.Possible;

        this.touchmoveHandler = this.touchmove.bind(this);
        this.touchendHandler = this.touchend.bind(this);

        this.observe(this._target, GestureRecognizer.Events.TouchStart, this.touchstart.bind(this));
        this.observe(this._target, GestureRecognizer.States.Possible, this.possible.bind(this));
        this.observe(this._target, GestureRecognizer.States.Began, this.began.bind(this));
        this.observe(this._target, GestureRecognizer.States.Ended, this.ended.bind(this));
        this.observe(this._target, GestureRecognizer.States.Cancelled, this.cancelled.bind(this));
        this.observe(this._target, GestureRecognizer.States.Failed, this.failed.bind(this));
        this.observe(this._target, GestureRecognizer.States.Changed, this.changed.bind(this));
        
        this.gesturechangeHandler = this.gesturechange.bind(this);
        this.gestureendHandler = this.gestureend.bind(this);

        this.observe(this.target, GestureRecognizer.Events.TouchStart, this.gesturestart.bind(this));
    },

    reset: function()
    {
        // …
    },
  
    touchstart: function(event, obj)
    {
        if (this._target && event.target === this._target) {
            this.addObservers();
            this.fire(this._target, GestureRecognizer.States.Possible, this);
        }
    },
    
    touchmove: function(event)
    {
        // …
    },

    touchend: function(event)
    {
        // …
    },

    touchcancelled: function(event)
    {
        // …
    },

    possible: function(event, memo)
    {
        if (!event.memo)
            event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Possible;
            if (this.callback)
                this.callback(this);
        }
    },

    began: function(event, memo)
    {
        if (!event.memo)
            event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Began;
            if (this.callback)
                this.callback(this);
        }
    },

    ended: function(event, memo)
    {
        if (!event.memo)
            event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Ended;
            if (this.callback)
                this.callback(this);
            this.removeObservers();
            this.reset();
        }
    },
    
    cancelled: function(event, memo)
    {
        if (!event.memo)
            event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Cancelled;
            if (this.callback)
                this.callback(this);
            this.removeObservers();
            this.reset();
        }
    },
    
    failed: function(event, memo)
    {
        if (!event.memo)
            event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Failed;
            if (this.callback)
                this.callback(this);
            this.removeObservers();
            this.reset();
        }
    },
    
    changed: function(event, memo)
    {
        if (!event.memo) event.memo = memo;
        if (event.memo == this) {
            this.state = GestureRecognizer.States.Changed;
            if (this.callback)
                this.callback(this);
        }
    },
    
    addObservers: function()
    {
        this.observe(document, GestureRecognizer.Events.TouchMove, this.touchmoveHandler);
        this.observe(document, GestureRecognizer.Events.End, this.touchendHandler);
    },
    
    removeObservers: function()
    {
        this.stopObserving(document, GestureRecognizer.Events.TouchMove, this.touchmoveHandler);
        this.stopObserving(document, GestureRecognizer.Events.End, this.touchendHandler);
        this.stopObserving(document, GestureRecognizer.Events.GestureChange, this.gesturechangeHandler);
        this.stopObserving(document, GestureRecognizer.Events.GestureEnd, this.gestureendHandler);
    },
    
    fire: function(target, eventName, obj)
    {
        if (Framework.Prototype)
            Event.fire(target, eventName, obj);
        else if (Framework.jQuery)
            $(target).trigger(eventName, obj);
    },
    
    observe: function(target, eventName, handler)
    {
        if (Framework.Prototype)
            target.observe(eventName, handler);
        else if (Framework.jQuery)
            $(target).bind(eventName, handler);
    },
    
    stopObserving: function(target, eventName, handler)
    {
        if (Framework.Prototype)
            target.stopObserving(eventName, handler);
        else if (Framework.jQuery)
            $(target).unbind(eventName, handler);
    },
    
    getEventPoint: function(event)
    {
        if (MobileSafari)
            return { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
        if (Framework.Prototype) return Event.pointer(event);
        if (Framework.jQuery) return { x: event.pageX, y: event.pageY };
    }

    gesturestart: function(event)
    {
        if (this.target && event.target === this.target) {
            this.observe(document, GestureRecognizer.Events.GestureChange, this.gesturechangeHandler);
            this.observe(document, GestureRecognizer.Events.GestureEnd, this.gestureendHandler);
            this.fire(this.target, GestureRecognizer.States.Possible, this);
        }
    },

    gesturechange: function(event)
    {
        // …
    },

    gestureend: function(event)
    {
        if (this.target && event.target == this.target)
            this.fire(this.target, GestureRecognizer.States.Ended, this);
    }
};
