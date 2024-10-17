import { Cryptocurrency } from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../util.ts";
import {IProduct} from "../types.ts";
import {EthersAdapter} from "@reown/appkit-adapter-ethers";
import {mainnet, bsc} from '@reown/appkit/networks'
import {AppKit, createAppKit} from '@reown/appkit'
import {WagmiAdapter} from "@reown/appkit-adapter-wagmi";
import { getAccount } from '@wagmi/core'
import {MetaMaskSDK} from "@metamask/sdk";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    @property({ type: Array })
    productsInfo: IProduct[] = [];

    @property({ type: String })
    theme: string = 'light';

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

    @property({ attribute: false, type: Object })
    private metaMaskSDK = null;

    // @property({ attribute: false, type: Object })
    // private appKitModal: AppKit;

    connectedCallback() {
        super.connectedCallback();

        if (this.walletAddress) {
            this.inputValue = this.walletAddress;
            this.buttonDisabled = this.walletAddress === '';
        }

        this.initMetaMask();
        // this.createAppKit();

    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if(changedProperties.has('walletAddress')) {
            this.inputValue = this.walletAddress;
        }

        if(changedProperties.has('appKitModal')) {
            console.log('appKitModal', this.appKitModal)
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.theme === 'dark' ? 'dark' : ''}`}>
                <step-header
                    .darkTheme=${(this.theme === 'dark')}
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

                              <div class="connectorButton">
                                  <svg height="30" viewBox="0 0 1311 242" width="162" xmlns="http://www.w3.org/2000/svg"
                                       class="app-header__metafox-logo--horizontal">
                                      <g fill="none">
                                          <g fill="var(--sp-widget-text-color)" transform="translate(361 61)">
                                              <path d="m796.7 60.9c-6.8-4.5-14.3-7.7-21.4-11.7-4.6-2.6-9.5-4.9-13.5-8.2-6.8-5.6-5.4-16.6 1.7-21.4 10.2-6.8 27.1-3 28.9 10.9 0 .3.3.5.6.5h15.4c.4 0 .7-.3.6-.7-.8-9.6-4.5-17.6-11.3-22.7-6.5-4.9-13.9-7.5-21.8-7.5-40.7 0-44.4 43.1-22.5 56.7 2.5 1.6 24 12.4 31.6 17.1s10 13.3 6.7 20.1c-3 6.2-10.8 10.5-18.6 10-8.5-.5-15.1-5.1-17.4-12.3-.4-1.3-.6-3.8-.6-4.9 0-.3-.3-.6-.6-.6h-16.7c-.3 0-.6.3-.6.6 0 12.1 3 18.8 11.2 24.9 7.7 5.8 16.1 8.2 24.8 8.2 22.8 0 34.6-12.9 37-26.3 2.1-13.1-1.8-24.9-13.5-32.7z"></path>
                                              <path d="m71.6 2.3h-7.4-8.1c-.3 0-.5.2-.6.4l-13.7 45.2c-.2.6-1 .6-1.2 0l-13.7-45.2c-.1-.3-.3-.4-.6-.4h-8.1-7.4-10c-.3 0-.6.3-.6.6v115.4c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-87.7c0-.7 1-.8 1.2-.2l13.8 45.5 1 3.2c.1.3.3.4.6.4h12.8c.3 0 .5-.2.6-.4l1-3.2 13.8-45.5c.2-.7 1.2-.5 1.2.2v87.7c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-115.4c0-.3-.3-.6-.6-.6z"></path>
                                              <path d="m541 2.3c-.3 0-.5.2-.6.4l-13.7 45.2c-.2.6-1 .6-1.2 0l-13.7-45.2c-.1-.3-.3-.4-.6-.4h-25.4c-.3 0-.6.3-.6.6v115.4c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-87.7c0-.7 1-.8 1.2-.2l13.8 45.5 1 3.2c.1.3.3.4.6.4h12.8c.3 0 .5-.2.6-.4l1-3.2 13.8-45.5c.2-.7 1.2-.5 1.2.2v87.7c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-115.4c0-.3-.3-.6-.6-.6z"></path>
                                              <path d="m325.6 2.3h-31.1-16.7-31.1c-.3 0-.6.3-.6.6v14.4c0 .3.3.6.6.6h30.5v100.4c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-100.4h30.5c.3 0 .6-.3.6-.6v-14.4c0-.3-.2-.6-.6-.6z"></path>
                                              <path d="m424.1 118.9h15.2c.4 0 .7-.4.6-.8l-31.4-115.8c-.1-.3-.3-.4-.6-.4h-5.8-10.2-5.8c-.3 0-.5.2-.6.4l-31.4 115.8c-.1.4.2.8.6.8h15.2c.3 0 .5-.2.6-.4l9.1-33.7c.1-.3.3-.4.6-.4h33.6c.3 0 .5.2.6.4l9.1 33.7c.1.2.4.4.6.4zm-39.9-51 12.2-45.1c.2-.6 1-.6 1.2 0l12.2 45.1c.1.4-.2.8-.6.8h-24.4c-.4 0-.7-.4-.6-.8z"></path>
                                              <path d="m683.3 118.9h15.2c.4 0 .7-.4.6-.8l-31.4-115.8c-.1-.3-.3-.4-.6-.4h-5.8-10.2-5.8c-.3 0-.5.2-.6.4l-31.4 115.8c-.1.4.2.8.6.8h15.2c.3 0 .5-.2.6-.4l9.1-33.7c.1-.3.3-.4.6-.4h33.6c.3 0 .5.2.6.4l9.1 33.7c.1.2.3.4.6.4zm-39.9-51 12.2-45.1c.2-.6 1-.6 1.2 0l12.2 45.1c.1.4-.2.8-.6.8h-24.4c-.4 0-.7-.4-.6-.8z"></path>
                                              <path d="m149.8 101.8v-35.8c0-.3.3-.6.6-.6h44.5c.3 0 .6-.3.6-.6v-14.4c0-.3-.3-.6-.6-.6h-44.5c-.3 0-.6-.3-.6-.6v-30.6c0-.3.3-.6.6-.6h50.6c.3 0 .6-.3.6-.6v-14.4c0-.3-.3-.6-.6-.6h-51.2-17.3c-.3 0-.6.3-.6.6v15 31.9 15.6 37 15.8c0 .3.3.6.6.6h17.3 53.3c.3 0 .6-.3.6-.6v-15.2c0-.3-.3-.6-.6-.6h-52.8c-.3-.1-.5-.3-.5-.7z"></path>
                                              <path d="m949.3 117.9-57.8-59.7c-.2-.2-.2-.6 0-.8l52-54c.4-.4.1-1-.4-1h-21.3c-.2 0-.3.1-.4.2l-44.1 45.8c-.4.4-1 .1-1-.4v-45c0-.3-.3-.6-.6-.6h-16.7c-.3 0-.6.3-.6.6v115.4c0 .3.3.6.6.6h16.7c.3 0 .6-.3.6-.6v-50.8c0-.5.7-.8 1-.4l50 51.6c.1.1.3.2.4.2h21.3c.4-.1.7-.8.3-1.1z"></path>
                                          </g>
                                          <g stroke-linecap="round" stroke-linejoin="round" transform="translate(1 1)">
                                              <path d="m246.1.2-101.1 75 18.8-44.2z" fill="#e17726" stroke="#e17726"></path>
                                              <g fill="#e27625" stroke="#e27625" transform="translate(2)">
                                                  <path d="m10.9.2 100.2 75.7-17.9-44.9z"></path>
                                                  <path d="m207.7 174.1-26.9 41.2 57.6 15.9 16.5-56.2z"></path>
                                                  <path d="m.2 175 16.4 56.2 57.5-15.9-26.8-41.2z"></path>
                                                  <path d="m71 104.5-16 24.2 57 2.6-1.9-61.5z"></path>
                                                  <path d="m184 104.5-39.7-35.4-1.3 62.2 57-2.6z"></path>
                                                  <path d="m74.1 215.3 34.5-16.7-29.7-23.2z"></path>
                                                  <path d="m146.4 198.6 34.4 16.7-4.7-39.9z"></path>
                                              </g>
                                              <g fill="#d5bfb2" stroke="#d5bfb2" transform="translate(76 198)">
                                                  <path d="m106.8 17.3-34.4-16.7 2.8 22.4-.3 9.5z"></path>
                                                  <path d="m.1 17.3 32 15.2-.2-9.5 2.7-22.4z"></path>
                                              </g>
                                              <path d="m108.7 160.6-28.6-8.4 20.2-9.3z" fill="#233447" stroke="#233447"></path>
                                              <path d="m150.3 160.6 8.4-17.7 20.3 9.3z" fill="#233447" stroke="#233447"></path>
                                              <g fill="#cc6228" stroke="#cc6228" transform="translate(49 128)">
                                                  <path d="m27.1 87.3 5-41.2-31.8.9z"></path>
                                                  <path d="m128.9 46.1 4.9 41.2 26.9-40.3z"></path>
                                                  <path d="m153 .7-57 2.6 5.3 29.3 8.4-17.7 20.3 9.3z"></path>
                                                  <path d="m31.1 24.2 20.2-9.3 8.4 17.7 5.3-29.3-57-2.6z"></path>
                                              </g>
                                              <g fill="#e27525" stroke="#e27525" transform="translate(57 128)">
                                                  <path d="m0 .7 23.9 46.7-.8-23.2z"></path>
                                                  <path d="m122 24.2-.9 23.2 23.9-46.7z"></path>
                                                  <path d="m57 3.3-5.3 29.3 6.7 34.6 1.5-45.6z"></path>
                                                  <path d="m88 3.3-2.8 18.2 1.4 45.7 6.7-34.6z"></path>
                                              </g>
                                              <path d="m150.3 160.6-6.7 34.6 4.8 3.4 29.7-23.2.9-23.2z" fill="#f5841f" stroke="#f5841f"></path>
                                              <path d="m80.1 152.2.8 23.2 29.7 23.2 4.8-3.4-6.7-34.6z" fill="#f5841f" stroke="#f5841f"></path>
                                              <path d="m150.9 230.5.3-9.5-2.6-2.2h-38.2l-2.5 2.2.2 9.5-32-15.2 11.2 9.2 22.7 15.7h38.9l22.8-15.7 11.1-9.2z"
                                                    fill="#c0ac9d" stroke="#c0ac9d"></path>
                                              <path d="m148.4 198.6-4.8-3.4h-28.2l-4.8 3.4-2.7 22.4 2.5-2.2h38.2l2.6 2.2z" fill="#161616"
                                                    stroke="#161616"></path>
                                              <g fill="#763e1a" stroke="#763e1a">
                                                  <path d="m250.4 80.1 8.5-41.4-12.8-38.5-97.7 72.5 37.6 31.8 53.1 15.5 11.7-13.7-5.1-3.7 8.1-7.4-6.2-4.8 8.1-6.2z"></path>
                                                  <path d="m.1 38.7 8.6 41.4-5.5 4.1 8.2 6.2-6.2 4.8 8.1 7.4-5.1 3.7 11.7 13.7 53.1-15.5 37.6-31.8-97.7-72.5z"></path>
                                              </g>
                                              <g fill="#f5841f" stroke="#f5841f">
                                                  <path d="m239.1 120-53.1-15.5 16 24.2-23.9 46.7 31.6-.4h47.2z"></path>
                                                  <path d="m73 104.5-53.1 15.5-17.7 55h47.1l31.6.4-23.9-46.7z"></path>
                                                  <path d="m145 131.3 3.4-58.6 15.4-41.7h-68.6l15.4 41.7 3.4 58.6 1.3 18.4.1 45.5h28.2l.1-45.5z"></path>
                                              </g>
                                          </g>
                                      </g>
                                  </svg>
                              </div>

                              <div class="textSeparator">
                                  <p>OR</p>
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
                    .darkTheme=${(this.theme === 'dark')}
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

    private initMetaMask(){
        try {
            const MMSDK = new MetaMaskSDK({
                dappMetadata: {
                    name: "Simple example dapp",
                    url: window.location.href,
                },
                infuraAPIKey: process.env.INFURA_API_KEY,
                // Other options.
            })
        } catch (error) {

            const options = {
                detail: {
                    notificationData: {
                        title: 'MetaMask Initialization Failed',
                        text: 'We were unable to initialize MetaMask at this time. If you would like to use MetaMask, please try again later.',
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
    }
    // private async createAppKit(){
    //
    //     const themeVariables = {};
    //     if(this.theme === 'custom'){
    //         let colorMix = 'rgb(244 244 245)';
    //         let colorAccent = 'rgb(59 130 246)';
    //
    //         const customThemeVariables = document.querySelector('html').getAttribute('style');
    //
    //         if(customThemeVariables){
    //             const variablesArray = customThemeVariables.split(';')
    //             if(variablesArray.length > 0){
    //                 for(let variable of variablesArray){
    //                     if(variable.indexOf('--sp-widget-link-color') !== -1){
    //                         colorAccent = variable.split(':')[1].trim();
    //                     }
    //
    //                     if(variable.indexOf('--sp-widget-secondary-bg-color') !== -1){
    //                         colorMix = variable.split(':')[1].trim();
    //                     }
    //                 }
    //             }
    //         }
    //
    //         themeVariables['--w3m-color-mix'] = colorMix;
    //         themeVariables['--w3m-color-mix-strength'] = 30;
    //         themeVariables['--w3m-accent'] = colorAccent;
    //     }
    //
    //     const modal = createAppKit({
    //         adapters: [new EthersAdapter()],
    //         networks: [mainnet],
    //         metadata: {
    //             name: 'Simple',
    //             description: 'Simple description for test',
    //             url: 'https://simple-console.vercel.app/',
    //             icons: []
    //         },
    //         projectId: 'b385e1eebef135dccafa0f1efaf09e85',
    //         features: {
    //             analytics: true,
    //             onramp: true
    //         },
    //         themeMode: 'light',
    //         themeVariables
    //     })
    //     this.appKitModal = modal;
    //
    //     modal.subscribeEvents((newEvent) => {
    //         console.log('Event', newEvent.data.event)
    //         if(newEvent.data.event === 'CONNECT_SUCCESS'){
    //             console.log('success', modal.getAddress())
    //         }
    //     })
    // }

    // private async connectWallet(){
    //
    //     if(!this.appKitModal){
    //         const options = {
    //             detail: {
    //                 notificationData: {
    //                     title: 'WalletConnect Initialization Failed',
    //                     text: 'We were unable to initialize WalletConnect at this time. If you would like to use WalletConnect, please try again later.',
    //                     buttonText: 'Confirm'
    //                 },
    //                 notificationShow: true
    //             },
    //             bubbles: true,
    //             composed: true
    //         };
    //         this.dispatchEvent(new CustomEvent('updateNotification', options));
    //
    //         return;
    //     }
    //
    //     await this.appKitModal.open()
    // }

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

                .connectorButton {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--sp-widget-hint-color);
                    background: var(--sp-widget-bg-color);
                    cursor: pointer;

                    svg {
                        transition-property: transform;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 350ms;
                    }

                    @media(hover: hover) and (pointer: fine){
                        &:hover{
                            svg {
                                transform: scale(1.1);
                            }
                        }
                    }
                }

                .textSeparator {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 24px 0;

                    &:after {
                        content: '';
                        width: 100%;
                        height: 1px;
                        background: var(--sp-widget-hint-color);
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
                        color: var(--sp-widget-text-color);
                        background: var(--sp-widget-secondary-bg-color);
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
                
                .walletConnectButton{
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

                .textSeparator {
                    &:after {
                        background: color-mix(
                                in srgb,
                                var(--sp-widget-hint-color) 15%,
                                transparent
                        ) !important;
                    }

                    p {
                        background: var(--sp-widget-bg-color) !important;
                    }
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
