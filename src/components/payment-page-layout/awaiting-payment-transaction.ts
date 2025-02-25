//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {customElement, html, LitElement, property, query, unsafeCSS} from 'lit-element';
//@ts-ignore
import style from "../../styles/payment-page-styles/awaiting-payment-transaction.css?inline";
import {PaymentPageStep, WalletType} from "../../lib/types.ts";
import {Invoice, InvoiceProduct, Transaction} from "@simplepay-ai/api-client";
import {PropertyValues} from "lit";
import {roundUpAmount} from "../../lib/util.ts";
import {arbitrum, avalanche, base, bsc, mainnet, optimism, polygon, zksync} from "@wagmi/core/chains";
import {
    estimateGas,
    getGasPrice,
    sendTransaction, SendTransactionErrorType,
    switchChain,
    writeContract,
    WriteContractErrorType
} from "@wagmi/core";
import {Address, parseEther, parseUnits} from "viem";
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
    {
        "inputs": [{"internalType": "address", "name": "_proxyTo", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "_new", "type": "address"}, {
            "indexed": false,
            "internalType": "address",
            "name": "_old",
            "type": "address"
        }],
        "name": "ProxyOwnerUpdate",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "_new", "type": "address"}, {
            "indexed": true,
            "internalType": "address",
            "name": "_old",
            "type": "address"
        }],
        "name": "ProxyUpdated",
        "type": "event"
    }, {"stateMutability": "payable", "type": "fallback"}, {
        "inputs": [],
        "name": "implementation",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "proxyOwner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "proxyType",
        "outputs": [{"internalType": "uint256", "name": "proxyTypeId", "type": "uint256"}],
        "stateMutability": "pure",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "transferProxyOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_newProxyTo", "type": "address"}, {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
        }], "name": "updateAndCall", "outputs": [], "stateMutability": "payable", "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_newProxyTo", "type": "address"}],
        "name": "updateImplementation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {"stateMutability": "payable", "type": "receive"}
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

@customElement('awaiting-payment-transaction')
export class AwaitingPaymentTransaction extends LitElement {

    static styles = unsafeCSS(style);

