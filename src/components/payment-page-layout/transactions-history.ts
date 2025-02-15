import {html, LitElement, unsafeCSS} from 'lit-element';
import { customElement } from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/transactions-history.css?inline";

@customElement('transactions-history')
export class TransactionsHistory extends LitElement {

    static styles = unsafeCSS(style);

    render() {
        return html`
            <div class="stepContent">
                <div class="spinner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="4" />
                        <path
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'transactions-history': TransactionsHistory;
    }
}
