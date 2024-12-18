import {html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {CurrentPriceStep} from "../types.ts";
import {App, Cryptocurrency} from "@simplepay-ai/api-client";
import {getTokenStandart, roundUpAmount} from "../util.ts";
//@ts-ignore
import style from "../styles/price-step.css?inline";

@customElement('price-step')
export class PriceStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    appInfo: App | null = null;

    @property({type: String})
    price: string = '';

    @property({type: Boolean})
    payloadMessage: boolean = false;

    @property({type: String})
    invoiceMessage: string = '';

    @property({type: String})
    currentPriceStep: CurrentPriceStep = 'priceEnter';

    @property({type: Boolean})
    priceAvailable: boolean = false;

    @property({type: Boolean})
    tokenAvailable: boolean = false;

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

            if (this.payloadMessage) {
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
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
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

                                        <div class=${`
                                        tokenInfo
                                        ${(this.tokenAvailable) ? 'disabled' : ''}
                                        `}
                                             @click=${() => this.openTokenModal()}
                                        >

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
                                                    <p>${this.price}</p>
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
                            (this.payloadMessage)
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
                                                            : ''
                                            }

                                            ${
                                                    (this.currentPriceStep === 'messageEnter' && !this.priceAvailable)
                                                            ? html`
                                                                <button class="secondaryButton"
                                                                        @click=${() => {
                                                                            this.updateCurrentPriceStep('priceEnter')
                                                                            this.updateInvoiceMessage('');
                                                                        }}
                                                                >
                                                                    Edit amount
                                                                </button>
                                                            `
                                                            : ''
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
}

declare global {
    interface HTMLElementTagNameMap {
        'price-step': PriceStep;
    }
}
