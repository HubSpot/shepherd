### Rollup/Webpack Based Builds

The latest versions of Rollup and Webpack support ES6 imports. We have an ES module
exported to `dist/js/shepherd.esm.js`. This is also specified as `"module"` in
`package.json`, which should allow you to import using standard ES import syntax.

i.e.

```js
import Shepherd from 'shepherd.js';
```

First create a new `Tour` instance for your tour:

```javascript
const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    classes: 'shadow-md bg-purple-dark',
    scrollTo: true
  }
});
```

The `defaultStepOptions` option allows you to specify any options which should be applied
to all this tour's steps by default.

Next, add your steps:

```javascript
tour.addStep({
  id: 'example-step',
  text: 'This step is attached to the bottom of the <code>.example-css-selector</code> element.',
  attachTo: {
    element: '.example-css-selector',
    on: 'bottom'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});
```

Finally, to start the tour, just call `start` on your `Tour` instance:

```javascript
tour.start();
```

If you need to remove a step from your tour, call `removeStep` on your `Tour` instance. If the step currently being displayed is the one you're removing, and there are steps left in the tour, then the first one will be shown, otherwise, the tour will be cancelled.

```javascript
tour.removeStep('example-step');
```

### API

#### Global Shepherd Object

Shepherd exposes a single object onto the window, `Shepherd`.

That global object fires several events to let you link up actions with events
occurring in _any_ tour:

##### Methods

- `Shepherd.on(eventName, handler, [context])`: Bind an event
- `Shepherd.off(eventName, [handler])`: Unbind an event
- `Shepherd.once(eventName, handler, [context])`: Bind just the next instance of an event

##### Events

The global Shepherd fires the following events whenever a `Tour` instance fires them.  It adds to the object passed to the
event handlers a `tour` key pointing to the instance which fired the event:

- `complete`
- `cancel`
- `hide`
- `show`
- `start`
- `active`
- `inactive`

For multiple events, you can use something like:

```javascript
['close', 'cancel'].forEach(event => shepherd.on(event, () => {
   // some code here
}));
```

##### Current Tour

The global `Shepherd` includes a property which is always set to the currently active tour, or null if there is no active tour:

- `Shepherd.activeTour`

#### Tour Instances

##### Creation

You create a `Tour` object for each tour you'd like to create.

Tour's constructor accepts a hash of options:

```javascript
const myTour = new Shepherd.Tour(options);
```

##### Tour Options

- `classPrefix`: The prefix to add to the `shepherd-enabled` and `shepherd-target` class names as well as the `data-shepherd-step-id`.
- `confirmCancel`: If true, will issue a `window.confirm` before cancelling
- `confirmCancelMessage`: The message to display in the confirm dialog
- `defaultStepOptions`: Default options for Steps created through `addStep`
- `exitOnEsc`: Exiting the tour with the escape key will be enabled unless this is explicitly set to `false`.
- `keyboardNavigation`: Navigating the tour via left and right arrow keys will be enabled unless this is explicitly set to `false`.
- `stepsContainer` An optional container element for the steps. If not set, the steps will be appended to `document.body`.
- `modalContainer` An optional container element for the modal. If not set, the modal will be appended to `document.body`.
- `steps`: An array of step options objects or Step instances to initialize the tour with.
- `tourName`: An optional "name" for the tour. This will be appended to the the tour's
dynamically generated `id` property -- which is also set on the `body` element as the `data-shepherd-active-tour` attribute whenever the tour becomes active.
- `useModalOverlay`: Whether or not steps should be placed above a darkened modal overlay. If true, the overlay will create an opening around the target element so that it can remain interactive.

##### Tour Methods

- `addStep(options)`: Creates a new Step object with options, and returns the `Step` instance it created. If the options hash doesn't include an `id`, one will be generated.
You can also pass an existing `Step` instance rather than `options`, but note that Shepherd does not support a Step being attached to multiple Tours.
- `addSteps([Steps])`: Add multiple steps to the tour
- `getById(id)`: Return a step with a specific id
- `isActive()`: Check if the tour is active
- `next()`: Advance to the next step, in the order they were added
- `back()`: Show the previous step, in the order they were added
- `cancel()`: Trigger cancel on the current step, hiding it without advancing
- `hide()`: Hide the current step
- `show([id])`: Show the step specified by id (if it's a string), or index (if it's a number) provided.  Defaults to the first step.
- `start()`: Show the first step and begin the tour
- `getCurrentStep()`: Returns the currently shown step
- `removeStep(id)`: Removes the step from the tour
- `on(eventName, handler, [context])`: Bind an event
- `off(eventName, [handler])`: Unbind an event
- `once(eventName, handler, [context])`: Bind just the next instance of an event

##### Tour Events

- `complete`: Triggered when the last step is advanced
- `cancel`
- `hide`
- `show`: Triggered with a hash of the `step` and the `previous` step
- `start`

Steps are instances of the Step object. They are generally created by the `Tour::addStep` method, which returns the `Step` instance it
created.

#### Steps

##### Step Options

