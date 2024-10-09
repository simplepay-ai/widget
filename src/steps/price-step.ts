import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('price-step')
export class PriceStep extends LitElement {
    @property({ type: Boolean })
    dark: boolean = false;

    @property({ type: String })
    price: string = '';

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
                    .hasBackButton=${false}
                ></step-header>

                <div class="stepContent">
                    
                    <div class="priceEnter">
                        <p>${this.price} USD</p>
                    </div>
                    
                    <div class="keyboardWrapper">
                        
                        <div class="keyboard">
                            
                            <div class="item">
                                <p>1</p>
                            </div>
                            <div class="item">
                                <p>2</p>
                            </div>
                            <div class="item">
                                <p>3</p>
                            </div>

                            <div class="item">
                                <p>4</p>
                            </div>
                            <div class="item">
                                <p>5</p>
                            </div>
                            <div class="item">
                                <p>6</p>
                            </div>

                            <div class="item">
                                <p>7</p>
                            </div>
                            <div class="item">
                                <p>8</p>
                            </div>
                            <div class="item">
                                <p>9</p>
                            </div>

                            <div class="item secondary">
                                <p>.</p>
                            </div>
                            <div class="item">
                                <p>0</p>
                            </div>
                            <div class="item secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/><path d="m12 9 6 6"/><path d="m18 9-6 6"/></svg>
                            </div>
                            
                        </div>
                        
                    </div>
                    
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
                overflow-y: auto;
                display: flex;
                flex-direction: column;

                &::-webkit-scrollbar {
                    width: 1px;
                }
                &::-webkit-scrollbar-track {
                    background: transparent;
                }
                &::-webkit-scrollbar-thumb {
                    background: var(--sp-border);
                }
                
                .priceEnter{
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 16px;
                }
                
                .keyboardWrapper{
                    background: var(--sp-primary-background);
                    border-top: 1px solid var(--sp-border);
                    padding: 16px 8px 48px;

                    .keyboard{
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 4px;
                        
                        .item{
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 10px;
                            background: var(--sp-secondary-background);
                            border-radius: 0.5rem;
                            cursor: pointer;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;
                            
                            &.secondary{
                                background: transparent;
                                color: var(--sp-accent);
                            }
                            
                            p{
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: var(--sp-primary-font);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }
                            
                            svg{
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            &:hover,
                            &:active{
                                background: color-mix(in srgb, var(--sp-secondary-font) 15%, transparent);

                                &.secondary{
                                    background: color-mix(in srgb, var(--sp-secondary-font) 5%, transparent);
                                }
                                
                                p, svg{
                                    transform: scale(1.05);
                                }
                            }
                        }
                    }
                }

            }

            &.dark {
                
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
