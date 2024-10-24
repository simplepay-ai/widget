import {css, html, LitElement, property, query} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {CurrentPriceStep} from "../types.ts";

@customElement('price-step')
export class PriceStep extends LitElement {
    @property({type: String})
    price: string = '';

    @property({type: Boolean})
    payload: boolean = false;

    @property({type: String})
    invoiceMessage: string = '';

    @property({type: String})
    currentPriceStep: CurrentPriceStep = 'priceEnter';

    @property({attribute: false, type: String})
    private priceValue = '0';

    @property({attribute: false, type: Array})
    private numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    @property({attribute: false, type: Boolean})
    private nextButtonDisabled: boolean = true;

    @property({attribute: false, type: String})
    private message = '';

    @property({attribute: false, type: Boolean})
    private showMessageEmptyError = false;

    @query('#messageInput')
    messageInput: any;

    connectedCallback() {
        super.connectedCallback();

        if (this.price && this.price !== '0') {
            this.priceValue = parseFloat(this.price).toFixed(2)
            this.nextButtonDisabled = Number(this.price) <= 0
        }

        if (this.invoiceMessage !== '') {
            this.updateCurrentPriceStep('messageEnter');
        }

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if(changedProperties.has('price') && this.currentPriceStep === 'priceEnter'){
            this.nextButtonDisabled = !this.price || Number(this.price) <= 0;
        }

        if (changedProperties.has('currentPriceStep')) {

            if(this.currentPriceStep === 'messageEnter'){
                this.messageInput.focus();

                if (this.payload && this.invoiceMessage === '') {
                    this.nextButtonDisabled = true;
                }
            }else{
                this.nextButtonDisabled = !this.price || Number(this.price) <= 0;
            }

        }

        if (changedProperties.has('invoiceMessage') && this.payload && this.currentPriceStep === 'messageEnter') {
            this.nextButtonDisabled = (this.invoiceMessage === '');
        }

    }

    render() {
        return html`
            <div class=${`stepWrapper`}>

                <div class="header">

                    <p>Invoice to:</p>
                    <div class="merchantInfo">

                        <div class="image placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <circle cx="12" cy="8" r="5"/>
                                <path d="M20 21a8 8 0 0 0-16 0"/>
                            </svg>
                        </div>

                        <p>Merchant Name</p>

                    </div>

                </div>

                <div class="stepContent">
                    ${
                            (this.currentPriceStep === 'priceEnter')
                                    ? html`
                                        <div class="priceEnter">
                                            <p>${this.priceValue} <span class="line"></span> USD</p>
                                        </div>
                                    `
                                    : html`
                                        <div class="infoWrapper">

                                            <div class="priceInfo">
                                                <p class="label">
                                                    Amount to pay
                                                </p>
                                                <div class="price">
                                                    <p>${this.priceValue}</p>
                                                    <span>USD</span>
                                                </div>
                                            </div>

                                            <div class="messageInfo">
                                                <div class="labelWrapper">
                                                    <p>
                                                        Message
                                                    </p>

                                                    <p>
                                                        ${this.invoiceMessage.length} / 124
                                                    </p>
                                                </div>

                                                <textarea id="messageInput"
                                                          .value=${this.invoiceMessage}
                                                          @input=${(event) => {

                                                              if (event.target.value.length > 0 && this.showMessageEmptyError) {
                                                                  this.showMessageEmptyError = false;
                                                              }

                                                              this.updateInvoiceMessage(event.target.value);
                                                          }}
                                                >
                                                </textarea>

                                                ${
                                                        (this.invoiceMessage.length > 124)
                                                                ? html`
                                                                    <p class="messageError">
                                                                        Message is too long. Please shorten it to proceed. The maximum
                                                                        allowed length is 124 characters.
                                                                    </p>
                                                                `
                                                                : ''
                                                }

                                                ${
                                                        (this.showMessageEmptyError)
                                                                ? html`
                                                                    <p class="messageError">
                                                                        Message is empty. Please add text or delete the message to
                                                                        proceed.
                                                                    </p>
                                                                `
                                                                : ''
                                                }

                                            </div>

                                        </div>
                                    `
                    }
                </div>

                <div class="footer">

                    ${
                            (this.payload)
                                    ? html`
                                        <div class="buttonsWrapper">

                                            ${
                                                    (this.currentPriceStep === 'messageEnter')
                                                            ? html`
                                                                <button class="secondaryButton"
                                                                        @click=${() => {
                                                                            this.updateCurrentPriceStep('priceEnter')
                                                                        }}
                                                                >
                                                                    Edit price
                                                                </button>
                                                            `
                                                            : ''
                                            }

                                            <button class="mainButton"
                                                    @click=${this.nextWithPayload}
                                                    .disabled=${this.nextButtonDisabled}
                                            >
                                                PAY
                                            </button>
                                        </div>
                                    `
                                    : html`
                                        <div class="buttonsWrapper">
                                            ${
                                                    (this.currentPriceStep === 'priceEnter')
                                                            ? html`
                                                                <button class="secondaryButton"
                                                                        @click=${() => {
                                                                            this.updateCurrentPriceStep('messageEnter')
                                                                            this.priceValue = parseFloat(this.priceValue).toFixed(2);
                                                                            this.updatePrice(this.priceValue);
                                                                        }}
                                                                        .disabled=${this.nextButtonDisabled}
                                                                >
                                                                    + Message
                                                                </button>
                                                            `
                                                            : html`
                                                                <button class="secondaryButton"
                                                                        @click=${() => {
                                                                            this.updateCurrentPriceStep('priceEnter')
                                                                            this.updateInvoiceMessage('');
                                                                        }}
                                                                >
                                                                    Remove
                                                                </button>
                                                            `
                                            }

                                            <button class="mainButton"
                                                    @click=${this.dispatchNextStep}
                                                    .disabled=${this.nextButtonDisabled}
                                            >
                                                PAY
                                            </button>
                                        </div>
                                    `
                    }

                    ${
                            (this.currentPriceStep === 'priceEnter')
                                    ? html`
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
                                    `
                                    : ''
                    }
                </div>
            </div>
        `;
    }

