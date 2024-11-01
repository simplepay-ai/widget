import {css, html, LitElement, property, query} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {CurrentPriceStep} from "../types.ts";
import {Cryptocurrency} from "@simplepay-ai/api-client";
import {getTokenStandart, roundUpAmount} from "../util.ts";

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

    @property({type: Boolean})
    priceAvailable: boolean = false;

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

    @property({attribute: false, type: Boolean})
    numpadButtonsActive = false;

    @property({attribute: false, type: String})
    private priceValue = '0';

    @property({attribute: false, type: Array})
    private numpadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

    @property({attribute: false, type: Boolean})
    private nextButtonDisabled: boolean = true;

    @property({attribute: false, type: Boolean})
    private showMessageEmptyError = false;

    @query('#messageInput')
    messageInput: any;

    @property({attribute: false, type: Number})
    startVisualViewportHeight: any = 0;

    @property({attribute: false, type: Number})
    currentVisualViewportHeight: any = 0;

    @property({attribute: false, type: Boolean})
    showTokenModal: boolean = false;

    @property({attribute: false, type: Boolean})
    showTokenModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    showTokenModalContent: boolean = false;

    @property({attribute: false, type: String})
    tokenPrice: string = '';

    connectedCallback() {
        super.connectedCallback();

        if (this.price && this.price !== '0') {
            this.priceValue = parseFloat(this.price).toFixed(2)
            this.nextButtonDisabled = Number(this.price) < 1
        }

        if (this.invoiceMessage !== '') {
            this.updateCurrentPriceStep('messageEnter');
        }

        this.startVisualViewportHeight = visualViewport?.height;
        this.currentVisualViewportHeight = visualViewport?.height;
        visualViewport?.addEventListener('resize', (event: any) => {
            this.currentVisualViewportHeight = (event.target.height < 500) ? event.target.height : event.target.height;
        });

        window.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (this.currentPriceStep === 'priceEnter') {

            this.nextButtonDisabled = !this.price || Number(this.price) < 1

        } else {

            if (this.payload) {
                this.nextButtonDisabled = this.invoiceMessage.trim() === '' || this.invoiceMessage.length > 124;
            } else {
                this.nextButtonDisabled = this.invoiceMessage.length > 124;
            }

        }

        if (changedProperties.has('currentPriceStep')) {
            if (this.currentPriceStep === 'priceEnter') {
                this.numpadButtonsActive = true;
            }

            if (this.currentPriceStep === 'messageEnter') {
                this.messageInput.focus();
                this.numpadButtonsActive = false;
            }
        }

        if ((changedProperties.has('selectedTokenSymbol') || changedProperties.has('selectedNetworkSymbol') || changedProperties.has('price')) && this.price) {

            const currentToken = this.tokens.find((item) => {
                return item.symbol === this.selectedTokenSymbol && item.networks;
            })

            if (currentToken?.networks && currentToken.rates) {

                const currentNetwork = currentToken.networks.find((item) => item.symbol === this.selectedNetworkSymbol);

                if (currentNetwork) {

                    //@ts-ignore
                    const priceInToken = this.price / currentToken.rates['usd'];
                    this.tokenPrice = '~' + roundUpAmount(
                        priceInToken.toString(),
                        currentToken.stable
                    );

                } else {
                    this.tokenPrice = '';
                }

            } else {

            }


        }

        // if(changedProperties.has('price') && this.currentPriceStep === 'priceEnter'){
        //     this.nextButtonDisabled = !this.price || Number(this.price) <= 0;
        // }

        // if(changedProperties.has('currentPriceStep')) {
        //     if(this.currentPriceStep === 'messageEnter'){
        //         // this.numpadButtonsActive = false;
        //         this.messageInput.focus();
        //
        //         // if (this.payload && this.invoiceMessage === '') {
        //         //     this.nextButtonDisabled = true;
        //         // }
        //     }else{
        //         // this.numpadButtonsActive = true;
        //         // this.nextButtonDisabled = !this.price || Number(this.price) <= 0;
        //     }
        //
        // }

        // if (changedProperties.has('invoiceMessage') && this.payload && this.currentPriceStep === 'messageEnter') {
        //     this.nextButtonDisabled = (this.invoiceMessage.trim() === '' || this.invoiceMessage.length > 124);
        // }

    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.numpadButtonsActive = false;
    }

    render() {
        return html`
            <div class=${`
                 stepWrapper
                 `}
                 style=${(window.innerWidth <= 768) ? `height: ${this.currentVisualViewportHeight}px;` : 'height: 100%;'}
            >

                <div class="header">

                    <p>Invoice from:</p>
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

                                        <div class="tokenInfo" @click=${() => this.openTokenModal()}>

                                            ${
                                                    (this.selectedTokenSymbol && this.selectedNetworkSymbol)
                                                            ? html`
                                                                <p>${this.tokenPrice} <span>${this.selectedTokenSymbol}</span></p>

                                                                <token-icon
                                                                        .id=${this.selectedTokenSymbol}
                                                                        width="25"
                                                                        height="25"
                                                                        class="tokenIcon"
                                                                ></token-icon>
                                                            `
                                                            : html`
                                                                <p class="selectText">Choose token</p>
                                                            `
                                            }

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
                                                          @input=${(event: any) => {

                                                              if (event.target.value.length > 0 && this.showMessageEmptyError) {
                                                                  this.showMessageEmptyError = false;
                                                              }

                                                              this.updateInvoiceMessage(event.target.value);
                                                          }}
                                                          @focus=${() => {
                                                              setTimeout(() => {
                                                                  window.scrollTo({
                                                                      top: -1,
                                                                      left: 0,
                                                                      behavior: "smooth",
                                                                  });
                                                              }, 100)
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
                                                    (this.currentPriceStep === 'messageEnter' && !this.priceAvailable)
                                                            ? html`
                                                                <button class="secondaryButton"
                                                                        @click=${() => {
                                                                            this.updateCurrentPriceStep('priceEnter')
                                                                        }}
                                                                >
                                                                    Edit amount
                                                                </button>
                                                            `
                                                            : ''
                                            }

                                            <button class="mainButton"
                                                    @click=${this.nextWithPayload}
                                                    .disabled=${this.nextButtonDisabled}
                                            >
                                                Next
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
                                                Next
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

                <div class="tokenModal ${(this.showTokenModal) ? 'show' : ''}">

                    <div @click=${() => this.closeTokenModal()}
                         class="overlay ${(this.showTokenModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showTokenModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>Tokens</p>
                                <div class="closeButton"
                                     @click=${() => this.closeTokenModal()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                         viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2"
                                         stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M18 6 6 18"/>
                                        <path d="m6 6 12 12"/>
                                    </svg>
                                </div>
                            </div>

                            <div class="tokensList">
                                ${this.tokens &&
                                this.tokens.map((token: Cryptocurrency) => {
                                    return token.networks?.map((network) => {
                                        const networkStandart = getTokenStandart(network.symbol);

                                        let formatPrice = 0;
                                        if (this.price) {
                                            //@ts-ignore
                                            const price = this.price / token.rates['usd'];
                                            formatPrice = roundUpAmount(price.toString(), token.stable);

                                        }

                                        return html`
                                            <div
                                                    @click=${() => {
                                                        this.dispatchTokenSelect(token.symbol, network.symbol);
                                                        this.closeTokenModal();
                                                    }}
                                                    class=${`tokenItem
                                                        ${this.selectedTokenSymbol === token.symbol && this.selectedNetworkSymbol === network.symbol ? 'selected' : ''}
                                                    `}
                                            >
                                                <div class="tokenContent">
                                                    <div class="tokenIconWrapper">
                                                        <token-icon
                                                                .id=${token.symbol}
                                                                width="32"
                                                                height="32"
                                                                class="tokenIcon"
                                                        ></token-icon>

                                                        <network-icon
                                                                .id=${network.symbol}
                                                                width="16"
                                                                height="16"
                                                                class="networkIcon"
                                                        ></network-icon>
                                                    </div>

                                                    <div class="info">
                                                        <div class="leftSection">
                                                            <p>${token.symbol}</p>

                                                            ${networkStandart
                                                                    ? html`
                                                                        <div class="badge">
                                                                            ${networkStandart}
                                                                        </div>
                                                                    `
                                                                    : ''}
                                                        </div>

                                                        ${
                                                                (formatPrice !== 0)
                                                                        ? html`
                                                                            <p>~${formatPrice} ${token.symbol}</p>
                                                                        `
                                                                        : ''
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    });
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    private dispatchTokenSelect(tokenSymbol: string, networkSymbol: string) {
        const updateEvent = new CustomEvent('updateSelectedToken', {
            detail: {
                tokenSymbol: tokenSymbol,
                networkSymbol: networkSymbol
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updateEvent);
    }

    private openTokenModal() {
        this.showTokenModal = true;

        setTimeout(() => {
            this.showTokenModalOverlay = true;

            setTimeout(() => {
                this.showTokenModalContent = true;
            }, 200)
        }, 200)
    }

    private closeTokenModal() {
        this.showTokenModalContent = false;

        setTimeout(() => {
            this.showTokenModalOverlay = false;

            setTimeout(() => {
                this.showTokenModal = false;
            }, 200)
        }, 200)
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

        if (this.priceValue && Number(this.priceValue) >= 1) {
            const nextStepEvent = new CustomEvent('nextStep', {
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(nextStepEvent);
        }
    }

    private nextWithPayload() {
        if (this.currentPriceStep === 'priceEnter') {

            if (!this.priceValue || Number(this.priceValue) < 1) {
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
            display: flex;
            flex-direction: column;
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 350ms;

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

                        input {
                            font-size: 16px;
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

                .tokenInfo {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;
                    position: absolute;
                    top: calc(50% + 55px);
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    @media (hover: hover) and (pointer: fine) {
                        &:hover {
                            background: var(--sp-widget-function-button-hover-color);
                        }
                    }

                    .selectText {
                        font-size: 13px;
                        font-weight: 500;
                        line-height: 1.2;
                        color: var(--sp-widget-text-color);
                    }

                    p {
                        color: var(--sp-widget-function-button-text-color);
                        font-size: 12px;
                        line-height: 1.2;
                        font-weight: 500;

                        span {
                            color: var(--sp-widget-function-button-text-color);
                            font-size: 12px;
                            line-height: 1.2;
                            font-weight: 500;
                        }
                    }

                    .tokenIcon {
                        background: var(--sp-widget-bg-color);
                        border: 1px solid var(--sp-widget-border-color);
                        width: 20px;
                        aspect-ratio: 1;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
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

            .tokenModal {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                display: flex;
                align-items: flex-end;
                overflow: hidden;
                z-index: 11;

                &.show {
                    height: 100%;
                }

                .overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10;
                    background: color-mix(in srgb,
                    black 0%,
                    transparent) !important;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        background: color-mix(in srgb,
                        black 75%,
                        transparent) !important;
                    }
                }

                .contentWrapper {
                    width: 100%;
                    background: var(--sp-widget-bg-color);
                    z-index: 11;
                    border-radius: 12px 12px 0 0;
                    overflow: hidden;
                    height: auto;
                    max-height: 50%;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        transform: translateY(0);
                    }

                    .content {
                        padding: 1rem;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

                        .titleWrapper {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            p {
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: var(--sp-widget-text-color);
                            }
                        }

                        .closeButton {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            user-select: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                            width: 25px;
                            height: 25px;
                            background: var(--sp-widget-function-button-color);
                            border-radius: 6px;

                            svg {
                                width: 20px;
                                height: 20px;
                                color: var(--sp-widget-function-button-text-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 350ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-function-button-hover-color);

                                    svg {
                                        color: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }
                            }
                        }

                    }
                }

                .tokensList {
                    margin-top: 20px;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    padding: 0 4px;

                    &::-webkit-scrollbar {
                        width: 2px;
                    }

                    &::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--sp-widget-secondary-bg-color);
                    }

                    .tokenItem {
                        user-select: none;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        padding: 8px;
                        border: 1px solid var(--sp-widget-function-button-border-color);
                        border-radius: 8px;
                        background: var(--sp-widget-function-button-color);
                        outline: 2px solid transparent;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 50ms;

                        &.selected {
                            border: 1px solid var(--sp-widget-active-color);
                        }

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: var(--sp-widget-function-button-hover-color);
                                border: 1px solid var(--sp-widget-function-button-hover-border-color);
                            }
                        }

                        .tokenContent {
                            flex: 1;
                            display: flex;
                            gap: 8px;
                            align-items: center;

                            img {
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                object-fit: cover;
                                border: 1px solid var(--sp-widget-border-color);
                                background: var(--sp-widget-bg-color);
                            }

                            .tokenIconWrapper {
                                position: relative;

                                .tokenIcon {
                                    position: relative;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-border-color);
                                    width: 32px;
                                    height: 32px;
                                    border-radius: 50%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    overflow: hidden;

                                    svg {
                                        width: 16px;
                                        height: 16px;
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }

                                .networkIcon {
                                    position: absolute;
                                    bottom: -2px;
                                    right: -3px;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-border-color);
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    overflow: hidden;

                                    svg {
                                        width: 16px;
                                        height: 16px;
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }
                            }

                            .info {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;

                                .leftSection {
                                    display: flex;
                                    gap: 8px;
                                    align-items: center;

                                    p {
                                        font-weight: 500;
                                        color: var(--sp-widget-text-color);
                                    }
                                }

                                p {
                                    font-size: 12px;
                                    font-weight: 500;
                                    color: var(--sp-widget-secondary-text-color);
                                }
                            }

                            .badge {
                                color: var(--sp-widget-badge-text-color);
                                font-weight: 700;
                                padding: 2px 4px;
                                background: var(--sp-widget-badge-bg-color);
                                border: 1px solid var(--sp-widget-badge-border-color);
                                font-size: 10px;
                                border-radius: 4px;
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
