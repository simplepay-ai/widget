import {css, html, LitElement, property, query} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {CurrentPriceStep} from "../types.ts";
import {App, Cryptocurrency} from "@simplepay-ai/api-client";
import {getTokenStandart, roundUpAmount} from "../util.ts";

@customElement('new-set-price-step')
export class NewSetPriceStep extends LitElement {

    @property({type: Object})
    appInfo: App | null = null;

    @property({type: String})
    price: string = '';

    @property({attribute: false, type: Boolean})
    numpadButtonsActive = false;

    @property({type: Boolean})
    creatingInvoice: boolean = false;

    @property({attribute: false, type: String})
    private priceValue = '0';

    @property({attribute: false, type: Array})
    private numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    @property({attribute: false, type: Boolean})
    private nextButtonDisabled: boolean = true;

    connectedCallback() {
        super.connectedCallback();

        if (this.price && this.price !== '0') {
            this.priceValue = parseFloat(this.price).toFixed(2)
            this.nextButtonDisabled = Number(this.price) < 1
        }

        this.numpadButtonsActive = true;

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.numpadButtonsActive = false;
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

                                    <p>Creating invoice ...</p>
                                </div>
                            </div>
                        `
                        : html`
                            <div class="header">

                                <p>Invoice from:</p>
                                <div class="merchantInfo">

                                    ${
                                            (this.appInfo?.image)
                                                    ? html`
                                                        <div class="image">
                                                            <img src=${this.appInfo.image}
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
                                    <span>USD</span>
                                </div>
                            </div>

                            <div class="footer">

                                <div class="buttonsWrapper">

                                    <button class="secondaryButton"
                                            @click=${() => this.dispatchPrevStep()}
                                    >
                                        Back
                                    </button>

                                    <button class="mainButton"
                                            .disabled=${!this.priceValue || Number(this.priceValue) < 1}
                                            @click=${() => this.dispatchNextStep()}
                                    >
                                        Create
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
            display: flex;
            flex-direction: column;
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 350ms;
            height: 100%;

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
                        border-radius: 50%;

                        img {
                            width: 32px;
                            height: 32px;
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
                position: relative;
                
                &.loading{
                    background: var(--sp-widget-bg-color);
                }

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-scroll-color);
                }

                .spinner {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;

                    p {
                        margin-top: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--sp-widget-text-color);
                    }

                    svg {
                        width: 20px;
                        height: 20px;
                        animation: spin 1s linear infinite;
                    }

                    circle {
                        stroke: var(--sp-widget-active-color);
                        opacity: 0.25;
                    }

                    path {
                        fill: var(--sp-widget-active-color);
                        opacity: 0.75;
                    }
                }

                .priceEnter {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;

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

                        .line {
                            position: absolute;
                            top: 50%;
                            right: -2px;
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

                    span {
                        font-size: 40px;
                        line-height: 1.2;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                    }

                    &.medium {
                        p, span {
                            font-size: 33px;
                        }
                    }

                    &.small {
                        p, span {
                            font-size: 26px;
                        }
                    }

                    &.xSmall {
                        p, span {
                            font-size: 19px;
                        }
                    }
                }

            }

            .footer {
                border-radius: 12px 12px 0 0;
                padding: 8px;
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
                    padding-bottom: 16px;

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

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'new-set-price-step': NewSetPriceStep;
    }
}
