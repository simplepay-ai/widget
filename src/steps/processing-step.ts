import {Invoice, Transaction} from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import {PropertyValues} from 'lit';
import {css, customElement, html, LitElement, property, query} from 'lit-element';
import {getTokenStandart, roundUpAmount} from "../util.ts";

@customElement('processing-step')
export class ProcessingStep extends LitElement {

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

    connectedCallback() {
        super.connectedCallback();

        if(this.transaction?.amount){
            this.amountToken = roundUpAmount(this.transaction.amount, this.transaction.cryptocurrency.stable).toString();

            const formatAmount = parseFloat(this.transaction.amount);
            const formatRate = parseFloat(this.transaction.rate);
            const calc = Number(formatAmount) * Number(formatRate);

            this.amountUSD = parseFloat(calc.toString()).toFixed(2);
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
                        .title= ${'Proсessing transaction'}
                        .hasBackButton=${this.hasReturnBack}
                        .hasShareButton=${true}
                        .sharedData=${{
                            title: 'New Invoice',
                            url: this.qrCodeUrl
                        }}
                ></step-header>

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

                <step-footer
                        .price=${this.amountUSD}
                        .hasExplorerButton=${true}
                        .explorerLink=${this.qrCodeUrl}
                        .productsInfo=${this.invoice?.products}
                ></step-footer>
            </div>
        `;
    }

    private getBlocksCount(networkSymbol: string) {
        switch (networkSymbol) {
            case 'ethereum':
                return 12;
            case 'bsc':
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
                    background: var(--sp-widget-scroll-color);
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
                                position: absolute;
                                width: 1px;
                                height: 58px;
                                left: 3.5px;

                                &:nth-child(1) {
                                    top: 0;
                                    background: var(--sp-widget-active-color);
                                }

                                &:nth-child(2) {
                                    height: 44px;
                                    bottom: 8px;
                                    background: var(--sp-widget-secondary-text-color);
                                }
                            }

                            .dot {
                                position: absolute;
                                width: 8px;
                                height: 8px;
                                border-radius: 50%;
                                background: var(--sp-widget-active-color);
                                left: 4px;

                                &:nth-child(3) {
                                    top: 0;
                                    transform: translateX(-50%);
                                }

                                &:nth-child(4) {
                                    top: 50%;
                                    transform: translate(-50%, -50%);
                                }

                                &:nth-child(5) {
                                    bottom: 0;
                                    transform: translateX(-50%);
                                }

                                &.notActive {
                                    background: var(--sp-widget-secondary-text-color);
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
                                }

                                &.notActive {
                                    .text,
                                    .title {
                                        color: var(--sp-widget-secondary-text-color);
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
                    margin: 16px 0;
                    height: 1px;
                    min-height: 1px;
                    width: 100%;
                    background: var(--sp-widget-separator-color);
                }

                .loaderWrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;

                    .title {
                        font-size: 16px;
                        line-height: 20px;
                        color: var(--sp-widget-text-color);
                        font-weight: 700;
                        text-align: left;
                    }

                    .text {
                        text-align: center;
                        color: var(--sp-widget-secondary-text-color);
                        font-weight: 500;
                        font-size: 11px;
                        margin-top: 6px;
                    }

                    .loader {
                        margin-top: 12px;
                        position: relative;
                        width: 100%;
                        height: 6px;
                        border: 1px solid var(--sp-widget-separator-color);
                        border-radius: 4px;

                        .progressLine {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 0;
                            max-width: 99%;
                            height: 100%;
                            background-color: var(--sp-widget-active-color);
                            border-radius: 4px;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 550ms;
                        }
                    }
                }

                .infoWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    color: var(--sp-widget-secondary-text-color);

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
                    }
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'processing-step': ProcessingStep;
    }
}
