import {Invoice, InvoiceProduct, Transaction} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {customElement, html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {getTokenStandart, roundUpAmount} from "../../../lib/util.ts";
//@ts-ignore
import style from "../../../styles/processing-step.css?inline";

@customElement('processing-step')
export class ProcessingStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Object})
    transaction: Transaction | null = null;

    @property({type: Boolean})
    hasReturnBack: boolean = true;

    @query('#qrcode')
    qrcode: any;

    @property({attribute: false})
    progressMaxNumber: number = 0;

    @property({attribute: false})
    progressNumber: number = 1;

    @property({attribute: false})
    timeForBlock: number = 1;

    @property({attribute: false})
    progressPercent: number = 0;

    @property({attribute: false})
    tokenStandart: string = '';

    @property({attribute: false, type: String})
    qrCodeUrl: string = '';

    @property({attribute: false})
    amountToken: string = '';

    @property({attribute: false})
    amountUSD: string = '';

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    connectedCallback() {
        super.connectedCallback();

        if(this.transaction?.amount){
            this.amountToken = roundUpAmount(this.transaction.amount, this.transaction.cryptocurrency.stable).toString();

            const formatAmount = parseFloat(this.transaction.amount);
            const formatRate = parseFloat(this.transaction.rate);
            const calc = Number(formatAmount) * Number(formatRate);

            this.amountUSD = parseFloat(calc.toString()).toFixed(2);
        }

        if(this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0){
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if(this.invoice?.products && this.invoice.products.length > 0){
            this.invoiceProducts = this.invoice.products;
        }

        this.progressMaxNumber = this.getBlocksCount(this.transaction?.network.symbol!);
        this.timeForBlock = this.getTimeForBlock(this.transaction?.network.symbol!);
        this.tokenStandart = getTokenStandart(this.transaction?.network.symbol!);
        this.progressPercent = Math.round((100 * this.progressNumber) / this.progressMaxNumber);

        setInterval(() => this.calcProgress(), this.timeForBlock);
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

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <main-header
                        .title= ${'Proсessing transaction'}
                        .hasBackButton=${this.hasReturnBack}
                        .hasShareButton=${true}
                        .sharedData=${{
                            title: 'New Invoice',
                            url: this.qrCodeUrl
                        }}
                ></main-header>

                <div class="stepContent">
                    <div class="topInfo">
                        <div class="leftSection">
                            <div class="linesWrapper">
                                <div class="line"></div>
                                <div class="line"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot notActive"></div>
                            </div>
                            <div class="infoWrapper">
                                <div class="infoItem">
                                    <p class="title">Invoice created</p>
                                    <p class="text">
                                        ${`${new Date(this.transaction?.createdAt!).toLocaleDateString()} ${new Date(this.transaction?.createdAt!).toLocaleTimeString()}`}
                                    </p>
                                </div>
                                <div class="infoItem">
                                    <p class="title">Payment in progress</p>
                                    <p class="text">
                                        ${this.progressNumber} / ${this.progressMaxNumber}
                                    </p>
                                </div>
                                <div class="infoItem notActive">
                                    <p class="title">Payment complete</p>
                                    <p class="text">Awaiting</p>
                                </div>
                            </div>
                        </div>
                        <div class="rightSection">
                            <div id="qrcode" class="qrcode"></div>

                            <div class="icon">
                                <img
                                        src="https://loutre.blockchair.io/assets/kit/blockchair.cube.svg"
                                        alt="blockchair icon"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="separator"></div>

                    <div class="loaderWrapper">
                        <p class="title">Time to estimate:</p>

                        <div class="loader">
                            <div
                                    class="progressLine"
                                    style=${`width: ${this.progressPercent}%`}
                            ></div>
                        </div>

                        <p class="text">~${this.progressPercent}% Completed</p>
                    </div>

                    <div class="separator"></div>

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
                            <p class="title">Amount:</p>
                            <p class="amountInfo">
                                ${this.amountToken} ${this.transaction?.cryptocurrency.symbol}
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
                </div>

                <main-footer
                        .price=${this.amountUSD}
                        .hasExplorerButton=${true}
                        .explorerLink=${this.qrCodeUrl}
                        .productsInfo=${this.invoiceProducts}
                ></main-footer>
            </div>
        `;
    }

    private getBlocksCount(networkSymbol: string) {
        switch (networkSymbol) {
            case 'ethereum':
                return 12;
            case 'bsc':
            case 'polygon':
            case 'avalanche':
            case 'zksync':
            case 'arbitrum':
            case 'optimism':
            case 'base':
                return 27;
            case 'tron':
                return 24;
            case 'bitcoin':
                return 2;
            case 'litecoin':
                return 2;
            default:
                return 0;
        }
    }

    private getTimeForBlock(networkSymbol: string) {
        switch (networkSymbol) {
            case 'ethereum':
                return 10000;
            case 'bsc':
            case 'polygon':
            case 'avalanche':
            case 'zksync':
            case 'arbitrum':
            case 'optimism':
            case 'base':
                return 3000;
            case 'tron':
                return 3000;
            case 'bitcoin':
                return 1500000;
            case 'litecoin':
                return 900000;
            default:
                return 0;
        }
    }

    private calcProgress() {
        if (this.progressNumber + 1 !== this.progressMaxNumber) {
            this.progressNumber += 1;
            this.progressPercent = Math.round((100 * this.progressNumber) / this.progressMaxNumber);
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
}

declare global {
    interface HTMLElementTagNameMap {
        'processing-step': ProcessingStep;
    }
}
