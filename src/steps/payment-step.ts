import {Invoice, InvoiceProduct} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {css, html, LitElement, property, query} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {getTokenStandart, roundUpAmount} from "../util.ts";
import {WalletType} from "../types.ts";
import {
    estimateFeesPerGas,
    sendTransaction,
    SendTransactionErrorType,
    switchChain,
    writeContract,
    WriteContractErrorType
} from "@wagmi/core";
import {bsc, mainnet} from "@wagmi/core/chains";
import {parseEther, parseUnits} from "viem";

const ABI_USDT_BSC = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
const ABI_USDT_ETH = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_upgradedAddress","type":"address"}],"name":"deprecate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"deprecated","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_evilUser","type":"address"}],"name":"addBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"upgradedAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maximumFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_maker","type":"address"}],"name":"getBlackListStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newBasisPoints","type":"uint256"},{"name":"newMaxFee","type":"uint256"}],"name":"setParams","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"issue","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"basisPointsRate","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isBlackListed","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_clearedUser","type":"address"}],"name":"removeBlackList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_UINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_blackListedUser","type":"address"}],"name":"destroyBlackFunds","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Issue","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"amount","type":"uint256"}],"name":"Redeem","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"newAddress","type":"address"}],"name":"Deprecate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"feeBasisPoints","type":"uint256"},{"indexed":false,"name":"maxFee","type":"uint256"}],"name":"Params","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_blackListedUser","type":"address"},{"indexed":false,"name":"_balance","type":"uint256"}],"name":"DestroyedBlackFunds","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"AddedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_user","type":"address"}],"name":"RemovedBlackList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"}]

