import { Cryptocurrency } from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../util.ts";
import {IProduct} from "../types.ts";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    @property({ type: Array })
    productsInfo: IProduct[] = [];

    @property({ type: Boolean })
    darkTheme: boolean = false;

    @property({ type: Array })
    tokens: Cryptocurrency[] = [];

    @property({ type: String })
    price: string = '';

    @property({ type: String })
    walletAddress: string = '';

    @property({ type: String })
    selectedTokenSymbol: string = '';

    @property({ type: String })
    selectedNetworkSymbol: string = '';

    @property({ type: Boolean })
    creatingInvoice: boolean = false;

    @property({ attribute: false, type: String })
    private inputValue = '';

    @property({ attribute: false, type: Boolean })
    private buttonDisabled = true;

    connectedCallback() {
        super.connectedCallback();

        if (this.walletAddress) {
            this.inputValue = this.walletAddress;
            this.buttonDisabled = this.walletAddress === '';
        }
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('walletAddress')) {
            this.inputValue = this.walletAddress;
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.darkTheme ? 'dark' : ''}`}>
                <step-header
                    .darkTheme=${this.darkTheme}
                    .title=${'Connect wallet'}
                    .hasBackButton=${true}
                    .backButtonDisabled=${this.creatingInvoice}
                    .showToken=${true}
                    .token="${{
                        tokenSymbol: this.selectedTokenSymbol,
                        networkStandart: getTokenStandart(this.selectedNetworkSymbol),
                        networkSymbol: this.selectedNetworkSymbol
                    }}"
                    .tokens=${this.tokens}
                ></step-header>

                ${this.creatingInvoice
                    ? html`
                          <div class="stepContent">
                              <div class="spinner">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                  >
                                      <circle cx="12" cy="12" r="10" stroke-width="4" />
                                      <path
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                  </svg>

                                  <p>Creating invoice ...</p>
                              </div>
                          </div>
                      `
                    : html`
                          <div class="stepContent">

                              <div class="inputWrapper">
                                  <label for="address">
                                      <p class="labelText">Enter your wallet address:</p>

                                      <div class="input">
                                          <input
                                              id="address"
                                              type="text"
                                              value=${this.inputValue}
                                              @input=${this.inputHandler}
                                              placeholder=${`Enter your ${this.selectedNetworkSymbol} address`}
                                          />

                                          <div class="pasteButton" @click=${() => this.pasteData()}>
                                              <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="24"
                                                  height="24"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  stroke-width="2"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                              >
                                                  <rect
                                                      width="8"
                                                      height="4"
                                                      x="8"
                                                      y="2"
                                                      rx="1"
                                                      ry="1"
                                                  />
                                                  <path
                                                      d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                                                  />
                                                  <path d="M16 4h2a2 2 0 0 1 2 2v4" />
                                                  <path d="M21 14H11" />
                                                  <path d="m15 10-4 4 4 4" />
                                              </svg>
                                          </div>
                                      </div>

                                      <p class="descriptionText">
                                          Enter the address of the wallet you will use to complete
                                          the payment. We need this to track and verify the on-chain
                                          transaction as our service is fully decentralized
                                      </p>
                                  </label>
                              </div>
                          </div>
                      `}

                <step-footer
                    .darkTheme=${this.darkTheme}
                    .price=${this.price}
                    .hasButton=${true}
                    .buttonDisabled=${this.buttonDisabled || this.creatingInvoice}
                    .buttonText=${'Confirm'}
                    .productsInfo=${this.productsInfo}
                    @footerButtonClick=${this.dispatchNextStep}
                ></step-footer>
            </div>
        `;
    }

    private pasteData() {
        try {
            navigator.clipboard.readText().then((clipText) => {
                this.inputValue = clipText;
                this.buttonDisabled = clipText === '';
                this.updateWalletAddress(clipText);
            });
        } catch (error) {
            console.log('Paste data error', error);
        }
    }

    private inputHandler(event: CustomEvent | any) {
        const address = event.target.value;

        if (address === '') {
            this.buttonDisabled = true;
            this.updateWalletAddress('');
            return;
        }

        this.inputValue = address;
        this.buttonDisabled = Boolean(address === '');
        this.updateWalletAddress(address);
    }

    private dispatchNextStep() {

        if (!this.inputValue || this.inputValue === '') {
            return;
        }

        if (!checkWalletAddress(this.inputValue, this.selectedNetworkSymbol)) {
            const options = {
                detail: {
                    notificationData: {
                        title: 'Invalid Wallet Address',
                        text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                        buttonText: 'Confirm'
                    },
                    notificationShow: true
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('updateNotification', options));

            return;
        }

        const nextStepEvent = new CustomEvent('nextStep', {
            bubbles: true,
            composed: true
        });

        this.updateWalletAddress(this.inputValue);
        this.dispatchEvent(nextStepEvent);
    }

    private updateWalletAddress(address: string){
        const updateWalletAddressEvent = new CustomEvent('updateWalletAddress', {
            detail: {
                walletAddress: address
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateWalletAddressEvent);
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
                        stroke: var(--sp-widget-link-color);
                        opacity: 0.25;
                    }

                    path {
                        fill: var(--sp-widget-link-color);
                        opacity: 0.75;
                    }
                }

                .inputWrapper {
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

                    .input {
                        margin-top: 4px;
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .pasteButton {
                            padding: 11px;
                            width: 42px;
                            aspect-ratio: 1;
                            border: 1px solid var(--sp-widget-hint-color);
                            border-radius: 6px;
                            color: var(--sp-widget-text-color);
                            background: var(--sp-widget-bg-color);
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 4px;
                            font-size: 12px;

                            svg {
                                width: 16px;
                                height: 16px;
                            }
                        }
                    }

                    .descriptionText {
                        padding-left: 8px;
                        margin-top: 8px;
                        font-size: 12px;
                        line-height: 16px;
                        color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                        text-align: left;
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
                
                .pasteButton {
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
                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent) !important;
                }
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
        'wallet-step': WalletStep;
    }
}
