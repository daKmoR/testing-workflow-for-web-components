---
title: Testing workflow for web-components
published: false
description: Testing and debugging your web component is an important skill to give you the confidence the code you share is production ready.
tags: webcomponents, javascript, testing, karma
---

Whenever you ship something to be used by others you take on a responsibility.
Unfortunately not always is this responsibility taken care of.
One thing to make sure you take it on is to write tests.

No matter how small - no matter how simple there should be tests.
*Yes I know reality hit's hard and there will be many cases where that doesn't happen - but strife for it*

### Disclaimer
We are going to make a simple version of an accessible input.
Everything you see here is for illustration purposes only - so don't scream at me that you should not do it.
We do it so we can see all the places where our testing workflow can shine.

If you wanna play along - all the code is on [github](https://github.com/daKmoR/testing-workflow-for-web-components).

## Let's get started

After following [https://open-wc.org/testing/](https://open-wc.org/testing/) you should have the basic setup up and running.

Let's create `src/a11y-input.js`;
```js
import { LitElement, html, css } from 'lit-element';

export class A11yInput extends LitElement {}

customElements.define('a11y-input', A11yInput);
```

and `test/a11y-input.test.js`;
```js
/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';

import '../src/a11y-input.js';

/**
 * @typedef {import('../src/a11y-input.js').A11yInput} A11yInput
 */

describe('a11y input', () => {
  it('has by default an empty string as label', async () => {
    const el = /** @type {A11yInput} */ (await fixture('<a11y-input></a11y-input>'));
    expect(el.label).to.equal('');
  });
});
```

Now onward with the tests - execute `npm run test`.
```
SUMMARY:
✔ 0 tests completed
✖ 1 test failed

FAILED TESTS:
  a11y input
    ✖ has by default an empty string as label
      HeadlessChrome 73.0.3683 (Windows 10.0.0)
    AssertionError: expected undefined to equal ''

      + expected - actual

      -[undefined]
      +""
```

Awesome - just an expected to fail test :)

Let's go into watch mode `npm run test:watch`

![01-watch-mode-intro](https://github.com/daKmoR/testing-workflow-for-web-components/raw/master/images/01-watch-mode-intro.gif)

That was quite easy lets up the game a little.

### Adding a test for shadow dom

```js
it('has a static shadowDom', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input></a11y-input>
  `));
  expect(el.shadowRoot.innerHTML).to.equal(`
    <slot name="label"></slot>
    <slot name="input"></slot>
  `);
});
```

As expected we get
```
✖ has a static shadowDom
AssertionError: expected '' to equal '\n      <slot name="label"></slot>\n      <slot name="input"></slot>\n    '

  + expected - actual

  +
  +      <slot name="label"></slot>
  +      <slot name="input"></slot>
  +
```

Add the implementation
```js
render() {
  return html`
    <slot name="label"></slot>
    <slot name="input"></slot>
  `;
}
```

Test should be green... but it's not :/
```
✖ has a static shadowDom
AssertionError: expected '<!---->\n      <slot name="label"></slot>\n      <slot name="input"></slot>\n    <!---->' to equal '\n        <slot name="label"></slot>\n        <slot name="input"></slot>\n    '

  + expected - actual

  -<!---->
  -      <slot name="label"></slot>
  -      <slot name="input"></slot>
  -    <!---->
  +
  +        <slot name="label"></slot>
  +        <slot name="input"></slot>
  +
```

What are those empty comment `<!---->` tags?
=> They are sort of markers for `lit-html` so it can do its update work as efficiently as possible.

Do we really need to match the exact same indentation in code and test?
=> Jup if you use innerHTML and equals then it's "just" a string compare so it will need to be a perfect match.

**@open-wc/chai helper to the rescue**

If we are using `@open-wc/testing` then it automatically loads a specific plugin for this for us.
So let's use it :muscle:

```js
// old:
expect(el.shadowRoot.innerHTML).to.equal(`...`);

// new:
expect(el).shadowDom.to.equal(`
  <slot name="label"></slot>
  <slot name="input"></slot>
`);
```

Bam :tada:

```
a11y input
  ✔ has by default an empty string as a label
  ✔ has a static shadowDom