@customElement('payment-step')
export class PaymentStep extends LitElement {
    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: String})
    price: string = '';

    @property({type: String})
    walletAddress: string = '';

    @property({type: Boolean})
    cancelingInvoice: boolean = false;

    @property({type: Boolean})
    checkingTransaction: boolean = false;

    @property({type: Boolean})
    connectorPaymentAwaiting: boolean = false;

    @property({type: String})
    walletType: WalletType | '' = '';

    @property({type: Object})
    walletConnectorConfig: any;

    @property({attribute: false})
    tokenStandart: string = '';

    @property({attribute: false})
    formatAmount: string = '';

    @query('#qrcode')
    qrcode: any;

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        if (this.invoice && this.invoice?.to) {
            const qr = QRCode(0, 'H');
            qr.addData(this.invoice?.to);
            qr.make();

            if(this.qrcode){
                this.qrcode.innerHTML = qr.createSvgTag();
            }
        }
    }

    async connectedCallback() {
        super.connectedCallback();

        //@ts-ignore
        this.formatAmount = roundUpAmount(this.invoice?.amount, this.invoice?.cryptocurrency.stable);
        this.tokenStandart = getTokenStandart(this.invoice?.network.symbol!);
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title= ${'Awaiting for Payment'}
                        .hasBackButton=${false}
                        .showAddress=${true}
                        .walletAddress=${this.invoice?.from}
                ></step-header>

                ${
                        (this.cancelingInvoice)
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

                                            <p>Canceling invoice ...</p>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${
                        (this.checkingTransaction)
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

                                            <p>Checking transaction ...</p>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${
                        (!this.cancelingInvoice && !this.checkingTransaction && (!this.walletType || this.walletType === 'Custom'))
                                ? html`
                                    <div class="stepContent">
                                        <div class="topInfo">
                                            <div class="infoItem">
                                                <p class="title">Network:</p>
                                                <div class="info">
                                                    <network-icon
                                                            .id=${this.invoice?.network.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></network-icon>
                                                    <p class="text">${this.invoice?.network.symbol}</p>
                                                </div>
                                            </div>

                                            <div class="infoItem">
                                                <p class="title">Token:</p>

                                                <div class="info">
                                                    <token-icon
                                                            .id=${this.invoice?.cryptocurrency.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></token-icon>

                                                    <p class="text">${this.invoice?.cryptocurrency.symbol}</p>

                                                    ${this.tokenStandart !== ''
                                                            ? html`
                                                                <div class="badge">${this.tokenStandart}</div> `
                                                            : ''}
                                                </div>
                                            </div>
                                        </div>

                                        <div class="qrcodeWrapper">
                                            <div id="qrcode" class="qrcodeContainer"></div>
                                            <div class="tokenIconWrapper">
                                                <token-icon
                                                        .id=${this.invoice?.cryptocurrency.symbol}
                                                        width="42"
                                                        height="42"
                                                        class="tokenIcon"
                                                ></token-icon>
                                                <network-icon
                                                        .id=${this.invoice?.network.symbol}
                                                        width="20"
                                                        height="20"
                                                        class="networkIcon"
                                                ></network-icon>
                                            </div>
                                        </div>

                                        <div class="separator"></div>

                                        <div class="bottomInfo">
                                            <label class="inputWrapper" for="payAddress">
                                                <p class="labelText">Address to pay:</p>

                                                <div class="input">
                                                    <input
                                                            id="payAddress"
                                                            type="text"
                                                            .value=${this.invoice?.to}
                                                            readonly
                                                            disabled
                                                    />

                                                    <div
                                                            class="copyButton"
                                                            @click=${(event: CustomEvent) =>
                                                                    this.copyData(event, this.invoice?.to || '')}
                                                    >
                                                        <div class="default">
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
                                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                                <path
                                                                        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                                                />
                                                            </svg>
                                                            Copy
                                                        </div>
                                                        <div class="active">
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
                                                                <path d="M20 6 9 17l-5-5"/>
                                                            </svg>
                                                            Copied
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label class="inputWrapper" for="payAmount">
                                                <p class="labelText">Amount:</p>

                                                <div class="input">
                                                    <input
                                                            id="payAmount"
                                                            type="text"
                                                            .value=${`${this.formatAmount} ${this.invoice?.cryptocurrency.symbol}`}
                                                            readonly
                                                            disabled
                                                    />

                                                    <div
                                                            class="copyButton"
                                                            @click=${(event: CustomEvent) =>
                                                                    this.copyData(event, this.formatAmount.toString() || '')}
                                                    >
                                                        <div class="default">
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
                                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                                                                <path
                                                                        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                                                />
                                                            </svg>
                                                            Copy
                                                        </div>
                                                        <div class="active">
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
                                                                <path d="M20 6 9 17l-5-5"/>
                                                            </svg>
                                                            Copied
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${
                        (!this.cancelingInvoice && !this.checkingTransaction && (this.walletType && this.walletType !== 'Custom'))
                                ? html`
                                    <div class="stepContent between">

                                        <div class="topInfo">
                                            <div class="infoItem">
                                                <p class="title">Network:</p>
                                                <div class="info">
                                                    <network-icon
                                                            .id=${this.invoice?.network.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></network-icon>
                                                    <p class="text">${this.invoice?.network.symbol}</p>
                                                </div>
                                            </div>

                                            <div class="infoItem">
                                                <p class="title">Token:</p>

                                                <div class="info">
                                                    <token-icon
                                                            .id=${this.invoice?.cryptocurrency.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></token-icon>

                                                    <p class="text">${this.invoice?.cryptocurrency.symbol}</p>

                                                    ${this.tokenStandart !== ''
                                                            ? html`
                                                                <div class="badge">${this.tokenStandart}</div> `
                                                            : ''}
                                                </div>
                                            </div>
                                        </div>

                                        ${
                                                (this.invoice?.products && this.invoice.products.length > 0)
                                                        ? html`
                                                            <div class="products">
                                                                <p class="title">Products</p>

                                                                <div class="productsList">

                                                                    ${
                                                                            this.invoice.products.map((item: InvoiceProduct) => html`
                                                                                <div class="productItem">

                                                                                    <div class=${`imageWrapper ${(!item.product.image) && 'placeholder'}`}>

                                                                                        ${
                                                                                                (item.product.image)
                                                                                                        ? html`
                                                                                                            <img src=${item.product.image}
                                                                                                                 alt="product image">
                                                                                                        `
                                                                                                        : html`
                                                                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                                 width="800px" height="800px"
                                                                                                                 viewBox="0 0 24 24"
                                                                                                                 fill="none">
                                                                                                                <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                                                      stroke="#1C274C"
                                                                                                                      stroke-width="1"
                                                                                                                      stroke-linecap="round"/>
                                                                                                                <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                                                      stroke="#1C274C"
                                                                                                                      stroke-width="1"
                                                                                                                      stroke-linecap="round"/>
                                                                                                            </svg>
                                                                                                        `
                                                                                        }


                                                                                    </div>

                                                                                    <div class="info">
                                                                                        <p class="name">${item.product.name}</p>
                                                                                        <p class="description">${item.product.description}</p>
                                                                                    </div>

                                                                                    <div class="priceWrapper">
                                                                                        <p class="price">${item.product.prices[0].price}
                                                                                            ${item.product.prices[0].currency.symbol}</p>
                                                                                        <p class="count">Count: ${item.count}</p>
                                                                                    </div>

                                                                                </div>
                                                                            `)
                                                                    }

                                                                </div>
                                                            </div>
                                                        `
                                                        : ''
                                        }

                                        <button class=${`mainButton ${(this.connectorPaymentAwaiting) ? 'active' : ''} `}
                                                @click=${this.triggerTransaction}
                                                .disabled=${this.connectorPaymentAwaiting}
                                        >
                                            ${
                                                (this.connectorPaymentAwaiting) 
                                                    ? html`
                                                            <div class="spinner">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle cx="12" cy="12" r="10" stroke-width="4" />
                                                                    <path
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        ` 
                                                    : 'Pay'
                                            }
                                            
                                        </button>

                                    </div>
                                `
                                : ''
                }

                <step-footer
                        .price=${this.price}
                        .hasButton=${false}
                        .hasCancelButton=${true}
                        .hasTimer=${true}
                        .timerTimeStart=${(Date.parse(this.invoice?.expireAt!) -
                                Date.parse(this.invoice?.createdAt!)) /
                        1000}
                        .timerTimeCurrent=${(Date.parse(this.invoice?.expireAt!) -
                                new Date().getTime()) /
                        1000}
                        .buttonDisabled=${this.cancelingInvoice || this.connectorPaymentAwaiting || this.checkingTransaction}
                        @footerCancelClick=${this.dispatchCancelInvoice}
                ></step-footer>
            </div>
        `;
    }

    private async triggerTransaction(){

        this.updatePaymentAwaiting(true);

        try {
            await switchChain(this.walletConnectorConfig, { chainId: (this.invoice?.network.symbol === 'bsc') ? bsc.id : mainnet.id })
        }catch (e) {

            const options = {
                detail: {
                    notificationData: {
                        title: 'Network Change Failed',
                        text: 'Unable to automatically switch the wallet network. Please change the network manually in your wallet settings and try again.',
                        buttonText: 'Confirm'
                    },
                    notificationShow: true
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('updateNotification', options));

            this.updatePaymentAwaiting(false);
            return;
        }

        switch (this.invoice?.network.symbol){
            case 'bsc':

                if(this.invoice?.cryptocurrency.symbol === 'USDT'){

                    try {
                        const hashTransaction = await writeContract(this.walletConnectorConfig, {
                            abi: ABI_USDT_BSC,
                            address: '0x55d398326f99059fF775485246999027B3197955',
                            functionName: 'transfer',
                            args: [
                                this.invoice?.to,
                                parseEther(this.invoice?.amount!)
                            ],
                            chainId: bsc.id,
                        })

                        if(hashTransaction){
                            this.checkingTransaction = true;
                            this.updatePaymentAwaiting(false);
                        }

                        return;

                    }catch (e) {

                        const error = e as WriteContractErrorType;
                        console.log('writeContract error', error)
                        console.log('writeContract error message', error.message)

                        let messageTitle = '';
                        let messageText = '';

                        if(error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1){

                            messageTitle = 'Transaction Canceled'
                            messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

                        }else if(error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1){

                            messageTitle = 'Transaction Canceled'
                            messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

                        }else{

                            messageTitle = 'Transaction Canceled';
                            messageText = 'Something went wrong with the transaction. Please try again later.'

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: 'Confirm'
                                },
                                notificationShow: true
                            },
                            bubbles: true,
                            composed: true
                        };
                        this.dispatchEvent(new CustomEvent('updateNotification', options));

                        this.checkingTransaction = false;
                        this.updatePaymentAwaiting(false);
                        return;

                    }

                }

                break;
            case 'ethereum':

                if(this.invoice?.cryptocurrency.symbol === 'USDT'){
                    try {

                        const feesPerGas = await estimateFeesPerGas(this.walletConnectorConfig);

                        const hashTransaction = await writeContract(this.walletConnectorConfig, {
                            abi: ABI_USDT_ETH,
                            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                            functionName: 'transfer',
                            args: [
                                this.invoice?.to,
                                parseUnits( this.invoice?.amount!, 6 )
                            ],
                            chainId: mainnet.id,
                            maxFeePerGas: (feesPerGas as any).maxFeePerGas
                        })

                        if(hashTransaction){
                            this.checkingTransaction = true;
                            this.updatePaymentAwaiting(false);
                        }

                        return;

                    }catch (e) {

                        const error = e as WriteContractErrorType;
                        console.log('writeContract error', error)
                        console.log('writeContract error message', error.message)

                        let messageTitle = '';
                        let messageText = '';

                        if(error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1){

                            messageTitle = 'Transaction Canceled'
                            messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

                        }else if(error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1){

                            messageTitle = 'Transaction Canceled'
                            messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

                        }else{

                            messageTitle = 'Transaction Canceled';
                            messageText = 'Something went wrong with the transaction. Please try again later.'

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: 'Confirm'
                                },
                                notificationShow: true
                            },
                            bubbles: true,
                            composed: true
                        };
                        this.dispatchEvent(new CustomEvent('updateNotification', options));

                        this.checkingTransaction = false;
                        this.updatePaymentAwaiting(false);
                        return;

                    }

                }

                break;
            default:
                break;
        }

        try {
            const hashTransaction = await sendTransaction(this.walletConnectorConfig, {
                //@ts-ignore
                to: this.invoice?.to,
                value: parseEther( this.invoice?.amount! ),
                chainId: (this.invoice?.network.symbol === 'bsc') ? bsc.id : mainnet.id
            })

            if(hashTransaction){
                this.checkingTransaction = true;
                this.updatePaymentAwaiting(false);
            }
        }catch (e) {
            const error = e as SendTransactionErrorType;
            console.log('sendTransaction error message', error.message)

            let messageTitle = '';
            let messageText = '';

            if(error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1){

                messageTitle = 'Transaction Canceled'
                messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

            }else if(error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1){

                messageTitle = 'Transaction Canceled'
                messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

            }else{

                messageTitle = 'Transaction Canceled';
                messageText = 'Something went wrong with the transaction. Please try again later.'

            }

            const options = {
                detail: {
                    notificationData: {
                        title: messageTitle,
                        text: messageText,
                        buttonText: 'Confirm'
                    },
                    notificationShow: true
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('updateNotification', options));

            this.checkingTransaction = false;
            this.updatePaymentAwaiting(false);
            return;

        }
    }

    private dispatchCancelInvoice() {
        const cancelInvoiceEvent = new CustomEvent('cancelInvoice', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelInvoiceEvent);
    }

    private updatePaymentAwaiting(state: boolean) {
        const updatePaymentAwaitingEvent = new CustomEvent('updatePaymentAwaiting', {
            detail: {
                connectorPaymentAwaiting: state
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updatePaymentAwaitingEvent);
    }

    private copyData(event: CustomEvent, text: string) {
        const targetElement: any = event.currentTarget;

        try {
            navigator.clipboard.writeText(text);

            targetElement.classList.add('active');

            setTimeout(function () {
                targetElement.classList.remove('active');
            }, 500);
        } catch (e) {
            console.log('CopyToClipboard error', e);
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

            .stepContent {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-secondary-bg-color);
                }
                
                &.between{
                    justify-content: space-between;
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

                .topInfo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    margin: 4px auto 0;

                    .infoItem {
                        display: flex;
                        align-items: center;
                        gap: 8px;

                        .title {
                            font-size: 12px;
                            line-height: 1;
                            font-weight: 700;
                            color: var(--sp-widget-secondary-text-color);
                        }

                        .info {
                            display: flex;
                            align-items: center;
                            gap: 4px;

                            .icon {
                                position: relative;
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

                            .text {
                                font-size: 12px;
                                line-height: 1;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                                text-transform: capitalize;
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

                .qrcodeWrapper {
                    flex: 1;
                    position: relative;
                    width: 100%;
                    max-width: 256px;
                    height: 256px;
                    margin: 0 auto;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .qrcodeContainer {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        svg {
                            width: 256px;
                            height: 256px;

                            rect {
                                fill: var(--sp-widget-secondary-bg-color);
                            }

                            path {
                                fill: var(--sp-widget-text-color);
                            }
                        }
                    }

                    .tokenIconWrapper {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);

                        .tokenIcon {
                            position: relative;
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-hint-color);
                            width: 42px;
                            height: 42px;
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
                            width: 20px;
                            height: 20px;
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
                }

                .separator {
                    margin: 8px 0;
                    height: 1px;
                    min-height: 1px;
                    width: 100%;
                    background: var(--sp-widget-separator-color);
                }

                .inputWrapper {
                    font-size: 14px;
                    line-height: 1;
                    font-weight: 500;
                    position: relative;
                    margin-top: 8px;
                    display: block;

                    .labelText {
                        font-size: 13px;
                        line-height: 20px;
                        color: var(--sp-widget-text-color);
                        padding-left: 8px;
                        font-weight: 500;
                        text-align: left;
                    }

                    .input {
                        margin-top: 4px;
                        display: flex;
                        align-items: center;
                        gap: 4px;

                        input {
                            display: flex;
                            height: 40px;
                            width: 100%;
                            border-radius: 6px;
                            border: 1px solid var(--sp-widget-input-border-color);
                            background: var(--sp-widget-input-bg-color);
                            padding: 8px 90px 8px 12px;
                            font-size: 14px;
                            line-height: 20px;
                            user-select: none;
                            pointer-events: none;
                            color: var(--sp-widget-input-color);
                            text-overflow: ellipsis;
                        }

                        .copyButton {
                            height: 40px;
                            min-width: 70px;
                            max-width: 70px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 7px 10px;
                            border: 1px solid var(--sp-widget-function-button-border-color);
                            border-radius: 6px;
                            color: var(--sp-widget-function-button-text-color);
                            background: var(--sp-widget-function-button-color);
                            cursor: pointer;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    border: 1px solid var(--sp-widget-function-button-hover-border-color);
                                    color: var(--sp-widget-function-button-hover-text-color);
                                    background: var(--sp-widget-function-button-hover-color);
                                }
                            }

                            & > * {
                                display: flex;
                                align-items: center;
                                gap: 2px;
                                font-size: 12px;

                                svg {
                                    width: 15px;
                                    height: 15px;
                                }
                            }

                            .active {
                                display: none;
                            }

                            &.active {
                                color: var(--sp-widget-function-button-hover-text-color);

                                svg {
                                    rect,
                                    path {
                                        stroke: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }

                                .default {
                                    display: none;
                                }

                                .active {
                                    display: flex;
                                }
                            }
                        }
                    }
                }
                
                .products{
                    margin-top: 1rem;
                    flex: 1;
                    height: auto;
                    overflow-y: auto;

                    &::-webkit-scrollbar {
                        width: 3px;
                    }

                    &::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--sp-widget-bg-color);
                    }
                    
                    .title{
                        font-size: 18px;
                        line-height: 28px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                    }
                    
                    .productsList{
                        margin-top: 20px;
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        width: 100%;
                        
                        .productItem{
                            display: flex;
                            align-items: flex-start;
                            gap: 12px;
                            margin: 0 auto;
                            width: 95%;

                            .imageWrapper {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                border: 1px solid var(--sp-widget-border-color);
                                background: var(--sp-widget-secondary-bg-color);
                                width: 40px;
                                height: 40px;
                                border-radius: 8px;
                                overflow: hidden;

                                img {
                                    width: 40px;
                                    height: 40px;
                                    object-fit: cover;
                                }

                                &.placeholder{
                                    svg {
                                        width: 32px;
                                        height: 32px;
                                        object-fit: cover;

                                        path{
                                            stroke: var(--sp-widget-text-color);
                                        }
                                    }
                                }
                            }

                            .info {
                                flex: 1;

                                .name {
                                    color: var(--sp-widget-text-color);
                                    font-size: 14px;
                                    font-weight: 500;
                                }

                                .description {
                                    font-size: 12px;
                                    color: var(--sp-widget-secondary-text-color);
                                }
                            }

                            .priceWrapper {
                                .price {
                                    color: var(--sp-widget-text-color);
                                    font-size: 14px;
                                    font-weight: 500;
                                    text-align: end;
                                }

                                .count {
                                    font-size: 12px;
                                    color: var(--sp-widget-secondary-text-color);
                                    text-align: end;
                                }
                            }
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
                    padding: 10px 8px;
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
                    }

                    .spinner {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        svg {
                            width: 20px;
                            height: 20px;
                            animation: spin 1s linear infinite;
                        }

                        circle {
                            stroke: var(--sp-widget-primary-button-text-color);
                            opacity: 0.25;
                        }

                        path {
                            fill: var(--sp-widget-primary-button-text-color);
                            opacity: 0.75;
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
        'payment-step': PaymentStep;
    }
}
