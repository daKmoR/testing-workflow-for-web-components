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

  it('has a static shadowDom', async () => {
    const el = /** @type {A11yInput} */ (await fixture(html`
      <a11y-input></a11y-input>
    `));
    expect(el).shadowDom.to.equal(`
      <slot name="label"></slot>
      <slot name="input"></slot>
    `);
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
});
