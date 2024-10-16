import { Invoice } from '@simplepay-ai/api-client';
//@ts-ignore
import QRCode from 'corcojs-qrcode';
import { PropertyValues } from 'lit';
import { css, html, LitElement, property, query } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import {getTokenStandart, roundUpAmount} from "../util.ts";

@customElement('payment-step')
export class PaymentStep extends LitElement {
    @property({ type: Object })
    invoice: Invoice | null = null;

    @property({ type: String })
    price: string = '';

    @property({ type: String })
    walletAddress: string = '';

    @property({ type: Boolean })
    cancelingInvoice: boolean = false;

    @property({ attribute: false })
    tokenStandart: string = '';

    @property({ attribute: false })
    formatAmount: string = '';

    @query('#qrcode')
    qrcode: any;

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        if (this.invoice && this.invoice?.to) {
            const qr = QRCode(0, 'H');
            qr.addData(this.invoice?.to);
            qr.make();

            this.qrcode.innerHTML = qr.createSvgTag();
        }
    }

    connectedCallback() {
        super.connectedCallback();

        //@ts-ignore
        this.formatAmount = roundUpAmount(this.invoice?.amount, this.invoice?.cryptocurrency.stable);
        this.tokenStandart = getTokenStandart(this.invoice?.network.symbol!);
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                    .title=${'Awaiting for Payment'}
                    .hasBackButton=${false}
                    .showAddress=${true}
                    .walletAddress=${this.invoice?.from}
                ></step-header>

                ${this.cancelingInvoice
                        ? html`
                          <div class="stepContent">
                              <div class="spinner">
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                  >
                                      <circle cx="12" cy="12" r="10" stroke-width="4" />
                                      <path
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                  </svg>

                                  <p>Canceling invoice ...</p>
                              </div>
                          </div>
                      `
                        : html`
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
                                                    ? html` <div class="badge">${this.tokenStandart}</div> `
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
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
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
                                                        <path d="M20 6 9 17l-5-5" />
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
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
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
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                    Copied
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                      `}

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
                    .buttonDisabled=${this.cancelingInvoice}
                    @footerCancelClick=${this.dispatchCancelInvoice}
                ></step-footer>
            </div>
        `;
    }

    private dispatchCancelInvoice(){
        const cancelInvoiceEvent = new CustomEvent('cancelInvoice', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelInvoiceEvent);
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
                    
                    .input{
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

                            @media(hover: hover) and (pointer: fine) {
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
