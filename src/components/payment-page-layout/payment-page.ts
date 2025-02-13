import {html, LitElement, unsafeCSS} from 'lit-element';
import { customElement } from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/payment-page.css?inline";

@customElement('payment-page')
export class PaymentPage extends LitElement {

    static styles = unsafeCSS(style);

    render() {
        return html`
            <div class="paymentPageContent">
                
                
                
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'payment-page': PaymentPage;
    }
}
