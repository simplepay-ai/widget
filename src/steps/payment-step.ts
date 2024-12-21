import {Invoice, InvoiceProduct, Network, Transaction} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {roundUpAmount} from "../util.ts";
import {WalletType} from "../types.ts";
import {
    sendTransaction,
    SendTransactionErrorType,
    switchChain,
    writeContract,
    WriteContractErrorType
} from "@wagmi/core";
import {bsc, mainnet} from "@wagmi/core/chains";
import {parseEther, parseUnits} from "viem";
//@ts-ignore
import style from "../styles/payment-step.css?inline";

const ABI_USDT_BSC = [{
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "Approval",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
    }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
    }, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "Transfer",
    "type": "event"
}, {
    "constant": true,
    "inputs": [],
    "name": "_decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "_name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "_symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {
        "internalType": "address",
        "name": "spender",
        "type": "address"
    }],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "burn",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
    }],
    "name": "decreaseAllowance",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getOwner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
    }],
    "name": "increaseAllowance",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}, {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "sender", "type": "address"}, {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
    }, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}]
const ABI_USDT_ETH = [{
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_upgradedAddress", "type": "address"}],
    "name": "deprecate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "approve",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "deprecated",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_evilUser", "type": "address"}],
    "name": "addBlackList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
        "name": "_value",
        "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "upgradedAddress",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "balances",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "maximumFee",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "_totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_maker", "type": "address"}],
    "name": "getBlackListStatus",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}, {"name": "", "type": "address"}],
    "name": "allowed",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "paused",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "who", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "getOwner",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "newBasisPoints", "type": "uint256"}, {"name": "newMaxFee", "type": "uint256"}],
    "name": "setParams",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "issue",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "redeem",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"name": "remaining", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "basisPointsRate",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{"name": "", "type": "address"}],
    "name": "isBlackListed",
    "outputs": [{"name": "", "type": "bool"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_clearedUser", "type": "address"}],
    "name": "removeBlackList",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "MAX_UINT",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{"name": "_blackListedUser", "type": "address"}],
    "name": "destroyBlackFunds",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{"name": "_initialSupply", "type": "uint256"}, {"name": "_name", "type": "string"}, {
        "name": "_symbol",
        "type": "string"
    }, {"name": "_decimals", "type": "uint256"}],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "amount", "type": "uint256"}],
    "name": "Issue",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "amount", "type": "uint256"}],
    "name": "Redeem",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "newAddress", "type": "address"}],
    "name": "Deprecate",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "feeBasisPoints", "type": "uint256"}, {
        "indexed": false,
        "name": "maxFee",
        "type": "uint256"
    }],
    "name": "Params",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "_blackListedUser", "type": "address"}, {
        "indexed": false,
        "name": "_balance",
        "type": "uint256"
    }],
    "name": "DestroyedBlackFunds",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "_user", "type": "address"}],
    "name": "AddedBlackList",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": false, "name": "_user", "type": "address"}],
    "name": "RemovedBlackList",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "owner", "type": "address"}, {
        "indexed": true,
        "name": "spender",
        "type": "address"
    }, {"indexed": false, "name": "value", "type": "uint256"}],
    "name": "Approval",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{"indexed": true, "name": "from", "type": "address"}, {
        "indexed": true,
        "name": "to",
        "type": "address"
    }, {"indexed": false, "name": "value", "type": "uint256"}],
    "name": "Transfer",
    "type": "event"
}, {"anonymous": false, "inputs": [], "name": "Pause", "type": "event"}, {
    "anonymous": false,
    "inputs": [],
    "name": "Unpause",
    "type": "event"
}]

