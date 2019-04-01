import { LitElement, html, css } from 'lit-element';

/**
 * Object Data representation of ToDoItem
 *
 * @typedef {Object} ToDoItemData
 * @property {string} label
 * @property {number} priority
 * @property {Boolean} done
 */

/**
 * This is a ToDo Item
 */
export class ToDoItem extends LitElement {
  static get properties() {
    return {
      label: { type: String },
      priority: { type: Number },
      done: { type: Boolean },
    };
  }

  constructor() {
    super();
    /**
     * What you need to do
     */
    this.label = '';

    /**
     * How important is it? 1-10
     *
     * 1 = less important; 10 = very important
     */
    this.priority = 1;

    /**
     * Is this task done already?
     */
    this.done = false;
  }

  render() {
    return html`
      <div>${this.label}</div>
      <div>${this.priority}</div>
      <div><button>done</button></div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        color: #333;
        border: 1px solid #333;
      }
    `;
  }
}

customElements.define('todo-item', ToDoItem);
