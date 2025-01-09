import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../../../lib/util.ts";
import {WalletType} from "../../../lib/types.ts";
import {
    createConfig,
    http,
    fallback,
    connect,
    injected, createStorage, reconnect, getAccount, disconnect,
} from "@wagmi/core";
import {mainnet, bsc, polygon, avalanche, zksync, arbitrum, optimism, base} from '@wagmi/core/chains'
import {coinbaseWallet, metaMask, walletConnect} from "@wagmi/connectors";
import {Cryptocurrency, Invoice, InvoiceProduct, Network} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../../../styles/wallet-step.css?inline";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: String})
    walletAddress: string = '';

    @property({type: Object})
    selectedToken: Cryptocurrency | null = null;

    @property({type: Object})
    selectedNetwork: Network | null = null;

    @property({type: String})
    walletType: WalletType | '' = '';

    @property({type: Boolean})
    creatingTransaction: boolean = false;

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

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    async connectedCallback() {
        super.connectedCallback();

        await this.checkConnectorConfig();

        if(this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0){
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if(this.invoice?.products && this.invoice.products.length > 0){
            this.invoiceProducts = this.invoice.products;
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <main-header
                        .title= ${'Connect wallet'}
                        .hasBackButton=${true}
                        .backButtonDisabled=${this.creatingTransaction}
                        .showToken=${true}
                        .token="${{
                            tokenSymbol: this.selectedToken?.symbol,
                            networkStandart: getTokenStandart(this.selectedNetwork?.symbol || ''),
                            networkSymbol: this.selectedNetwork?.symbol
                        }}"
                ></main-header>

                ${this.creatingTransaction
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

                                    <p>Creating transaction ...</p>
                                </div>
                            </div>
                        `
                        : html`
                            <div class="stepContent">

                                ${
                                        (['bsc', 'ethereum', 'polygon', 'avalanche', 'zksync', 'arbitrum', 'optimism', 'base'].includes(this.selectedNetwork?.symbol || ''))
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

                                                    <div @click=${() => this.selectWalletType('Coinbase')}
                                                         class=${`
                                                         walletType custom coinbase
                                                         ${(this.connectingInProcess && this.connectingType === 'Coinbase') ? 'inProcess' : ''}
                                                         ${(this.connectingInProcess && this.connectingType !== 'Coinbase') ? 'waiting' : ''}
                                                         `}
                                                    >
                                                        <p>Coinbase</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" role="img"
                                                             aria-label="Coinbase Wallet Logo" viewBox="0 0 32 32" width="32"
                                                             height="32" class="typeIcon" data-testid="wallet-logo" fill="none">
                                                            <path d="M0 16C0 24.8356 7.16444 32 16 32C24.8356 32 32 24.8356 32 16C32 7.16444 24.8356 0 16 0C7.16444 0 0 7.16444 0 16ZM11.9111 10.8444C11.32 10.8444 10.8444 11.32 10.8444 11.9111V20.0889C10.8444 20.68 11.32 21.1556 11.9111 21.1556H20.0889C20.68 21.1556 21.1556 20.68 21.1556 20.0889V11.9111C21.1556 11.32 20.68 10.8444 20.0889 10.8444H11.9111Z"
                                                                  fill="#3773f5" fill-rule="evenodd"
                                                                  clip-rule="evenodd"></path>
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
                                                            placeholder=${`Enter your ${this.selectedNetwork?.symbol} address`}
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

                <main-footer
                        .price=${Number(this.invoice?.total!) - Number(this.invoice?.paid!)}
                        .hasButton=${true}
                        .buttonDisabled=${this.buttonDisabled || this.creatingTransaction}
                        .buttonText=${'Confirm'}
                        .products=${this.invoiceProducts}
                        @footerButtonClick=${this.dispatchNextStep}
                ></main-footer>
            </div>
        `;
    }

    private async checkConnectorConfig() {
        if (!['bsc', 'ethereum', 'polygon', 'avalanche', 'zksync', 'arbitrum', 'optimism', 'base'].includes(this.selectedNetwork?.symbol || '')) {
            return;
        }

        if (!this.walletConnectorConfig) {
            this.createNewConnectorConfig();
            return;
        }
    }

    private createNewConnectorConfig() {

        const config = createConfig({
            chains: [mainnet, bsc, polygon, avalanche, zksync, arbitrum, optimism, base],
            connectors: [
                injected(),
                metaMask(),
                coinbaseWallet(),
                walletConnect({
                    projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                })
            ],
            storage: createStorage({storage: window.localStorage}),
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
                ]),
                [polygon.id]: fallback([
                    http('https://polygon.llamarpc.com'),
                    http('https://polygon.drpc.org'),
                    http('https://rpc.ankr.com/polygon'),
                    http('https://polygon.api.onfinality.io/public'),
                    http('https://1rpc.io/matic'),
                ]),
                [avalanche.id]: fallback([
                    http('https://1rpc.io/avax/c'),
                    http('https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc'),
                    http('https://avalanche-c-chain-rpc.publicnode.com'),
                    http('https://avax.meowrpc.com'),
                    http('https://avalanche.drpc.org'),
                ]),
                [base.id]: fallback([
                    http('https://base.rpc.subquery.network/public'),
                    http('https://base.meowrpc.com'),
                    http('https://base-rpc.publicnode.com'),
                    http('https://base.api.onfinality.io/public'),
                    http('https://base.blockpi.network/v1/rpc/public'),
                ]),
                [zksync.id]: fallback([
                    http('https://api.zan.top/zksync-mainnet'),
                    http('https://1rpc.io/zksync2-era'),
                    http('https://endpoints.omniatech.io/v1/zksync-era/mainnet/public'),
                    http('https://mainnet.era.zksync.io'),
                    http('https://zksync.meowrpc.com'),
                ]),
                [arbitrum.id]: fallback([
                    http('https://endpoints.omniatech.io/v1/arbitrum/one/public'),
                    http('https://arbitrum.llamarpc.com'),
                    http('https://arbitrum.drpc.org'),
                    http('https://arbitrum.meowrpc.com'),
                    http('https://api.zan.top/arb-one'),
                ]),
                [optimism.id]: fallback([
                    http('https://optimism.llamarpc.com'),
                    http('https://endpoints.omniatech.io/v1/op/mainnet/public'),
                    http('https://optimism.api.onfinality.io/public'),
                    http('https://optimism.rpc.subquery.network/public'),
                    http('https://mainnet.optimism.io'),
                ])
            }
        })

        this.updateWalletConnectorConfig(config);
    }

    private async selectWalletType(type: WalletType) {

        if (this.connectingInProcess && type === this.connectingType) {
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

        const state = this.walletConnectorConfig?.state
        const connections = state?.connections;

        let connectResult = null;
        switch (type) {
            case "MetaMask":
                try {

                    const reconnectResult: any = await Promise.race([
                        reconnect(this.walletConnectorConfig, {
                            connectors: [
                                metaMask()
                            ]
                        }),
                        timer,
                        cancelChecker
                    ]);

                    if (reconnectResult && reconnectResult.length > 0) {
                        connectResult = reconnectResult[0];
                    }

                    if (!connectResult) {

                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: metaMask()
                            }),
                            timer,
                            cancelChecker
                        ]);
                    }

                } catch (e) {
                    console.log('metaMask connection error', e)

                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again to continue.',
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
            case "Coinbase":
                try {

                    const reconnectResult: any = await Promise.race([
                        reconnect(this.walletConnectorConfig, {
                            connectors: [
                                coinbaseWallet({
                                    appName: 'Simple Widget',
                                    version: '3',
                                })
                            ]
                        }),
                        timer,
                        cancelChecker
                    ]);

                    if (reconnectResult && reconnectResult.length > 0) {
                        connectResult = reconnectResult[0];
                    }

                    if (!connectResult) {

                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: coinbaseWallet({
                                    appName: 'Simple Widget',
                                    version: '3',
                                })
                            }),
                            timer,
                            cancelChecker
                        ]);
                    }

                } catch (e) {
                    console.log('coinbaseWallet connection error', e)

                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again to continue.',
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

                        if (reconnectResult && reconnectResult.length > 0) {
                            connectResult = reconnectResult[0];
                        }
                    }

                    if (!walletConnectConnector || !connectResult) {
                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: walletConnect({
                                    projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                                })
                            }),
                            timer,
                            cancelChecker
                        ]);

                    }

                } catch (e) {
                    console.log('walletConnect connection error', e)

                    const walletConnectModals = document.querySelectorAll('wcm-modal');

                    if (walletConnectModals && walletConnectModals.length > 0) {
                        for (let modal of walletConnectModals) {
                            modal?.remove();
                        }
                    }

                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: 'The wallet connection was not confirmed. Please try again to continue.',
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

                    const reconnectResult: any = await Promise.race([
                        reconnect(this.walletConnectorConfig, {
                            connectors: [
                                injected({
                                    target() {
                                        //@ts-ignore
                                        return {
                                            id: 'windowProvider',
                                            name: 'Window Provider',
                                            provider: (window as any).okxwallet || window.ethereum,//ethereum
                                        }
                                    },
                                })
                            ]
                        }),
                        timer,
                        cancelChecker
                    ]);

                    if (reconnectResult && reconnectResult.length > 0) {
                        connectResult = reconnectResult[0];
                    }

                    if (!connectResult) {

                        connectResult = await Promise.race([
                            connect(this.walletConnectorConfig, {
                                connector: injected({
                                    target() {
                                        //@ts-ignore
                                        return {
                                            id: 'windowProvider',
                                            name: 'Window Provider',
                                            provider: (window as any).okxwallet || window.ethereum,//ethereum
                                        }
                                    },
                                })
                            }),
                            timer,
                            cancelChecker
                        ]);
                    }

                } catch (e) {
                    console.log('injected connection error', e)
                    this.connectingType = '';
                    this.connectingInProcess = false;

                    const options = {
                        detail: {
                            notificationData: {
                                title: 'Wallet Connection Not Confirmed',
                                text: ['The wallet connection was not confirmed. Please try again to continue.', 'Maybe your wallet extension is inactive in browser. Activate it by clicking on its icon in your browser.'],
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
    }

    private async disconnectWallet() {

        const {connector} = getAccount(this.walletConnectorConfig)
        await disconnect(this.walletConnectorConfig, {
            connector,
        })

        this.hideApproveAddressModal();
    }

    private selectCustomWallet() {

        if (!checkWalletAddress(this.inputValue, this.selectedNetwork?.type || '')) {

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
            });
        } catch (error) {
            console.log('Paste data error', error);
        }
    }

    private inputHandler(event: CustomEvent | any) {

        const address = event.target.value;

        this.showWalletModalError = false;
        this.walletModalErrorText = '';

        this.inputValue = address;
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
}

declare global {
    interface HTMLElementTagNameMap {
        'wallet-step': WalletStep;
    }
}
