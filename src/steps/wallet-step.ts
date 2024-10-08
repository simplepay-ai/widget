import { Cryptocurrency } from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import {checkWalletAddress} from "../util.ts";
import {IProduct} from "../types.ts";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    @property({ type: Array })
    productsInfo: IProduct[] = [];

    @property({ type: Boolean })
    dark: boolean = false;

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
            <div class=${`stepWrapper ${this.dark ? 'dark' : ''}`}>
                <step-header
                    .dark=${this.dark}
                    .title=${'Connect wallet'}
                    .hasBackButton=${true}
                    .backButtonDisabled=${this.creatingInvoice}
                    .showToken=${true}
                    .token="${{
                        tokenSymbol: this.selectedTokenSymbol,
                        networkStandart: this.getTokenStandart(this.selectedNetworkSymbol),
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
                              <div class="walletsList">
                                  <div @click=${this.dispatchNextStep} class="walletItem">
                                      <div class="image">
                                          <img
                                              src="https://portfolio.metamask.io/assets/metamask-fox-b8558514.svg"
                                              alt="metamask logo"
                                          />
                                      </div>

                                      <p>MetaMask</p>
                                  </div>

                                  <div @click=${this.dispatchNextStep} class="walletItem">
                                      <div class="image svg">
                                          <svg
                                              aria-label="Coinbase logo"
                                              height="32"
                                              role="img"
                                              viewBox="0 0 48 48"
                                              width="32"
                                              xmlns="http://www.w3.org/2000/svg"
                                          >
                                              <path
                                                  d="M24,36c-6.63,0-12-5.37-12-12s5.37-12,12-12c5.94,0,10.87,4.33,11.82,10h12.09C46.89,9.68,36.58,0,24,0 C10.75,0,0,10.75,0,24s10.75,24,24,24c12.58,0,22.89-9.68,23.91-22H35.82C34.87,31.67,29.94,36,24,36z"
                                                  fill="#0052FF"
                                              />
                                          </svg>
                                      </div>

                                      <p>Coinbase</p>
                                  </div>

                                  <div @click=${this.dispatchNextStep} class="walletItem">
                                      <div class="image">
                                          <img
                                              src="https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-logo-short.svg"
                                              alt="ledger logo"
                                          />
                                      </div>

                                      <p>Ledger</p>
                                  </div>
                              </div>

                              <div class="textSeparator">
                                  <p>OR</p>
                              </div>

                              <div @click=${this.dispatchNextStep} class="walletConnectButton">
                                  <svg
                                      viewBox="0 0 540 55"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                  >
                                      <path
                                          d="M18.18 10.6299C32.66 -3.54006 56.13 -3.54006 70.61 10.6299L72.35 12.3399C73.07 13.0499 73.07 14.1999 72.35 14.9099L66.39 20.7399C66.03 21.0899 65.44 21.0899 65.08 20.7399L62.68 18.3899C52.58 8.50994 36.2 8.50994 26.1 18.3899L23.53 20.8999C23.17 21.2499 22.58 21.2499 22.22 20.8999L16.26 15.0699C15.54 14.3599 15.54 13.2099 16.26 12.4999L18.17 10.6299H18.18ZM82.94 22.6899L88.24 27.8799C88.96 28.5899 88.96 29.7399 88.24 30.4499L64.32 53.8599C63.6 54.5699 62.42 54.5699 61.7 53.8599L44.72 37.2499C44.54 37.0699 44.25 37.0699 44.06 37.2499L27.08 53.8599C26.36 54.5699 25.18 54.5699 24.46 53.8599L0.54 30.4499C-0.18 29.7399 -0.18 28.5899 0.54 27.8799L5.84 22.6899C6.56 21.9799 7.74 21.9799 8.46 22.6899L25.44 39.2999C25.62 39.4799 25.91 39.4799 26.1 39.2999L43.08 22.6899C43.8 21.9799 44.98 21.9799 45.7 22.6899L62.68 39.3099C62.86 39.4899 63.15 39.4899 63.34 39.3099L80.32 22.6999C81.04 21.9899 82.22 21.9899 82.94 22.6999V22.6899Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M124.6 50.0202L132.27 19.3302C132.73 17.6402 133.12 15.8202 133.64 12.9602C134.03 15.8202 134.49 17.6402 134.81 19.3302L141.44 50.0202H155.16L166.73 4.50023H156.2L149.83 32.4602C149.18 35.1902 148.79 37.3402 148.33 40.5202C147.81 37.4602 147.29 35.1902 146.7 32.5202L140.52 4.49023H126.73L120.03 32.5202C119.44 35.1902 118.99 37.3302 118.47 40.5202C117.95 37.3302 117.49 35.1902 116.91 32.5202L110.67 4.49023H99.6799L111.19 50.0102H124.59L124.6 50.0202Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M175.87 51.1898C181.07 51.1898 184.39 49.0398 186.08 45.9198C185.88 46.8998 185.82 47.8698 185.82 48.8498V50.0198H194.53V31.2298C194.53 22.2598 190.43 17.0498 180.42 17.0498C171.77 17.0498 166.11 21.8598 165.59 28.4898H175.15C175.48 25.5598 177.56 23.8098 180.74 23.8098C183.73 23.8098 185.36 25.4998 185.36 27.4498C185.36 28.8798 184.51 29.7298 181.98 30.0498L177.43 30.5698C170.67 31.4198 164.88 33.8898 164.88 41.0398C164.88 47.5398 170.28 51.1798 175.87 51.1798V51.1898ZM178.8 44.4898C176.26 44.4898 174.38 43.0598 174.38 40.5898C174.38 38.1198 176.53 37.0098 179.78 36.4298L181.99 36.0398C183.88 35.6498 184.92 35.3198 185.57 34.7398V37.7298C185.57 41.7598 182.64 44.4898 178.81 44.4898H178.8Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M199.49 4.5V50.02H208.92V4.5H199.49Z"
                                          fill="#5570FF"
                                      />
                                      <path d="M214.8 4.5V50.02H224.23V4.5H214.8Z" fill="#5570FF" />
                                      <path
                                          d="M245.24 51.1898C254.21 51.1898 260 46.1198 260.65 39.4898H251.16C250.7 42.4198 248.23 44.0398 245.24 44.0398C241.21 44.0398 238.28 40.7898 238.22 36.2998H260.85V34.4798C260.85 23.9498 255.06 17.0498 245.05 17.0498C235.04 17.0498 228.66 23.8098 228.66 34.0198C228.66 45.0698 235.62 51.1898 245.24 51.1898ZM238.15 30.1198C238.54 26.4798 241.21 23.8098 244.98 23.8098C248.75 23.8098 251.16 26.3498 251.22 30.1198H238.15Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M281.23 50.6698C283.31 50.6698 285.33 50.3398 286.24 50.0798V42.9298C285.52 43.0598 284.68 43.1298 283.96 43.1298C280.51 43.1298 279.28 41.1798 279.28 37.9898V25.4998H286.95V18.1498H279.28V6.83984H269.92V18.1498H263.03V25.4998H269.92V39.2898C269.92 46.8298 273.69 50.6698 281.23 50.6698Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M313.05 51.1901C325.93 51.1901 333.73 43.6501 334.7 32.7901H324.49C323.71 38.7101 319.55 42.7401 313.44 42.7401C306.22 42.7401 301.15 36.8901 301.15 27.0001C301.15 17.1101 306.42 11.7801 313.64 11.7801C319.82 11.7801 323.33 15.5501 324.04 21.0801H334.51C333.47 9.77008 325.15 3.33008 313.7 3.33008C300.63 3.33008 290.62 12.1701 290.62 27.0001C290.62 41.8301 299.4 51.1901 313.05 51.1901Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M354.72 51.1898C364.54 51.1898 371.5 45.0098 371.5 34.2198C371.5 23.4298 364.54 17.0498 354.72 17.0498C344.9 17.0498 338.01 23.6198 338.01 34.2198C338.01 44.8198 344.9 51.1898 354.72 51.1898ZM354.72 43.9098C350.36 43.9098 347.57 40.3298 347.57 34.2198C347.57 28.1098 350.5 24.4698 354.72 24.4698C358.94 24.4698 361.94 27.9798 361.94 34.2198C361.94 40.4598 359.08 43.9098 354.72 43.9098Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M384.64 50.0198V31.3598C384.64 27.3898 387.11 24.4698 390.62 24.4698C393.94 24.4698 395.89 27.0098 395.89 31.2298V50.0198H405.32V29.8598C405.32 22.1898 401.29 17.0498 394.07 17.0498C389.06 17.0498 386.01 19.4598 384.38 22.3198C384.57 21.1498 384.64 20.2398 384.64 19.3898V18.1498H375.21V50.0098H384.64V50.0198Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M419.96 50.0198V31.3598C419.96 27.3898 422.43 24.4698 425.94 24.4698C429.26 24.4698 431.21 27.0098 431.21 31.2298V50.0198H440.64V29.8598C440.64 22.1898 436.61 17.0498 429.39 17.0498C424.38 17.0498 421.33 19.4598 419.7 22.3198C419.89 21.1498 419.96 20.2398 419.96 19.3898V18.1498H410.53V50.0098H419.96V50.0198Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M460.93 51.1898C469.9 51.1898 475.69 46.1198 476.34 39.4898H466.85C466.39 42.4198 463.92 44.0398 460.93 44.0398C456.9 44.0398 453.97 40.7898 453.91 36.2998H476.54V34.4798C476.54 23.9498 470.75 17.0498 460.74 17.0498C450.73 17.0498 444.35 23.8098 444.35 34.0198C444.35 45.0698 451.31 51.1898 460.93 51.1898ZM453.84 30.1198C454.23 26.4798 456.89 23.8098 460.67 23.8098C464.45 23.8098 466.85 26.3498 466.91 30.1198H453.84Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M496.78 51.1898C506.66 51.1898 512.06 45.7898 513.1 37.3998H503.67C503.35 40.9098 501.33 43.8998 497.1 43.8998C492.87 43.8998 489.88 39.9298 489.88 34.0798C489.88 27.7098 493.26 24.4598 497.29 24.4598C501.32 24.4598 503.21 27.3198 503.47 30.6398H512.9C512.19 22.8998 506.92 17.0498 497.23 17.0498C487.54 17.0498 480.32 23.2898 480.32 34.0898C480.32 44.8898 486.63 51.1898 496.77 51.1898H496.78Z"
                                          fill="#5570FF"
                                      />
                                      <path
                                          d="M533.5 50.6698C535.58 50.6698 537.6 50.3398 538.51 50.0798V42.9298C537.79 43.0598 536.95 43.1298 536.23 43.1298C532.78 43.1298 531.55 41.1798 531.55 37.9898V25.4998H539.22V18.1498H531.55V6.83984H522.19V18.1498H515.3V25.4998H522.19V39.2898C522.19 46.8298 525.96 50.6698 533.5 50.6698Z"
                                          fill="#5570FF"
                                      />
                                  </svg>
                              </div>

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
                    .dark=${this.dark}
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

    private getTokenStandart(network: string) {
        switch (network) {
            case 'ethereum':
                return 'ERC20';
            case 'bsc':
                return 'BEP20';
            case 'tron':
                return 'TRC20';
            default:
                return '';
        }
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
                    background: var(--sp-border);
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
                        color: var(--sp-primary-font);
                    }

                    svg {
                        width: 20px;
                        height: 20px;
                        animation: spin 1s linear infinite;
                    }

                    circle {
                        stroke: var(--sp-accent);
                        opacity: 0.25;
                    }

                    path {
                        fill: var(--sp-accent);
                        opacity: 0.75;
                    }
                }

                .walletsList {
                    display: none;
                    //display: flex;
                    gap: 16px;
                    align-items: flex-start;

                    .walletItem {
                        cursor: pointer;
                        user-select: none;

                        .image {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 65px;
                            height: 65px;
                            border-radius: 8px;
                            border: 1px solid var(--sp-border);
                            background: var(--sp-primary-background);

                            img,
                            svg {
                                width: 30px;
                                transition-property: transform;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 350ms;
                            }
                        }

                        p {
                            text-align: center;
                            margin-top: 8px;
                            font-weight: 700;
                            color: var(--sp-primary-font);
                            font-size: 12px;
                        }

                        &:hover,
                        &:active {
                            img,
                            svg {
                                transform: scale(1.2);
                            }
                        }
                    }
                }

                .textSeparator {
                    display: none;
                    position: relative;
                    //display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 12px;

                    &:after {
                        content: '';
                        width: 100%;
                        height: 1px;
                        background: var(--sp-border);
                        position: absolute;
                        top: 50%;
                        left: 0;
                        transform: translateY(-50%);
                    }

                    p {
                        z-index: 1;
                        overflow: hidden;
                        padding: 0 12px;
                        font-weight: 700;
                        color: var(--sp-primary-font);
                        background: var(--sp-secondary-background);
                    }
                }

                .walletConnectButton {
                    display: none;
                    margin-top: 12px;
                    //display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--sp-border);
                    background: var(--sp-primary-background);
                    cursor: pointer;

                    svg {
                        width: 170px;
                        height: 30px;
                        transition-property: transform;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 350ms;

                        path {
                            fill: var(--sp-accent);
                        }
                    }

                    &:hover,
                    &:active {
                        svg {
                            transform: scale(1.1);
                        }
                    }
                }

                .inputWrapper {
                    //margin-top: 16px;

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

                    input {
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

                    .input {
                        margin-top: 4px;
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        .pasteButton {
                            padding: 11px;
                            width: 42px;
                            aspect-ratio: 1;
                            border: 1px solid var(--sp-border);
                            border-radius: 6px;
                            color: var(--sp-primary-font);
                            background: var(--sp-primary-background);
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
                        margin-top: 8px;
                        font-size: 12px;
                        line-height: 16px;
                        color: var(--sp-secondary-font);
                        text-align: left;
                    }
                }

                .separator {
                    margin: 16px 0;
                    height: 1px;
                    width: 100%;
                    background: var(--sp-border);
                }

                .infoWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    color: var(--sp-secondary-font);

                    .infoItem {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;

                        &.column {
                            align-items: flex-start;
                            flex-direction: column;
                            justify-content: unset;
                            gap: 4px;
                        }

                        .title {
                            font-size: 14px;
                            line-height: 20px;
                            font-weight: 700;
                        }

                        .tokenInfo {
                            display: flex;
                            gap: 8px;
                            align-items: center;

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-primary-font);
                                font-weight: 700;
                            }

                            .badge {
                                color: var(--sp-secondary-font);
                                font-weight: 700;
                                padding: 2px 4px;
                                background: var(--sp-primary-background);
                                border: 1px solid var(--sp-border);
                                font-size: 10px;
                                border-radius: 4px;
                            }
                        }

                        .fromInfo {
                            font-size: 12px;
                            line-height: 20px;
                            text-transform: capitalize;
                            color: var(--sp-primary-font);
                            font-weight: 700;

                            &.empty {
                                font-weight: 700;
                                color: var(--sp-primary-font);
                            }
                        }

                        .amountInfo {
                            font-size: 12px;
                            line-height: 20px;
                            color: var(--sp-primary-font);
                            font-weight: 700;
                        }
                    }
                }
            }

            &.dark {
                .badge {
                    color: var(--sp-primary-background) !important;
                    background: var(--sp-primary-font) !important;
                }

                .walletConnectButton {
                    background: color-mix(
                        in srgb,
                        var(--sp-secondary-background) 20%,
                        transparent
                    ) !important;
                }

                .walletItem {
                    .image {
                        background: color-mix(
                            in srgb,
                            var(--sp-secondary-background) 20%,
                            transparent
                        ) !important;
                    }
                }

                input {
                    background: color-mix(
                        in srgb,
                        var(--sp-secondary-background) 15%,
                        transparent
                    ) !important;
                }

                .textSeparator {
                    p {
                        background: var(--sp-primary-background) !important;
                    }
                }

                .pasteButton {
                    color: var(--sp-primary-background) !important;
                    background: var(--sp-primary-font) !important;
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
