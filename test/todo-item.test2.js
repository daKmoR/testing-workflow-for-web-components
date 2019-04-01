/* eslint-disable no-unused-expressions */
import { html, fixture, expect } from '@open-wc/testing';

import '../src/todo-item.js';

/**
 * @typedef {import('../src/todo-item.js').ToDoItem} ToDoItem
 */

describe('todo item', () => {
  it('is by default not disable, has an empty label and a priority of 1', async () => {
    const el = /** @type {ToDoItem} */ (await fixture('<todo-item></todo-item>'));
    expect(el.done).to.be.false;
    expect(el.label).to.equal('');
    expect(el.priority).to.equal(1);
  });

  it('allows all properties to be set on init', async () => {
    const el = /** @type {ToDoItem} */ (await fixture(html`
      <todo-item .label=${'foo'} .done=${true} .priority=${5}></todo-item>
    `));
    expect(el.done).to.be.true;
    expect(el.label).to.equal('foo');
    expect(el.priority).to.equal(5);
  });

  it('has 3 divs and a button', async () => {
    const el = /** @type {ToDoItem} */ (await fixture(html`
      <todo-item .label=${'foo'} .priority=${5}></todo-item>
    `));
    expect(el).shadowDom.to.equal(`
      <div>foo</div>
      <div>2</div>
    `);
  });
});
