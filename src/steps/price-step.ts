import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('price-step')
export class PriceStep extends LitElement {
    @property({ type: Boolean })
    dark: boolean = false;

    @property({ type: String })
    price: string = '';

    @property({ type: Boolean })
    returnButtonShow: boolean = false;

    @property({ attribute: false, type: String })
    private inputValue = '';

    @property({ attribute: false, type: Boolean })
    private buttonDisabled = true;

    connectedCallback() {
        super.connectedCallback();

        if (this.price) {
            this.inputValue = this.price;
            this.buttonDisabled = this.price === '0';
        }
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('price')) {
            this.inputValue = this.price;
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.dark ? 'dark' : ''}`}>
                <step-header
                    .dark=${this.dark}
                    .title=${'Enter the amount'}
                    .hasBackButton=${this.returnButtonShow}
                ></step-header>

                <div class="stepContent">
                    <label for="price">
                        <p class="labelText">Enter your price:</p>

                        <input
                            id="price"
                            type="number"
                            placeholder="Enter the amount"
                            .value=${this.inputValue}
                            @input=${this.inputHandler}
                            @blur=${this.blurHandler}
                            min="0"
                            pattern="[0-9]*"
                            step=".01"
                            inputmode="decimal"
                        />
                    </label>
                </div>

                <step-footer
                    .dark=${this.dark}
                    .price=${this.price}
                    .hasButton=${true}
                    .buttonDisabled=${this.buttonDisabled}
                    .buttonText=${'Next'}
                    @footerButtonClick=${this.dispatchNextStep}
                ></step-footer>
            </div>
        `;
    }

    private inputHandler(event: any) {
        if (event.target.value === '') {
            this.buttonDisabled = true;
            return;
        }

        const priceString = event.target.value.toString().replaceAll(',', '.').replaceAll('-', '');
        const priceFormat = parseFloat(priceString).toString();

        this.inputValue = priceFormat;

        this.buttonDisabled = Number(priceFormat) <= 0;
    }

    private blurHandler(event: any) {
        if (event.target.value !== '') {
            const priceString = event.target.value
                .toString()
                .replaceAll(',', '.')
                .replaceAll('-', '');
            const priceFormat = parseFloat(priceString).toFixed(2);
            this.inputValue = priceFormat;
            this.buttonDisabled = Number(priceFormat) <= 0;
        }
    }

    private dispatchNextStep() {
        if (this.inputValue && this.inputValue !== '0') {
            const updateEvent = new CustomEvent('updatePrice', {
                detail: {
                    price: this.inputValue
                },
                bubbles: true,
                composed: true
            });

            const nextStepEvent = new CustomEvent('nextStep', {
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(updateEvent);
            this.dispatchEvent(nextStepEvent);
        }
    }

    static styles = css`
        * {
            font-family: system-ui;
            font-size: 14px;
            font-weight: 450;
            background: transparent;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .stepWrapper {
            height: 100%;
            display: flex;
            flex-direction: column;

            .stepContent {
                flex: 1;
                padding: 16px;
                overflow-y: auto;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-border);
                }

                label {
                    font-size: 14px;
                    line-height: 1;
                    font-weight: 500;
                }

                .labelText {
                    font-size: 13px;
                    line-height: 20px;
                    color: var(--sp-primary-font);
                    padding-left: 8px;
                    font-weight: 500;
                    text-align: left;
                }

                .labelError {
                    margin-top: 8px;
                    padding-left: 16px;
                    font-size: 12px;
                    line-height: 20px;
                    color: #dc2828;
                }

                input {
                    margin-top: 4px;
                    display: flex;
                    height: 40px;
                    width: 100%;
                    border-radius: 6px;
                    border: 1px solid var(--sp-border);
                    background: var(--sp-primary-background);
                    padding: 8px 12px;
                    font-size: 16px;
                    line-height: 20px;
                    color: var(--sp-primary-font);

                    &::placeholder {
                        font-size: 14px;
                        line-height: 20px;
                        color: var(--sp-secondary-font);
                    }

                    &:focus-visible {
                        outline: 2px solid var(--sp-accent);
                    }
                }
            }

            &.dark {
                input {
                    background: color-mix(
                        in srgb,
                        var(--sp-secondary-background) 15%,
                        transparent
                    ) !important;
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