- `text`: The text in the body of the step. It can be one of three types:
  - HTML string
  - `HTMLElement` object
  - `Function` to be executed when the step is built. It must return one the two options above.
- `title`: The step's title. It becomes an `h3` at the top of the step.
- `attachTo`: The element the step should be attached to on the page. An object with properties `element` and `on`.
  - `element`: An element selector string or a DOM element.
  - `on`: The optional direction to place the Popper tooltip relative to the element.
    - Possible string values: 'auto', 'auto-start', 'auto-end', 'top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'right', 'right-start', 'right-end', 'left', 'left-start', 'left-end'

```js
const new Step(tour, {
  attachTo: { element: '.some .selector-path', on: 'left' },
  ...moreOptions
});
```

If you don’t specify an attachTo the element will appear in the middle of the screen.
If you omit the `on` portion of `attachTo`, the element will still be highlighted, but the tooltip will appear
in the middle of the screen, without an arrow pointing to the target.
- `beforeShowPromise`: A function that returns a promise. When the promise resolves, the rest of the `show` code for
the step will execute. For example:
  ```javascript
  beforeShowPromise: function() {
    return new Promise(function(resolve) {
      $('#my-bootstrap-modal').on('shown.bs.modal', function () {
        resolve();
      });
    });
  },
  ```
- `canClickTarget` A boolean, that when set to false, will set `pointer-events: none` on the target
- `cancelIcon` Options for the cancel icon
  - `enabled` Should a cancel “✕” be shown in the header of the step?
  - `label` The label to add for `aria-label`
- `classes`: A string of extra classes to add to the step's content element.
- `buttons`: An array of buttons to add to the step. These will be rendered in a footer below the main body text. Each button in the array is an object of the format:
  - `text`: The HTML text of the button
  - `classes`: Extra classes to apply to the `<a>`
  - `secondary`: A boolean, that when true, adds a `shepherd-button-secondary` class to the button
  - `action`: A function executed when the button is clicked on.
   It is automatically bound to the `tour` the step is associated with, so things like `this.next` will
   work inside the action. You can use action to skip steps or navigate to specific steps, with something like:
   ```javascript
     action() {
       return this.show('some_step_name');
     }
   ```
- `advanceOn`: An action on the page which should advance shepherd to the next step.  It should be an object with a string `selector` and an `event` name.
For example: `{selector: '.some-element', event: 'click'}`.  It doesn't have to be an event inside the tour, it can be any event fired on any element on the page.  
You can also always manually advance the Tour by calling `myTour.next()`.
- `highlightClass`: An extra class to apply to the `attachTo` element when it is highlighted (that is, when its step is active). You can then target that selector in your CSS.
- `id`: The string to use as the `id` for the step. If an id is not passed one will be generated.
- `modalOverlayOpeningPadding`: An amount of padding to add around the modal overlay opening
- `modalOverlayOpeningRadius`: An amount of border radius to add around the modal overlay opening
- `popperOptions`: Extra options to pass to [Popper](https://popper.js.org/docs/v2/constructors/#options)
- `showOn`: A function that, when it returns true, will show the step. If it returns false, the step will be skipped.
- `scrollTo`: Should the element be scrolled to when this step is shown? If true, uses the default `scrollIntoView`, if an object, passes that object as the params to `scrollIntoView` i.e. `{behavior: 'smooth', block: 'center'}`
- `scrollToHandler`: A function that lets you override the default `scrollTo` behavior and define a custom action to do the scrolling,
and possibly other logic.
- `when`: You can define show, hide, etc events inside when. For example:
```javascript
when: {
  show: function() {
    window.scrollTo(0, 0);
  }
}
```

##### Step Methods

- `show()`: Show this step
- `hide()`: Hide this step
- `cancel()`: Hide this step and trigger the `cancel` event
- `complete()`: Hide this step and trigger the `complete` event
- `scrollTo()`: Scroll to this step's element
- `isOpen()`: Returns true if the step is currently shown
- `destroy()`: Remove the element
- `on(eventName, handler, [context])`: Bind an event
- `off(eventName, [handler])`: Unbind an event
- `once(eventName, handler, [context])`: Bind just the next instance of an event

##### Step Events

- `before-show`
- `show`
- `before-hide`
- `hide`
- `complete`
- `cancel`
- `destroy`

Please note that `complete` and `cancel` are only ever triggered if you call the associated methods in your code.

### Advancing on Actions

You can use the `advanceOn` option, or the Next button, to advance steps.  If you would like however to have a step advance on a
complex user action, you can do the following:

```javascript
const myStep = myTour.addStep(options);

yourApp.on('some-event', () => {
  if (myStep.isOpen()){
    Shepherd.activeTour.next();
  }
});
```

### 🔼 Displaying Arrows

By default, Shepherd will generate and position an "arrow" element that points to the target
of a step. This is done by setting the `arrow` option to `true` on each ``Step.options` &mdash; but you can disable the arrow manually by setting it to false:

```js
myTour.addStep({
  id: 'Step 1',
  arrow: false
});
```

Furthermore, while Shepherd provides some basic arrow styling, you can style it as you wish by targeting the `.shepherd-arrow` element.