```

### How does shadowDom.to.equal() work?

It actually does a lot of work
1. It gets the innerHTML of the shadowRoot
2. Parses it (actually, we let the browser do it - no library needed)
3. Normalizes it (potentially every tag/property on its own line)
4. It does 2 + 3 for the expected html string
5. Pass both normalizes dom string on to the default chai compare
6. It will show/group differences in a nice way

If you wanna know more please check out [semantic-dom-diff](https://open-wc.org/testing/semantic-dom-diff.html).

### Test the lightDom

We can do exactly the same thing with the light dom.
E.g. the dom which will be provided by our user or we render as well.

```js
it('has 1 input and 1 label in light-dom', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input .label=${'foo'}></a11y-input>
  `));
  expect(el).lightDom.to.equal(`
    <label slot="label">foo</label>
    <input slot="input">
  `);
});
```

And let's implement it.

```js
connectedCallback() {
  super.connectedCallback();
  this.labelEl = document.createElement('label');
  this.labelEl.innerText = this.label;
  this.labelEl.setAttribute('slot', 'label');
  this.appendChild(this.labelEl);

  this.inputEl = document.createElement('input');
  this.inputEl.setAttribute('slot', 'input');
  this.appendChild(this.inputEl);
}
```

*yes that is sort of an anti-pattern however to allow for a11y it might be a real use case - anyways it's great for illustration purposes*

Now, this leads to a certain problem - can you guess it?

### My Filter App

So now that we have a basic a11y input let's use it in our application.

Again we start with a skeleton `src/my-app.js`
```js
/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit-element';

export class MyApp extends LitElement {}

customElements.define('my-app', MyApp);
```

tests `test/my-app.test.js`;
```js
/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';

import '../src/my-app.js';

/**
 * @typedef {import('../src/my-app.js').MyApp} MyApp
 */

describe('My Filter App', () => {
  it('has a heading and a search field', async () => {
    const el = /** @type {MyApp} */ (await fixture(html`
      <my-app .label=${'foo'}></my-app>
    `));
    expect(el).shadowDom.to.equal(`
      <h1>My Filter App</h1>
      <a11y-input></a11y-input>
    `);
  });
});
```

and then we fill
```js
render() {
  return html`
    <h1>My Filter App</h1>
    <a11y-input></a11y-input>
  `;
}
```

and oh no... that should be green...

```
SUMMARY:
✔ 3 tests completed
✖ 1 test failed

FAILED TESTS:
  My Filter App
    ✖ has a heading and a search field
    AssertionError: expected '<h1>\n  My Filter App\n</h1>\n<a11y-input>\n  <label slot="label">\n  </label>\n  <input slot="input">\n</a11y-input>\n' to equal '<h1>\n  My Filter App\n</h1>\n<a11y-input>\n</a11y-input>\n'

      + expected - actual

       <h1>
         My Filter App
       </h1>
       <a11y-input>
      -  <label slot="label">
      -  </label>
      -  <input slot="input">
       </a11y-input>
```

So I'm only interested in `a11y-input` not in its implementation detail.
As an app developer, I'm now a little unlucky as this element "plays" in my domain. preposterous!
After some investigation I conclude there are very valid reasons for a11y input to do what it does.
Now how can I test it?

Luckily `.shadowDom` has another ace up its sleeve.
As it allows us to ignore certain dom parts.

```js
expect(el).shadowDom.to.equal(
  `
  <h1>My Filter App</h1>
  <a11y-input></a11y-input>
`,
  { ignoreChildren: ['a11y-input'] },
);
```

There is
- ignoreChildren
- ignoreTags
- ignoreAttributes (globally or for specific tags)

For more details please see [semantic-dom-diff](https://open-wc.org/testing/semantic-dom-diff.html).

### Code coverage

Another metric we get when we do testing is code coverage.
So how can we get it and what does it mean?
A simple `npm run test` is all we need and you will get the following:

```
=============================== Coverage summary ===============================
Statements   : 100% ( 15/15 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 5/5 )
Lines        : 100% ( 15/15 )
================================================================================
```

which is already pretty neat.

So let's go the other way and add code to `src/a11y-input.js` before adding a test. Let's say we want to access the value of our input directly via our custom element and whenever its value is 'cat' we want to log something.

```js
get value() {
  return this.inputEl.value;
}

set value(newValue) {
  if (newValue === 'cat') {
    console.log('We like cats too :)');
  }
  this.inputEl.value = newValue;
}
```

It's a vastly different result
```
SUMMARY:
✔ 4 tests completed
TOTAL: 4 SUCCESS

=============================== Coverage summary ===============================
Statements   : 81.82% ( 18/22 )
Branches     : 0% ( 0/2 )
Functions    : 75% ( 6/8 )
Lines        : 81.82% ( 18/22 )
================================================================================
06 04 2019 10:40:45.380:ERROR [reporter.coverage-istanbul]: Coverage for statements (81.82%) does not meet global threshold (90%)
06 04 2019 10:40:45.381:ERROR [reporter.coverage-istanbul]: Coverage for lines (81.82%) does not meet global threshold (90%)
06 04 2019 10:40:45.381:ERROR [reporter.coverage-istanbul]: Coverage for branches (0%) does not meet global threshold (90%)
06 04 2019 10:40:45.381:ERROR [reporter.coverage-istanbul]: Coverage for functions (75%) does not meet global threshold (90%)
```

So first of our coverage is way lower than before and our command even fails although all tests run successfully.
Apparently, there is a 90% limit on what your code coverage should be.

So let's add a test
```js
it('can set/get the input value directly via the custom element', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input .value=${'foo'}></a11y-input>
  `));
  expect(el.value).to.equal('foo');
});
```

uh oh :scream:
```
FAILED TESTS:
  a11y input
    ✖ can set/get the input value directly via the custom element
    TypeError: Cannot set property 'value' of null        at HTMLElement.set value [as value]
    // ... => long error stack
