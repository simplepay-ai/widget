import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {Product} from "@simplepay-ai/api-client";
import {ICartProduct} from "../types.ts";

@customElement('cart-step')
export class CartStep extends LitElement {

    @property({type: Array})
    products: Product[] = [];

    @property({type: Array})
    cart: ICartProduct[] = [];

    @property({type: Boolean})
    creatingInvoice: boolean = false;

    @property({attribute: false, type: Number})
    cartSum: number = 0;

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('cart')) {

            let result = 0;
            if (this.cart.length > 0) {
                for (let cartProduct of this.cart) {
                    const product = this.products.find((item) => item.id === cartProduct.id);
                    if (product) {
                        const productSum = cartProduct.count * product.prices[0].price;
                        result += productSum;
                    }
                }
            }
            this.cartSum = result;

        }
    }

    render() {
        return html`
            <div class="stepWrapper">

                ${this.creatingInvoice
                        ? html`
                            <div class="stepContent loading">
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

                                    <p>Creating invoice ...</p>
                                </div>
                            </div>
                        `
                        : html`
                            <step-header
                                    .title= ${'Select cart products'}
                            ></step-header>

                            <div class="stepContent">

                                ${
                                        (this.products.length > 0)
                                                ? html`
                                                    ${
                                                            this.products.map((item: Product) => html`
                                                                <div class="productItem">

                                                                    <div class=${`imageWrapper`}>

                                                                        ${
                                                                                (item.image)
                                                                                        ? html`
                                                                                            <img src=${item.image} alt="product image">
                                                                                        `
                                                                                        : html`
                                                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                 width="800px"
                                                                                                 height="800px"
                                                                                                 viewBox="0 0 24 24" fill="none">
                                                                                                <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                                      stroke-width="1"
                                                                                                      stroke-linecap="round"/>
                                                                                                <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                                      stroke-width="1"
                                                                                                      stroke-linecap="round"/>
                                                                                            </svg>
                                                                                        `
                                                                        }

                                                                    </div>

                                                                    <div class="info">
                                                                        <p class="name">${item.name}</p>
                                                                        <p class="price">${item.prices[0].price}
                                                                            ${item.prices[0].currency.symbol}</p>
                                                                    </div>

                                                                    <div class="controls">

                                                                        ${
                                                                                (this.cart.find((product) => product.id === item.id))
                                                                                        ? html`
                                                                                            <div class="button"
                                                                                                 @click=${() => this.dispatchRemoveFromCart(item.id)}>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                                                                     width="24" height="24"
                                                                                                     viewBox="0 0 24 24" fill="none"
                                                                                                     stroke="currentColor"
                                                                                                     stroke-width="1.5"
                                                                                                     stroke-linecap="round"
                                                                                                     stroke-linejoin="round">
                                                                                                    <path d="M5 12h14"/>
                                                                                                </svg>
                                                                                            </div>
                                                                                        `
                                                                                        : ''
                                                                        }

                                                                        <div class="button"
                                                                             @click=${() => this.dispatchAddToCart(item.id)}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                                 height="24"
                                                                                 viewBox="0 0 24 24" fill="none"
                                                                                 stroke="currentColor"
                                                                                 stroke-width="1.5" stroke-linecap="round"
                                                                                 stroke-linejoin="round">
                                                                                <path d="M5 12h14"/>
                                                                                <path d="M12 5v14"/>
                                                                            </svg>
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                                ${
                                                                        (this.cart.find((product) => product.id === item.id))
                                                                                ? html`
                                                                                    <p class="cartText">In cart
                                                                                            x${this.cart.find((product) => product.id === item.id)?.count}</p>
                                                                                `
                                                                                : ''
                                                                }
                                                            `)
                                                    }
                                                `
                                                : html`
                                                    <div class="emptyMessage">

                                                        <div class="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                 viewBox="0 0 24 24"
                                                                 fill="none" stroke="currentColor" stroke-width="1.5"
                                                                 stroke-linecap="round"
                                                                 stroke-linejoin="round">
                                                                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/>
                                                                <path d="m7.5 4.27 9 5.15"/>
                                                                <polyline points="3.29 7 12 12 20.71 7"/>
                                                                <line x1="12" x2="12" y1="22" y2="12"/>
                                                                <path d="m17 13 5 5m-5 0 5-5"/>
                                                            </svg>
                                                        </div>

                                                        <p>You currently have no products created in this app</p>
                                                    </div>
                                                `
                                }

                            </div>

                            <div class="stepFooter">
                                <button
                                        class="secondaryButton"
                                        @click=${() => this.dispatchPrevStep()}
                                >
                                    Back
                                </button>
                                <button
                                        class="mainButton"
                                        @click=${this.dispatchNextStep}
                                        .disabled=${this.cart.length === 0}
                                >
                                    Create
                                </button>
                            </div>
                        `
                }
            </div>
        `;
    }

    private dispatchNextStep() {

        if (this.cartSum < 1) {
            const options = {
                detail: {
                    notificationData: {
                        title: 'Minimum Invoice Amount',
                        text: 'The minimum amount required to create an invoice is 1 USD. Please adjust the amount and try again.',
                        buttonText: 'Confirm'
                    },
                    notificationShow: true
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('updateNotification', options));
            return;
        }

        const nextStepEvent = new CustomEvent('nextStep', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(nextStepEvent);
    }

    private dispatchPrevStep() {
        const prevStepEvent = new CustomEvent('prevStep', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(prevStepEvent);
    }

    private dispatchAddToCart(productId: string) {
        const addToCartEvent = new CustomEvent('addToCart', {
            detail: {
                productId: productId
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(addToCartEvent);
    }

    private dispatchRemoveFromCart(productId: string) {
        const removeFromCartEvent = new CustomEvent('removeFromCart', {
            detail: {
                productId: productId
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(removeFromCartEvent);
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
                gap: 8px;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-scroll-color);
                }

                &.loading{
                    background: var(--sp-widget-bg-color);
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

                .emptyMessage {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    gap: 8px;

                    .icon {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        aspect-ratio: 1;
                        width: 75px;

                        svg {
                            width: 100%;
                            height: 100%;

                            & > * {
                                stroke: var(--sp-widget-active-color);
                            }
                        }
                    }

                    p {
                        width: 100%;
                        max-width: 250px;
                        color: var(--sp-widget-secondary-text-color);
                        font-size: 14px;
                        line-height: 20px;
                        text-align: center;
                    }
                }

                .productItem {
                    user-select: none;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid var(--sp-widget-function-button-border-color);
                    border-radius: 8px;
                    background: var(--sp-widget-function-button-color);
                    padding: 4px 8px;

                    .imageWrapper {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 1px solid var(--sp-widget-border-color);
                        background: var(--sp-widget-secondary-bg-color);
                        width: 40px;
                        min-width: 40px;
                        aspect-ratio: 1;
                        border-radius: 8px;
                        overflow: hidden;

                        img {
                            width: 40px;
                            height: 40px;
                            object-fit: cover;
                        }

                        svg {
                            width: 32px;
                            height: 32px;
                            object-fit: cover;

                            path {
                                stroke: var(--sp-widget-active-color);
                            }
                        }
                    }

                    .info {
                        flex: 1;
                        overflow: hidden;

                        .name {
                            color: var(--sp-widget-text-color);
                            font-size: 14px;
                            font-weight: 500;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }

                        .price {
                            margin-top: 2px;
                            font-size: 12px;
                            color: var(--sp-widget-secondary-text-color);
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }

                    .controls {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;

                        .button {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 28px;
                            min-width: 28px;
                            aspect-ratio: 1;
                            border-radius: 8px;
                            border: 1px solid transparent;
                            background: transparent;
                            cursor: pointer;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 150ms;

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    border: 1px solid var(--sp-widget-border-color);
                                    background: var(--sp-widget-secondary-bg-color);
                                }
                            }

                            svg {
                                width: 20px;
                                height: 20px;

                                & > * {
                                    stroke: var(--sp-widget-active-color);
                                }
                            }
                        }
                    }
                }

                .cartText {
                    padding-left: 16px;
                    margin-bottom: 6px;
                    margin-top: -5px;
                    font-size: 12px;
                    color: var(--sp-widget-secondary-text-color);
                }
            }

            .stepFooter {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-top: 1px solid var(--sp-widget-separator-color);
                padding: 8px;
                background: var(--sp-widget-bg-color);

                button {
                    flex: 1;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    line-height: 1.2;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    height: 40px;
                    padding: 16px 8px;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.mainButton {
                        color: var(--sp-widget-primary-button-text-color);
                        background: var(--sp-widget-primary-button-color);
                        border: 1px solid var(--sp-widget-primary-button-border-color);

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                color: var(--sp-widget-primary-button-hover-text-color);
                                background: var(--sp-widget-primary-button-hover-color);
                                border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                            }
                        }
                    }

                    &.secondaryButton {
                        color: var(--sp-widget-cancel-button-text-color);
                        background: var(--sp-widget-cancel-button-color);
                        border: 0;

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: var(--sp-widget-cancel-button-hover-color);
                                border: 0;
                            }
                        }
                    }

                    &:disabled {
                        pointer-events: none;
                        touch-action: none;
                        opacity: 0.5;
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
        'cart-step': CartStep;
    }
}
