# Testing workflow for web-components
---
title: Testing workflow for web-components
published: false
description: Provide the best developer experience by showing awesome intellisense and adding types to your web components.
tags: webcomponents, javascript, type, openwc
---

Whenever you ship something to be used by others you take on a responsibilty.
Unfortunately not always is this responsibility taken care of.
One thing to make sure you take it on is to write tests.

No matter how small - no matter how simple there should be tests.
**Yes I know reality hit's hard and there will be many cases where that doesn't happen - but strife for it**

### Disclaimer
We are going to make a simple version of an accessible input.
Everything you see here is for illustration perposes only - so don't scream at me that you should not do it.
We do it so we can see all the places where our testing workflow can shine.

## Let's get started

After following https://open-wc.org/testing/ I have the basic setup up and and running.

Let's create `src/a11y-input.js`;
```
import { LitElement, html, css } from 'lit-element';

export class A11yInput extends LitElement {}

customElements.define('a11y-input', A11yInput);
```

and `test/a11y-input.test.js`;
```
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

That was quite easy let's up the game a little.

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
=> They are sort of markers for `lit-html` so it can do it's update work as efficently as possible.

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
  ✔ has by default an empty string as label
  ✔ has a static shadowDom
```

### How does shadowDom.to.equal() work?

It actually does a lot of work
1. It gets the innerHTML of the shadowRoot
2. Parses it (actually we let the browser do it - no library needed)
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

*yes that is sort of an anti-pattern however to allow for a11y it might be a real use case - anyways it's great for illustration perposes*

Now this leads to a certain problem - can you guess it?

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



