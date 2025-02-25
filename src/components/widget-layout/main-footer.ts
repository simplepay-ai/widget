import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {Invoice, InvoiceProduct} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../../styles/widget-styles/main-footer.css?inline";
import {I18n} from "i18n-js";

@customElement('main-footer')
export class MainFooter extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({ type: Array })
    products: InvoiceProduct[] = [];

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: String})
    price: string = '';

    @property({type: Boolean})
    hasButton: boolean = false;

    @property({type: Boolean})
    hasCancelButton: boolean = false;

    @property({type: Boolean})
    hasExplorerButton: boolean = false;

    @property({type: String})
    explorerLink: string = '';

    @property({type: String})
    buttonText: string = '';

    @property({type: Boolean})
    buttonDisabled: boolean = false;

    @property({type: Boolean})
    hasTimer: boolean = false;

    @property({type: String})
    backButtonUrl: string = '';

    @property({type: Number})
    timerTimeStart: number = 0;

    @property({type: Number})
    timerTimeCurrent: number = 0;

    @property({attribute: false})
    timerTimeStartLocal: number = 0;

    @property({attribute: false})
    timerTimeCurrentLocal: number = 0;

    @property({attribute: false})
    progressStart: number = 252;

    @property({attribute: false})
    progressCurrent: number = 252;

    @property({ attribute: false })
    productInfoOpen: boolean = false;

    @property({ attribute: false })
    productInfoOverlayActive: boolean = false;

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
    }

    async connectedCallback() {
        super.connectedCallback();

        window.addEventListener('localeChanged', this._onLocaleChanged);

        if(this.hasTimer) {

            this.timerTimeStartLocal = this.timerTimeStart;
            this.timerTimeCurrentLocal = this.timerTimeCurrent;

            const oneStep: number = this.progressStart / this.timerTimeStartLocal;
            this.progressCurrent =
                this.progressStart -
                (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * oneStep;

            setInterval(() => this.calcTimer(oneStep), 1000);
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
            <div class=${`stepFooter`}>
                
                ${
                        this.hasCancelButton
                                ? html`
                                    <button
                                            class="secondaryButton"
                                            @click=${this.dispatchCancelInvoice}
                                            ?disabled=${this.buttonDisabled}
                                    >
                                        ${this.i18n?.t('buttons.cancelTransaction')}
                                    </button>
                                `
                                : ''
                }
                
                ${
                        !this.hasCancelButton && this.products.length === 0
                            ? html`
                                    <div class="product">
                                        <div class="image placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
                                                <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
                                            </svg>
                                        </div>

                                        <div class="price">
                                            <p>${this.i18n?.t('footer.total')}:</p>
                                            <p>${this.price ? `${ parseFloat(this.price).toFixed(2) } USD` : '0 USD'}</p>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${
                        !this.hasCancelButton && this.products.length > 0
                                ? html`
                                    <div class="product">
                                        <div class=${`image ${ ((this.products.length === 1 && this.products[0].count > 1) || this.products.length > 1) && 'placeholder' }`}>
                                            
                                            ${
                                                    (this.products.length === 1 && (this.products[0].count === 1 || !this.products[0].count) && this.products[0].product.image)
                                                        ? html`
                                                                <img
                                                                        src=${ this.products[0].product.image }
                                                                        alt="product image"
                                                                />
                                                            `
                                                            : html`
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
                                                                    <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
                                                                </svg>
                                                            `
                                            }
                                        </div>

                                        <div class="productsInfo"
                                             @click=${this.toggleProductInfo}
                                        >
                                            <div class="info">
                                                <div class="row">
                                                    <p>${this.i18n?.t('footer.productsCount')}:</p>
                                                    <p>${this.products.length}</p>
                                                </div>
                                                <div class="row">
                                                    <p>${this.i18n?.t('footer.total')}:</p>
                                                    <p>${parseFloat(this.price.toString()).toFixed(2)} USD</p>
                                                </div>
                                            </div>

                                            <div class="toggleButton">
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
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${this.hasButton
                        ? html`
                            <button
                                    class="mainButton"
                                    @click=${this.dispatchNextStep}
                                    ?disabled=${this.buttonDisabled}
                            >
                                ${this.buttonText}
                            </button>
                        `
                        : ''}
                ${this.hasExplorerButton
                        ? html`
                            <a href=${this.explorerLink} target="_blank">
                                <button class="mainButton withIcon">
                                    ${this.i18n?.t('footer.explorer')}
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
                                        <path
                                                d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
                                        />
                                        <path d="m21 3-9 9"/>
                                        <path d="M15 3h6v6"/>
                                    </svg>
                                </button>
                            </a>
                        `
                        : ''}
                ${this.hasTimer
                        ? html`
                            <div class="timerWrapper">
                                <div class="loader">
                                    <svg
                                            width="78"
                                            height="78"
                                            viewBox="-9.75 -9.75 97.5 97.5"
                                            version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style="transform:rotate(-90deg)"
                                    >
                                        <circle
                                                class="timerBg"
                                                r="40"
                                                cx="38"
                                                cy="38"
                                                fill="transparent"
                                                stroke-width="12"
                                                stroke-dasharray="252"
                                                stroke-dashoffset="0"
                                        ></circle>
                                        <circle
                                                class=${`
                            timerProgress
                            `}
                                                r="40"
                                                cx="38"
                                                cy="38"
                                                stroke-width="12"
                                                stroke-linecap="round"
                                                stroke-dashoffset=${this.progressCurrent}
                                                fill="transparent"
                                                stroke-dasharray="252px"
                                        ></circle>
                                    </svg>
                                </div>

                                <div class="info">
                                    <p class="title">${this.i18n?.t('footer.timer')}</p>
                                    <p
                                            id="timerTime"
                                            class=${`timerLeft
                        `}
                                    >
                                        ${new Date(this.timerTimeCurrentLocal * 1000)
                                                .toISOString()
                                                .slice(14, 19)}
                                    </p>
                                </div>
                            </div>
                        `
                        : ''}
            </div>

            ${
                    this.products.length > 0
                            ? html`
                                <div class="fullProductInfo ${ (this.productInfoOpen) ? 'show' : '' }">
                                    
                                    <div @click=${this.toggleProductInfo} class="overlay ${ (this.productInfoOverlayActive) ? 'active' : '' }"></div>

                                    <div class="contentWrapper">
                                        <div class="content">
                                            <div class="titleWrapper">
                                                <p class="infoTitle">${this.i18n?.t('modals.products.title')}</p>
                                                <div class="closeButton"
                                                     @click=${this.toggleProductInfo}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </div>
                                            </div>
                                            <div class="productsList">

                                                ${
                                                        this.products.map((item: InvoiceProduct) => html`
                                                    <div class="productItem">

                                                        <div class=${`imageWrapper ${ (!item.product.image) && 'placeholder' }`}>

                                                            ${
                                                                    (item.product.image)
                                                                            ? html`
                                                                                <img src=${item.product.image} alt="product image">
                                                            `
                                                                            : html`
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
                                                                    <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="var(--sp-widget-active-color)" stroke-width="1" stroke-linecap="round"/>
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
                                `
                            : ''
            }
        `;
    }

    private toggleProductInfo(){
        if(this.productInfoOpen){

            this.productInfoOverlayActive = !this.productInfoOverlayActive;

            setTimeout(() => {
                this.productInfoOpen = !this.productInfoOpen;
            }, 150)

        }else{
            this.productInfoOpen = !this.productInfoOpen;

            setTimeout(() => {
                this.productInfoOverlayActive = !this.productInfoOverlayActive;
            }, 150)
        }
    }

    private calcTimer(step: number) {
        if (this.timerTimeCurrentLocal !== 0) {
            this.timerTimeCurrentLocal -= 1;
            this.progressCurrent =
                this.progressStart - (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * step;
        }
    }

    private dispatchCancelInvoice(){
        const cancelEvent = new CustomEvent('footerCancelClick', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelEvent);
    }

    private dispatchNextStep() {
        const nextStepEvent = new CustomEvent('footerButtonClick', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(nextStepEvent);
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'main-footer': MainFooter;
    }
}
