import {Invoice, InvoiceProduct, Transaction} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {roundUpAmount} from "../../../lib/util.ts";
import {WalletType} from "../../../lib/types.ts";
import {
    estimateGas,
    getGasPrice,
    sendTransaction,
    SendTransactionErrorType,
    switchChain,
    writeContract,
    WriteContractErrorType
} from "@wagmi/core";
import {bsc, mainnet, polygon, avalanche, zksync, arbitrum, optimism, base} from "@wagmi/core/chains";
import {Address, parseEther, parseUnits} from "viem";
//@ts-ignore
import style from "../../../styles/widget-styles/payment-step.css?inline";
import {I18n} from "i18n-js";

const ABI_USDT_BSC = [
    {
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
const ABI_USDT_ETH = [
    {
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
const ABI_USDT_POLYGON = [
    {"inputs":[{"internalType":"address","name":"_proxyTo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"_new","type":"address"},{"indexed":false,"internalType":"address","name":"_old","type":"address"}],"name":"ProxyOwnerUpdate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_new","type":"address"},{"indexed":true,"internalType":"address","name":"_old","type":"address"}],"name":"ProxyUpdated","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxyOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"proxyType","outputs":[{"internalType":"uint256","name":"proxyTypeId","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferProxyOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newProxyTo","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"updateAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_newProxyTo","type":"address"}],"name":"updateImplementation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}
]
const ABI_USDT_AVALANCE = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_logic",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin_",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "_data",
                "type": "bytes"
            }
        ],
        "stateMutability": "payable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "previousAdmin",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "AdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "beacon",
                "type": "address"
            }
        ],
        "name": "BeaconUpgraded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "implementation",
                "type": "address"
            }
        ],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "admin_",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newAdmin",
                "type": "address"
            }
        ],
        "name": "changeAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "implementation",
        "outputs": [
            {
                "internalType": "address",
                "name": "implementation_",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            }
        ],
        "name": "upgradeTo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newImplementation",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "data",
                "type": "bytes"
            }
        ],
        "name": "upgradeToAndCall",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]

