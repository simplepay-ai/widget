import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {Invoice} from "@simplepay-ai/api-client";

@customElement('success-footer')
export class SuccessFooter extends LitElement {

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: String})
    backButtonUrl: string = '';

    @property({attribute: false, type: String})
    leftPaid: string = '';

    async connectedCallback() {
        super.connectedCallback();

        if (this.invoice) {
            const leftNumber = Number(this.invoice.total) - Number(this.invoice.paid);
            this.leftPaid = parseFloat(leftNumber.toString()).toFixed(2);
        }
    }

    render() {
        return html`
            <div class=${`stepFooter`}>
                
                ${
                        (this.invoice?.status === 'active')
                        ? html`
                                    <div class="product">
                                        <div class="image placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                                <line x1="12" x2="12" y1="2" y2="22"/>
                                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                            </svg>
                                        </div>

                                        <div class="price">
                                            <p>Left to pay:</p>
                                            <p>${this.leftPaid ? `${this.leftPaid} USD` : '0 USD'}</p>
                                        </div>
                                    </div>

                                    <button class="mainButton" @click=${() => this.dispatchReturnBack()}>
                                        Make payment
                                    </button>
                                `
                                : html`
                                    <button class="mainButton full" @click=${() => {
                                        window.location.replace(this.backButtonUrl || location.href);
                                    }}>
                                        Back to Store
                                    </button>

                                `
                }

            </div>
        `;
    }

    private dispatchReturnBack() {
        const options = {
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('returnBack', options));
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

        .stepFooter {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-top: 1px solid var(--sp-widget-separator-color);
            padding: 8px;
            background: var(--sp-widget-bg-color);
            z-index: 10;
            position: relative;

            .product {
                display: flex;
                gap: 7px;
                z-index: 2;
                position: relative;

                .image {
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
                            width: 28px;
                            height: 28px;
                            object-fit: cover;
                            
                            & > *{
                                stroke: var(--sp-widget-text-color);
                            }
                        }
                    }
                }

                .price {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: left;

                    p {
                        white-space: nowrap;
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                    }
                }
            }

            a:has(.mainButton),
            a:has(.secondaryButton) {
                text-decoration: none;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 175px;
            }

            .mainButton {
                z-index: 2;
                position: relative;
                max-width: 175px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                line-height: 20px;
                font-weight: 500;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                height: 40px;
                padding: 16px 8px;
                color: var(--sp-widget-primary-button-text-color);
                background: var(--sp-widget-primary-button-color);
                border: 1px solid var(--sp-widget-primary-button-border-color);
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;
                
                &.full{
                    max-width: unset;
                }

                @media (hover: hover) and (pointer: fine) {
                    &:hover {
                        color: var(--sp-widget-primary-button-hover-text-color);
                        background: var(--sp-widget-primary-button-hover-color);
                        border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                    }
                }

                &:disabled {
                    pointer-events: none;
                    touch-action: none;
                    opacity: 0.5;
                }

                &.withIcon {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    svg {
                        width: 15px;
                        height: 15px;
                    }
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'success-footer': SuccessFooter;
    }
}
