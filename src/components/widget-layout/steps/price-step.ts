import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {App, Currency} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../../../styles/widget-styles/price-step.css?inline";
import {I18n} from "i18n-js";

@customElement('price-step')
export class PriceStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Array})
    currencies: Currency[] = [];

    @property({type: Object})
    selectedCurrency: Currency | null = null;

    @property({type: String})
    merchantLogoUrl: string = '';

    @property({type: Object})
    appInfo: App | null = null;

    @property({type: String})
    price: string = '';

    @property({type: Boolean})
    creatingInvoice: boolean = false;

    @property({type: Boolean})
    paymentTypeSelected: boolean = false;

    @property({attribute: false, type: Boolean})
    numpadButtonsActive = false;

    @property({attribute: false, type: String})
    private priceValue = '0';

    @property({attribute: false, type: Array})
    private numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();

        window.addEventListener('localeChanged', this._onLocaleChanged);

        if (this.price && this.price !== '0') {
            this.priceValue = parseFloat(this.price).toFixed(2)
        }

        this.numpadButtonsActive = true;

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    disconnectedCallback() {
        window.removeEventListener('localeChanged', this._onLocaleChanged);
        this.numpadButtonsActive = false;

        super.disconnectedCallback()
    }

    _onLocaleChanged() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="stepWrapper">

                ${this.creatingInvoice
                        ? html`
                            <div class="stepContent loading">
                                <div class="spinner">
                                    <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                    >
                                        <circle cx="12" cy="12" r="10" stroke-width="4"/>
                                        <path
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>

                                    <p>${`${this.i18n?.t('loaders.creatingInvoice')} ...`}</p>
                                </div>
                            </div>
                        `
                        : html`
                            <div class="header">

                                <div class="topSection">

                                    <p>${this.i18n?.t('enterPriceStep.title')}:</p>

                                    ${
                                            (this.paymentTypeSelected)
                                                    ? html`
                                                        <language-selector
                                                                .i18n=${this.i18n}
                                                        ></language-selector>
                                                    `
                                                    : ''
                                    }

                                </div>
                                <div class="merchantInfo">

                                    ${
                                            (this.appInfo?.image || this.merchantLogoUrl)
                                                    ? html`
                                                        <div class="image">
                                                            <img src=${this.merchantLogoUrl || this.appInfo?.image}
                                                                 alt="merchant image">
                                                        </div>
                                                    `
                                                    : html`
                                                        <div class="image placeholder">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                 viewBox="0 0 24 24"
                                                                 fill="none" stroke="currentColor" stroke-width="1.5"
                                                                 stroke-linecap="round"
                                                                 stroke-linejoin="round">
                                                                <circle cx="12" cy="8" r="5"/>
                                                                <path d="M20 21a8 8 0 0 0-16 0"/>
                                                            </svg>
                                                        </div>
                                                    `
                                    }

                                    <p>${this.appInfo?.name}</p>

                                </div>

                            </div>

                            <div class="stepContent">
                                <div class=${`priceEnter
                                            ${(this.priceValue.toString().length >= 9 ? 'medium' : '')}
                                            ${(this.priceValue.toString().length >= 12 ? 'small' : '')}
                                            ${(this.priceValue.toString().length >= 15 ? 'xSmall' : '')}
                                            `}>
                                    <p>
                                        ${this.priceValue} <span class="line"></span>
                                    </p>

                                    <select id="currency"
                                            class=${`
                                            custom-select
                                            `}
                                            @change=${(event: CustomEvent | any) => {
                                                const currency = this.currencies.find((item) => item.id === event.target.value)
                                                if(currency){
                                                    this.dispatchEvent(
                                                            new CustomEvent('updateCurrency', {
                                                                detail: {
                                                                    currency
                                                                },
                                                                bubbles: true,
                                                                composed: true
                                                            })
                                                    );
                                                }
                                            }}
                                            .value=${this.selectedCurrency?.id}
                                    >
                                        ${
                                                this.currencies &&
                                                this.currencies.map((item) => {
                                                    return html`
                                                        <option value=${item.id}>
                                                            ${item.symbol}
                                                        </option>
                                                    `
                                                })
                                        }
                                    </select>

<!--                                    <span>USD</span>-->
                                </div>
                            </div>

                            <div class="footer">

                                <div class="buttonsWrapper">

                                    ${
                                            (!this.paymentTypeSelected)
                                                    ? html`
                                                        <button class="secondaryButton"
                                                                @click=${() => this.dispatchPrevStep()}
                                                        >
                                                            ${this.i18n?.t('buttons.back')}
                                                        </button>
                                                    `
                                                    : ''
                                    }

                                    <button class="mainButton"
                                            .disabled=${!this.priceValue || Number(this.priceValue) < 1}
                                            @click=${() => this.dispatchNextStep()}
                                    >
                                        ${this.i18n?.t('buttons.create')}
                                    </button>

                                </div>

                                <div class="keyboardWrapper">

                                    <div class="keyboard">

                                        ${
                                                this.numpadButtons.map((button) => {

                                                    const buttonContent = (button === 'backspace')
                                                            ? html`
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                     height="24"
                                                                     viewBox="0 0 24 24" fill="none"
                                                                     stroke="currentColor"
                                                                     stroke-width="2" stroke-linecap="round"
                                                                     stroke-linejoin="round">
                                                                    <path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
                                                                    <path d="m12 9 6 6"/>
                                                                    <path d="m18 9-6 6"/>
                                                                </svg>`
                                                            : html`<p>${button}</p>`

                                                    const buttonSubClass = (button === 'backspace' || button === '.')
                                                            ? 'secondary'
                                                            : '';

                                                    return html`
                                                        <div class=${`item ${buttonSubClass}`}
                                                             @click=${() => this.handleKeyPress(button)}>
                                                            ${buttonContent}
                                                        </div>
                                                    `
                                                })
                                        }

                                    </div>

                                </div>

                            </div>
                        `
                }
            </div>
        `;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (!this.numpadButtonsActive) {
            return;
        }

        if (event.key === 'Backspace') {
            this.handleKeyPress('backspace');
        } else if (event.key === '.' || event.key === ',') {
            this.handleKeyPress('.');
        } else if (/^\d$/.test(event.key)) {
            this.handleKeyPress(event.key);
        }
    }

    private handleKeyPress(key: string) {
        if (key === 'backspace') {
            this.priceValue = this.priceValue.slice(0, -1) || '0'
        } else if (key === '.') {
            if (!this.priceValue.includes('.')) {
                this.priceValue = this.priceValue + '.';
            }
        } else if (/^\d$/.test(key)) {
            if (this.priceValue === '0' && key !== '0') {
                this.priceValue = key;
            } else if (this.priceValue.includes('.')) {
                const [_integer, decimal] = this.priceValue.split('.');
                if (decimal.length < 2) {
                    this.priceValue = this.priceValue + key;
                }
            } else {
                if (this.priceValue + key !== '00') {
                    this.priceValue = this.priceValue + key;
                }

            }
        }

        this.updatePrice(this.priceValue)
    }

    private updatePrice(price: string) {
        const updateEvent = new CustomEvent('updatePrice', {
            detail: {
                price
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateEvent);
    }

    private dispatchNextStep() {
        const nextStepEvent = new CustomEvent('nextStep', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(nextStepEvent);
    }

    private dispatchPrevStep() {
        const prevStepEvent = new CustomEvent('prevStep', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(prevStepEvent);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