```

That seems to be too tough to just figure out in my head I need to see some actual nodes and expect them in the browser.

### Debugging in the browser

- be sure you started with `npm run test:watch`
- visit [http://localhost:9876/debug.html](http://localhost:9876/debug.html)


You should see something like this
![02-debugging-in-browser](https://github.com/daKmoR/testing-workflow-for-web-components/raw/master/images/02-debugging-in-browser.png)

And you can click on that circled play button to only run one individual test.

So let's open the Chrome Dev Tools (F12) and put a debugger in the code.

```js
it('can set/get the input value directly via the custom element', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input .value=${'foo'}></a11y-input>
  `));
  debugger;
  expect(el.value).to.equal('foo');
});
```

dang.. the error happens even before...

```js
set value(newValue) {
  debugger;
```

ok let's see what we have there
```js
// console.log(this);
<a11y-input>
  #shadow-root (open)
</a11y-input>
```

ahh so there we have it - the shadow dom is not yet rendered when the setter is called.
Let's be safe

```js
set value(newValue) {
  if (newValue === 'cat') {
    console.log('We like cats too :)');
  }
  if (this.inputEl) {
    this.inputEl.value = newValue;
  }
}
```

ok now the setter doesn't break anymore but we still have
```
✖ can set/get the input value directly via the custom element
AssertionError: expected '' to equal 'foo'
```

Ok, we need a change of tactic :thinking:
- add it as a separate property
- sync it when needed

```js
static get properties() {
  return {
    label: { type: String },
    value: { type: String },
  };
}

constructor() {
  super();
  this.label = '';
  this.value = '';
  // ...
}

update(changedProperties) {
  super.update(changedProperties);
  if (changedProperties.has('value')) {
    if (this.value === 'cat') {
      console.log('We like cats too :)');
    }
    this.inputEl.value = this.value;
  }
}
```

woow we are finally back in business :tada:

### Back to coverage

With this added test we made progress.

```
=============================== Coverage summary ===============================
Statements   : 95.83% ( 23/24 )
Branches     : 50% ( 2/4 )
Functions    : 100% ( 7/7 )
Lines        : 95.83% ( 23/24 )
================================================================================
06 04 2019 13:18:54.902:ERROR [reporter.coverage-istanbul]: Coverage for branches (50%) does not meet global threshold (90%)
```

However we are still not fully there - the question is why?

To find out open `coverage/index.html` in your browser => no web server needed just drag the file into your browser.

You will see something like this

![03-coverage-overview](https://github.com/daKmoR/testing-workflow-for-web-components/raw/master/images/03-coverage-overview.png)

Once you click on `a11y-input.js` you get a line by line info how often they got executed.
So we can immediately see which lines are not executed yet by our tests.

![04-coverage-line-by-line](https://github.com/daKmoR/testing-workflow-for-web-components/raw/master/images/04-coverage-line-by-line.png)

So let's add a test for that
```js
it('outputs "We like cats too :)" if the value is "cat"', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input .value=${'cat'}></a11y-input>
  `));
  // somehow check that console.log was called
});
```

```
=============================== Coverage summary ===============================
Statements   : 100% ( 24/24 )
Branches     : 75% ( 3/4 )
Functions    : 100% ( 7/7 )
Lines        : 100% ( 24/24 )
================================================================================
```

With that, we are back at 100% on statements but we still have something missing on branches.
Let's see why?

![05-coverage-line-by-line-else](https://github.com/daKmoR/testing-workflow-for-web-components/raw/master/images/05-coverage-line-by-line-else.png)

This `E` means `else path not taken`.
So whenever the function `update` gets called there is always a property `value` in the changedProperties.

We have `label` as well so it's a good idea to test it. :+1:

```js
it('can update its label', async () => {
  const el = /** @type {A11yInput} */ (await fixture('<a11y-input label="foo"></a11y-input>'));
  expect(el.label).to.equal('foo');
  el.label = 'bar';
  expect(el.label).to.equal('bar');
});
```

boom :muscle:

```
=============================== Coverage summary ===============================
Statements   : 100% ( 24/24 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 7/7 )
Lines        : 100% ( 24/24 )
================================================================================
```

But wait we didn't even finish the test above it still has
```js
  // somehow check that console.log was called
