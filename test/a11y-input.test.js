/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';
import sinon from 'sinon';

import '../src/a11y-input.js';

/**
 * @typedef {import('../src/a11y-input.js').A11yInput} A11yInput
 */

describe('a11y input', () => {
  it('has by default an empty string as label', async () => {
    const el = /** @type {A11yInput} */ (await fixture('<a11y-input></a11y-input>'));
    expect(el.label).to.equal('');
  });

  it('can update its label', async () => {
    const el = /** @type {A11yInput} */ (await fixture('<a11y-input label="foo"></a11y-input>'));
    expect(el.label).to.equal('foo');
    el.label = 'bar';
    expect(el.label).to.equal('bar');
  });

  it('has a static shadowDom', async () => {
    const el = /** @type {A11yInput} */ (await fixture(html`
      <a11y-input></a11y-input>
    `));
    expect(el).shadowDom.to.equalSnapshot();
  });

  it('has 1 input and 1 label in light-dom', async () => {
    const el = /** @type {A11yInput} */ (await fixture(html`
      <a11y-input .label=${'foo'}></a11y-input>
    `));
    expect(el).lightDom.to.equal(`
      <label slot="label">foo</label>
      <input slot="input">
    `);
  });

  it('can set/get the input value directly via the custom element', async () => {
    const el = /** @type {A11yInput} */ (await fixture(html`
      <a11y-input .value=${'foo'}></a11y-input>
    `));
    expect(el.value).to.equal('foo');
    expect(el.querySelector('input').value).to.equal('foo');
  });

  // it('outputs "We like cats too :)" if the value is set to "cat"', async () => {
  //   const logSpy = sinon.spy(console, 'log');
  //   const el = /** @type {A11yInput} */ (await fixture(html`
  //     <a11y-input></a11y-input>
  //   `));

  //   el.value = 'cat';
  //   expect(logSpy.callCount).to.equal(1);
  //   expect(logSpy.calledWith('We like cats too :)')).to.be.true;

  //   // different values do NOT log
  //   el.value = 'foo';
  //   expect(logSpy.callCount).to.equal(1);

  //   el.value = 'cat';
  //   expect(logSpy.callCount).to.equal(2);
  // });

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
});