    /////////////////////

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Object})
    transaction: Transaction | null = null;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Boolean})
    cancelingTransaction: boolean = false;

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

    @property({type: Boolean})
    checkingTransaction: boolean = false;

    /////////////

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

    @property({type: Number, attribute: false})
    timerTimeStart: number = 0;

    @property({type: Number, attribute: false})
    timerTimeCurrent: number = 0;

    @property({attribute: false})
    timerTimeStartLocal: number = 0;

    @property({attribute: false})
    timerTimeCurrentLocal: number = 0;

    @property({attribute: false})
    progressStart: number = 252;

    @property({attribute: false})
    progressCurrent: number = 252;

    /////////////////

    private dispatchStepChange(step: PaymentPageStep) {
        const changeStepEvent = new CustomEvent('goToStep', {
            detail: {
                stepName: step,
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(changeStepEvent);
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

    private dispatchCancelInvoice() {
        const cancelEvent = new CustomEvent('cancelTransaction', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelEvent);
    }

    private calcTimer(step: number) {
        if (this.timerTimeCurrentLocal !== 0) {
            this.timerTimeCurrentLocal -= 1;
            this.progressCurrent =
                this.progressStart - (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * step;
        }
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

        if (this.walletType === "WalletConnectTron" || this.walletType === 'TronLink') {

            if (this.transaction?.cryptocurrency.symbol === 'USDT') {

                try {

                    let contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
                    let functionSelector = "transfer(address,uint256)"
                    let from = this.transaction?.from;
                    let to = this.transaction?.to;
                    let amount = this.tronWeb.toSun(this.leftAmountToken);
                    let parameter = [{type: 'address', value: to}, {type: 'uint256', value: amount}]
                    let options = {
                        feeLimit: 100000000
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

                    } else if (errorMessage.indexOf('timeout') !== -1) {

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

            } else {

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

                    } else if (errorMessage.indexOf('timeout') !== -1) {

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

    /////////////////

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

        if (this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0) {
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if (this.invoice?.products && this.invoice.products.length > 0) {
            this.invoiceProducts = this.invoice.products;
        }

        if (this.transaction) {
            this.timerTimeStart = (Date.parse(this.transaction?.expireAt!) - Date.parse(this.transaction?.createdAt!)) / 1000;
            this.timerTimeCurrent = (Date.parse(this.transaction?.expireAt!) - new Date().getTime()) / 1000;

            this.timerTimeStartLocal = this.timerTimeStart;
            this.timerTimeCurrentLocal = this.timerTimeCurrent;

            const oneStep: number = this.progressStart / this.timerTimeStartLocal;
            this.progressCurrent =
                this.progressStart -
                (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * oneStep;

            setInterval(() => this.calcTimer(oneStep), 1000);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.updatePaymentAwaiting(false);
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (this.invoice) {

            const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!);
            this.leftAmount = parseFloat(left.toString()).toFixed(2);

            const price = left / Number(this.transaction?.rate);
            this.leftAmountToken = roundUpAmount(price.toString(), this.transaction?.cryptocurrency.stable!).toString();
        }

    }

    render() {
        return html`
            <div class=${`awaitingPayment`}>

                <div class="header">
                    <button
                            @click=${() => this.dispatchStepChange('invoiceStep')}
                            class="backButton"
                    >
                        <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                        >
                            <path d="m12 19-7-7 7-7"/>
                            <path d="M19 12H5"/>
                        </svg>
                    </button>

                    <p class="title">
                        ${this.i18n?.t('paymentStep.title')}
                    </p>

                    <div class="badge withAddress">
                        <div class="network"></div>

                        ${`${this.transaction?.from.slice(0, 4)}...${this.transaction?.from.slice(this.transaction?.from.length - 4, this.transaction?.from.length)}`}
                    </div>
                </div>

                <div class="contentWrapper">

                    ${
                            (this.cancelingTransaction)
                                    ? html`
                                        <div class="cancelingWrapper">
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
                                        <div class="cancelingWrapper">
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
                            (!this.cancelingTransaction && !this.checkingTransaction)
                                    ? html`
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

                                            ${
                                                    (this.walletType && this.walletType !== 'Custom')
                                                            ? html`
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
                                                                                                <circle cx="12" cy="12" r="10"
                                                                                                        stroke-width="4"/>
                                                                                                <path
                                                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                                />
                                                                                            </svg>
                                                                                        </div>
                                                                                    `
                                                                                    :
                                                                                    html`

                                                                                        ${
                                                                                                (this.walletType === 'Coinbase')
                                                                                                        ? html`
                                                                                                            <div class="icon coinbaseIcon">
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                                     role="img"
                                                                                                                     aria-label="Coinbase Wallet Logo"
                                                                                                                     viewBox="0 0 32 32"
                                                                                                                     width="32"
                                                                                                                     height="32"
                                                                                                                     class="typeIcon"
                                                                                                                     data-testid="wallet-logo"
                                                                                                                     fill="none">
                                                                                                                    <path d="M0 16C0 24.8356 7.16444 32 16 32C24.8356 32 32 24.8356 32 16C32 7.16444 24.8356 0 16 0C7.16444 0 0 7.16444 0 16ZM11.9111 10.8444C11.32 10.8444 10.8444 11.32 10.8444 11.9111V20.0889C10.8444 20.68 11.32 21.1556 11.9111 21.1556H20.0889C20.68 21.1556 21.1556 20.68 21.1556 20.0889V11.9111C21.1556 11.32 20.68 10.8444 20.0889 10.8444H11.9111Z"
                                                                                                                          fill="#3773f5"
                                                                                                                          fill-rule="evenodd"
                                                                                                                          clip-rule="evenodd"></path>
                                                                                                                </svg>
                                                                                                            </div>

                                                                                                            <p>${`${this.i18n?.t('buttons.payWith')} Coinbase`}</p>
                                                                                                        ` : ''
                                                                                        }

                                                                                        ${
                                                                                                (this.walletType === 'WalletConnect' || this.walletType === 'WalletConnectTron')
                                                                                                        ? html`
                                                                                                            <div class="icon walletConnectIcon">
                                                                                                                <svg class="typeIcon"
                                                                                                                     xmlns="http://www.w3.org/2000/svg"
                                                                                                                     width="68"
                                                                                                                     height="35"
                                                                                                                     viewBox="0 0 68 35"
                                                                                                                     fill="none">
                                                                                                                    <g clip-path="url(#clip0_6067_204)">
                                                                                                                        <path d="M50.4609 16.1674L56.4597 10.1686C42.9015 -3.38955 26.0548 -3.38955 12.4966 10.1686L18.4954 16.1674C28.8068 5.85594 40.1564 5.85594 50.4679 16.1674H50.4609Z"
                                                                                                                              fill="#202020"/>
                                                                                                                        <path d="M48.4623 30.1435L34.4721 16.1533L20.482 30.1435L6.4918 16.1533L0.5 22.1451L20.482 42.1341L34.4721 28.1439L48.4623 42.1341L68.4443 22.1451L62.4525 16.1533L48.4623 30.1435Z"
                                                                                                                              fill="#202020"/>
                                                                                                                    </g>
                                                                                                                </svg>
                                                                                                            </div>
                                                                                                            <p>${`${this.i18n?.t('buttons.payWith')} WalletConnect`}</p>
                                                                                                        ` : ''
                                                                                        }

                                                                                        ${
                                                                                                (this.walletType === 'TronLink')
                                                                                                        ? html`
                                                                                                            <div class="icon tronLinkIcon">
                                                                                                                <svg class="typeIcon"
                                                                                                                     xmlns="http://www.w3.org/2000/svg"
                                                                                                                     width="26"
                                                                                                                     height="26"
                                                                                                                     viewBox="0 0 26 26"
                                                                                                                     fill="none">
                                                                                                                    <rect width="26" height="26"
                                                                                                                          rx="6"
                                                                                                                          fill="#135DCD"/>
                                                                                                                    <mask id="mask0_12_18"
                                                                                                                          style="mask-type:alpha"
                                                                                                                          maskUnits="userSpaceOnUse"
                                                                                                                          x="0"
                                                                                                                          y="0"
                                                                                                                          width="26"
                                                                                                                          height="26">
                                                                                                                        <path fill-rule="evenodd"
                                                                                                                              clip-rule="evenodd"
                                                                                                                              d="M2.92288 0C1.30853 0 0 1.43954 0 3.21535V22.7846C0 24.5605 1.30853 26 2.92288 26H23.0771C24.6913 26 26 24.5605 26 22.7846V3.21535C26 1.43954 24.6913 0 23.0771 0H2.92288Z"
                                                                                                                              fill="white"/>
                                                                                                                    </mask>
                                                                                                                    <g mask="url(#mask0_12_18)">
                                                                                                                        <path fill-rule="evenodd"
                                                                                                                              clip-rule="evenodd"
                                                                                                                              d="M22.2767 20.4777L34.5747 18.2553L20.4683 35.4043L22.2767 20.4777ZM20.7448 19.7316L18.8422 35.4046L8.57463 9.68123L20.7448 19.7316ZM21.3583 17.7022L9.68081 8.29797L28.7659 11.7083L21.3583 17.7022ZM30.8061 12.4467L34.8508 16.2655L23.787 18.2552L30.8061 12.4467ZM31.33 10.375L4.97876 5.53198L18.8475 40.383L38.1702 16.8702L31.33 10.375Z"
                                                                                                                              fill="white"/>
                                                                                                                    </g>
                                                                                                                </svg>
                                                                                                            </div>
                                                                                                            <p>${`${this.i18n?.t('buttons.payWith')} TronLink`}</p>
                                                                                                        ` : ''
                                                                                        }

                                                                                        ${
                                                                                                (this.walletType === 'Injected')
                                                                                                        ? this.i18n?.t('buttons.pay')
                                                                                                        : ''
                                                                                        }

                                                                                        ${
                                                                                                (this.walletType === 'MetaMask')
                                                                                                        ? html`
                                                                                                            <div class="icon metaMaskIcon">
                                                                                                                <svg class="typeIcon"
                                                                                                                     xmlns="http://www.w3.org/2000/svg"
                                                                                                                     width="36"
                                                                                                                     height="30"
                                                                                                                     viewBox="0 0 36 30"
                                                                                                                     fill="none">
                                                                                                                    <path d="M32.9583 1L19.8242 10.7183L22.2666 4.99099L32.9583 1Z"
                                                                                                                          fill="#E17726"
                                                                                                                          stroke="#E17726"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M2.66284 1L15.68 10.809L13.3546 4.99098L2.66284 1Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M28.2292 23.5334L24.7346 28.872L32.2175 30.9323L34.3611 23.6501L28.2292 23.5334Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M1.27271 23.6501L3.40325 30.9323L10.8732 28.872L7.39154 23.5334L1.27271 23.6501Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M10.4704 14.5149L8.39185 17.6507L15.7968 17.9876L15.55 10.0186L10.4704 14.5149Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M25.1503 14.515L19.9929 9.92798L19.824 17.9877L27.2289 17.6508L25.1503 14.515Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M10.8733 28.872L15.3552 26.7081L11.4969 23.7019L10.8733 28.872Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M20.2659 26.7081L24.7348 28.872L24.1242 23.7019L20.2659 26.7081Z"
                                                                                                                          fill="#E27625"
                                                                                                                          stroke="#E27625"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M24.7348 28.8722L20.2659 26.7083L20.6296 29.6108L20.5906 30.8418L24.7348 28.8722Z"
                                                                                                                          fill="#D5BFB2"
                                                                                                                          stroke="#D5BFB2"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M10.8733 28.8722L15.0305 30.8418L15.0045 29.6108L15.3552 26.7083L10.8733 28.8722Z"
                                                                                                                          fill="#D5BFB2"
                                                                                                                          stroke="#D5BFB2"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M15.1083 21.7842L11.3928 20.6958L14.017 19.4907L15.1083 21.7842Z"
                                                                                                                          fill="#233447"
                                                                                                                          stroke="#233447"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M20.5127 21.7842L21.604 19.4907L24.2412 20.6958L20.5127 21.7842Z"
                                                                                                                          fill="#233447"
                                                                                                                          stroke="#233447"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M10.8732 28.872L11.5228 23.5334L7.3916 23.6501L10.8732 28.872Z"
                                                                                                                          fill="#CC6228"
                                                                                                                          stroke="#CC6228"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M24.0981 23.5334L24.7347 28.872L28.2293 23.6501L24.0981 23.5334Z"
                                                                                                                          fill="#CC6228"
                                                                                                                          stroke="#CC6228"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M27.2289 17.6506L19.824 17.9875L20.5125 21.7842L21.6038 19.4906L24.241 20.6957L27.2289 17.6506Z"
                                                                                                                          fill="#CC6228"
                                                                                                                          stroke="#CC6228"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M11.3928 20.6957L14.017 19.4906L15.1083 21.7842L15.7968 17.9875L8.39185 17.6506L11.3928 20.6957Z"
                                                                                                                          fill="#CC6228"
                                                                                                                          stroke="#CC6228"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M8.39209 17.6506L11.497 23.7019L11.393 20.6957L8.39209 17.6506Z"
                                                                                                                          fill="#E27525"
                                                                                                                          stroke="#E27525"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M24.2412 20.6957L24.1243 23.7019L27.2292 17.6506L24.2412 20.6957Z"
                                                                                                                          fill="#E27525"
                                                                                                                          stroke="#E27525"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M15.7972 17.9875L15.1086 21.7842L15.979 26.2675L16.1739 20.3588L15.7972 17.9875Z"
                                                                                                                          fill="#E27525"
                                                                                                                          stroke="#E27525"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M19.8242 17.9875L19.4604 20.3459L19.6423 26.2675L20.5127 21.7842L19.8242 17.9875Z"
                                                                                                                          fill="#E27525"
                                                                                                                          stroke="#E27525"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M20.5127 21.7843L19.6423 26.2676L20.2659 26.7082L24.1243 23.702L24.2412 20.6958L20.5127 21.7843Z"
                                                                                                                          fill="#F5841F"
                                                                                                                          stroke="#F5841F"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M11.3928 20.6958L11.4968 23.702L15.3551 26.7082L15.9787 26.2676L15.1083 21.7843L11.3928 20.6958Z"
                                                                                                                          fill="#F5841F"
                                                                                                                          stroke="#F5841F"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M20.5907 30.8417L20.6296 29.6107L20.2919 29.3256H15.3293L15.0045 29.6107L15.0305 30.8417L10.8733 28.8721L12.3283 30.0642L15.2773 32.0986H20.3308L23.2928 30.0642L24.7348 28.8721L20.5907 30.8417Z"
                                                                                                                          fill="#C0AC9D"
                                                                                                                          stroke="#C0AC9D"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M20.2658 26.7081L19.6422 26.2676H15.9787L15.3552 26.7081L15.0044 29.6107L15.3292 29.3256H20.2918L20.6296 29.6107L20.2658 26.7081Z"
                                                                                                                          fill="#161616"
                                                                                                                          stroke="#161616"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M33.5168 11.3532L34.6211 5.98873L32.9582 1L20.2659 10.3944L25.1505 14.5149L32.0488 16.5234L33.5688 14.7482L32.9063 14.2687L33.9585 13.3099L33.1531 12.6879L34.2054 11.8845L33.5168 11.3532Z"
                                                                                                                          fill="#763E1A"
                                                                                                                          stroke="#763E1A"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M1 5.98873L2.11724 11.3532L1.40273 11.8845L2.468 12.6879L1.66255 13.3099L2.71483 14.2687L2.05228 14.7482L3.57225 16.5234L10.4706 14.5149L15.3552 10.3944L2.66287 1L1 5.98873Z"
                                                                                                                          fill="#763E1A"
                                                                                                                          stroke="#763E1A"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M32.0489 16.5233L25.1506 14.5149L27.2292 17.6507L24.1243 23.7019L28.2295 23.6501H34.3613L32.0489 16.5233Z"
                                                                                                                          fill="#F5841F"
                                                                                                                          stroke="#F5841F"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M10.4704 14.5149L3.57214 16.5233L1.27271 23.6501H7.39154L11.4967 23.7019L8.39186 17.6507L10.4704 14.5149Z"
                                                                                                                          fill="#F5841F"
                                                                                                                          stroke="#F5841F"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                    <path d="M19.8241 17.9876L20.2658 10.3943L22.2664 4.99097H13.3545L15.3551 10.3943L15.7968 17.9876L15.9657 20.3718L15.9787 26.2676H19.6422L19.6552 20.3718L19.8241 17.9876Z"
                                                                                                                          fill="#F5841F"
                                                                                                                          stroke="#F5841F"
                                                                                                                          stroke-width="0.25"
                                                                                                                          stroke-linecap="round"
                                                                                                                          stroke-linejoin="round"/>
                                                                                                                </svg>
                                                                                                            </div>
                                                                                                            <p>${`${this.i18n?.t('buttons.payWith')} MetaMask`}</p>
                                                                                                        ` : ''
                                                                                        }

                                                                                    `
                                                                    }

                                                                </button>
                                                            ` : ''
                                            }

                                        </div>
                                    `
                                    : ''
                    }

                </div>

                <div class="footer">

                    <button
                            class="secondaryButton"
                            @click=${this.dispatchCancelInvoice}
                            .disabled=${this.cancelingTransaction || this.connectorPaymentAwaiting || this.checkingTransaction}
                    >
                        ${this.i18n?.t('buttons.cancelTransaction')}
                    </button>

                    <div class="timerWrapper">
                        <div class="loader">
                            <svg
                                    width="78"
                                    height="78"
                                    viewBox="-9.75 -9.75 97.5 97.5"
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    style="transform:rotate(-90deg)"
                            >
                                <circle
                                        class="timerBg"
                                        r="40"
                                        cx="38"
                                        cy="38"
                                        fill="transparent"
                                        stroke-width="12"
                                        stroke-dasharray="252"
                                        stroke-dashoffset="0"
                                ></circle>
                                <circle
                                        class=${`
                            timerProgress
                            `}
                                        r="40"
                                        cx="38"
                                        cy="38"
                                        stroke-width="12"
                                        stroke-linecap="round"
                                        stroke-dashoffset=${this.progressCurrent}
                                        fill="transparent"
                                        stroke-dasharray="252px"
                                ></circle>
                            </svg>
                        </div>

                        <div class="info">
                            <p class="title">${this.i18n?.t('footer.timer')}</p>
                            <p
                                    id="timerTime"
                                    class=${`timerLeft
                        `}
                            >
                                ${new Date(this.timerTimeCurrentLocal * 1000)
                                        .toISOString()
                                        .slice(14, 19)}
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'awaiting-payment-transaction': AwaitingPaymentTransaction;
    }
}
