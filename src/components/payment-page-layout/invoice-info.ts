import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/invoice-info.css?inline";
import {Invoice, InvoiceProduct, Transaction, UserProfile} from "@simplepay-ai/api-client";
//@ts-ignore
import logo from "../../assets/logo.jpg";
import {PaymentPageStep} from "../../lib/types.ts";

@customElement('invoice-info')
export class InvoiceInfo extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: String})
    currentStep: PaymentPageStep | '' = '';

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Object})
    user: any = null;

    @property({type: Object})
    userProfile: UserProfile | null = null;

    @property({type: Boolean})
    loginLoading: boolean = false;

    @property({type: Boolean})
    hasTransactions: boolean = false;

    @property({attribute: false, type: Boolean})
    hasActiveTransaction: boolean = false;

    ///////////////////////

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    @property({attribute: false, type: Number})
    leftAmount: number = 0;

    @property({attribute: false, type: String})
    private userName = '';

    ///////////////////////

    connectedCallback() {
        super.connectedCallback();

        const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!)
        this.leftAmount = (left < 0) ? 0 : left;

        if (this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0) {
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if (this.invoice?.products && this.invoice.products.length > 0) {
            this.invoiceProducts = this.invoice.products;
        }

        this.userName = this.getUserName();
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('invoice') && this.invoice) {
            const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!)
            this.leftAmount = (left < 0) ? 0 : left;
        }

        if (changedProperties.has('user') || changedProperties.has('userProfile')) {
            this.userName = this.getUserName();
        }
    }

    ///////////////////////

    private getUserName() {

        if (this.userProfile && this.userProfile.username) {
            return this.userProfile.username
        }

        if (this.user && this.user?.identity?.traits?.email) {
            return this.user?.identity?.traits?.email
        }

        if (this.user && !this.user?.identity?.traits?.email && this.user?.authentication_methods.length > 0 && this.user?.authentication_methods[0].provider === "telegram") {
            return 'Telegram Account';
        }

    }

    private dispatchLogin() {
        const loginEvent = new CustomEvent('login', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(loginEvent);
    }

    private dispatchStepChange(step: PaymentPageStep) {
        const changeStepEvent = new CustomEvent('goToStep', {
            detail: {
                stepName: step,
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(changeStepEvent);
    }

    private dispatchTransactionStep() {
        const changeTransactionStepEvent = new CustomEvent('goToTransactionStep', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(changeTransactionStepEvent);
    }

    goToTransactionStep

    render() {
        return html`
            <div class="invoiceInfoWrapper">

                <div class="merchantInfo">
                    <div class="topInfo">

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

                    ${
                            (this.invoice?.app?.description)
                                    ? html`
                                        <p class="description">${this.invoice?.app?.description}</p>
                                    `
                                    : ''
                    }
                </div>

                <div class="mainInfo">

                    <div>
                        <div class="infoRow">
                            <p class="infoTitle">
                                Status
                            </p>
                            <div class=${`infoValue ${this.invoice?.status}`}>
                                <div class="circle"></div>
                                ${this.invoice?.status}
                            </div>
                        </div>

                        <div class="infoRow">
                            <p class="infoTitle">
                                Created Date
                            </p>
                            <div class="infoValue">
                                ${`${new Date(this.invoice?.createdAt!).toDateString()} ${new Date(this.invoice?.createdAt!).toTimeString().split(':')[0]}:${new Date(this.invoice?.createdAt!).toTimeString().split(':')[1]}`}
                            </div>
                        </div>
                    </div>

                    ${
                            (this.invoice?.updatedAt !== this.invoice?.createdAt)
                                    ? html`
                                        <div class="infoRow">
                                            <p class="infoTitle">
                                                Last Update
                                            </p>
                                            <div class="infoValue">
                                                ${`${new Date().toDateString()} ${new Date(this.invoice?.updatedAt!).toTimeString().split(':')[0]}:${new Date(this.invoice?.updatedAt!).toTimeString().split(':')[1]}`}
                                            </div>
                                        </div>
                                    ` : ''
                    }

                    <div class="priceInfo">

                        <div class="totalWrapper">
                            <p>Total amount</p>
                            <p>$${this.invoice?.total}</p>
                        </div>

                        ${
                                (Number(this.invoice?.paid) > 0)
                                        ? html`
                                            <div class="leftWrapper">
                                                <p>Left</p>
                                                <p>$${parseFloat(this.leftAmount.toString()).toFixed(2)}</p>
                                            </div>
                                        ` : ''
                        }
                    </div>

                    <div class="productsInfo">

                        ${
                                this.invoiceProducts && this.invoiceProducts.length > 0 && this.invoiceProducts.map((item: InvoiceProduct) => {

                                    let totalPrice = 0;

                                    if (item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) {
                                        totalPrice = item.product.prices[0].price;

                                        if (item.count) {
                                            totalPrice = item.count * item.product.prices[0].price;
                                        }
                                    }

                                    return html`
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
                                                <p class="count">x${item.count || '---'}</p>
                                            </div>

                                            <div class="priceWrapper">
                                                <p class="total">
                                                        $${parseFloat(totalPrice.toString()).toFixed(2)} total
                                                </p>
                                                <p class="price">
                                                        $${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) ? item.product.prices[0].price : ''}
                                                    each
                                                </p>
                                            </div>

                                        </div>
                                    `
                                })
                        }

                    </div>

                </div>

                <div class="buttonsWrapper">

                    ${
                            (this.user)
                                    ? html`
                                        <div class="userInfo">
                                            <div class="icon">
                                                <img src=${(this.userProfile && this.userProfile.image) ? this.userProfile.image : logo}
                                                     alt="SimpleID Logo">
                                            </div>
                                            <p>${this.userName}</p>
                                        </div>
                                    `
                                    : html`
                                        <button class="secondaryButton loginButton"
                                                @click=${() => this.dispatchLogin()}
                                                .disabled=${this.loginLoading}
                                        >
                                            ${
                                                    (this.loginLoading)
                                                            ? html`
                                                                <div class="spinner">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                         viewBox="0 0 24 24">
                                                                        <circle cx="12" cy="12" r="10"
                                                                                stroke-width="4"/>
                                                                        <path
                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                            `
                                                            : html`
                                                                <img src=${logo} alt="logo image">
                                                                Login
                                                            `
                                            }
                                        </button>
                                    `
                    }

                    ${
                            (this.invoice?.status === 'active')
                                    ? html`

                                        ${
                                                (this.currentStep === 'transactionsHistoryStep')
                                                        ? html`
                                                            <button class="mainButton"
                                                                    @click=${() => {
                                                                        if(this.hasActiveTransaction){
                                                                            this.dispatchTransactionStep();
                                                                        }else{
                                                                            this.dispatchStepChange('invoiceStep')   
                                                                        }
                                                                    }}
                                                            >
                                                                ${(this.hasActiveTransaction) ? 'To Active Transaction' : 'Create Transaction'}
                                                            </button>
                                                        ` 
                                                        :
                                                        html`
                                                            <button class="mainButton"
                                                                    @click=${() => this.dispatchStepChange('transactionsHistoryStep')}
                                                            >
                                                                Transactions History
                                                            </button>
                                                        `
                                        }

                                    ` : ''
                    }

                </div>

            </div>
        `;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'invoice-info': InvoiceInfo;
    }
}
