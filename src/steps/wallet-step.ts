import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../util.ts";
import {IProduct, WalletType} from "../types.ts";
import {
    createConfig,
    http,
    fallback,
    connect,
    injected,
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

    // @property({type: String})
    // selectedWalletType: WalletType | '' = '';

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
    private showWalletModalError: boolean = false;

    @property({attribute: false, type: String})
    private walletModalErrorText: string = '';

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
                                                         class="walletType"
                                                    >
                                                        <p>MetaMask</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="30"
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
                                                    </div>

                                                    <div @click=${() => this.selectWalletType('WalletConnect')}
                                                         class="walletType walletConnect"
                                                    >
                                                        <p>WalletConnect</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="68" height="35"
                                                             viewBox="0 0 68 35" fill="none">
                                                            <g clip-path="url(#clip0_6067_204)">
                                                                <path d="M50.4609 16.1674L56.4597 10.1686C42.9015 -3.38955 26.0548 -3.38955 12.4966 10.1686L18.4954 16.1674C28.8068 5.85594 40.1564 5.85594 50.4679 16.1674H50.4609Z"
                                                                      fill="#202020"/>
                                                                <path d="M48.4623 30.1435L34.4721 16.1533L20.482 30.1435L6.4918 16.1533L0.5 22.1451L20.482 42.1341L34.4721 28.1439L48.4623 42.1341L68.4443 22.1451L62.4525 16.1533L48.4623 30.1435Z"
                                                                      fill="#202020"/>
                                                            </g>
                                                        </svg>
                                                    </div>

                                                    <div @click=${() => this.selectWalletType('Injected')}
                                                         class="walletType custom"
                                                    >
                                                        <p>Injected</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                            <path d="M12 22v-5"/>
                                                            <path d="M9 8V2"/>
                                                            <path d="M15 8V2"/>
                                                            <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>
                                                        </svg>

                                                    </div>
                                                `
                                                : ''
                                }

                                <div @click=${this.openWalletModal}
                                     class="walletType custom"
                                >
                                    <p>By wallet address</p>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                                    </svg>
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

        const config = createConfig({
            chains: [mainnet, bsc],
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

        // if(type === this.selectedWalletType){
        //     return;
        // }

        this.buttonDisabled = true;

        this.updateWalletAddress('');
        this.updateWalletType('');

        // const account = getAccount(this.walletConnectorConfig)
        // if (account && account.connector) {
        //
        //     switch (type) {
        //         case "MetaMask":
        //
        //             if ((account.connector as any).name && (account.connector as any).type! === 'metaMask') {
        //
        //                 if (account.addresses && account.addresses?.length > 0) {
        //                     this.updateWalletAddress(account.addresses[0]);
        //                     this.updateWalletType(type);
        //
        //                     this.dispatchNextStep();
        //
        //                     return;
        //                 }
        //
        //             }
        //
        //             break;
        //         default:
        //             break;
        //     }
        //
        // }

        let connectResult = null;
        switch (type) {
            case "MetaMask":
                try {
                    connectResult = await connect(this.walletConnectorConfig, {
                        connector: metaMask({
                            dappMetadata: {
                                name: "SimplePay",
                                url: 'https://www.simplepay.ai/',
                                base64Icon: "data:image/png;base64,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AACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAEAAACkJ3AAAAAA6QkcAAAAQHoCBwAAAJCewAHA/9/e/Rw3cYYBHH53IZwyEysNxFQQp4I4HcQHPOQUU0HSQaADUwHmxIx9iKkAUwFKB0sBicSESQ5Y2uwnRSAZ25KtP9YHzzODZq2VRpx/837vAgBA9gQOAAAAIHsCBwAAAJA9gQMAAADInsABAAAAZE/gAAAAALIncAAAAADZEzgAAACA7AkcAAAAQPYEDgAAACB7AgcAAACQPYEDAAAAyJ7AAQAAAGRP4AAAAACyJ3AAAAAA2RM4AAAAgOwJHAAAAED2BA4AAAAgewIHAAAAkD2BAwAAAMheGUV0AwAAACBf3TLq+k0AAAAA5KsJHEXRCQAAAIBs1a/TBMfrAAAAAMhY2VSOKgAAAABy1a/bacloFQAAAAD5qsqmclQBAAAAkKtbZbuMO7dOAgAAACBXb6MJHDutbto2GgAAAAD5qeJBq1sOLuv6JAAAAACyU/+RXoeBo4x2AAAAAGSnOE6vw8BxWh4HAAAAQG7eDYc2ivdvHP5VNX9+EwAAAAB5qGK3dTddlB/eq01xAAAAAPko4+TD5UjPMRUAAAAgI3U8HV0WEzeOOq+am1sBAAAAsN7eH09Jyolb/f7zAAAAAFh/j8b/mAwcd8r9KKIbAAAAAOus92H/RjIZOHZa3aj7TwMAAABgXZVxED+1qsm3Pv7UQQAAAACsq3eTx1OSjwPHbqsdxeSYBwAAAMBaOGd6Y/j2eU7jQQAAAACsm3OmN5LzA8eghPQfBwAAAMC6uGB6Y3jrIl+UDz1RBQAAAFgT1UXTG8nFgSM9USUu/iIAAADACj26aHojKWKao86LqGM7AAAAAG5E/TJ2v96+7BNlTJMWjjqqAgAAANyE1CR6xd60j00PHMPxD0dVAAAAgNXrXX40ZWR64EjutfY9VQUAAABYqX48jvupSUw3fQfHyO+djTiNtI9jKwAAAACWq4rd1t1ZPzzbBEeSnqpyGjuDHwAAAABYnip68cNVvjD7BMfIs85m3I5XUcdGAAAAACxSWip6Gt/Nsndj3OwTHCPpB+qmoniyCgAAALBIqTWk5nDFuDH86nUddraab78wyQEAAADMbRQ3dlvtuIbrB45E5AAAAADmNWfcSK5+RGVc+uF0LsbiUQAAAOB6qkFbmCNuJPMFjiSdixluNq0CAAAAYHbtQVO4xs6Ns+Y7onLW4Z/7TTP5JQAAAAAu04/H8W88jAethTzEZLGBIznq/Nq8/mYvBwAAAPCRtG+jF4/ifms/FmjxgSN51tmM2/GkiRzbAQAAADBQv4xesbeIIylnLSdwjBx29iJNc0RsBgAAAPB5WtLUxrj5l4xeZrd1MFgWUvSfBgAAAPD5Sbs23sbdZcaNZLkTHOMGx1b6D6Mufw4AAADgE7e84yjnWV3gGBE6AAAA4NOUjqLU6RRHeRC7rXas0OoDx0gKHbcGS0jt6AAAAIC8taOO5/FP7C/qsa9XdXOBY9xRZzuivxd1+X2IHQAAAJCB+nXz7ziK8jjutU7ihq1H4Bh32NlqXreiqH+Muvg2BA8AAABYA03QKOqTiLIdt+M4dlazW2NW6xc4znrS2YgvYxg96v5m81/e+v/OZhTFV1HHRgAAAADzGezPqN80V93mumquqyjKanD9d5zc1NGTWf0HeUA8opsAFzYAAAAASUVORK5CYII="
                            },
                        })
                    });
                } catch (e) {

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
                    connectResult = await connect(this.walletConnectorConfig, {
                        connector: walletConnect({
                            projectId: 'b385e1eebef135dccafa0f1efaf09e85',
                        })
                    });
                } catch (e) {

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
                    connectResult = await connect(this.walletConnectorConfig, {
                        connector: injected()
                    })
                } catch (e) {

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

        this.dispatchNextStep();

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

                    svg {
                        width: 30px;
                        aspect-ratio: 1;
                    }

                    &.custom {
                        svg {
                            color: var(--sp-widget-active-color);
                        }
                    }

                    &.walletConnect {
                        svg {
                            path {
                                fill: var(--sp-widget-active-color);
                            }
                        }
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
