import {Invoice, InvoiceProduct, Transaction, TransactionStatus} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {customElement, html, LitElement, property, query, unsafeCSS} from 'lit-element';
//@ts-ignore
import style from "../../styles/payment-page-styles/completed-transaction.css?inline";
import {getTokenStandart, roundUpAmount} from "../../lib/util.ts";
import {PaymentPageStep} from "../../lib/types.ts";
import {I18n} from "i18n-js";

@customElement('completed-transaction')
export class CompletedTransaction extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Boolean})
    private customServerMode: boolean = false;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Object})
    transaction: Transaction | null = null;

    @property({type: String})
    backToStoreUrl: string = '';

    @query('#qrcode')
    qrcode: any;

    @property({attribute: false, type: String})
    qrCodeUrl: string = '';

    @property({attribute: false})
    tokenStandart: string = '';

    @property({attribute: false})
    amountToken: string = '';

    @property({attribute: false})
    amountUSD: string = '';

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    @property({attribute: false, type: Boolean})
    showProductModal: boolean = false;

    @property({attribute: false, type: Boolean})
    showProductModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    showProductModalContent: boolean = false;

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

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
    }

    disconnectedCallback() {
        window.removeEventListener('localeChanged', this._onLocaleChanged);
        super.disconnectedCallback();
    }

    _onLocaleChanged() {
        this.requestUpdate();
    }

    connectedCallback() {
        super.connectedCallback();

        window.addEventListener('localeChanged', this._onLocaleChanged);

        if (this.transaction?.amount) {
            this.amountToken = roundUpAmount(this.transaction.amount, this.transaction.cryptocurrency.stable).toString();

            const formatAmount = parseFloat(this.transaction.amount);
            const formatRate = parseFloat(this.transaction.rate);
            const calc = Number(formatAmount) * Number(formatRate);

            this.amountUSD = parseFloat(calc.toString()).toFixed(2);
        }

        this.tokenStandart = getTokenStandart(this.transaction?.network.symbol!);

        if (this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0) {
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if (this.invoice?.products && this.invoice.products.length > 0) {
            this.invoiceProducts = this.invoice.products;
        }
    }

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        if (this.transaction) {

            let networkSymbol = this.transaction?.network.symbol

            switch (this.transaction?.network.symbol) {
                case 'bsc':
                    networkSymbol = 'bnb'
                    break;
                case 'zksync':
                    networkSymbol = 'zksync-era'
                    break;
                default:
                    break;
            }

            let resultUrl = `https://blockchair.com/${networkSymbol}/transaction/${this.transaction.hash}`;
            if(!this.customServerMode){
                resultUrl += '?from=simplepay'
            }

            this.qrCodeUrl = resultUrl;

            const qr = QRCode(0, 'H');
            qr.addData(resultUrl);
            qr.make();

            this.qrcode.innerHTML = qr.createSvgTag();
        }
    }

    private getStatusTitle(status: TransactionStatus) {
        switch (status) {
            case TransactionStatus.Canceled:
                return this.i18n?.t('successStep.statusTitle.canceled');
            case TransactionStatus.Expired:
                return this.i18n?.t('successStep.statusTitle.expired');
            case TransactionStatus.Rejected:
                return this.i18n?.t('successStep.statusTitle.rejected');
            case TransactionStatus.Success:
                return this.i18n?.t('successStep.statusTitle.success');
        }
    }

    private getLocaliseTransactionStatus(status: TransactionStatus) {
        switch (status) {
            case TransactionStatus.Created:
                return this.i18n?.t('transactionStatus.created');
            case TransactionStatus.Processing:
                return this.i18n?.t('transactionStatus.processing');
            case TransactionStatus.Confirming:
                return this.i18n?.t('transactionStatus.confirming');
            case TransactionStatus.Success:
                return this.i18n?.t('transactionStatus.success');
            case TransactionStatus.Rejected:
                return this.i18n?.t('transactionStatus.rejected');
            case TransactionStatus.Canceled:
                return this.i18n?.t('transactionStatus.canceled');
            case TransactionStatus.Expired:
                return this.i18n?.t('transactionStatus.expired');
            default:
                return '';
        }
    }

    render() {
        return html`
            <div class=${`completedTransaction`}>

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
                        ${this.getStatusTitle(this.transaction?.status!)}
                    </p>
                </div>

                <div class="contentWrapper">
                    <div class="topContent">
                        <div class="topInfo">
                            <div class="leftSection">
                                <div class="linesWrapper">
                                    <div class="line"></div>
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                    <div class="dot"></div>
                                </div>
                                <div class="infoWrapper">
                                    <div class="infoItem">
                                        <p class="title">${this.i18n?.t('successStep.progressCreatedTitle')}</p>
                                        <p class="text">
                                            ${`${new Date(this.transaction?.createdAt!).toLocaleDateString()} ${new Date(this.transaction?.createdAt!).toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                    <div class="infoItem">
                                        <p class="title">${this.i18n?.t('successStep.progressProcessingTitle')}</p>
                                        <p class="text capitalize">
                                            ${this.getLocaliseTransactionStatus(this.transaction?.status!)}</p>
                                    </div>

                                    <div class="infoItem">
                                        <p class="title">
                                            ${
                                                    (this.transaction?.status.toString() === 'success')
                                                            ? this.i18n?.t('successStep.progressSuccessResultTitle')
                                                            : this.i18n?.t('successStep.progressFailedResultTitle')
                                            }
                                        </p>
                                        <p class="text">
                                            ${`${new Date(this.transaction?.updatedAt!).toLocaleDateString()} ${new Date(this.transaction?.updatedAt!).toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="rightSection">
                                ${
                                        (this.transaction?.hash)
                                                ? html`
                                                    <div id="qrcode" class="qrcode"></div>

                                                    <div class="icon">
                                                        <img
                                                                src="https://loutre.blockchair.io/assets/kit/blockchair.cube.svg"
                                                                alt="blockchair icon"
                                                        />
                                                    </div>
                                                `
                                                : ''
                                }
                            </div>
                        </div>
                    </div>
                    <div class="infoContent">
                        <div class="infoWrapper">
                            <p class="title">${this.i18n?.t('successStep.transactionDetailsTitle')}:</p>

                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.network')}:</p>
                                <div class="networkInfo">
                                    <network-icon
                                            .id=${this.transaction?.network.symbol}
                                            width="24"
                                            height="24"
                                            class="icon"
                                    ></network-icon>
                                    <p>${this.transaction?.network.symbol}</p>
                                </div>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.token')}:</p>
                                <div class="tokenInfo">
                                    <token-icon
                                            .id=${this.transaction?.cryptocurrency.symbol.toString().replace('x', '')}
                                            width="24"
                                            height="24"
                                            class="icon"
                                    ></token-icon>
                                    <p>${this.transaction?.cryptocurrency.symbol}</p>
                                    ${this.tokenStandart !== ''
                                            ? html`
                                                <div class="badge">${this.tokenStandart}</div> `
                                            : ''}
                                </div>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.amount')}:</p>
                                <p class="amountInfo">
                                    ${(this.amountToken) ? this.amountToken : 0}
                                    ${this.transaction?.cryptocurrency.symbol}
                                </p>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.from')}:</p>

                                <div class="copyLine"
                                     @click=${(event: CustomEvent) =>
                                             this.copyData(event, this.transaction?.from || '')}
                                >
                                    <p>
                                        ${this.transaction?.from.slice(0, 6)}
                                            ...${this.transaction?.from.slice(
                                                this.transaction?.from.length - 4,
                                                this.transaction?.from.length
                                        )}
                                    </p>

                                    <div class="defaultIcon">
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
                                                    width="14"
                                                    height="14"
                                                    x="8"
                                                    y="8"
                                                    rx="2"
                                                    ry="2"
                                            />
                                            <path
                                                    d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                            />
                                        </svg>
                                    </div>
                                    <div class="activeIcon">
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
                                    </div>
                                </div>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.to')}:</p>

                                <div class="copyLine"
                                     @click=${(event: CustomEvent) =>
                                             this.copyData(event, this.transaction?.to || '')}
                                >
                                    <p>
                                        ${this.transaction?.to.slice(0, 6)}
                                            ...${this.transaction?.to.slice(
                                                this.transaction?.to.length - 4,
                                                this.transaction?.to.length
                                        )}
                                    </p>

                                    <div class="defaultIcon">
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
                                                    width="14"
                                                    height="14"
                                                    x="8"
                                                    y="8"
                                                    rx="2"
                                                    ry="2"
                                            />
                                            <path
                                                    d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                            />
                                        </svg>
                                    </div>
                                    <div class="activeIcon">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button class="mainButton"
                        @click=${() => {
                            if (this.invoice?.status === 'active') {
                                this.dispatchStepChange('invoiceStep')
                            } else {
                                window.location.replace(this.backToStoreUrl || location.href)
                            }
                        }}
                >
                    ${
                            (this.invoice?.status === 'active')
                                    ? this.i18n?.t('buttons.makePayment')
                                    : this.i18n?.t('buttons.backToStore')
                    }
                </button>

            </div>
        `;
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
        'completed-transaction': CompletedTransaction;
    }
}
