/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit-element';

let __a11yInputId = 0;

export class A11yInput extends LitElement {
  static get properties() {
    return {
      label: { type: String },
    };
  }

  constructor() {
    super();
    __a11yInputId += 1;
    this.label = '';
    this.a11yId = __a11yInputId;
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

  render() {
    return html`
      <div>
        <slot name="label"></slot>
      </div>
      <div>
        <slot name="input"></slot>
      </div>
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
