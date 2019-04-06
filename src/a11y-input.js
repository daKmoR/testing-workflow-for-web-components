/* eslint-disable class-methods-use-this, no-console */
import { LitElement, html, css } from 'lit-element';

export class A11yInput extends LitElement {
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
    /** @type {HTMLLabelElement} */
    this.labelEl = null;
    /** @type {HTMLInputElement} */
    this.inputEl = null;
  }

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

  update(changedProperties) {
    super.update(changedProperties);
    if (changedProperties.has('value')) {
      if (this.value === 'cat') {
        console.log('We like cats too :)');
      }
      this.inputEl.value = this.value;
    }
  }

  render() {
    return html`
      <slot name="label"></slot>
      <slot name="input"></slot>
    `;
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

customElements.define('a11y-input', A11yInput);