@customElement('payment-step')
export class PaymentStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    transaction: Transaction | null = null;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Boolean})
    hasReturnBack: boolean = true;

    @property({type: String})
    walletAddress: string = '';

    @property({type: Boolean})
    cancelingTransaction: boolean = false;

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
    leftAmountToken: string = '';

    @property({attribute: false})
    leftAmount: string = '';

    @query('#qrcode')
    qrcode: any;

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        if (this.transaction && this.transaction?.to) {
            const qr = QRCode(0, 'H');
            qr.addData(this.transaction?.to);
            qr.make();

            if (this.qrcode) {
                this.qrcode.innerHTML = qr.createSvgTag();
            }
        }
    }

    async connectedCallback() {
        super.connectedCallback();

        if(this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0){
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if(this.invoice?.products && this.invoice.products.length > 0){
            this.invoiceProducts = this.invoice.products;
        }
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if(this.invoice){
            const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!);
            this.leftAmount = parseFloat(left.toString()).toFixed(2);

            const price = left / Number(this.transaction?.rate);
            this.leftAmountToken = roundUpAmount(price.toString(), this.transaction?.cryptocurrency.stable!).toString();
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title= ${'Awaiting for Payment'}
                        .hasBackButton=${this.hasReturnBack}
                        .showAddress=${true}
                        .walletAddress=${this.transaction?.from}
                ></step-header>

                ${
                        (this.cancelingTransaction)
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

                                            <p>Canceling transaction ...</p>
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
                        (!this.cancelingTransaction && !this.checkingTransaction && (!this.walletType || this.walletType === 'Custom'))
                                ? html`
                                    <div class="stepContent">
                                        <div class="topInfo">
                                            <div class="infoItem">
                                                <p class="title">Network:</p>
                                                <div class="info">
                                                    <network-icon
                                                            .id=${this.transaction?.network.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></network-icon>
                                                    <p class="text">${this.transaction?.network.symbol}</p>
                                                </div>
                                            </div>

                                            <div class="infoItem">
                                                <p class="title">Token:</p>

                                                <div class="info">
                                                    <token-icon
                                                            .id=${this.transaction?.cryptocurrency.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></token-icon>

                                                    <p class="text">${this.transaction?.cryptocurrency.symbol}</p>

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
                                                        .id=${this.transaction?.cryptocurrency.symbol}
                                                        width="42"
                                                        height="42"
                                                        class="tokenIcon"
                                                ></token-icon>
                                                <network-icon
                                                        .id=${this.transaction?.network.symbol}
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
                                                            .value=${this.transaction?.to}
                                                            readonly
                                                            disabled
                                                    />

                                                    <div
                                                            class="copyButton"
                                                            @click=${(event: CustomEvent) =>
                                                                    this.copyData(event, this.transaction?.to || '')}
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
                                                            .value=${`${this.leftAmountToken} ${this.transaction?.cryptocurrency.symbol}`}
                                                            readonly
                                                            disabled
                                                    />

                                                    <div
                                                            class="copyButton"
                                                            @click=${(event: CustomEvent) =>
                                                                    this.copyData(event, this.leftAmountToken.toString() || '')}
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
                        (!this.cancelingTransaction && !this.checkingTransaction && (this.walletType && this.walletType !== 'Custom'))
                                ? html`
                                    <div class="stepContent between">

                                        <div class="topInfo">
                                            <div class="infoItem">
                                                <p class="title">Network:</p>
                                                <div class="info">
                                                    <network-icon
                                                            .id=${this.transaction?.network.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></network-icon>
                                                    <p class="text">${this.transaction?.network.symbol}</p>
                                                </div>
                                            </div>

                                            <div class="infoItem">
                                                <p class="title">Token:</p>

                                                <div class="info">
                                                    <token-icon
                                                            .id=${this.transaction?.cryptocurrency.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="icon"
                                                    ></token-icon>

                                                    <p class="text">${this.transaction?.cryptocurrency.symbol}</p>

                                                    ${this.tokenStandart !== ''
                                                            ? html`
                                                                <div class="badge">${this.tokenStandart}</div> `
                                                            : ''}
                                                </div>
                                            </div>
                                        </div>

                                        ${
                                                (this.invoiceProducts && this.invoiceProducts.length > 0)
                                                        ? html`
                                                            <div class="products">
                                                                <p class="title">Products</p>

                                                                <div class="productsList">

                                                                    ${
                                                                            this.invoiceProducts.map((item: InvoiceProduct) => html`
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
                                                                                                                      stroke="var(--sp-widget-active-color)"
                                                                                                                      stroke-width="1"
                                                                                                                      stroke-linecap="round"/>
                                                                                                                <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                                                      stroke="var(--sp-widget-active-color)"
                                                                                                                      stroke-width="1"
                                                                                                                      stroke-linecap="round"/>
                                                                                                            </svg>
                                                                                                        `
                                                                                        }


                                                                                    </div>

                                                                                    <div class="info">
                                                                                        <p class="name">${item.product.name}</p>
                                                                                        <p class="description">
                                                                                            ${item.product.description}</p>
                                                                                    </div>

                                                                                    <div class="priceWrapper">
                                                                                        <p class="price">
                                                                                            ${parseFloat(item.product.prices[0].price.toString()).toFixed(2)}
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

                                        ${
                                                (this.invoiceProducts.length === 0)
                                                        ? html`
                                                            <div class="card">
                                                                <svg class="image" xmlns="http://www.w3.org/2000/svg" width="24"
                                                                     height="24"
                                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                                     stroke-width="1.5"
                                                                     stroke-linecap="round" stroke-linejoin="round">
                                                                    <circle cx="12" cy="12" r="10"/>
                                                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                                                    <path d="M12 18V6"/>
                                                                </svg>

                                                                <p class="title">Amount</p>
                                                                <p class="price">${`$${this.leftAmount}`}</p>
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
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                         viewBox="0 0 24 24">
                                                                        <circle cx="12" cy="12" r="10" stroke-width="4"/>
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
                        .price=${this.leftAmount}
                        .hasButton=${false}
                        .hasCancelButton=${true}
                        .hasTimer=${true}
                        .timerTimeStart=${(Date.parse(this.transaction?.expireAt!) -
                                Date.parse(this.transaction?.createdAt!)) /
                        1000}
                        .timerTimeCurrent=${(Date.parse(this.transaction?.expireAt!) -
                                new Date().getTime()) /
                        1000}
                        .buttonDisabled=${this.cancelingTransaction || this.connectorPaymentAwaiting || this.checkingTransaction}
                        @footerCancelClick=${this.dispatchCancelTransaction}
                ></step-footer>
            </div>
        `;
    }

    private async triggerTransaction() {

        this.updatePaymentAwaiting(true);

        if (this.walletType !== 'MetaMask') {
            try {
                await switchChain(this.walletConnectorConfig, {chainId: (this.transaction?.network.symbol === 'bsc') ? bsc.id : mainnet.id})
            } catch (e) {

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
        }

        const timer = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout error')), 40000)
        );

        switch (this.transaction?.network.symbol) {
            case 'bsc':

                if (this.transaction?.cryptocurrency.symbol === 'USDT') {

                    try {

                        const hashTransaction = await Promise.race([
                            writeContract(this.walletConnectorConfig, {
                                abi: ABI_USDT_BSC,
                                address: '0x55d398326f99059fF775485246999027B3197955',
                                functionName: 'transfer',
                                args: [
                                    this.transaction?.to,
                                    parseEther(this.leftAmountToken)
                                ],
                                chainId: bsc.id,
                            }),
                            timer,
                        ]);

                        if (hashTransaction) {
                            this.checkingTransaction = true;
                            this.updatePaymentAwaiting(false);
                        }

                        return;

                    } catch (e) {

                        const error = e as WriteContractErrorType;

                        let messageTitle = '';
                        let messageText = '';

                        if (error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = `The current network of your wallet is incompatible with this transaction. Please switch to the ${(this.transaction.network.symbol === 'bsc') ? 'BNB' : 'Ethereum Mainnet'} network manually and try again.`

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = `The time limit for completing the payment has expired. Please try again to proceed with your transaction.`

                        } else {

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

                if (this.transaction?.cryptocurrency.symbol === 'USDT') {
                    try {

                        const hashTransaction = await Promise.race([
                            writeContract(this.walletConnectorConfig, {
                                abi: ABI_USDT_ETH,
                                address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                                functionName: 'transfer',
                                args: [
                                    this.transaction?.to,
                                    parseUnits(this.leftAmountToken, 6)
                                ],
                                chainId: mainnet.id,
                            }),
                            timer,
                        ]);

                        if (hashTransaction) {
                            this.checkingTransaction = true;
                            this.updatePaymentAwaiting(false);
                        }

                        return;

                    } catch (e) {

                        const error = e as WriteContractErrorType;

                        let messageTitle = '';
                        let messageText = '';

                        if (error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            const network: Network = this.transaction.network;
                            const networkName: any = (network && network.symbol === 'bsc') ? 'BNB' : 'Ethereum Mainnet'

                            messageTitle = 'Transaction Canceled'
                            messageText = `The current network of your wallet is incompatible with this transaction. Please switch to the ${networkName} network manually and try again.`

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = 'Transaction Canceled'
                            messageText = `The time limit for completing the payment has expired. Please try again to proceed with your transaction.`

                        } else {

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

            const hashTransaction = await Promise.race([
                sendTransaction(this.walletConnectorConfig, {
                    //@ts-ignore
                    to: this.transaction?.to,
                    value: parseEther(this.leftAmountToken),
                    chainId: (this.transaction?.network.symbol === 'bsc') ? bsc.id : mainnet.id,
                    data: '0x'
                }),
                timer,
            ]);

            if (hashTransaction) {
                this.checkingTransaction = true;
                this.updatePaymentAwaiting(false);
            }
        } catch (e) {
            const error = e as SendTransactionErrorType;
            console.log('sendTransaction error message', error.message)

            let messageTitle = '';
            let messageText = '';

            if (error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1) {

                messageTitle = 'Transaction Canceled'
                messageText = 'You have canceled the transaction. If this was unintentional, please try again.'

            } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                messageTitle = 'Transaction Canceled'
                messageText = 'Your balance is too low to complete the transaction. Please add funds to your account and try again.'

            } else if (error.message.indexOf('not match the target chain') !== -1) {

                messageTitle = 'Transaction Canceled'
                messageText = `The current network of your wallet is incompatible with this transaction. Please switch to the ${(this.transaction?.network.symbol === 'bsc') ? 'BNB' : 'Ethereum Mainnet'} network manually and try again.`

            } else if (error.message.indexOf('Timeout error') !== -1) {

                messageTitle = 'Transaction Canceled'
                messageText = `The time limit for completing the payment has expired. Please try again to proceed with your transaction.`

            } else {

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

    private dispatchCancelTransaction() {
        const cancelTransactionEvent = new CustomEvent('cancelTransaction', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelTransactionEvent);
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
}

declare global {
    interface HTMLElementTagNameMap {
        'payment-step': PaymentStep;
    }
}
