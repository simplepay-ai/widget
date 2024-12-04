import {Invoice, InvoiceProduct, Transaction} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {css, customElement, html, LitElement, property, query} from 'lit-element';
import {getTokenStandart, roundUpAmount} from "../util.ts";

@customElement('success-step')
export class SuccessStep extends LitElement {

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

    connectedCallback() {
        super.connectedCallback();

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
            const networkSymbol =
                this.transaction?.network.symbol === 'bsc' ? 'bnb' : this.transaction?.network.symbol;
            this.qrCodeUrl = `https://blockchair.com/${networkSymbol}/transaction/${this.transaction.hash}?from=simplepay`;

            const qr = QRCode(0, 'H');
            qr.addData(this.qrCodeUrl);
            qr.make();

            this.qrcode.innerHTML = qr.createSvgTag();
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title=${`${this.transaction?.status} transaction`}
                        .hasBackButton=${this.hasReturnBack}
                        .hasShareButton=${true}
                        .sharedData=${(this.transaction?.hash) ? {
                            title: 'New Invoice',
                            url: this.qrCodeUrl
                        } : null}
                ></step-header>

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
                                        <p class="title">Invoice created</p>
                                        <p class="text">
                                            ${`${new Date(this.transaction?.createdAt!).toLocaleDateString()} ${new Date(this.transaction?.createdAt!).toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                    <div class="infoItem">
                                        <p class="title">Processing</p>
                                        <p class="text capitalize">${this.transaction?.status}</p>
                                    </div>

                                    <div class="infoItem">
                                        <p class="title">
                                            ${this.transaction?.status.toString() === 'success'
                                                    ? 'Payment success'
                                                    : 'Payment failed'}
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
                            <p class="title">Transaction details:</p>

                            <div class="infoItem">
                                <p class="title">Network:</p>
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
                                <p class="title">Token:</p>
                                <div class="tokenInfo">
                                    <token-icon
                                            .id=${this.transaction?.cryptocurrency.symbol}
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
                                <p class="title">Amount:</p>
                                <p class="amountInfo">
                                    ${(this.amountToken) ? this.amountToken : 0}
                                    ${this.transaction?.cryptocurrency.symbol}
                                </p>
                            </div>
                            <div class="infoItem">
                                <p class="title">From:</p>

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
                                <p class="title">To:</p>

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
                            <p class="title">Invoice details:</p>

                            <div class="infoItem">
                                <p class="title">Merchant:</p>
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
                                <p class="title">Total amount:</p>
                                <p class="amountInfo">
                                    ${(this.invoice?.total) ? this.invoice.total : 0}
                                    ${this.invoice?.currency.symbol}
                                </p>
                            </div>
                            <div class="infoItem">
                                <p class="title">Paid amount:</p>
                                <p class="amountInfo">
                                    ${(this.invoice?.paid) ? this.invoice.paid : 0}
                                    ${this.invoice?.currency.symbol}
                                </p>
                            </div>

                            ${
                                    (this.invoiceProducts.length === 1 && this.invoiceProducts[0].count === 1)
                                            ? html`
                                                <div class="infoItem">
                                                    <p class="title">Product:</p>
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
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                                     height="24"
                                                                                     viewBox="0 0 24 24"
                                                                                     fill="none" stroke="currentColor"
                                                                                     stroke-width="1.5"
                                                                                     stroke-linecap="round"
                                                                                     stroke-linejoin="round">
                                                                                    <circle cx="12" cy="8" r="5"/>
                                                                                    <path d="M20 21a8 8 0 0 0-16 0"/>
                                                                                </svg>
                                                                            </div>
                                                                        `
                                                        }

                                                        <p class="name">${this.invoiceProducts[0].product.name}</p>
                                                    </div>
                                                </div>
                                            `
                                            : ''
                            }

                            ${
                                    ((this.invoiceProducts.length === 1 && this.invoiceProducts[0].count > 1) || (this.invoiceProducts.length > 1))
                                            ? html`
                                                <div class="infoItem">
                                                    <p class="title">Products:</p>
                                                    <div class="productButton" @click=${() => this.openProductModal()}>
                                                        <p class="name">Items: ${this.invoiceProducts.length}</p>
                                                    </div>
                                                </div>
                                            `
                                            : ''
                            }
                        </div>
                    </div>
                </div>

                <success-footer
                        .invoice=${this.invoice}
                        .backButtonUrl=${this.backToStoreUrl}
                ></success-footer>

                <div class="productModal ${(this.showProductModal) ? 'show' : ''}">

                    <div @click=${() => this.closeProductModal()}
                         class="overlay ${(this.showProductModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showProductModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>Products</p>
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
                                                                                  stroke="#1C274C" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="#1C274C" stroke-width="1"
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
                    </div>

                </div>
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
                gap: 16px;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-scroll-color);
                }

                .topContent {
                    width: 100%;
                }

                .infoContent {
                    flex: 1;
                    width: 100%;
                    overflow-y: auto;
                }

                .topInfo {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .leftSection {
                        display: flex;

                        .linesWrapper {
                            position: relative;
                            display: flex;
                            flex-direction: column;
                            margin: 8px 0;
                            height: 112px;

                            .line {
                                width: 1px;
                                background: var(--sp-widget-active-color);
                                height: 128px;
                            }

                            .dot {
                                position: absolute;
                                width: 8px;
                                height: 8px;
                                border-radius: 50%;
                                background: var(--sp-widget-active-color);

                                &:nth-child(2) {
                                    top: 0;
                                    left: 50%;
                                    transform: translateX(-50%);
                                }

                                &:nth-child(3) {
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                }

                                &:nth-child(4) {
                                    bottom: 0;
                                    left: 50%;
                                    transform: translateX(-50%);
                                }
                            }
                        }

                        .infoWrapper {
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-left: 16px;

                            .infoItem {
                                display: flex;
                                flex-direction: column;
                                text-align: left;
                                gap: 4px;
                                height: auto;

                                .title {
                                    width: 100%;
                                    text-align: left;
                                    font-size: 12px;
                                    line-height: 1;
                                    color: var(--sp-widget-text-color);
                                }

                                .text {
                                    width: 100%;
                                    text-align: left;
                                    font-size: 12px;
                                    line-height: 1;
                                    color: var(--sp-widget-active-color);

                                    &.capitalize {
                                        text-transform: capitalize;
                                    }
                                }
                            }
                        }
                    }

                    .rightSection {
                        position: relative;
                        display: flex;
                        justify-content: flex-end;

                        .qrcode {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 128px;
                            aspect-ratio: 1;

                            svg {
                                width: 100%;
                                height: 100%;

                                rect {
                                    fill: transparent;
                                }

                                path {
                                    fill: var(--sp-widget-text-color);
                                }
                            }
                        }

                        .icon {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 20px;
                            height: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;

                            img {
                                width: 100%;
                                height: 100%;
                            }
                        }
                    }
                }

                .separator {
                    margin-top: 16px;
                    height: 1px;
                    width: 100%;
                    background: var(--sp-widget-separator-color);
                }

                .infoWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;;
                    color: var(--sp-widget-secondary-text-color);
                    margin-bottom: 8px;

                    & > .title {
                        font-size: 16px;
                        line-height: 20px;
                        color: var(--sp-widget-text-color);
                        font-weight: 700;
                        text-align: left;
                        margin-bottom: 10px;
                    }

                    .infoItem {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        height: 27px;

                        &.column {
                            align-items: flex-start;
                            flex-direction: column;
                            justify-content: unset;
                            gap: 4px;
                        }

                        .title {
                            font-size: 12px;
                            line-height: 20px;
                            font-weight: 700;
                        }

                        .networkInfo {
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

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                                text-transform: capitalize;
                            }
                        }

                        .tokenInfo {
                            display: flex;
                            gap: 4px;
                            align-items: center;

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

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
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

                        .amountInfo {
                            font-size: 12px;
                            line-height: 20px;
                            color: var(--sp-widget-text-color);
                            font-weight: 700;
                        }

                        .hashInfo {
                            display: flex;
                            align-items: center;
                            gap: 8px;

                            .separator {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                background: transparent;
                                width: 4px;

                                .dot {
                                    width: 4px;
                                    aspect-ratio: 1;
                                    background: var(--sp-widget-secondary-text-color);
                                    border-radius: 50%;
                                }
                            }

                            .copyButton {
                                padding: 5px;
                                border-radius: 6px;
                                color: var(--sp-widget-text-color);
                                cursor: pointer;

                                & > * {
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    font-size: 12px;

                                    svg {
                                        width: 14px;
                                        height: 14px;
                                    }
                                }

                                .active {
                                    display: none;
                                }

                                &.active {
                                    color: var(--sp-widget-active-color);

                                    svg {
                                        rect,
                                        path {
                                            stroke: var(--sp-widget-active-color);
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

                            a {
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                text-decoration: none;
                                color: var(--sp-widget-active-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;

                                svg {
                                    width: 12px;
                                    height: 12px;
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                            }
                        }

                        .copyLine {
                            display: flex;
                            align-items: center;
                            gap: 4px;
                            cursor: pointer;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            svg {
                                width: 16px;
                                height: 16px;
                                color: var(--sp-widget-active-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            .activeIcon,
                            .defaultIcon {
                                align-items: center;
                                justify-content: center;
                            }

                            .defaultIcon {
                                display: flex;
                            }

                            .activeIcon {
                                display: none;
                            }

                            &.active {
                                color: var(--sp-widget-active-color);

                                p {
                                    color: var(--sp-widget-active-color);
                                }

                                svg {
                                    rect,
                                    path {
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }

                                .defaultIcon {
                                    display: none;
                                }

                                .activeIcon {
                                    display: flex;
                                }
                            }
                        }

                        .merchantInfo {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: end;
                            gap: 4px;
                            overflow: hidden;

                            .image {
                                width: 20px;
                                min-width: 20px;
                                aspect-ratio: 1;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;
                                border: 1px solid var(--sp-widget-border-color);
                                background: var(--sp-widget-bg-color);
                                border-radius: 50%;

                                img {
                                    width: 20px;
                                    height: 20px;
                                    object-fit: cover;
                                }

                                &.placeholder {
                                    svg {
                                        width: 10px;
                                        height: 10px;
                                        object-fit: cover;
                                        color: var(--sp-widget-active-color);
                                    }
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                                -webkit-line-clamp: 1;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                        }

                        .productInfo {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: end;
                            gap: 4px;
                            overflow: hidden;

                            .image {
                                width: 20px;
                                min-width: 20px;
                                aspect-ratio: 1;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;
                                border: 1px solid var(--sp-widget-border-color);
                                background: var(--sp-widget-bg-color);
                                border-radius: 50%;

                                img {
                                    width: 20px;
                                    height: 20px;
                                    object-fit: cover;
                                }

                                &.placeholder {
                                    svg {
                                        width: 10px;
                                        height: 10px;
                                        object-fit: cover;
                                        color: var(--sp-widget-active-color);
                                    }
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-text-color);
                                font-weight: 700;
                                -webkit-line-clamp: 1;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                        }

                        .productButton {
                            background-color: var(--sp-widget-function-button-color);
                            border: 1px solid var(--sp-widget-function-button-border-color);
                            padding: 2px 10px;
                            border-radius: 4px;
                            cursor: pointer;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-widget-function-button-text-color);
                                font-weight: 700;
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-function-button-hover-color);
                                    border: 1px solid var(--sp-widget-function-button-hover-border-color);

                                    p {
                                        color: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            .productModal {
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
                    height: auto;
                    max-height: 50%;
                    display: flex;
                    flex-direction: column;
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
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

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

                    }
                }

                .productsList {
                    margin-top: 20px;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    width: 100%;
                    padding: 0 4px;

                    &::-webkit-scrollbar {
                        width: 2px;
                    }

                    &::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--sp-widget-scroll-color);
                    }

                    .productItem {
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

                            &.placeholder {
                                svg {
                                    width: 32px;
                                    height: 32px;
                                    object-fit: cover;

                                    path {
                                        stroke: var(--sp-widget-active-color);
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
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'success-step': SuccessStep;
    }
}
