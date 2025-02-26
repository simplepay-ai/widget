import {css, customElement, html, LitElement, property} from "lit-element";
import {Invoice, InvoiceProduct} from "@simplepay-ai/api-client";
import {I18n} from "i18n-js";

@customElement('created-invoice-step')
export class CreatedInvoiceStep extends LitElement {

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: String})
    merchantLogoUrl: string = '';

    @property({type: Object})
    invoice: Invoice | null = null;

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

        if (this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0) {
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if (this.invoice?.products && this.invoice.products.length > 0) {
            this.invoiceProducts = this.invoice.products;
        }
    }

    render() {
        return html`
            <div class="stepWrapper">

                <div class="successMessage">

                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                        <path stroke-width="2" d="m9 11 3 3L22 4"/>
                    </svg>

                    <p>${this.i18n?.t('createdInvoiceStep.titleFirst')}<br/>${this.i18n?.t('createdInvoiceStep.titleSecond')}</p>

                </div>

                <div class="invoiceInfo">

                    <p class="title">${this.i18n?.t('createdInvoiceStep.detailsTitle')}:</p>

                    <div class="infoItem">
                        <p class="title">${this.i18n?.t('createdInvoiceStep.fields.id')}:</p>

                        <div class="copyLine"
                             @click=${(event: CustomEvent) =>
                                     this.copyData(event, this.invoice?.id || '')}
                        >
                            <p>
                                ${this.invoice?.id.slice(0, 6)}
                                    ...${this.invoice?.id.slice(
                                        this.invoice?.id.length - 4,
                                        this.invoice?.id.length
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
                        <p class="title">${this.i18n?.t('createdInvoiceStep.fields.merchant')}:</p>
                        <div class="merchantInfo">
                            ${
                                    (this.invoice?.app?.image || this.merchantLogoUrl)
                                            ? html`
                                                <div class="image">
                                                    <img src=${this.merchantLogoUrl || this.invoice?.app?.image}
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
                        <p class="title">${this.i18n?.t('createdInvoiceStep.fields.amount')}:</p>
                        <p class="amountInfo">
                            ${(this.invoice?.total) ? this.invoice.total : 0}
                            ${this.invoice?.currency.symbol}
                        </p>
                    </div>
                    ${
                            (this.invoiceProducts.length === 1 && (this.invoiceProducts[0].count === 1 || !this.invoiceProducts[0].count))
                                    ? html`
                                        <div class="infoItem">
                                            <p class="title">${this.i18n?.t('createdInvoiceStep.fields.product')}:</p>
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
                                                                                  stroke="var(--sp-widget-active-color)"
                                                                                  stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="var(--sp-widget-active-color)"
                                                                                  stroke-width="1"
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
                                            <p class="title">${this.i18n?.t('createdInvoiceStep.fields.products')}:</p>
                                            <div class="productButton" @click=${() => this.openProductModal()}>
                                                <p class="name">${this.i18n?.t('createdInvoiceStep.fields.productsCount')}: ${this.invoiceProducts.length}</p>
                                            </div>
                                        </div>
                                    `
                                    : ''
                    }
                </div>

                <div class="buttonWrapper">
                    <button
                            class="mainButton"
                            @click=${this.dispatchPrevStep}
                    >
                        ${this.i18n?.t('buttons.createInvoice')}
                    </button>
                </div>

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
                                                                                  stroke="var(--sp-widget-active-color)"
                                                                                  stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="var(--sp-widget-active-color)"
                                                                                  stroke-width="1"
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
                                                    <p class="price">
                                                        ${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) ? item.product.prices[0].price : ''}
                                                        ${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].currency.symbol) ? item.product.prices[0].currency.symbol : ''}</p>
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

    private dispatchPrevStep() {
        const prevStepEvent = new CustomEvent('prevStep', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(prevStepEvent);
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
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 14px;
            font-weight: 450;
            background: transparent;
            margin: 0;
            padding: 0;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        .stepWrapper {
            height: 100%;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            gap: 32px;

            .successMessage {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                flex: 1;
                overflow-y: auto;

                svg {
                    color: var(--sp-widget-active-color);
                    width: 50px;
                    height: 50px;
                }

                p {
                    text-align: center;
                    margin-top: 8px;
                    font-size: 24px;
                    line-height: 32px;
                    font-weight: 700;
                    color: #333333; /* Fallback */
                    color: var(--sp-widget-text-color);
                    text-transform: capitalize;
                }
            }

            .invoiceInfo {
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                gap: 8px;
                padding: 0 16px;

                .title {
                    font-size: 16px;
                    line-height: 20px;
                    color: #333;
                    color: var(--sp-widget-text-color);
                    font-weight: 700;
                    text-align: left;
                    margin-bottom: 10px;
                }

                .infoItem {
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 4px;
                    height: auto;

                    .title {
                        flex: 1;
                        text-align: left;
                        font-size: 12px;
                        line-height: 1;
                        color: #666666; /* Fallback */
                        color: var(--sp-widget-secondary-text-color);
                        margin: 0;
                    }

                    .text {
                        width: 100%;
                        text-align: left;
                        font-size: 12px;
                        line-height: 1;
                        color: #007bff; /* Fallback */
                        color: var(--sp-widget-active-color);

                        &.capitalize {
                            text-transform: capitalize;
                        }
                    }

                    .merchantInfo {
                        -webkit-box-flex: 1;
                        -ms-flex: 1;
                        flex: 1;
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-align: center;
                        -ms-flex-align: center;
                        align-items: center;
                        -webkit-box-pack: end;
                        -ms-flex-pack: end;
                        justify-content: end;
                        gap: 4px;
                        overflow: hidden;

                        .image {
                            width: 20px;
                            min-width: 20px;
                            height: 20px;
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            justify-content: center;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;
                            overflow: hidden;
                            border: 1px solid #cccccc; /* Fallback */
                            border: 1px solid var(--sp-widget-border-color);
                            background: #ffffff; /* Fallback */
                            background: var(--sp-widget-bg-color);
                            border-radius: 50%;

                            img {
                                width: 20px;
                                height: 20px;
                                -o-object-fit: cover;
                                object-fit: cover;
                            }

                            &.placeholder svg {
                                width: 10px;
                                height: 10px;
                                -o-object-fit: cover;
                                object-fit: cover;
                                color: #007bff; /* Fallback */
                                color: var(--sp-widget-active-color);
                            }
                        }

                        p {
                            font-size: 12px;
                            line-height: 20px;
                            color: #333333; /* Fallback */
                            color: var(--sp-widget-text-color);
                            font-weight: 700;
                            -webkit-line-clamp: 1;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }
                    }

                    .amountInfo {
                        font-size: 12px;
                        line-height: 20px;
                        color: #333333; /* Fallback */
                        color: var(--sp-widget-text-color);
                        font-weight: 700;
                    }

                    .copyLine {
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-align: center;
                        -ms-flex-align: center;
                        align-items: center;
                        gap: 4px;
                        cursor: pointer;
                        -webkit-transition-property: all;
                        transition-property: all;
                        -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        -webkit-transition-duration: 150ms;
                        transition-duration: 150ms;

                        p {
                            font-size: 12px;
                            line-height: 20px;
                            color: #333333; /* Fallback */
                            color: var(--sp-widget-text-color);
                            font-weight: 700;
                            -webkit-transition-property: all;
                            transition-property: all;
                            -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            -webkit-transition-duration: 150ms;
                            transition-duration: 150ms;
                        }

                        svg {
                            width: 16px;
                            height: 16px;
                            color: #007bff; /* Fallback */
                            color: var(--sp-widget-active-color);
                            -webkit-transition-property: all;
                            transition-property: all;
                            -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            -webkit-transition-duration: 150ms;
                            transition-duration: 150ms;
                        }

                        .activeIcon,
                        .defaultIcon {
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            justify-content: center;
                        }

                        .defaultIcon {
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                        }

                        .activeIcon {
                            display: none;
                        }

                        &.active {
                            color: #007bff; /* Fallback */
                            color: var(--sp-widget-active-color);

                            p {
                                color: #007bff; /* Fallback */
                                color: var(--sp-widget-active-color);
                            }

                            svg {
                                rect, path {
                                    stroke: #007bff; /* Fallback */
                                    stroke: var(--sp-widget-active-color);
                                }
                            }

                            .defaultIcon {
                                display: none;
                            }

                            .activeIcon {
                                display: -webkit-box;
                                display: -ms-flexbox;
                                display: flex;
                            }

                        }
                    }

                    .productInfo {
                        -webkit-box-flex: 1;
                        -ms-flex: 1;
                        flex: 1;
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-align: center;
                        -ms-flex-align: center;
                        align-items: center;
                        -webkit-box-pack: end;
                        -ms-flex-pack: end;
                        justify-content: end;
                        gap: 4px;
                        overflow: hidden;

                        .image {
                            width: 20px;
                            min-width: 20px;
                            height: 20px;
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            justify-content: center;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;
                            overflow: hidden;
                            border: 1px solid #cccccc; /* Fallback */
                            border: 1px solid var(--sp-widget-border-color);
                            background: #ffffff; /* Fallback */
                            background: var(--sp-widget-bg-color);
                            border-radius: 50%;

                            img {
                                width: 20px;
                                height: 20px;
                                -o-object-fit: cover;
                                object-fit: cover;
                            }
                            
                            &.placeholder svg {
                                width: 13px;
                                height: 13px;
                                -o-object-fit: cover;
                                object-fit: cover;
                                color: #007bff; /* Fallback */
                                color: var(--sp-widget-active-color);
                            }
                        }

                        p {
                            font-size: 12px;
                            line-height: 20px;
                            color: #333333; /* Fallback */
                            color: var(--sp-widget-text-color);
                            font-weight: 700;
                            -webkit-line-clamp: 1;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                        }
                    }

                    .productButton {
                        background-color: #f8f9fa; /* Fallback */
                        background-color: var(--sp-widget-function-button-color);
                        border: 1px solid #cccccc; /* Fallback */
                        border: 1px solid var(--sp-widget-function-button-border-color);
                        padding: 2px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        -webkit-transition-property: all;
                        transition-property: all;
                        -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        -webkit-transition-duration: 150ms;
                        transition-duration: 150ms;

                        p {
                            font-size: 12px;
                            line-height: 20px;
                            color: #333333; /* Fallback */
                            color: var(--sp-widget-function-button-text-color);
                            font-weight: 700;
                            -webkit-transition-property: all;
                            transition-property: all;
                            -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            -webkit-transition-duration: 150ms;
                            transition-duration: 150ms;
                        }

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: #e9ecef; /* Fallback */
                                background: var(--sp-widget-function-button-hover-color);
                                border: 1px solid #b3b3b3; /* Fallback */
                                border: 1px solid var(--sp-widget-function-button-hover-border-color);

                                p {
                                    color: #1a1a1a; /* Fallback */
                                    color: var(--sp-widget-function-button-hover-text-color);
                                }
                            }
                        }
                    }

                }

            }

            .buttonWrapper {
                width: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: center;
                align-items: center;
                border-top: 1px solid #e5e5e5; /* Fallback */
                border-top: 1px solid var(--sp-widget-separator-color);
                padding: 8px 16px;
                background: #ffffff; /* Fallback */
                background: var(--sp-widget-bg-color);
                z-index: 10;
                position: relative;

                .mainButton {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-align: center;
                    -ms-flex-align: center;
                    align-items: center;
                    -webkit-box-pack: center;
                    -ms-flex-pack: center;
                    justify-content: center;
                    font-size: 14px;
                    line-height: 20px;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    width: 100%;
                    height: 40px;
                    padding: 16px 8px;
                    color: #ffffff; /* Fallback */
                    color: var(--sp-widget-primary-button-text-color);
                    background: #007bff; /* Fallback */
                    background: var(--sp-widget-primary-button-color);
                    border: 1px solid #0056b3; /* Fallback */
                    border: 1px solid var(--sp-widget-primary-button-border-color);
                    -webkit-transition-property: all;
                    transition-property: all;
                    -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-transition-duration: 150ms;
                    transition-duration: 150ms;
                }

                @media (hover: hover) and (pointer: fine) {
                    .mainButton:hover {
                        color: #ffffff; /* Fallback */
                        color: var(--sp-widget-primary-button-hover-text-color);
                        background: #0056b3; /* Fallback */
                        background: var(--sp-widget-primary-button-hover-color);
                        border: 1px solid #004080; /* Fallback */
                        border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                    }
                }
            }

            .productModal {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: end;
                -ms-flex-align: end;
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
                    background: rgba(0, 0, 0, 0) !important;
                    -webkit-transition-property: all;
                    transition-property: all;
                    -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-transition-duration: 150ms;
                    transition-duration: 150ms;
                    
                    &.show {
                        background: rgba(0, 0, 0, 0.75) !important;
                    }
                }

                .contentWrapper {
                    width: 100%;
                    background: #ffffff; /* Fallback */
                    background: var(--sp-widget-bg-color);
                    z-index: 11;
                    border-radius: 12px 12px 0 0;
                    overflow: hidden;
                    height: auto;
                    max-height: 50%;
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -ms-flex-direction: column;
                    flex-direction: column;
                    -webkit-transform: translateY(100%);
                    transform: translateY(100%);
                    -webkit-transition-property: all;
                    transition-property: all;
                    -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-transition-duration: 150ms;
                    transition-duration: 150ms;
                    
                    &.show {
                        -webkit-transform: translateY(0);
                        transform: translateY(0);
                    }

                    .content {
                        padding: 1rem;
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-orient: vertical;
                        -webkit-box-direction: normal;
                        -ms-flex-direction: column;
                        flex-direction: column;
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

                        .titleWrapper {
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                            -webkit-box-pack: justify;
                            -ms-flex-pack: justify;
                            justify-content: space-between;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;

                            p {
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: #333333; /* Fallback */
                                color: var(--sp-widget-text-color);
                            }
                        }

                        .closeButton {
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            justify-content: center;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;
                            cursor: pointer;
                            -webkit-user-select: none;
                            -moz-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                            -webkit-transition-property: all;
                            transition-property: all;
                            -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            -webkit-transition-duration: 350ms;
                            transition-duration: 350ms;
                            width: 25px;
                            height: 25px;
                            background: #f8f9fa; /* Fallback */
                            background: var(--sp-widget-function-button-color);
                            border-radius: 6px;

                            svg {
                                width: 20px;
                                height: 20px;
                                color: #333333; /* Fallback */
                                color: var(--sp-widget-function-button-text-color);
                                -webkit-transition-property: all;
                                transition-property: all;
                                -webkit-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                -webkit-transition-duration: 350ms;
                                transition-duration: 350ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: #e9ecef; /* Fallback */
                                    background: var(--sp-widget-function-button-hover-color);
                                }

                                &:hover svg {
                                    color: #1a1a1a; /* Fallback */
                                    color: var(--sp-widget-function-button-hover-text-color);
                                }
                            }
                        }
                    }
                }

                .productsList {
                    margin-top: 20px;
                    -webkit-box-flex: 1;
                    -ms-flex: 1;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: normal;
                    -ms-flex-direction: column;
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
                        background: #888888; /* Fallback */
                        background: var(--sp-widget-scroll-color);
                    }

                    .productItem {
                        display: -webkit-box;
                        display: -ms-flexbox;
                        display: flex;
                        -webkit-box-align: start;
                        -ms-flex-align: start;
                        align-items: flex-start;
                        gap: 12px;
                        margin: 0 auto;
                        width: 95%;

                        .imageWrapper {
                            display: -webkit-box;
                            display: -ms-flexbox;
                            display: flex;
                            -webkit-box-pack: center;
                            -ms-flex-pack: center;
                            justify-content: center;
                            -webkit-box-align: center;
                            -ms-flex-align: center;
                            align-items: center;
                            border: 1px solid #cccccc; /* Fallback */
                            border: 1px solid var(--sp-widget-border-color);
                            background: #f8f9fa; /* Fallback */
                            background: var(--sp-widget-secondary-bg-color);
                            width: 40px;
                            height: 40px;
                            border-radius: 8px;
                            overflow: hidden;

                            img {
                                width: 40px;
                                height: 40px;
                                -o-object-fit: cover;
                                object-fit: cover;
                            }
                            
                            &.placeholder svg {
                                width: 32px;
                                height: 32px;
                                -o-object-fit: cover;
                                object-fit: cover;

                                path {
                                    stroke: #007bff; /* Fallback */
                                    stroke: var(--sp-widget-active-color);
                                }
                            }
                        }

                        .info {
                            -webkit-box-flex: 1;
                            -ms-flex: 1;
                            flex: 1;

                            .name {
                                color: #333333; /* Fallback */
                                color: var(--sp-widget-text-color);
                                font-size: 14px;
                                font-weight: 500;
                                min-height: 14px;
                            }

                            .description {
                                font-size: 12px;
                                color: #666666; /* Fallback */
                                color: var(--sp-widget-secondary-text-color);
                                min-height: 14px;
                            }
                        }

                        .priceWrapper {
                            .price {
                                color: #333333; /* Fallback */
                                color: var(--sp-widget-text-color);
                                font-size: 14px;
                                font-weight: 500;
                                text-align: end;
                                min-height: 14px;
                            }

                            .count {
                                font-size: 12px;
                                color: #666666; /* Fallback */
                                color: var(--sp-widget-secondary-text-color);
                                text-align: end;
                                min-height: 14px;
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
        'created-invoice-step': CreatedInvoiceStep;
    }
}