```

#### How come we have 100% test coverage?

Lets first try to understand how code coverage work :thinking:
The way code coverage gets measured is by applying a form of `instrumentation`.
In short, before our code is executed it gets changed (`instrumented`) and it behaves something like this:

**Note:** This is a super simplified version to show the concept
```js
if (this.value === 'cat') {
  console.log('We like cats too :)');
}

// becomes something like this (psoido code)
__instrumented['functionUpdate'] += 1;
if (this.value === 'cat') {
  __instrumented['functionUpdateBranch1yes'] += 1;
  console.log('We like cats too :)');
} else {
  __instrumented['functionUpdateBranch1no'] += 1;
}
```

Basically, your code gets littered with many many flags.
Based on which flags are set you can create a statistic.

So 100% test coverage only means that every line you have in your code was executed at least once after all your tests finished.
It does NOT mean that you tested everything or if you are expecting the correct things.
You should see it as a tool that can give you guidance and help on spotting not executed lines of code in your tests.

### Spying on code

If you want to check how often a function gets called or with which parameters then it's called spying.
I would recommend [sinon](https://sinonjs.org/) for it.

```bash
npm i -D sinon
```

Let's write a test using it
```js
import sinon from 'sinon';

it('outputs "We like cats too :)" if the value is set to "cat"', async () => {
  const logSpy = sinon.spy(console, 'log');
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input></a11y-input>
  `));

  el.value = 'cat';
  expect(logSpy.callCount).to.equal(1);
});
```

o oh... it fails
```
AssertionError: expected 0 to equal 1
```

After some research, it basically comes down testing `console.log` is nasty and it should be better to refactor the code to a custom log function.

Sure let's do that :)

```js
update(changedProperties) {
  super.update(changedProperties);
  if (changedProperties.has('value')) {
    if (this.value === 'cat') {
      this.log('We like cats too :)');
    }
    this.inputEl.value = this.value;
  }
}

log(msg) {
  console.log(msg);
}
```

Now we also no longer need to check for a global object - sweet :hugs:

```js
it('logs "We like cats too :)" if the value is set to "cat"', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input></a11y-input>
  `));
  const logSpy = sinon.spy(el, 'log');

  el.value = 'cat';
  expect(logSpy.callCount).to.equal(1);
});
```

Still the same error => let's debug... boohoo apparently `update` is already patched and async.

There seems to be no public API to enable sync logging for properties.
Let's create an issue for it https://github.com/Polymer/lit-element/issues/643.

For now apparently, the only way is to rely on a *private* api. :see_no_evil:
Also, we needed to move the value sync to `updated` so it gets executed after every dom render.

```js
_requestUpdate(name, oldValue) {
  super._requestUpdate(name, oldValue);
  if (name === 'value') {
    if (this.value === 'cat') {
      this.log('We like cats too :)');
    }
  }
}

