import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('price-step')
export class PriceStep extends LitElement {
    @property({ type: Boolean })
    darkTheme: boolean = false;

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
            <div class=${`stepWrapper ${this.darkTheme ? 'dark' : ''}`}>
                <step-header
                    .darkTheme=${this.darkTheme}
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
                    .darkTheme=${this.darkTheme}
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
            this.updatePrice('');
            return;
        }

        const priceString = event.target.value.toString().replaceAll(',', '.').replaceAll('-', '');
        const priceFormat = parseFloat(priceString).toString();

        this.inputValue = priceFormat;
        this.buttonDisabled = Number(priceFormat) <= 0;
        this.updatePrice(priceFormat);
    }
    private updatePrice(price: string){
        const updateEvent = new CustomEvent('updatePrice', {
            detail: {
                price
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateEvent);
    }
    private blurHandler(event: any) {

        if(event.target.value === ''){
            this.updatePrice('');
            return;
        }

        const priceString = event.target.value
            .toString()
            .replaceAll(',', '.')
            .replaceAll('-', '');
        const priceFormat = parseFloat(priceString).toFixed(2);
        this.inputValue = priceFormat;
        this.buttonDisabled = Number(priceFormat) <= 0;
        this.updatePrice(priceFormat);
    }
    private dispatchNextStep() {
        if (this.inputValue && this.inputValue !== '0') {

            const nextStepEvent = new CustomEvent('nextStep', {
                bubbles: true,
                composed: true
            });

            this.updatePrice(this.inputValue);
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
                    background: var(--sp-widget-secondary-bg-color);
                }

                label {
                    font-size: 14px;
                    line-height: 1;
                    font-weight: 500;
                }

                .labelText {
                    font-size: 13px;
                    line-height: 20px;
                    color: var(--sp-widget-text-color);
                    padding-left: 8px;
                    font-weight: 500;
                    text-align: left;
                }

                input {
                    margin-top: 4px;
                    display: flex;
                    height: 40px;
                    width: 100%;
                    border-radius: 6px;
                    border: 1px solid var(--sp-widget-hint-color);
                    background: var(--sp-widget-bg-color);
                    padding: 8px 12px;
                    font-size: 16px;
                    line-height: 20px;
                    color: var(--sp-widget-text-color);

                    &::placeholder {
                        font-size: 14px;
                        line-height: 20px;
                        color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                    }

                    &:focus-visible {
                        outline: 2px solid var(--sp-widget-link-color);
                    }
                }
            }

            &.dark {
                input {
                    background: color-mix(
                        in srgb,
                        var(--sp-widget-secondary-bg-color) 15%,
                        transparent
                    ) !important;
                    border-color: color-mix(
                            in srgb,
                            var(--sp-widget-hint-color) 15%,
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
