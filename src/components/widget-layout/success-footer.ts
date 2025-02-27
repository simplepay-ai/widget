import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {Invoice} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../../styles/widget-styles/success-footer.css?inline";
import {I18n} from "i18n-js";

@customElement('success-footer')
export class SuccessFooter extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: String})
    backButtonUrl: string = '';

    @property({attribute: false, type: String})
    leftPaid: string = '';

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
    }

    async connectedCallback() {
        super.connectedCallback();

        window.addEventListener('localeChanged', this._onLocaleChanged);

        if (this.invoice) {
            const leftNumber = Number(this.invoice.total) - Number(this.invoice.paid);
            this.leftPaid = (leftNumber < 0) ? '0' : parseFloat(leftNumber.toString()).toFixed(2);
        }
    }

    disconnectedCallback() {
        window.removeEventListener('localeChanged', this._onLocaleChanged);
        super.disconnectedCallback();
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('invoice') && this.invoice) {
            const leftNumber = Number(this.invoice.total) - Number(this.invoice.paid);
            this.leftPaid = (leftNumber < 0) ? '0' : parseFloat(leftNumber.toString()).toFixed(2);
        }
    }

    _onLocaleChanged() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class=${`stepFooter`}>
                
                ${
                        (this.invoice?.status === 'active')
                        ? html`
                                    <div class="product">
                                        <div class="image placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                                <line x1="12" x2="12" y1="2" y2="22"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                            </svg>
                                        </div>

                                        <div class="price">
                                            <p>${this.i18n?.t('footer.leftPay')}:</p>
                                            <p>${this.leftPaid ? `${this.leftPaid} ${this.invoice.currency.symbol}` : `0 ${this.invoice.currency.symbol}`}</p>
                                        </div>
                                    </div>

                                    <button class="mainButton" @click=${() => this.dispatchReturnBack()}>
                                        ${this.i18n?.t('buttons.makePayment')}
                                    </button>
                                `
                                : html`
                                    <button class="mainButton full" @click=${() => {
                                        window.location.replace(this.backButtonUrl || location.href);
                                    }}>
                                        ${this.i18n?.t('buttons.backToStore')}
                                    </button>

                                `
                }

            </div>
        `;
    }

    private dispatchReturnBack() {
        const options = {
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('returnBack', options));
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'success-footer': SuccessFooter;
    }
}
