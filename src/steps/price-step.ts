import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('price-step')
export class PriceStep extends LitElement {
    @property({ type: Boolean })
    dark: boolean = false;

    @property({ type: String })
    price: string = '';

    @property({ attribute: false, type: Boolean })
    private buttonDisabled = true;

    @property({ attribute: false, type: String })
    private priceValue = '0';

    connectedCallback() {
        super.connectedCallback();

        if(this.price){
            this.priceValue = parseFloat(this.price).toFixed(2)
            this.buttonDisabled = this.price === '0'
        }

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));

    }
    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);
        this.buttonDisabled = !this.price || this.price === '0';
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
                        <p>${this.priceValue} <span class="line"></span> USD</p>
                    </div>
                    
                    <div class="keyboardWrapper">
                        
                        <div class="keyboard">
                            
                            <div class="item" @click=${() => this.handleKeyPress('1')}>
                                <p>1</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('2')}>
                                <p>2</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('3')}>
                                <p>3</p>
                            </div>

                            <div class="item" @click=${() => this.handleKeyPress('4')}>
                                <p>4</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('5')}>
                                <p>5</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('6')}>
                                <p>6</p>
                            </div>

                            <div class="item" @click=${() => this.handleKeyPress('7')}>
                                <p>7</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('8')}>
                                <p>8</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('9')}>
                                <p>9</p>
                            </div>

                            <div class="item secondary" @click=${() => this.handleKeyPress('.')}>
                                <p>.</p>
                            </div>
                            <div class="item" @click=${() => this.handleKeyPress('0')}>
                                <p>0</p>
                            </div>
                            <div class="item secondary" @click=${() => this.handleKeyPress('backspace')}>
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

    private handleKeyDown(event: KeyboardEvent){
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
                if(this.priceValue + key !== '00'){
                    this.priceValue = this.priceValue + key;
                }

            }
        }

        this.updatePrice(this.priceValue)
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
    private dispatchNextStep() {
        if (this.priceValue && this.priceValue !== '0') {

            const nextStepEvent = new CustomEvent('nextStep', {
                bubbles: true,
                composed: true
            });

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
                    
                    p{
                        font-size: 20px;
                        line-height: 28px;
                        font-weight: 700;
                        color: var(--sp-primary-font);
                        position: relative;
                    }
                    
                    .line{
                        position: absolute;
                        top: 50%;
                        right: 44px;
                        height: 40px;
                        width: 2px;
                        background-color: #3c82f6;
                        transform: translateY(-50%);
                        border-radius: 0.5rem;
                        animation: blink 1.5s step-end infinite;
                    }
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
                            user-select: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;
                            
                            &.secondary{
                                background: transparent;
                                p,
                                svg{
                                    color: var(--sp-accent);
                                }
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
                .keyboardWrapper{
                    background: color-mix(in srgb, var(--sp-secondary-background) 15%, transparent) !important;
                }
                
                .item{
                    background: var(--sp-primary-background) !important;

                    &.secondary{
                        background: transparent !important;
                        p,
                        svg{
                            color: var(--sp-accent) !important;
                        }
                    }

                    &:hover,
                    &:active{
                        background: color-mix(in srgb, var(--sp-primary-background) 40%, transparent) !important;

                        &.secondary{
                            background: color-mix(in srgb, var(--sp-primary-background) 30%, transparent) !important;
                        }

                    }
                }
            }
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
