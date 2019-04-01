/* eslint-disable no-console */
import { LitElement, html, css } from 'lit-element';

/**
 * @typedef {import('./todo-item.js').ToDoItemData} ToDoItemData
 * @typedef {import('./todo-item.js').ToDoItem} ToDoItem
 */

import './todo-item.js';
import './a11y-input.js';

export class ToDoList extends LitElement {
  static get properties() {
    return {
      items: { type: Array },
    };
  }

  constructor() {
    super();
    /**
     * @type {ToDoItemData[]}
     */
    this.dataItems = [
      { label: 'Item 1', priority: 5, done: false },
      { label: 'Item 2', priority: 2, done: true },
      { label: 'Item 3', priority: 7, done: false },
    ];
  }

  render() {
    return html`
      <h1>To Do List Map</h1>
      <a11y-input label="Search"></a11y-input>
      ${this.dataItems.map(
        item => html`
          <todo-item .label=${item.label} .priority=${item.priority} .done=${item.done}></todo-item>
        `,
      )}
    `;
  }

  calculateStats() {
    const items = /** @type {ToDoItem[]} */ (Array.from(
      this.shadowRoot.querySelectorAll('todo-item'),
    ));

    let doneCounter = 0;
    let prioritySum = 0;
    items.forEach(item => {
      doneCounter += item.done ? 1 : 0;
      prioritySum += item.priority;
    });
    console.log('Done tasks', doneCounter);
    console.log('Average priority', prioritySum / items.length);
  }

  static get styles() {
    return css`
      :host {
        margin: 50px;
        text-align: center;
        min-height: 100px;
        display: block;
        padding: 20px;
        background: #fff;
        color: #333;
        position: relative;
      }
    `;
  }
}

customElements.define('todo-list', ToDoList);
