import {html, LitElement, property, unsafeCSS} from 'lit-element';
import { customElement } from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/error-step-payment-page.css?inline";

@customElement('error-step-payment-page')
export class ErrorStepPaymentPage extends LitElement {

    static styles = unsafeCSS(style);

    @property({ type: String })
    title: string = '';

    @property({ type: String })
    text: string = '';

    render() {
        return html`
            <div class="stepContent">
                <div class="errorWrapper">
                    ${this.title ? html`<h2>${this.title}</h2>` : ''}
                    ${this.text ? html`<p>${this.text}</p>` : ''}
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'error-step-payment-page': ErrorStepPaymentPage;
    }
}