updated(changedProperties) {
  super.updated(changedProperties);
  if (changedProperties.has('value')) {
    this.inputEl.value = this.value;
  }
}
```

and here is the updated test for the logging
```js
it('logs "We like cats too :)" if the value is set to "cat"', async () => {
  const el = /** @type {A11yInput} */ (await fixture(html`
    <a11y-input></a11y-input>
  `));
  const logSpy = sinon.spy(el, 'log');

  el.value = 'cat';
  expect(logSpy.callCount).to.equal(1);
  expect(logSpy.calledWith('We like cats too :)')).to.be.true;

  // different values do NOT log
  el.value = 'foo';
  expect(logSpy.callCount).to.equal(1);

  el.value = 'cat';
  expect(logSpy.callCount).to.equal(2);
});
```

wow, that was a little tougher than expected but we did it :muscle:

```
SUMMARY:
✔ 7 tests completed
TOTAL: 7 SUCCESS
```

### Run it bare bone

The nice thing with everything we proposed so far is that is fully es module and does need no transpilation (except bare modules).
So just by creating a `test/index.html`.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="../node_modules/mocha/mocha.css" rel="stylesheet" />
  <script src="../node_modules/mocha/mocha.js"></script>
  <script src="../node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js"></script>
</head>
<body>
  <div id="mocha"></div>
  <script>
    mocha.setup('bdd');
  </script>

  <script type="module">
    import './a11y-input.test.js';
    import './my-app.test.js';

    mocha.checkLeaks();
    mocha.run();
  </script>
</body>
</html>
```

and opening it via `owc-dev-server` in chrome will work perfectly fine.
e.g. the code works without `webpack` or `karma` - sweet :hugs:

### Do the cross-browser thing

We now feel pretty comfortable with our web component just one more step - test it in all the browsers.

If you didn't setup Browserstack before do it now - here is the link again - [https://open-wc.org/testing/](https://open-wc.org/testing/).

So let's just run it
```
npm run test:bs
```

uh yeah that works nicely :hugs:

```
SUMMARY:
✔ 42 tests completed
TOTAL: 42 SUCCESS
```

If there are failing tests it will only them in the summary with the specific browsers that had the problem.
```
SUMMARY:
✔ 40 tests completed
✖ 2 tests failed

FAILED TESTS:
  a11y input
    ✖ has a static shadowDom
      Firefox 64.0.0 (Windows 10.0.0)
      Safari 12.0.0 (Mac OS X 10.14.0)
    expected '<slot name="label">\n</slot>\n<slot name="input">\n</slot>\n<style>\n</style>\n' to equal '<slot name="label">\n</slot>\n<slot name="input">\n</slot>\n'

      + expected - actual

       <slot name="label">
       </slot>
       <slot name="input">
       </slot>
      -<style>
      -</style>
```

If you need to debug a particular browser:
- `npm run test:legacy:watch`
- visit [http://localhost:9876/debug.html](http://localhost:9876/debug.html) with that browser (be it locally or via browserstack)
- select a specific test (or use it.only in code)
- start debugging

Also if you want to adjust the browser that gets tested you can adjust your `karma.bs.config.js`.

For example, if you want to add the `Firefox ESR` to your list.

```js
module.exports = config => {
  config.set(
    merge(bsSettings(config), createBaseConfig(config), {
      browserStack: {
        project: 'testing-workflow-for-web-components',
      },
      browsers: [
        'bs_win10_firefox_ESR',
      ],
      // define browsers
      // https://www.browserstack.com/automate/capabilities
      customLaunchers: {
        bs_win10_firefox_ESR: {
          base: 'BrowserStack',
          browser: 'Firefox',
          browser_version: '60',
          os: 'Windows',
          os_version: '10',
        },
      },
    }),
  );

  return config;
};
```

Or maybe you want to test only 2 specific browsers?

```js
merge.strategy({
  browsers: 'replace',
})(bsSettings(config), createBaseConfig(config), {
  browserStack: {
    project: 'testing-workflow-for-web-components',
  },
  browsers: [
    'bs_win10_ie_11',
    'bs_win10_firefox_ESR',
  ],
}),
```

**Note:** This uses the [webpack merge strategies](https://github.com/survivejs/webpack-merge#merging-with-strategies) replace.

## Quick recap
- Be sure to write lots of tests if you want to
- Try to keep your code coverage high (however, it does not need to be 100%)
- Debug in the browser via `npm run test:watch` for legacy browser use `npm run test:legacy.watch`

## What's next?
- Run the tests in your CI (works perfectly well together with browserstack)

Follow me on [Twitter](https://twitter.com/daKmoR).
If you have any interest in web component make sure to check out [open-wc.org](https://open-wc.org).
