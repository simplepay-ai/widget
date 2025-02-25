import {Invoice, InvoiceProduct, Transaction, TransactionStatus} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {customElement, html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {getTokenStandart, roundUpAmount} from "../../../lib/util.ts";
//@ts-ignore
import style from "../../../styles/widget-styles/success-step.css?inline";
import {I18n} from "i18n-js";

@customElement('success-step')
export class SuccessStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Object})
    transaction: Transaction | null = null;

    @property({type: Boolean})
    hasReturnBack: boolean = true;

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

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
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

            this.qrCodeUrl = `https://blockchair.com/${networkSymbol}/transaction/${this.transaction.hash}?from=simplepay`;

            const qr = QRCode(0, 'H');
            qr.addData(this.qrCodeUrl);
            qr.make();

            this.qrcode.innerHTML = qr.createSvgTag();
        }
    }

    disconnectedCallback() {
        window.removeEventListener('localeChanged', this._onLocaleChanged);
        super.disconnectedCallback();
    }

    _onLocaleChanged() {
        this.requestUpdate();
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <main-header
                        .title=${this.getStatusTitle(this.transaction?.status!)}
                        .hasBackButton=${this.hasReturnBack}
                        .hasShareButton=${true}
                        .sharedData=${(this.transaction?.hash) ? {
                            title: this.i18n?.t('successStep.shareTitle'),
                            url: this.qrCodeUrl
                        } : null}
                ></main-header>

                <div class="stepContent">
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
                                        <p class="text capitalize">${this.getLocaliseTransactionStatus(this.transaction?.status!)}</p>
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

                        <div class="separator"></div>
                    </div>

                    <div class="infoContent">
                        <div class="infoWrapper">
                            <p class="title">${this.i18n?.t('successStep.transactionDetailsTitle')}:</p>

                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.transactionFields.network')}:</p>
                                <div class="networkInfo">
                                    <network-icon
                                            .id=${this.transaction?.network.symbol}
                                            width="16"
                                            height="16"
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
                                            width="16"
                                            height="16"
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
                        <div class="infoWrapper">
                            <p class="title">${this.i18n?.t('successStep.invoiceDetailsTitle')}:</p>

                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.invoiceFields.merchant')}:</p>
                                <div class="merchantInfo">
                                    ${
                                            (this.invoice?.app?.image)
                                                    ? html`
                                                        <div class="image">
                                                            <img src=${this.invoice?.app?.image}
                                                                 alt="merchant image">
                                                        </div>
                                                    `
                                                    : html`
                                                        <div class="image placeholder">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                 viewBox="0 0 24 24"
                                                                 fill="none" stroke="currentColor" stroke-width="1.5"
                                                                 stroke-linecap="round"
                                                                 stroke-linejoin="round">
                                                                <circle cx="12" cy="8" r="5"/>
                                                                <path d="M20 21a8 8 0 0 0-16 0"/>
                                                            </svg>
                                                        </div>
                                                    `
                                    }

                                    <p class="name">${this.invoice?.app?.name}</p>
                                </div>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.invoiceFields.amountTotal')}:</p>
                                <p class="amountInfo">
                                    ${(this.invoice?.total) ? this.invoice.total : 0}
                                    ${this.invoice?.currency.symbol}
                                </p>
                            </div>
                            <div class="infoItem">
                                <p class="title">${this.i18n?.t('successStep.invoiceFields.amountPaid')}:</p>
                                <p class="amountInfo">
                                    ${(this.invoice?.paid) ? this.invoice.paid : 0}
                                    ${this.invoice?.currency.symbol}
                                </p>
                            </div>

                            ${
                                    (this.invoiceProducts.length === 1 && (this.invoiceProducts[0].count === 1 || !this.invoiceProducts[0].count))
                                            ? html`
                                                <div class="infoItem">
                                                    <p class="title">${this.i18n?.t('successStep.invoiceFields.product')}:</p>
                                                    <div class="productInfo">
                                                        ${
                                                                (this.invoiceProducts[0].product.image)
                                                                        ? html`
                                                                            <div class="image">
                                                                                <img src=${this.invoiceProducts[0].product.image}
                                                                                     alt="product image">
                                                                            </div>
                                                                        `
                                                                        : html`
                                                                            <div class="image placeholder">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                                                     height="800px" viewBox="0 0 24 24" fill="none">
                                                                                    <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                          stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                          stroke-linecap="round"/>
                                                                                    <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                          stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                          stroke-linecap="round"/>
                                                                                </svg>
                                                                            </div>
                                                                        `
                                                        }

                                                        <p class="name">${this.invoiceProducts[0].product.name || ''}</p>
                                                    </div>
                                                </div>
                                            `
                                            : ''
                            }

                            ${
                                    ((this.invoiceProducts.length === 1 && this.invoiceProducts[0].count > 1) || (this.invoiceProducts.length > 1))
                                            ? html`
                                                <div class="infoItem">
                                                    <p class="title">${this.i18n?.t('successStep.invoiceFields.products')}:</p>
                                                    <div class="productButton" @click=${() => this.openProductModal()}>
                                                        <p class="name">${this.i18n?.t('successStep.invoiceFields.productCount')}: ${this.invoiceProducts.length}</p>
                                                    </div>
                                                </div>
                                            `
                                            : ''
                            }
                        </div>
                    </div>
                </div>

                <success-footer
                        .i18n=${this.i18n}
                        .invoice=${this.invoice}
                        .backButtonUrl=${this.backToStoreUrl}
                ></success-footer>

                <div class="productModal ${(this.showProductModal) ? 'show' : ''}">

                    <div @click=${() => this.closeProductModal()}
                         class="overlay ${(this.showProductModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showProductModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>${this.i18n?.t('modals.products.title')}</p>
                                <div class="closeButton"
                                     @click=${() => this.closeProductModal()}
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
                            <div class="productsList">

                                ${
                                        this.invoiceProducts && this.invoiceProducts.length > 0 && this.invoiceProducts.map((item: InvoiceProduct) => html`
                                            <div class="productItem">

                                                <div class=${`imageWrapper ${(!item.product.image) && 'placeholder'}`}>

                                                    ${
                                                            (item.product.image)
                                                                    ? html`
                                                                        <img src=${item.product.image} alt="product image">
                                                                    `
                                                                    : html`
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                                             height="800px" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                        </svg>
                                                                    `
                                                    }


                                                </div>

                                                <div class="info">
                                                    <p class="name">${item.product.name || ''}</p>
                                                    <p class="description">${item.product.description || ''}</p>
                                                </div>

                                                <div class="priceWrapper">
                                                    <p class="price">${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) ? item.product.prices[0].price : ''} ${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].currency.symbol) ? item.product.prices[0].currency.symbol : ''}</p>
                                                    <p class="count">${this.i18n?.t('modals.products.count')}: ${item.count || '---'}</p>
                                                </div>

                                            </div>
                                        `)
                                }

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
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

    private getStatusTitle(status: TransactionStatus){
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

    private openProductModal() {
        this.showProductModal = true;

        setTimeout(() => {
            this.showProductModalOverlay = true;

            setTimeout(() => {
                this.showProductModalContent = true;
            }, 200)
        }, 200)
    }

    private closeProductModal() {
        this.showProductModalContent = false;

        setTimeout(() => {
            this.showProductModalOverlay = false;

            setTimeout(() => {
                this.showProductModal = false;
            }, 200)
        }, 200)
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'success-step': SuccessStep;
    }
}