    private handleKeyDown(event: KeyboardEvent) {

        if(this.currentPriceStep !== 'priceEnter'){
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
    private updateInvoiceMessage(message: string) {
        const updateEvent = new CustomEvent('updateInvoiceMessage', {
            detail: {
                invoiceMessage: message
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateEvent);
    }
    private updateCurrentPriceStep(step: CurrentPriceStep) {
        const updateEvent = new CustomEvent('updateCurrentPriceStep', {
            detail: {
                currentPriceStep: step
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
    private nextWithPayload() {

        if (this.currentPriceStep === 'priceEnter') {

            if (!this.priceValue || this.priceValue === '0') {
                return;
            } else {
                this.priceValue = parseFloat(this.priceValue).toFixed(2);
                this.updatePrice(this.priceValue);
                this.updateCurrentPriceStep('messageEnter');
                return;
            }

        } else {

            if (this.invoiceMessage === '') {
                this.showMessageEmptyError = true;
                return;
            } else if (this.invoiceMessage.length > 124) {
                return;
            } else {
                this.dispatchNextStep();
            }

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

            .header {
                padding: 16px;

                p {
                    font-size: 20px;
                    line-height: 1.2;
                    font-weight: 700;
                    color: var(--sp-widget-text-color);
                }

                .merchantInfo {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 4px;

                    .image {
                        width: 32px;
                        aspect-ratio: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        border: 1px solid var(--sp-widget-border-color);
                        background: var(--sp-widget-bg-color);
                        border-radius: 8px;

                        img {
                            width: 40px;
                            height: 40px;
                            object-fit: cover;
                        }

                        &.placeholder {
                            svg {
                                width: 20px;
                                object-fit: cover;
                                color: var(--sp-widget-active-color);
                            }
                        }
                    }

                    p {
                        font-size: 18px;
                        line-height: 1.2;
                        font-weight: 300;
                        color: var(--sp-widget-text-color);
                    }
                }
            }

            .stepContent {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                padding: 16px;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-secondary-bg-color);
                }

                .priceEnter {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    p {
                        font-size: 40px;
                        line-height: 1.2;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                        position: relative;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                    }

                    .line {
                        position: absolute;
                        top: 50%;
                        right: 90px;
                        height: 55px;
                        width: 2px;
                        background-color: var(--sp-widget-active-color);
                        transform: translateY(-50%);
                        border-radius: 0.5rem;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        animation: blink 1.5s step-end infinite;
                    }
                }

                .infoWrapper {

                    .priceInfo {
                        max-width: max-content;

                        .label {
                            color: var(--sp-widget-secondary-text-color);
                            font-weight: 300;
                            font-size: 13px;
                        }

                        .price {
                            display: flex;
                            align-items: baseline;
                            gap: 8px;

                            p {
                                overflow: hidden;
                                text-overflow: ellipsis;
                                font-size: 35px;
                                line-height: 1.2;
                                font-weight: 700;
                                color: var(--sp-widget-text-color);
                                position: relative;
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                            }

                            span {
                                color: var(--sp-widget-text-color);
                                font-size: 13px;
                            }
                        }
                    }

                    .messageInfo {
                        margin-top: 1rem;

                        .labelWrapper {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            p {
                                color: var(--sp-widget-secondary-text-color);
                                font-weight: 300;
                                font-size: 13px;
                            }
                        }

                        textarea {
                            margin-top: 4px;
                            display: flex;
                            height: 80px;
                            width: 100%;
                            border-radius: 6px;
                            border: 1px solid var(--sp-widget-input-border-color);
                            background: var(--sp-widget-input-bg-color);
                            padding: 8px 12px;
                            font-size: 16px;
                            line-height: 1.2;
                            color: var(--sp-widget-input-color);
                            resize: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            &:focus-visible {
                                outline: 2px solid var(--sp-widget-input-active-border-color);
                            }
                        }

                        .messageError {
                            padding-left: 8px;
                            margin-top: 8px;
                            font-size: 12px;
                            line-height: 1.2;
                            color: var(--sp-widget-destructive-text-color);
                            text-align: left;
                        }
                    }
                }

            }

            .footer {
                border-radius: 40px 40px 0 0;
                padding: 24px 16px;
                background-color: var(--sp-widget-bg-color);

                .buttonsWrapper {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    button {
                        flex: 1;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        line-height: 1.2;
                        font-weight: 500;
                        border-radius: 6px;
                        cursor: pointer;
                        width: 100%;
                        height: 40px;
                        padding: 16px 8px;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;

                        &.mainButton {
                            color: var(--sp-widget-primary-button-text-color);
                            background: var(--sp-widget-primary-button-color);
                            border: 1px solid var(--sp-widget-primary-button-border-color);

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    color: var(--sp-widget-primary-button-hover-text-color);
                                    background: var(--sp-widget-primary-button-hover-color);
                                    border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                                }
                            }
                        }

                        &.secondaryButton {
                            color: var(--sp-widget-cancel-button-text-color);
                            background: var(--sp-widget-cancel-button-color);
                            border: 0;

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-cancel-button-hover-color);
                                    border: 0;
                                }
                            }
                        }

                        &:disabled {
                            pointer-events: none;
                            touch-action: none;
                            opacity: 0.5;
                        }
                    }
                }

                .keyboardWrapper {
                    margin-top: 24px;

                    .keyboard {
                        display: grid;
                        grid-template-columns: 1fr 1fr 1fr;
                        gap: 4px;

                        .item {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 10px;
                            background: var(--sp-widget-cancel-button-color);
                            border-radius: 0.5rem;
                            cursor: pointer;
                            user-select: none;
                            touch-action: manipulation;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            &.secondary {
                                background: transparent;
                            }

                            p {
                                font-size: 20px;
                                line-height: 1.2;
                                font-weight: 700;
                                color: var(--sp-widget-cancel-button-text-color);
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            svg {
                                color: var(--sp-widget-cancel-button-text-color);
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-cancel-button-hover-color);

                                    p, svg {
                                        transform: scale(1.05);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        @keyframes blink {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0;
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
