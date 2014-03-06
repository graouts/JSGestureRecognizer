# gesture-recognizer

A JavaScript implementation of the [UIKit gesture recognizers](https://developer.apple.com/library/ios/documentation/EventHandling/Conceptual/EventHandlingiPhoneOS/GestureRecognizer_basics/GestureRecognizer_basics.html#//apple_ref/doc/uid/TP40009541-CH2-SW2) aiming to bring the same system and features available to iOS developers to Web developers targeting devices with multi-touch input.

## Installation

  Install with [component(1)](http://component.io):

    $ component install graouts/gesture-recognizer

## Usage

The library introduces a `GestureRecognizer` abstract class and six concrete subclasses: `LongPressGestureRecognizer`, `PanGestureRecognizer`, `PinchGestureRecognizer`, `RotationGestureRecognizer`, `SwipeGestureRecognizer`, `TapGestureRecognizer`, each tracking a specific kind of gesture. A gesture recognizer evolves through various states as it tracks touches and as the recognizer's `state` changes, `statechange` events are dispatched.

Once you've created a gesture recognizer, you typically listen to `statechange` events like so:

```javascript
recognizer.addEventListener("statechange", function(event) {
    // do something based on `event.target.state`
});
```

And then you typically attach it to a target DOM element:

```javascript
GestureRecognizer.addGestureRecognizer(someElement, recognizer);
```

A utility class `GestureView` is also made available to wrap an element and eases setting its transform as illustrated across the examples below.

### TapGestureRecognizer

This gesture recognizer allows you to identify a quick tap, or multiple quick taps when you set `numberOfTapsRequired` to a value higher than the default value `1`. You can customize the number of fingers used for the taps with `numberOfTouchesRequired`.

```javascript
var GestureRecognizer    = require("gesture-recognizer"),
    TapGestureRecognizer = require("gesture-recognizer/tap");

var recognizer = new TapGestureRecognizer;
recognizer.numberOfTapsRequired = 3;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Recognized)
        console.log("tapped!");
});

GestureRecognizer.addGestureRecognizer(someElement, recognizer);
```

### LongPressGestureRecognizer

This gesture recognizer allows you to identify a long stationary press. You can customize the expected duration of the press with `minimumPressDuration` as well as the number of fingers used for the press with `numberOfTouchesRequired`.

```javascript
var GestureRecognizer          = require("gesture-recognizer"),
    LongPressGestureRecognizer = require("gesture-recognizer/long-press");

var recognizer = new LongPressGestureRecognizer;
recognizer.maximumNumberOfTouches = 1;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Recognized)
        console.log("Long press!");
});

GestureRecognizer.addGestureRecognizer(someElement, recognizer);
```

### SwipeGestureRecognizer

This gesture recognizer allows you to identify a linear swipe gesture. You can customize the allowed `direction` for the swipe as a bit-mask as well as the number of fingers used for the swipe with `numberOfTouchesRequired`. 

```javascript
var GestureRecognizer      = require("gesture-recognizer"),
    SwipeGestureRecognizer = require("gesture-recognizer/swipe");

var recognizer = new SwipeGestureRecognizer;
recognizer.direction = SwipeGestureRecognizer.Directions.Right | SwipeGestureRecognizer.Directions.Left;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Recognized)
        console.log("Swiped");
});

GestureRecognizer.addGestureRecognizer(someElement, recognizer);
```

### PanGestureRecognizer

This gesture recognizer allows you to track where the user's finger travels on the screen. You can set both the `minimumNumberOfTouches` and `maximumNumberOfTouches` for the interaction. Each time the `statechange` fires, you can check the `velocity` for the user interaction. This example shows a way to make an element follow the user's finger at all times.

```javascript
var GestureRecognizer    = require("gesture-recognizer"),
    PanGestureRecognizer = require("gesture-recognizer/pan"),
    GestureView          = require("gesture-recognizer/view"),
    Point                = require("geometry").Point;

var translation = new Point;

var recognizer = new PanGestureRecognizer;
recognizer.maximumNumberOfTouches = 1;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Ended || recognizer.state === GestureRecognizer.States.Changed) {
        translation.x += recognizer.translation.x;
        translation.y += recognizer.translation.y;
        recognizer.view.transform = translation;
        recognizer.translation = new Point;
    }
});

window.addEventListener("DOMContentLoaded", function() {
    new GestureView("target").addGestureRecognizer(recognizer);
});
```

### PinchGestureRecognizer

This gesture recognizer allows you to identify a two-finger pinch gesture, usually used to scale an element up and down and possibly bring the element full-screen during the gesture. Each time the `statechange` fires, you can check the `velocity` for the user interaction.

```javascript
var GestureRecognizer      = require("gesture-recognizer"),
    PinchGestureRecognizer = require("gesture-recognizer/pinch"),
    GestureView            = require("gesture-recognizer/view");

var scale = 1;

var recognizer = new PinchGestureRecognizer;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Ended || recognizer.state === GestureRecognizer.States.Changed) {
        scale *= recognizer.scale;
        recognizer.view.transform = { scale: scale };
        recognizer.scale = 1;
    }
});

window.addEventListener("DOMContentLoaded", function() {
    new GestureView("target").addGestureRecognizer(recognizer);
});
```

### RotationGestureRecognizer

This gesture recognizer allows you to identify a two-finger rotation gesture, usually used to rotate an element around its center. Each time the `statechange` fires, you can check the `velocity` for the user interaction.

```javascript
var GestureRecognizer         = require("gesture-recognizer"),
    RotationGestureRecognizer = require("gesture-recognizer/rotation"),
    GestureView               = require("gesture-recognizer/view");

var rotation = 0;

var recognizer = new RotationGestureRecognizer;
recognizer.addEventListener("statechange", function(event) {
    if (recognizer.state === GestureRecognizer.States.Ended || recognizer.state === GestureRecognizer.States.Changed) {
        rotation += recognizer.rotation;
        recognizer.view.transform = { rotation: rotation };
        recognizer.rotation = 0;
    }
});

window.addEventListener("DOMContentLoaded", function() {
    new GestureView("target").addGestureRecognizer(recognizer);
});
```

## Authors

This project is a fork of [JSGestureRecognizer](https://github.com/mud/JSGestureRecognizer), originally created by [Takashi Okamoto](http://mud.mitplw.com/), maintained by [Antoine Quint](https://github.com/graouts/).
