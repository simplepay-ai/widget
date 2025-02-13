import {html, LitElement, property, unsafeCSS} from 'lit-element';
import { customElement } from 'lit/decorators.js';
//@ts-ignore
import style from "../../../styles/widget-styles/error-step.css?inline";

@customElement('error-step')
export class ErrorStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({ type: String })
    title: string = '';

    @property({ type: String })
    text: string = '';

    render() {
        return html`
            <div class="stepContent">
                ${this.title ? html`<h2>${this.title}</h2>` : ''}
                ${this.text ? html`<p>${this.text}</p>` : ''}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'error-step': ErrorStep;
    }
}
