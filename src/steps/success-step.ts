import { Invoice } from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import { PropertyValues } from 'lit';
import { css, customElement, html, LitElement, property, query } from 'lit-element';

@customElement('success-step')
export class SuccessStep extends LitElement {
    @property({ type: Object })
    invoice: Invoice | null = null;

    @property({ type: Boolean })
    dark: boolean = false;

    @property({ type: String })
    price: string = '';

    @property({ type: String })
    backToStoreUrl: string = '';

    @query('#qrcode')
    qrcode: any;

    @property({ attribute: false, type: String })
    qrCodeUrl: string = '';

    @property({ attribute: false })
    tokenStandart: string = '';

    @property({ attribute: false })
    formatAmount: string = '';

    connectedCallback() {
        super.connectedCallback();

        //@ts-ignore
        this.formatAmount = this.roundUp(this.invoice?.amount, this.invoice?.cryptocurrency.stable);
        this.tokenStandart = this.getTokenStandart(this.invoice?.network.symbol!);
    }

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        if (this.invoice) {
            const networkSymbol =
                this.invoice?.network.symbol === 'bsc' ? 'bnb' : this.invoice?.network.symbol;
            this.qrCodeUrl = `https://blockchair.com/${networkSymbol}/transaction/${this.invoice.txHash}?from=simplepay`;

            const qr = QRCode(0, 'H');
            qr.addData(this.qrCodeUrl);
            qr.make();

            this.qrcode.innerHTML = qr.createSvgTag();
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.dark ? 'dark' : ''}`}>
                <step-header
                    .dark=${this.dark}
                    .title=${`${this.invoice?.status} transaction`}
                    .hasBackButton=${false}
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
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                            </div>
                            <div class="infoWrapper">
                                <div class="infoItem">
                                    <p class="title">Invoice created</p>
                                    <p class="text">
                                        ${`${new Date(this.invoice?.createdAt!).toLocaleDateString()} ${new Date(this.invoice?.createdAt!).toLocaleTimeString()}`}
                                    </p>
                                </div>
                                <div class="infoItem">
                                    <p class="title">Processing</p>
                                    <p class="text capitalize">${this.invoice?.status}</p>
                                </div>

                                <div class="infoItem">
                                    <p class="title">
                                        ${this.invoice?.status.toString() === 'success'
                                            ? 'Payment success'
                                            : 'Payment failed'}
                                    </p>
                                    <p class="text">
                                        ${`${new Date(this.invoice?.updatedAt!).toLocaleDateString()} ${new Date(this.invoice?.updatedAt!).toLocaleTimeString()}`}
                                    </p>
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

                    <div class="infoWrapper">
                        <p class="title">Transaction details:</p>

                        <div class="infoItem">
                            <p class="title">Network:</p>
                            <div class="networkInfo">
                                <network-icon
                                    .id=${this.invoice?.network.symbol}
                                    width="16"
                                    height="16"
                                    class="icon"
                                ></network-icon>
                                <p>${this.invoice?.network.symbol}</p>
                            </div>
                        </div>
                        <div class="infoItem">
                            <p class="title">Token:</p>
                            <div class="tokenInfo">
                                <token-icon
                                    .id=${this.invoice?.cryptocurrency.symbol}
                                    width="16"
                                    height="16"
                                    class="icon"
                                ></token-icon>
                                <p>${this.invoice?.cryptocurrency.symbol}</p>
                                ${this.tokenStandart !== ''
                                    ? html` <div class="badge">${this.tokenStandart}</div> `
                                    : ''}
                            </div>
                        </div>
                        <div class="infoItem">
                            <p class="title">Amount:</p>
                            <p class="amountInfo">
                                ${this.formatAmount} ${this.invoice?.cryptocurrency.symbol}
                            </p>
                        </div>
                        <div class="infoItem">
                            <p class="title">From:</p>

                            <div class="hashInfo">
                                <p>
                                    ${this.invoice?.from.slice(0, 6)}
                                    ...${this.invoice?.from.slice(
                                        this.invoice?.from.length - 4,
                                        this.invoice?.from.length
                                    )}
                                </p>

                                <div class="separator">
                                    <div class="dot"></div>
                                </div>

                                <div
                                    class="copyButton"
                                    @click=${(event: CustomEvent) =>
                                        this.copyData(event, this.invoice?.from || '')}
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
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="infoItem">
                            <p class="title">To:</p>

                            <div class="hashInfo">
                                <p>
                                    ${this.invoice?.to.slice(0, 6)}
                                    ...${this.invoice?.to.slice(
                                        this.invoice?.to.length - 4,
                                        this.invoice?.to.length
                                    )}
                                </p>

                                <div class="separator">
                                    <div class="dot"></div>
                                </div>

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
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <step-footer
                    .dark=${this.dark}
                    .price=${this.price}
                    .hasBackButton=${true}
                    .backButtonUrl=${this.backToStoreUrl}
                ></step-footer>
            </div>
        `;
    }

    private roundUp(number: string, stable: boolean) {
        const factor = stable ? 1e2 : 1e6;
        return Math.ceil(Number(number) * factor) / factor;
    }

    private getTokenStandart(network: string) {
        switch (network) {
            case 'ethereum':
                return 'ERC20';
            case 'bsc':
                return 'BEP20';
            case 'tron':
                return 'TRC20';
            default:
                return '';
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

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-border);
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
                                background: var(--sp-accent);
                                height: 128px;
                            }

                            .dot {
                                position: absolute;
                                width: 8px;
                                height: 8px;
                                border-radius: 50%;
                                background: var(--sp-accent);

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
                                    color: var(--sp-primary-font);
                                }

                                .text {
                                    width: 100%;
                                    text-align: left;
                                    font-size: 12px;
                                    line-height: 1;
                                    color: var(--sp-accent);

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
                                    fill: var(--sp-secondary-background);
                                }

                                path {
                                    fill: var(--sp-primary-font);
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
                    width: 100%;
                    background: var(--sp-border);
                }

                .infoWrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    color: var(--sp-secondary-font);

                    & > .title {
                        font-size: 16px;
                        line-height: 20px;
                        color: var(--sp-primary-font);
                        font-weight: 700;
                        text-align: left;
                    }

                    .infoItem {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        height: 33px;

                        &.column {
                            align-items: flex-start;
                            flex-direction: column;
                            justify-content: unset;
                            gap: 4px;
                        }

                        .title {
                            font-size: 13px;
                            line-height: 20px;
                            font-weight: 700;
                        }

                        .networkInfo {
                            display: flex;
                            align-items: center;
                            gap: 4px;

                            .icon {
                                position: relative;
                                background: var(--sp-primary-background);
                                border: 1px solid var(--sp-border);
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
                                    stroke: var(--sp-accent);
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-primary-font);
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
                                background: var(--sp-primary-background);
                                border: 1px solid var(--sp-border);
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
                                    stroke: var(--sp-accent);
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-primary-font);
                                font-weight: 700;
                            }

                            .badge {
                                color: var(--sp-secondary-font);
                                font-weight: 700;
                                padding: 2px 4px;
                                background: var(--sp-primary-background);
                                border: 1px solid var(--sp-border);
                                font-size: 10px;
                                border-radius: 4px;
                            }
                        }

                        .amountInfo {
                            font-size: 12px;
                            line-height: 20px;
                            color: var(--sp-primary-font);
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
                                    background: var(--sp-secondary-font);
                                    border-radius: 50%;
                                }
                            }

                            .copyButton {
                                padding: 5px;
                                border: 1px solid var(--sp-border);
                                border-radius: 6px;
                                color: var(--sp-primary-font);
                                background: var(--sp-primary-background);
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
                                    color: var(--sp-accent);

                                    svg {
                                        rect,
                                        path {
                                            stroke: var(--sp-accent);
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
                                color: var(--sp-accent);
                                transition-property: color, background-color, border-color,
                                    text-decoration-color, fill, stroke;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;

                                svg {
                                    width: 12px;
                                    height: 12px;
                                }

                                &:hover,
                                &:active {
                                    color: color-mix(in srgb, var(--sp-accent) 90%, transparent);
                                }
                            }

                            p {
                                font-size: 12px;
                                line-height: 20px;
                                color: var(--sp-primary-font);
                                font-weight: 700;
                            }
                        }
                    }
                }
            }

            &.dark {
                .badge {
                    color: var(--sp-primary-background) !important;
                    background: var(--sp-primary-font) !important;
                }

                .copyButton {
                    color: var(--sp-primary-background) !important;
                    background: var(--sp-primary-font) !important;

                    &.active {
                        color: var(--sp-accent) !important;
                    }
                }

                .qrcode {
                    rect {
                        fill: var(--sp-primary-background) !important;
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