@customElement('payment-step')
export class PaymentStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

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

    @property({type: Object})
    tronLinkConfig: any;

    @property({type: Object})
    tronWalletConnect: any;

    @property({type: Object})
    tronWeb: any;

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

    disconnectedCallback() {
        super.disconnectedCallback()
        this.updatePaymentAwaiting(false);
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
                <main-header
                        .title=${ this.i18n?.t('paymentStep.title') }
                        .hasBackButton=${this.hasReturnBack}
                        .showAddress=${true}
                        .walletAddress=${this.transaction?.from}
                ></main-header>

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

                                            <p>${`${this.i18n?.t('loaders.cancelingTransaction')} ...`}</p>
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

                                            <p>${`${this.i18n?.t('loaders.checkingTransaction')} ...`}</p>
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
                                                <p class="title">${this.i18n?.t('paymentStep.network')}:</p>
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
                                                <p class="title">${this.i18n?.t('paymentStep.token')}:</p>

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
                                                <p class="labelText">${this.i18n?.t('paymentStep.payAddress')}:</p>

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
                                                            ${this.i18n?.t('buttons.copy')}
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
                                                            ${this.i18n?.t('buttons.copied')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            <label class="inputWrapper" for="payAmount">
                                                <p class="labelText">${this.i18n?.t('paymentStep.payAmount')}:</p>

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
                                                            ${this.i18n?.t('buttons.copy')}
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
                                                            ${this.i18n?.t('buttons.copied')}
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
                                                <p class="title">${this.i18n?.t('paymentStep.network')}:</p>
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
                                                <p class="title">${this.i18n?.t('paymentStep.token')}:</p>

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
                                                                <p class="title">${this.i18n?.t('paymentStep.products')}</p>

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
                                                                                        <p class="name">${item.product.name || ''}</p>
                                                                                        <p class="description">
                                                                                            ${item.product.description || ''}</p>
                                                                                    </div>

                                                                                    <div class="priceWrapper">
                                                                                        <p class="price">
                                                                                            ${ (item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) ? parseFloat(item.product.prices[0].price.toString()).toFixed(2) : ''}
                                                                                            ${ (item.product.prices && item.product.prices.length > 0 && item.product.prices[0].currency.symbol) ? item.product.prices[0].currency.symbol : '' }</p>
                                                                                        <p class="count">${this.i18n?.t('paymentStep.productCount')}: ${item.count || '---'}</p>
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

                                                                <p class="title">${this.i18n?.t('paymentStep.totalAmount')}</p>
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
                                                            : this.i18n?.t('buttons.pay')
                                            }

                                        </button>

                                    </div>
                                `
                                : ''
                }

                <main-footer
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
                ></main-footer>
            </div>
        `;
    }

    private async triggerTransaction() {

        this.updatePaymentAwaiting(true);

        if (this.walletType !== 'MetaMask' && this.walletType !== 'WalletConnectTron' && this.walletType !== 'TronLink') {
            try {

                let chainId = 0;

                switch (this.transaction?.network.symbol) {
                    case 'bsc':
                        chainId = bsc.id;
                        break;
                    case 'ethereum':
                        chainId = mainnet.id;
                        break;
                    case 'polygon':
                        chainId = polygon.id;
                        break;
                    case 'avalanche':
                        chainId = avalanche.id;
                        break;
                    case 'zksync':
                        chainId = zksync.id;
                        break;
                    case 'arbitrum':
                        chainId = arbitrum.id;
                        break;
                    case 'optimism':
                        chainId = optimism.id;
                        break;
                    case 'base':
                        chainId = base.id;
                        break;
                    default:
                        break;
                }

                await switchChain(this.walletConnectorConfig, {chainId: chainId})
            } catch (e) {

                const options = {
                    detail: {
                        notificationData: {
                            title: this.i18n?.t('errors.networkChangeFailed.title'),
                            text: this.i18n?.t('errors.networkChangeFailed.text'),
                            buttonText: this.i18n?.t('buttons.confirm')
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

        const timer = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error())
            }, 40000)
        });

        if(this.walletType === "WalletConnectTron" || this.walletType === 'TronLink'){

            if (this.transaction?.cryptocurrency.symbol === 'USDT') {

                try {

                    let contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                    let functionSelector = "transfer(address,uint256)"
                    let from =  this.transaction?.from;
                    let to = this.transaction?.to;
                    let amount = this.tronWeb.toSun(this.leftAmountToken);
                    let parameter = [{type:'address',value:to},{type:'uint256',value:amount}]
                    let options = {
                        feeLimit:100000000
                    }

                    const transactionBuild = await this.tronWeb.transactionBuilder.triggerSmartContract(
                        contractAddress,
                        functionSelector,
                        options,
                        parameter,
                        from
                    );

                    let signedTransaction;
                    switch (this.walletType) {
                        case "TronLink":
                            signedTransaction = await this.tronLinkConfig.signTransaction(transactionBuild.transaction);
                            break;
                        case "WalletConnectTron":
                            signedTransaction = await this.tronWalletConnect.signTransaction(transactionBuild.transaction);
                            break;
                        default:
                            break;
                    }

                    const hashTransaction = await Promise.race([
                        this.tronWeb.trx.sendRawTransaction(signedTransaction),
                        timer,
                    ]);

                    if (hashTransaction) {
                        this.checkingTransaction = true;
                        this.updatePaymentAwaiting(false);
                    }

                    return;

                } catch (error: any) {

                    console.log('error', error)
                    const errorMessage = (error.message) ? error.message.toLowerCase() : '';

                    let messageTitle = '';
                    let messageText = '';

                    if (errorMessage.indexOf('rejected') !== -1
                        || errorMessage.indexOf('not support') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                    } else if (errorMessage.indexOf('balance') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                    }else if (errorMessage.indexOf('timeout') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                    } else {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                    }

                    const options = {
                        detail: {
                            notificationData: {
                                title: messageTitle,
                                text: messageText,
                                buttonText: this.i18n?.t('buttons.confirm')
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

            }else{

                try {
                    const transactionBuild = await this.tronWeb.transactionBuilder.sendTrx(
                        this.transaction?.to,
                        this.tronWeb.toSun(this.leftAmountToken),
                        this.transaction?.from,
                    );

                    let signedTransaction;
                    switch (this.walletType) {
                        case "TronLink":
                            signedTransaction = await this.tronLinkConfig.signTransaction(transactionBuild);
                            break;
                        case "WalletConnectTron":
                            signedTransaction = await this.tronWalletConnect.signTransaction(transactionBuild);
                            break;
                        default:
                            break;
                    }

                    const hashTransaction = await Promise.race([
                        await this.tronWeb.trx.sendRawTransaction(signedTransaction),
                        timer,
                    ]);
                    if (hashTransaction) {
                        this.checkingTransaction = true;
                        this.updatePaymentAwaiting(false);
                    }

                } catch (error: any) {

                    console.log('error', error)

                    const errorMessage = (error.message) ? error.message.toLowerCase() : '';

                    let messageTitle = '';
                    let messageText = '';

                    if (errorMessage.indexOf('rejected') !== -1
                        || errorMessage.indexOf('not support') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                    } else if (errorMessage.indexOf('balance') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                    }else if (errorMessage.indexOf('timeout') !== -1) {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                    } else {

                        messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                        messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                    }

                    const options = {
                        detail: {
                            notificationData: {
                                title: messageTitle,
                                text: messageText,
                                buttonText: this.i18n?.t('buttons.confirm')
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

            return;
        }

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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'BNB'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'Ethereum Mainnet'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'zksync':

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
                                chainId: zksync.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'zkSync Mainnet'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'arbitrum':

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
                                chainId: arbitrum.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'Arbitrum One'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'optimism':

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
                                chainId: optimism.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'OP Mainnet'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'base':

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
                                chainId: base.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'Base'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'polygon':

                if (this.transaction?.cryptocurrency.symbol === 'USDT') {

                    try {

                        const hashTransaction = await Promise.race([
                            writeContract(this.walletConnectorConfig, {
                                abi: ABI_USDT_POLYGON,
                                address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
                                functionName: 'transfer',
                                args: [
                                    this.transaction?.to,
                                    parseEther(this.leftAmountToken)
                                ],
                                chainId: polygon.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'Polygon'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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
            case 'avalanche':

                if (this.transaction?.cryptocurrency.symbol === 'USDT') {

                    try {

                        const hashTransaction = await Promise.race([
                            writeContract(this.walletConnectorConfig, {
                                abi: ABI_USDT_AVALANCE,
                                address: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
                                functionName: 'transfer',
                                args: [
                                    this.transaction?.to,
                                    parseEther(this.leftAmountToken)
                                ],
                                chainId: avalanche.id,
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

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

                        } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

                        } else if (error.message.indexOf('not match the target chain') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: 'Avalanche'}) || ''

                        } else if (error.message.indexOf('Timeout error') !== -1) {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

                        } else {

                            messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                            messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

                        }

                        const options = {
                            detail: {
                                notificationData: {
                                    title: messageTitle,
                                    text: messageText,
                                    buttonText: this.i18n?.t('buttons.confirm')
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

            let chainId = 0;

            switch (this.transaction?.network.symbol) {
                case 'bsc':
                    chainId = bsc.id;
                    break;
                case 'ethereum':
                    chainId = mainnet.id;
                    break;
                case 'polygon':
                    chainId = polygon.id;
                    break;
                case 'avalanche':
                    chainId = avalanche.id;
                    break;
                case 'zksync':
                    chainId = zksync.id;
                    break;
                case 'arbitrum':
                    chainId = arbitrum.id;
                    break;
                case 'optimism':
                    chainId = optimism.id;
                    break;
                case 'base':
                    chainId = base.id;
                    break;
                default:
                    break;
            }

            // const estimatedFees: any = await estimateFeesPerGas(this.walletConnectorConfig)
            // maxFeePerGas: parseGwei(estimatedFees.formatted.maxFeePerGas),

            const estimatedGas: any = await estimateGas(this.walletConnectorConfig, {
                to: this.transaction?.to as Address,
                value: parseEther(this.leftAmountToken),
            })
            const gasPrice = await getGasPrice(this.walletConnectorConfig)

            const hashTransaction = await Promise.race([
                sendTransaction(this.walletConnectorConfig, {
                    //@ts-ignore
                    to: this.transaction?.to,
                    value: parseEther(this.leftAmountToken),
                    chainId: chainId,
                    data: '0x',
                    gas: estimatedGas,
                    gasPrice: gasPrice,
                }),
                timer,
            ]);

            if (hashTransaction) {
                this.checkingTransaction = true;
                this.updatePaymentAwaiting(false);
            }
        } catch (e) {
            console.log('e', e)
            const error = e as SendTransactionErrorType;
            console.log('sendTransaction error message', error.message)

            let messageTitle = '';
            let messageText = '';

            if (error.message.indexOf('User rejected') !== -1 || error.message.indexOf('does not support the requested method') !== -1) {

                messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                messageText = this.i18n?.t('errors.transactionCanceled.userCancelText') || ''

            } else if (error.message.indexOf('exceeds the balance') !== -1 || error.message.indexOf('exceeds balance') !== -1 || error.message.indexOf('resource not found') !== -1) {

                messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                messageText = this.i18n?.t('errors.transactionCanceled.lowBalanceText') || ''

            } else if (error.message.indexOf('not match the target chain') !== -1) {

                let chainName = this.transaction?.network.symbol || '';

                switch (this.transaction?.network.symbol) {
                    case 'bsc':
                        chainName = 'BNB';
                        break;
                    case 'ethereum':
                        chainName = 'Ethereum Mainnet';
                        break;
                    case 'polygon':
                        chainName = 'Polygon';
                        break;
                    case 'avalanche':
                        chainName = 'Avalanche';
                        break;
                    case 'zksync':
                        chainName = 'zkSync';
                        break;
                    case 'arbitrum':
                        chainName = 'Arbitrum One';
                        break;
                    case 'optimism':
                        chainName = 'OP Mainnet';
                        break;
                    case 'base':
                        chainName = 'Base';
                        break;
                    default:
                        break;
                }

                messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                messageText = this.i18n?.t('errors.transactionCanceled.wrongNetworkText', {networkName: chainName}) || ''

            } else if (error.message.indexOf('Timeout error') !== -1) {

                messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                messageText = this.i18n?.t('errors.transactionCanceled.timeLimitText') || ''

            } else {

                messageTitle = this.i18n?.t('errors.transactionCanceled.title') || ''
                messageText = this.i18n?.t('errors.transactionCanceled.somethingWrongText') || ''

            }

            const options = {
                detail: {
                    notificationData: {
                        title: messageTitle,
                        text: messageText,
                        buttonText: this.i18n?.t('buttons.confirm')
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
