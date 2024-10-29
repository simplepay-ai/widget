import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../util.ts";
import {IProduct, WalletType} from "../types.ts";
import {
    createConfig,
    http,
    fallback,
    connect,
    injected, createStorage, reconnect, getAccount, disconnect,
} from "@wagmi/core";
import {mainnet, bsc} from '@wagmi/core/chains'
import {metaMask, walletConnect} from "@wagmi/connectors";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    @property({type: Array})
    productsInfo: IProduct[] = [];

    @property({type: String})
    price: string = '';

    @property({type: String})
    walletAddress: string = '';

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: String})
    walletType: WalletType | '' = '';

    @property({type: Boolean})
    creatingInvoice: boolean = false;

    @property({type: Object})
    walletConnectorConfig: any;

    @property({attribute: false, type: String})
    private inputValue = '';

    @property({attribute: false, type: Boolean})
    private buttonDisabled = true;

    @property({attribute: false, type: Boolean})
    private showWalletModal = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    private showApproveAddressModal = false;

    @property({attribute: false, type: Boolean})
    private showApproveAddressModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    private showApproveAddressModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalError: boolean = false;

    @property({attribute: false, type: String})
    private walletModalErrorText: string = '';

    @property({attribute: false, type: Boolean})
    private connectingInProcess: boolean = false;

    @property({attribute: false, type: String})
    private connectingType: WalletType | '' = '';

    async connectedCallback() {
        super.connectedCallback();

        await this.checkConnectorConfig();
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title= ${'Connect wallet'}
                        .hasBackButton=${true}
                        .backButtonDisabled=${this.creatingInvoice}
                        .showToken=${true}
                        .token="${{
                            tokenSymbol: this.selectedTokenSymbol,
                            networkStandart: getTokenStandart(this.selectedNetworkSymbol),
                            networkSymbol: this.selectedNetworkSymbol
                        }}"
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
                            <div class="stepContent">

                                ${
                                        (['bsc', 'ethereum'].includes(this.selectedNetworkSymbol))
                                                ? html`
                                                    <div @click=${() => this.selectWalletType('MetaMask')}
                                                         class=${`
                                                         walletType
                                                         ${(this.connectingInProcess && this.connectingType === 'MetaMask') ? 'inProcess' : ''}
                                                         ${(this.connectingInProcess && this.connectingType !== 'MetaMask') ? 'waiting' : ''}
                                                         `}
                                                    >
                                                        <p>MetaMask</p>
                                                        <svg class="typeIcon" xmlns="http://www.w3.org/2000/svg" width="36"
                                                             height="30"
                                                             viewBox="0 0 36 30" fill="none">
                                                            <path d="M32.9583 1L19.8242 10.7183L22.2666 4.99099L32.9583 1Z"
                                                                  fill="#E17726" stroke="#E17726" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M2.66284 1L15.68 10.809L13.3546 4.99098L2.66284 1Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M28.2292 23.5334L24.7346 28.872L32.2175 30.9323L34.3611 23.6501L28.2292 23.5334Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M1.27271 23.6501L3.40325 30.9323L10.8732 28.872L7.39154 23.5334L1.27271 23.6501Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M10.4704 14.5149L8.39185 17.6507L15.7968 17.9876L15.55 10.0186L10.4704 14.5149Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M25.1503 14.515L19.9929 9.92798L19.824 17.9877L27.2289 17.6508L25.1503 14.515Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M10.8733 28.872L15.3552 26.7081L11.4969 23.7019L10.8733 28.872Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M20.2659 26.7081L24.7348 28.872L24.1242 23.7019L20.2659 26.7081Z"
                                                                  fill="#E27625" stroke="#E27625" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M24.7348 28.8722L20.2659 26.7083L20.6296 29.6108L20.5906 30.8418L24.7348 28.8722Z"
                                                                  fill="#D5BFB2" stroke="#D5BFB2" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M10.8733 28.8722L15.0305 30.8418L15.0045 29.6108L15.3552 26.7083L10.8733 28.8722Z"
                                                                  fill="#D5BFB2" stroke="#D5BFB2" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M15.1083 21.7842L11.3928 20.6958L14.017 19.4907L15.1083 21.7842Z"
                                                                  fill="#233447" stroke="#233447" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M20.5127 21.7842L21.604 19.4907L24.2412 20.6958L20.5127 21.7842Z"
                                                                  fill="#233447" stroke="#233447" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M10.8732 28.872L11.5228 23.5334L7.3916 23.6501L10.8732 28.872Z"
                                                                  fill="#CC6228" stroke="#CC6228" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M24.0981 23.5334L24.7347 28.872L28.2293 23.6501L24.0981 23.5334Z"
                                                                  fill="#CC6228" stroke="#CC6228" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M27.2289 17.6506L19.824 17.9875L20.5125 21.7842L21.6038 19.4906L24.241 20.6957L27.2289 17.6506Z"
                                                                  fill="#CC6228" stroke="#CC6228" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M11.3928 20.6957L14.017 19.4906L15.1083 21.7842L15.7968 17.9875L8.39185 17.6506L11.3928 20.6957Z"
                                                                  fill="#CC6228" stroke="#CC6228" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M8.39209 17.6506L11.497 23.7019L11.393 20.6957L8.39209 17.6506Z"
                                                                  fill="#E27525" stroke="#E27525" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M24.2412 20.6957L24.1243 23.7019L27.2292 17.6506L24.2412 20.6957Z"
                                                                  fill="#E27525" stroke="#E27525" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M15.7972 17.9875L15.1086 21.7842L15.979 26.2675L16.1739 20.3588L15.7972 17.9875Z"
                                                                  fill="#E27525" stroke="#E27525" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M19.8242 17.9875L19.4604 20.3459L19.6423 26.2675L20.5127 21.7842L19.8242 17.9875Z"
                                                                  fill="#E27525" stroke="#E27525" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M20.5127 21.7843L19.6423 26.2676L20.2659 26.7082L24.1243 23.702L24.2412 20.6958L20.5127 21.7843Z"
                                                                  fill="#F5841F" stroke="#F5841F" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M11.3928 20.6958L11.4968 23.702L15.3551 26.7082L15.9787 26.2676L15.1083 21.7843L11.3928 20.6958Z"
                                                                  fill="#F5841F" stroke="#F5841F" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M20.5907 30.8417L20.6296 29.6107L20.2919 29.3256H15.3293L15.0045 29.6107L15.0305 30.8417L10.8733 28.8721L12.3283 30.0642L15.2773 32.0986H20.3308L23.2928 30.0642L24.7348 28.8721L20.5907 30.8417Z"
                                                                  fill="#C0AC9D" stroke="#C0AC9D" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M20.2658 26.7081L19.6422 26.2676H15.9787L15.3552 26.7081L15.0044 29.6107L15.3292 29.3256H20.2918L20.6296 29.6107L20.2658 26.7081Z"
                                                                  fill="#161616" stroke="#161616" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M33.5168 11.3532L34.6211 5.98873L32.9582 1L20.2659 10.3944L25.1505 14.5149L32.0488 16.5234L33.5688 14.7482L32.9063 14.2687L33.9585 13.3099L33.1531 12.6879L34.2054 11.8845L33.5168 11.3532Z"
                                                                  fill="#763E1A" stroke="#763E1A" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M1 5.98873L2.11724 11.3532L1.40273 11.8845L2.468 12.6879L1.66255 13.3099L2.71483 14.2687L2.05228 14.7482L3.57225 16.5234L10.4706 14.5149L15.3552 10.3944L2.66287 1L1 5.98873Z"
                                                                  fill="#763E1A" stroke="#763E1A" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M32.0489 16.5233L25.1506 14.5149L27.2292 17.6507L24.1243 23.7019L28.2295 23.6501H34.3613L32.0489 16.5233Z"
                                                                  fill="#F5841F" stroke="#F5841F" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M10.4704 14.5149L3.57214 16.5233L1.27271 23.6501H7.39154L11.4967 23.7019L8.39186 17.6507L10.4704 14.5149Z"
                                                                  fill="#F5841F" stroke="#F5841F" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                            <path d="M19.8241 17.9876L20.2658 10.3943L22.2664 4.99097H13.3545L15.3551 10.3943L15.7968 17.9876L15.9657 20.3718L15.9787 26.2676H19.6422L19.6552 20.3718L19.8241 17.9876Z"
                                                                  fill="#F5841F" stroke="#F5841F" stroke-width="0.25"
                                                                  stroke-linecap="round" stroke-linejoin="round"/>
                                                        </svg>

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
                                                        </div>
                                                    </div>

                                                    <div @click=${() => this.selectWalletType('WalletConnect')}
                                                         class=${`
                                                         walletType walletConnect
                                                         ${(this.connectingInProcess && this.connectingType === 'WalletConnect') ? 'inProcess' : ''}
                                                         ${(this.connectingInProcess && this.connectingType !== 'WalletConnect') ? 'waiting' : ''}
                                                         `}
                                                    >
                                                        <p>WalletConnect</p>
                                                        <svg class="typeIcon" xmlns="http://www.w3.org/2000/svg" width="68"
                                                             height="35"
                                                             viewBox="0 0 68 35" fill="none">
                                                            <g clip-path="url(#clip0_6067_204)">
                                                                <path d="M50.4609 16.1674L56.4597 10.1686C42.9015 -3.38955 26.0548 -3.38955 12.4966 10.1686L18.4954 16.1674C28.8068 5.85594 40.1564 5.85594 50.4679 16.1674H50.4609Z"
                                                                      fill="#202020"/>
                                                                <path d="M48.4623 30.1435L34.4721 16.1533L20.482 30.1435L6.4918 16.1533L0.5 22.1451L20.482 42.1341L34.4721 28.1439L48.4623 42.1341L68.4443 22.1451L62.4525 16.1533L48.4623 30.1435Z"
                                                                      fill="#202020"/>
                                                            </g>
                                                        </svg>

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
                                                        </div>
                                                    </div>

                                                    <div @click=${() => this.selectWalletType('Injected')}
                                                         class=${`
                                                         walletType custom injected
                                                         ${(this.connectingInProcess && this.connectingType === 'Injected') ? 'inProcess' : ''}
                                                         ${(this.connectingInProcess && this.connectingType !== 'Injected') ? 'waiting' : ''}
                                                         `}
                                                    >
                                                        <p>Injected</p>
                                                        <svg class="typeIcon" xmlns="http://www.w3.org/2000/svg" width="24"
                                                             height="24"
                                                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                            <path d="M12 22v-5"/>
                                                            <path d="M9 8V2"/>
                                                            <path d="M15 8V2"/>
                                                            <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
                                                        </svg>

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
                                                        </div>

                                                    </div>

                                                    <div class="addressModal ${(this.showApproveAddressModal) ? 'show' : ''}">

                                                        <div @click=${this.hideApproveAddressModal}
                                                             class="overlay ${(this.showApproveAddressModalOverlay) ? 'show' : ''}"></div>

                                                        <div class="contentWrapper ${(this.showApproveAddressModalContent) ? 'show' : ''}">
                                                            <div class="content">
                                                                <div class="titleWrapper">
                                                                    <p>Approve the Wallet to Continue</p>
                                                                    <div class="closeButton"
                                                                         @click=${this.hideApproveAddressModal}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                             height="24"
                                                                             viewBox="0 0 24 24"
                                                                             fill="none" stroke="currentColor" stroke-width="2"
                                                                             stroke-linecap="round"
                                                                             stroke-linejoin="round">
                                                                            <path d="M18 6 6 18"/>
                                                                            <path d="m6 6 12 12"/>
                                                                        </svg>
                                                                    </div>
                                                                </div>

                                                                <p class="text">
                                                                    Please confirm if you'd like to proceed using this wallet
                                                                    address to continue with the transaction.
                                                                </p>

                                                                <p class="address">
                                                                    ${this.walletAddress}
                                                                </p>

                                                                <div class="buttonsWrapper">
                                                                    <button class="secondaryButton"
                                                                            @click=${this.disconnectWallet}
                                                                    >
                                                                        No
                                                                    </button>

                                                                    <button class="mainButton"
                                                                            @click=${this.approveWallet}
                                                                    >
                                                                        Continue
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                `
                                                : ''
                                }

                                <div @click=${this.openWalletModal}
                                     class=${`
                                     walletType custom
                                     ${(this.connectingInProcess && this.connectingType === 'Custom') ? 'inProcess' : ''}
                                     ${(this.connectingInProcess && this.connectingType !== 'Custom') ? 'waiting' : ''}
                                     `}
                                >
                                    <p>By wallet address</p>
                                    <svg class="typeIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                         viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                                    </svg>

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
                                    </div>
                                </div>
                                <div class="walletModal ${(this.showWalletModal) ? 'show' : ''}">

                                    <div @click=${this.hideWalletModal}
                                         class="overlay ${(this.showWalletModalOverlay) ? 'show' : ''}"></div>

                                    <div class="contentWrapper ${(this.showWalletModalContent) ? 'show' : ''}">
                                        <div class="content">
                                            <div class="titleWrapper">
                                                <p>Wallet address</p>
                                                <div class="closeButton"
                                                     @click=${this.hideWalletModal}
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

                                            <div class="inputWrapper">
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
                                                            <path d="M16 4h2a2 2 0 0 1 2 2v4"/>
                                                            <path d="M21 14H11"/>
                                                            <path d="m15 10-4 4 4 4"/>
                                                        </svg>
                                                    </div>
                                                </div>

                                                <p class=${`
                                        descriptionText
                                        ${(this.showWalletModalError) ? 'error' : ''}
                                        `}>
                                                    ${
                                                            (this.showWalletModalError)
                                                                    ? this.walletModalErrorText
                                                                    : 'Enter the address of the wallet you will use to complete the payment. We need this to track and verify the on-chain transaction as our service is fully decentralized'
                                                    }
                                                </p>
                                            </div>

                                            <button class="mainButton"
                                                    @click=${this.selectCustomWallet}
                                                    .disabled=${this.showWalletModalError || this.inputValue.trim() === ''}
                                            >
                                                Select address
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        `
                }

                <step-footer
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

    private async checkConnectorConfig() {
        if (this.selectedNetworkSymbol !== 'bsc' && this.selectedNetworkSymbol !== 'ethereum') {
            return;
        }

        if (!this.walletConnectorConfig) {
            this.createNewConnectorConfig();
            return;
        }
    }

    private createNewConnectorConfig() {

        // const chains = [];
        // if(this.selectedNetworkSymbol === 'bsc'){
        //     chains.push(bsc);
        // }else{
        //     chains.push(mainnet);
        // }

        const config = createConfig({
            chains: [mainnet, bsc],
            storage: createStorage({ storage: window.localStorage }),
            transports: {
                [mainnet.id]: fallback([
                    http('https://rpc.ankr.com/eth'),
                    http('https://eth-pokt.nodies.app'),
                    http('https://ethereum.callstaticrpc.com'),
                    http('https://eth.drpc.org'),
                    http('https://rpc.mevblocker.io'),
                ]),
                [bsc.id]: fallback([
                    http('https://binance.llamarpc.com'),
                    http('https://1rpc.io/bnb'),
                    http('https://bsc.callstaticrpc.com'),
                    http('https://bsc-pokt.nodies.app'),
                    http('https://bsc-rpc.publicnode.com'),
                ])
            }
        })

        this.updateWalletConnectorConfig(config);
    }

    private async selectWalletType(type: WalletType) {

        if(this.connectingInProcess && type === this.connectingType){
            this.connectingInProcess = false;
            return;
        }

        this.buttonDisabled = true;
        this.connectingType = type;
        this.connectingInProcess = true;

        this.updateWalletAddress('');
        this.updateWalletType('');

        const timer = new Promise((_, reject) => setTimeout(() => reject(new Error()), 40000));
        const cancelChecker = new Promise((_, reject) => {
            const checkCancel = setInterval(() => {
                if (!this.connectingInProcess) {
                    clearInterval(checkCancel);
                    reject(new Error());
                }
            }, 100);
        });

        const state = this.walletConnectorConfig.state
        const connections = state.connections;

        let connectResult = null;
        switch (type) {
            case "MetaMask":
                try {

                    const reconnectResult: any = await Promise.race([
                        reconnect(this.walletConnectorConfig, {
                            connectors: [
                                metaMask({
                                    preferDesktop: true
                                })
                            ]
                        }),
                        timer,
                        cancelChecker
                    ]);

                    if(reconnectResult && reconnectResult.length > 0){
                        connectResult = reconnectResult[0];
                    }

                    if(!connectResult){

                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: metaMask()
                            }),
                            timer,
                            cancelChecker
                        ]);
                    }

                } catch (e) {
                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again for continue.',
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
                break;
            case "WalletConnect":
                try {

                    let walletConnectConnector = null;
                    for (let connection of connections.values()) {
                        if (connection.connector.type === 'walletConnect' && connection.connector['connect'] !== undefined) {
                            walletConnectConnector = connection.connector;
                        }
                    }

                    if (walletConnectConnector) {

                        const reconnectResult: any = await Promise.race([
                            reconnect(this.walletConnectorConfig, {
                                connectors: [
                                    walletConnect({
                                        projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                                    })
                                ]
                            }),
                            timer,
                            cancelChecker
                        ]);

                        if(reconnectResult && reconnectResult.length > 0){
                            connectResult = reconnectResult[0];
                        }
                    }

                    if(!walletConnectConnector || !connectResult){
                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: walletConnect({
                                    projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                                })
                            }),
                            timer,
                            cancelChecker
                        ]);

                        // connectResult = await connect(this.walletConnectorConfig, {
                        //     connector: walletConnect({
                        //         projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                        //     })
                        // });
                    }

                } catch (e) {

                    const walletConnectModal = document.querySelector('wcm-modal');

                    if(walletConnectModal){
                        walletConnectModal.remove();
                    }

                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again for continue.',
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
                break;
            case "Injected":
                try {

                    let injectedConnector = null;
                    for (let connection of connections.values()) {
                        if (connection.connector.type === 'injected' && connection.connector['connect'] !== undefined) {
                            injectedConnector = connection.connector;
                        }
                    }

                    if (injectedConnector) {

                        const reconnectResult: any = await Promise.race([
                            await reconnect(this.walletConnectorConfig, {
                                connectors: [
                                    injected(),
                                ]
                            }),
                            timer,
                            cancelChecker
                        ]);

                        if(reconnectResult && reconnectResult.length > 0){
                            connectResult = reconnectResult[0];
                        }

                    }

                    if(!injectedConnector || !connectResult){
                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: injected()
                            }),
                            timer,
                            cancelChecker
                        ]);

                        // connectResult = await connect(this.walletConnectorConfig, {
                        //     connector: injected()
                        // })
                    }

                } catch (e) {

                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again for continue.',
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
                break;
            default:
                break;
        }

        if (!connectResult) {

            this.connectingType = '';
            this.connectingInProcess = false;

            const options = {
                detail: {
                    notificationData: {
                        title: 'Connection Failed',
                        text: 'Unable to establish a connection with the wallet connector. Please check your wallet and try again.',
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

        if (connectResult.accounts.length === 0) {

            this.connectingType = '';
            this.connectingInProcess = false;

            const options = {
                detail: {
                    notificationData: {
                        title: 'No Wallet Addresses Found',
                        text: 'No addresses were found in your wallet. Please add an address or try connecting a different wallet.',
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

        this.updateWalletAddress(connectResult.accounts[0]);
        this.updateWalletType(type);
        this.openApproveAddressModal();

    }

    private openApproveAddressModal() {
        this.showApproveAddressModal = true;

        setTimeout(() => {
            this.showApproveAddressModalOverlay = true;

            setTimeout(() => {
                this.showApproveAddressModalContent = true;
            }, 200)
        }, 200)
    }

    private hideApproveAddressModal() {
        this.showApproveAddressModalContent = false;

        setTimeout(() => {
            this.showApproveAddressModalOverlay = false;

            setTimeout(() => {
                this.showApproveAddressModal = false;

                this.connectingType = '';
                this.connectingInProcess = false;

            }, 200)
        }, 200)
    }

    private approveWallet() {
        this.dispatchNextStep();
        // this.hideApproveAddressModal();
    }

    private async disconnectWallet() {

        const { connector } = getAccount(this.walletConnectorConfig)
        await disconnect(this.walletConnectorConfig, {
            connector,
        })

        this.hideApproveAddressModal();

        // if (this.walletType === 'MetaMask') {
        //
        //     let metaMaskConnectorMobile = null;
        //     for (let connection of this.walletConnectorConfig.state.connections.values()) {
        //         if (connection.connector.type === 'metaMask' && connection.connector['disconnect'] !== undefined) {
        //             metaMaskConnectorMobile = connection.connector;
        //         }
        //     }
        //
        //     const connectors = this.walletConnectorConfig.connectors;
        //     const metaMaskConnectorDesk = connectors?.find((item: any) => item.id === 'io.metamask' && item.type === 'injected');
        //
        //     if (metaMaskConnectorMobile && metaMaskConnectorMobile['disconnect']) {
        //         await metaMaskConnectorMobile.disconnect();
        //     }
        //
        //     if (metaMaskConnectorDesk && metaMaskConnectorDesk['disconnect']) {
        //         await metaMaskConnectorDesk.disconnect();
        //     }
        // } else {
        //     const state = this.walletConnectorConfig.state;
        //     const currentConnection = state.connections.get(state.current);
        //     const connector = currentConnection.connector;
        //
        //     if (connector && connector['disconnect']) {
        //         await connector.disconnect();
        //     }
        // }
        //
        // this.hideApproveAddressModal();

        // const connectors = this.walletConnectorConfig.connectors;
        // await connectors[0].disconnect();
        //
        // this.hideApproveAddressModal();
    }

    private selectCustomWallet() {

        if (!checkWalletAddress(this.inputValue, this.selectedNetworkSymbol)) {

            this.walletModalErrorText = 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.';
            this.showWalletModalError = true;
            this.buttonDisabled = true;

            return;
        }

        this.updateWalletConnectorConfig(null);
        this.updateWalletAddress(this.inputValue.trim());
        this.updateWalletType('Custom');

        this.hideWalletModal();
        this.dispatchNextStep();
    }

    private openWalletModal() {
        this.showWalletModal = true;
        this.connectingInProcess = true;
        this.connectingType = 'Custom';

        setTimeout(() => {
            this.showWalletModalOverlay = true;

            setTimeout(() => {
                this.showWalletModalContent = true;
            }, 200)
        }, 200)
    }

    private hideWalletModal() {
        this.showWalletModalContent = false;

        setTimeout(() => {
            this.showWalletModalOverlay = false;

            setTimeout(() => {
                this.showWalletModal = false;

                this.connectingType = '';
                this.connectingInProcess = false;

            }, 200)
        }, 200)
    }

    private pasteData() {
        try {
            navigator.clipboard.readText().then((clipText) => {
                this.inputValue = clipText;
                // this.updateWalletAddress(clipText);
            });
        } catch (error) {
            console.log('Paste data error', error);
        }
    }

    private inputHandler(event: CustomEvent | any) {

        const address = event.target.value;

        this.showWalletModalError = false;
        this.walletModalErrorText = '';

        // if (address === '') {
        //     this.updateWalletAddress('');
        //     return;
        // }

        this.inputValue = address;
        // this.updateWalletAddress(address);
    }

    private dispatchNextStep() {

        this.connectingType = '';
        this.connectingInProcess = false;

        const nextStepEvent = new CustomEvent('nextStep', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(nextStepEvent);
    }

    private updateWalletAddress(address: string) {
        const updateWalletAddressEvent = new CustomEvent('updateWalletAddress', {
            detail: {
                walletAddress: address
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateWalletAddressEvent);
    }

    private updateWalletType(type: WalletType | '') {
        const updateWalletTypeEvent = new CustomEvent('updateWalletType', {
            detail: {
                walletType: type
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateWalletTypeEvent);
    }

    private updateWalletConnectorConfig(config: any) {
        const updateWalletConnectorConfigEvent = new CustomEvent('updateWalletConnectorConfig', {
            detail: {
                walletConnectorConfig: config
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updateWalletConnectorConfigEvent);
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
                        stroke: var(--sp-widget-active-color);
                        opacity: 0.25;
                    }

                    path {
                        fill: var(--sp-widget-active-color);
                        opacity: 0.75;
                    }
                }

                .walletType {
                    user-select: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    height: 50px;
                    padding: 10px 20px;
                    border: 1px solid var(--sp-widget-function-button-border-color);
                    border-radius: 8px;
                    background: var(--sp-widget-function-button-color);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &:not(:last-child) {
                        margin-bottom: 8px;
                    }

                    svg.typeIcon {
                        display: block;
                        width: 30px;
                        aspect-ratio: 1;
                    }

                    .spinner {
                        display: none;
                        width: 30px;
                    }

                    &.custom {
                        svg.typeIcon {
                            color: var(--sp-widget-active-color);
                        }
                    }

                    &.walletConnect {
                        svg.typeIcon {
                            path {
                                fill: var(--sp-widget-active-color);
                            }
                        }
                    }

                    &.inProcess {

                        svg.typeIcon {
                            display: none;
                        }

                        .spinner {
                            display: flex;
                        }
                    }

                    &.waiting {
                        opacity: 0.6;
                        touch-action: none;
                        pointer-events: none;
                    }

                    p {
                        display: block;
                        flex: 1;
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--sp-widget-function-button-text-color);
                    }

                    @media (hover: hover) and (pointer: fine) {
                        &:hover {
                            border: 1px solid var(--sp-widget-function-button-hover-border-color);
                            background: var(--sp-widget-function-button-hover-color);

                            &.selected {
                                border: 1px solid var(--sp-widget-active-color);
                            }
                        }
                    }

                    @media screen and (max-width: 768px) {
                        &.injected {
                            opacity: 0.4;
                            touch-action: none;
                            pointer-events: none;
                        }
                    }
                }

                .walletModal {
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
                        max-height: 50%;
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

                            .inputWrapper {
                                margin-top: 1rem;

                                input {
                                    display: flex;
                                    height: 40px;
                                    width: 100%;
                                    border-radius: 6px;
                                    border: 1px solid var(--sp-widget-input-border-color);
                                    background: var(--sp-widget-input-bg-color);
                                    padding: 8px 12px;
                                    font-size: 16px;
                                    line-height: 20px;
                                    color: var(--sp-widget-input-color);
                                    outline: none;
                                    transition-property: all;
                                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                    transition-duration: 50ms;

                                    &::placeholder {
                                        font-size: 14px;
                                        line-height: 20px;
                                        color: var(--sp-widget-input-placeholder-color);
                                    }

                                    &:focus-visible {
                                        border: 1px solid var(--sp-widget-input-active-border-color);
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
                                        border: 1px solid var(--sp-widget-function-button-border-color);
                                        border-radius: 6px;
                                        color: var(--sp-widget-function-button-text-color);
                                        background: var(--sp-widget-function-button-color);
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 4px;
                                        font-size: 12px;
                                        transition-property: all;
                                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                        transition-duration: 150ms;

                                        svg {
                                            width: 16px;
                                            height: 16px;
                                        }

                                        @media (hover: hover) and (pointer: fine) {
                                            &:hover {
                                                border: 1px solid var(--sp-widget-function-button-hover-border-color);
                                                color: var(--sp-widget-function-button-hover-text-color);
                                                background: var(--sp-widget-function-button-hover-color);
                                            }
                                        }
                                    }
                                }

                                .descriptionText {
                                    padding-left: 8px;
                                    margin-top: 8px;
                                    font-size: 12px;
                                    line-height: 16px;
                                    color: var(--sp-widget-secondary-text-color);
                                    text-align: left;

                                    &.error {
                                        color: var(--sp-widget-destructive-text-color);
                                    }
                                }
                            }

                            .mainButton {
                                margin-top: 2rem;
                                width: 100%;
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 14px;
                                line-height: 20px;
                                font-weight: 500;
                                border-radius: 6px;
                                cursor: pointer;
                                height: 40px;
                                padding: 16px 8px;
                                color: var(--sp-widget-primary-button-text-color);
                                background: var(--sp-widget-primary-button-color);
                                border: 1px solid var(--sp-widget-primary-button-border-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;

                                @media (hover: hover) and (pointer: fine) {
                                    &:hover {
                                        color: var(--sp-widget-primary-button-hover-text-color);
                                        background: var(--sp-widget-primary-button-hover-color);
                                        border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                                    }
                                }

                                &:disabled {
                                    pointer-events: none;
                                    touch-action: none;
                                    opacity: 0.5;
                                }
                            }
                        }
                    }
                }

                .addressModal {
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
                        max-height: 50%;
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

                            .text {
                                text-align: center;
                                margin-top: 1rem;
                                font-size: 13px;
                                font-weight: 400;
                                color: var(--sp-widget-secondary-text-color);
                            }

                            .address {
                                margin: 1rem 0 2rem;
                                text-align: center;
                                font-size: 12px;
                                font-weight: 600;
                                color: var(--sp-widget-text-color);
                            }

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
                        }
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
