import {
    Client,
    Cryptocurrency,
    HttpError,
    Invoice, InvoiceCreateErrors,
    InvoiceStatus,
    ValidationError,
    WsClient
} from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import {AppStep, AppTheme, INotification, IProduct, IProductInvoice, WalletType} from './types';
import './steps/step-header.ts';
import './steps/step-footer.ts';
import './steps/loading-step.ts';
import './steps/error-step.ts';
import './steps/payment-step.ts';
import './steps/price-step.ts';
import './steps/wallet-step.ts';
import './steps/token-step.ts';
import './steps/payment-step.ts';
import './steps/success-step.ts';
import './steps/processing-step.ts';
import './steps/token-icon.ts';
import './steps/network-icon.ts';
import './steps/custom-notification.ts';
import {checkWalletAddress} from "./util.ts";
import themesConfig from '../themesConfig.json';

@customElement('payment-app')
export class PaymentApp extends LitElement {
    @property({
        converter: (attrValue: string | null) => {
            if (attrValue && parseFloat(attrValue) && parseFloat(attrValue) > 0)
                return parseFloat(attrValue).toFixed(2);
            else return undefined;
        },
        type: String
    })
    price: string = '0';

    @property({ type: Array })
    products: IProductInvoice[] = [];

    @property({ type: String })
    clientId: string = '';

    @property({ type: String })
    theme: AppTheme = 'light';

    @property({ type: String })
    backToStoreUrl: string = '';

    @property({ type: String })
    appId: string = '';

    @property({ type: String })
    invoiceId: string = '';

    @property({ attribute: false })
    private priceAvailable: boolean = false;

    @property({ attribute: false })
    private appStep: AppStep = 'loading';

    @property({ attribute: false })
    private tokens: Cryptocurrency[] | undefined = [];

    @property({ attribute: false })
    private walletAddress: string = '';

    @property({ attribute: false })
    private errorTitle: string = '';

    @property({ attribute: false })
    private errorText: string = '';

    @property({ attribute: false })
    private API: any = null;

    @property({ attribute: false })
    private selectedTokenSymbol: string = '';

    @property({ attribute: false })
    private selectedNetworkSymbol: string = '';

    @property({ attribute: false })
    private invoice: Invoice | null = null;

    @property({ attribute: false })
    private notificationShow: boolean = false;

    @property({ attribute: false })
    private notificationData: INotification | null = null;

    @property({ attribute: false })
    private creatingInvoice: Boolean = false;

    @property({ attribute: false })
    private cancelingInvoice: Boolean = false;

    @property({ attribute: false })
    private connectorPaymentAwaiting: Boolean = false;

    @property({ attribute: false })
    private productsInfo: IProduct[] = [];

    @property({ attribute: false })
    private walletType: WalletType | '' = '';

    @property({attribute: false})
    private walletConnectorConfig = null;

    constructor() {
        super();

        document.addEventListener('keydown',(event) => {
            if (event.key === 'Enter') {
                this.nextStep();
            }
        });
    }

    async connectedCallback() {
        super.connectedCallback();

        switch (this.theme) {
            case "light":
                case "dark":
                this.setTheme(this.theme);
                break;
            case "custom":
                break;
            default:
                this.setTheme('light');
                break;
        }

        this.API = new Client();

        this.clientId = this.clientId ? this.clientId : '';
        this.price = (this.price && this.price !== '0') ? this.price : '';
        this.priceAvailable = Boolean(this.price);
        this.tokens = await this.getTokens();

        if (this.invoiceId) {
            await this.getInvoice(this.invoiceId);
            return;
        }

        if (!this.clientId) {
            this.errorTitle = 'Empty clientId';
            this.errorText =
                'You did not pass the clientId. In order to continue, the clientId field must be filled in.';

            this.goToStep('error');

            return;
        }

        if(this.products && this.products.length > 0){

            const resultProductsInfo: IProduct[] = await this.getProductsInfo(this.products);
            this.productsInfo = resultProductsInfo;

            if(resultProductsInfo.length > 0){

                for(let product of resultProductsInfo){
                    const currentPrice = Number(this.price);
                    const productSum = currentPrice + (product.count * product?.prices[0].price);
                    this.price = parseFloat(productSum.toString()).toFixed(2)
                }

                this.priceAvailable = true;
                this.goToStep('setToken');
                return;
            }

        }

        if(!this.price || this.price === '0'){
            this.goToStep('setPrice');
            return;
        }

        this.goToStep('setToken');
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                
                ${this.appStep === 'loading'
                    ? html` <loading-step></loading-step>`
                    : ''}
                ${this.appStep === 'error'
                    ? html` <error-step
                          .title=${this.errorTitle}
                          .text=${this.errorText}
                      ></error-step>`
                    : ''}
                ${this.appStep === 'setPrice'
                    ? html` <price-step
                          .price=${this.price}
                          @updatePrice=${(event: CustomEvent) => (this.price = event.detail.price)}
                          @nextStep=${this.nextStep}
                      ></price-step>`
                    : ''}
                ${this.appStep === 'setToken'
                    ? html` <token-step
                          .tokens=${this.tokens}
                          .selectedTokenSymbol=${this.selectedTokenSymbol}
                          .selectedNetworkSymbol=${this.selectedNetworkSymbol}
                          .price=${this.price}
                          .returnButtonShow=${!this.priceAvailable}
                          .productsInfo=${this.productsInfo}
                          @updateSelectedToken=${(event: CustomEvent) => {
                              this.selectedTokenSymbol = event.detail.tokenSymbol;
                              this.selectedNetworkSymbol = event.detail.networkSymbol;
                          }}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></token-step>`
                    : ''}
                ${this.appStep === 'setWallet'
                    ? html` <wallet-step
                                .walletAddress=${this.walletAddress}
                                .price=${this.price}
                                .productsInfo=${this.productsInfo}
                                .selectedTokenSymbol=${this.selectedTokenSymbol}
                                .selectedNetworkSymbol=${this.selectedNetworkSymbol}
                                .walletConnectorConfig=${this.walletConnectorConfig}
                                @returnBack=${this.prevStep}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                                @updateWalletType=${(event: CustomEvent) =>
                                        (this.walletType = event.detail.walletType)}
                                @updateWalletAddress=${(event: CustomEvent) =>
                                        (this.walletAddress = event.detail.walletAddress)}
                                @updateWalletConnectorConfig=${(event: CustomEvent) => {
                                    this.walletConnectorConfig = event.detail.walletConnectorConfig
                                }}
                          
                          .creatingInvoice=${this.creatingInvoice}
                          @nextStep=${this.nextStep}
                          
                      ></wallet-step>`
                    : ''}
                ${this.appStep === 'payment'
                    ? html` <payment-step
                          .price=${this.price}
                          .walletAddress=${this.walletAddress}
                          .invoice=${this.invoice}
                          .cancelingInvoice=${this.cancelingInvoice}
                          .connectorPaymentAwaiting=${this.connectorPaymentAwaiting}
                          .walletType=${this.walletType}
                          .walletConnectorConfig=${ (this.walletType === 'Custom') ? null : this.walletConnectorConfig }
                          @cancelInvoice=${this.cancelInvoice}
                          @updatePaymentAwaiting=${(event: CustomEvent) =>
                                  (this.connectorPaymentAwaiting = event.detail.connectorPaymentAwaiting)}
                          @updateNotification=${(event: CustomEvent) =>
                                  this.updateNotification(event)}
                      ></payment-step>`
                    : ''}
                ${this.appStep === 'processing'
                    ? html` <processing-step
                          .price=${this.price}
                          .invoice=${this.invoice}
                          .productsInfo=${this.productsInfo}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></processing-step>`
                    : ''}
                ${this.appStep === 'success'
                    ? html` <success-step
                          .price=${this.price}
                          .invoice=${this.invoice}
                          .backToStoreUrl=${this.backToStoreUrl}
                          .productsInfo=${this.productsInfo}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></success-step>`
                    : ''}

                <custom-notification
                        .active=${this.notificationShow}
                        .data=${this.notificationData}
                        .dark=${this.theme === 'dark'}
                        @updateNotification=${this.updateNotification}
                ></custom-notification>
            </div>
        `;
    }

    private setTheme(theme: AppTheme){

        if(theme !== 'custom'){
            const currentThemeConfig: any = themesConfig.themes[theme];

            for(const colorName of Object.keys(currentThemeConfig)){
                const colorValue = currentThemeConfig[colorName];
                document.documentElement.style.setProperty(colorName, colorValue);
            }
        }

    }
    private updateNotification(event: CustomEvent) {
        if (event.detail?.notificationData) {
            this.notificationData = event.detail.notificationData;
        }
        this.notificationShow = event.detail.notificationShow;
    }

    private async createInvoice() {

        const ws = new WsClient();
        let invoiceId: string = '';
        let invoiceWS = null;

        try {

            invoiceWS = ws.appClientInvoice(this.appId, this.clientId);

            let params;

            if(this.products.length > 0){
                params = {
                    type: 'payment',
                    clientId: this.clientId,
                    from: this.walletAddress,
                    network: this.selectedNetworkSymbol,
                    cryptocurrency: this.selectedTokenSymbol,
                    currency: 'USD',
                    appId: this.appId,
                    products: this.products
                }
            }else{
                params = {
                    type: 'payment',
                    clientId: this.clientId,
                    from: this.walletAddress,
                    network: this.selectedNetworkSymbol,
                    cryptocurrency: this.selectedTokenSymbol,
                    currency: 'USD',
                    appId: this.appId,
                    price: Number(this.price)
                }
            }

            const invoice = await this.API.invoice.create(params);
            invoiceId = invoice.id;

            this.dispatchInvoiceChangedEvent('created', invoice);

        } catch (error) {
            let errorTitle: string = '';
            let errorText: string = '';

            if (error instanceof ValidationError) {
                const errorObject = error as ValidationError<InvoiceCreateErrors>;
                const fieldsError: string[] = [];

                for (const [key, value] of Object.entries(errorObject.errors)) {
                    fieldsError.push(`${key} - ${value}`);
                }

                errorTitle = 'Validation Error';
                errorText = `Please review the following fields in your request: ${fieldsError.join(', ')}. Ensure they meet the required format and try again.`;

            } else if (error instanceof HttpError) {
                errorTitle = 'Request Error';
                errorText = `An error occurred while creating the invoice. Please try again later.`;

            } else {
                errorTitle = 'Server Connection Error';
                errorText = `We were unable to connect to the server. Please check your internet connection and try again.`;

            }

            this.notificationData = {
                title: errorTitle,
                text: errorText,
                buttonText: 'Confirm'
            };
            this.notificationShow = true;
            this.creatingInvoice = false;

            this.dispatchErrorEvent(`Invoice Creating ${errorTitle}`, errorText);
        }

        if(invoiceWS){

            invoiceWS.on(InvoiceStatus.Processing, (invoice) => {
                console.log('invoice Processing', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('payment');
            });

            invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
                console.log('invoice Confirming', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('processing');
            });

            invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
                console.log('invoice Rejected', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('success');
            });

            invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
                console.log('invoice Cancelled', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('success');
            });

            invoiceWS.on(InvoiceStatus.Success, (invoice) => {
                console.log('invoice Success', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('success');
            });

            invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
                console.log('invoice Expired', invoice);
                this.invoice = invoice;
                this.dispatchInvoiceChangedEvent(invoice.status, invoice);
                this.goToStep('success');
            });

            setTimeout(async () => {

                try {
                    const newInvoiceData = await this.API.invoice.get(invoiceId);
                    this.invoice = newInvoiceData;

                    if (newInvoiceData.status === 'processing') {
                        this.goToStep('payment');
                    }
                } catch (error) {
                    let errorTitle: string = '';
                    let errorText: string = '';

                    if (error instanceof HttpError) {
                        errorTitle = 'Request Error';
                        errorText = `An error occurred while creating the invoice. Please try again later.`;
                    } else {
                        errorTitle = 'Server Connection Error';
                        errorText = `We were unable to connect to the server. Please check your internet connection and try again.`;
                    }

                    this.notificationData = {
                        title: errorTitle,
                        text: errorText,
                        buttonText: 'Confirm'
                    };
                    this.notificationShow = true;
                    this.creatingInvoice = false;
                    this.dispatchErrorEvent(`Invoice Creating ${errorTitle}`, errorText);
                }

            }, 1000);
        }

    }
    private async cancelInvoice(){

        if(!this.invoice?.id){

            this.notificationData = {
                title: 'Error',
                text: 'Unable to retrieve the ID of invoice. Please try again later.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;
            this.dispatchErrorEvent('Invoice Canceling Error', 'Unable to retrieve the ID of invoice. Please try again later.');
            return;
        }

        try {
            this.cancelingInvoice = true;
            await this.API.invoice.cancel(this.invoice?.id);
        } catch (error) {

            this.notificationData = {
                title: 'Error',
                text: 'Failed to cancel the invoice. Please try again later.',
                buttonText: 'Confirm'
            };
            this.cancelingInvoice = false;
            this.dispatchErrorEvent('Invoice Canceling Error', 'Failed to cancel the invoice. Please try again later.');
            return;

        }
    }
    private async getInvoice(invoiceId: string) {

        const ws = new WsClient();
        const invoiceWS = ws.appClientInvoice(this.appId, this.clientId);

        let result;
        try {
            result = await this.API.invoice.get(invoiceId);
        } catch (e) {
            this.errorTitle = 'Error';
            this.errorText =
                'There was an error with creating/receiving an invoice. Please try again later.';
            this.goToStep('error');
            this.dispatchErrorEvent('Fetch Invoice Error', 'There was an error with creating/receiving an invoice. Please try again later.');
            return;
        }

        this.invoice = result;
        this.price = result.price || '';

        if(result.products && result.products.length > 0){
            this.productsInfo = await this.getProductsInfo(result.products)
        }

        this.dispatchInvoiceChangedEvent(result.status, result);

        if (result.status === 'processing') {

            this.goToStep('payment');
        } else if (result.status === 'confirming') {

            this.goToStep('processing');
        } else if (
            result.status === 'rejected' ||
            result.status === 'canceled' ||
            result.status === 'success' ||
            result.status === 'expired'
        ) {

            this.goToStep('success');
        }

        invoiceWS.on(InvoiceStatus.Processing, (invoice) => {
            console.log('invoice Processing', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('payment');
        });

        invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
            console.log('invoice Confirming', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('processing');
        });

        invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
            console.log('invoice Rejected', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
            console.log('invoice Cancelled', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
            console.log('invoice Expired', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Success, (invoice) => {
            console.log('invoice Success', invoice);
            this.invoice = invoice;
            this.dispatchInvoiceChangedEvent(invoice.status, invoice);
            this.goToStep('success');
        });
    }

    private nextStep() {
        if (this.appStep === 'setPrice' && this.price && Number(this.price) > 0) {
            this.price = parseFloat(this.price).toFixed(2);
            this.goToStep('setToken');
            return;
        }

        if (this.appStep === 'setToken' && this.selectedTokenSymbol && this.selectedNetworkSymbol) {
            this.goToStep('setWallet');
            return;
        }

        if(this.appStep === 'setWallet' && this.walletAddress && !checkWalletAddress(this.walletAddress, this.selectedNetworkSymbol)){
            this.notificationData = {
                title: 'Invalid Wallet Address',
                text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Invalid Wallet Address', 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.');
        }

        if(this.appStep === 'setWallet' && this.walletAddress && checkWalletAddress(this.walletAddress, this.selectedNetworkSymbol)) {

            this.creatingInvoice = true;
            this.createInvoice();

        }
    }
    private async prevStep() {
        if (this.appStep === 'setToken') {
            if (!this.priceAvailable) {
                this.goToStep('setPrice');
                return;
            }
        }

        if (this.appStep === 'setWallet') {

            this.walletAddress = '';
            this.walletType = '';

            this.goToStep('setToken');

            return;
        }
    }
    private goToStep(stepName: AppStep) {
        this.appStep = stepName;
    }

    private async getTokens() {
        try {
            const result: Cryptocurrency[] = await this.API.cryptocurrency.list({
                appId: this.appId,
                networks: true,
                rates: true
            });

            return result;
        } catch (error) {

            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve token data. Please try again later.';
            this.goToStep('error');
            this.dispatchErrorEvent('Fetch Tokens Error', 'Failed to retrieve token data. Please try again later.');
        }
    }
    private async getProductsInfo(products: IProductInvoice[]){
        const result = [];
        for(let product of products){

            try{
                const productId = product.id || product.product?.id;
                const info = await this.API.product.get(productId);
                const count = products.find((item) => item.id === productId)?.count || product.count;

                if(info){
                    result.push({
                        ...info,
                        count: count
                    });
                }

            }catch (e){
                this.notificationData = {
                    title: 'Get Products Failed',
                    text: 'Failed to retrieve data for some products.',
                    buttonText: 'Confirm'
                };
                this.notificationShow = true;

                this.dispatchErrorEvent('Fetch Products Error', 'Failed to retrieve data for some products.');
            }
        }

        return result;
    }

    private dispatchInvoiceChangedEvent(status: string, invoice: Invoice){
        const updateStatusEvent = new CustomEvent(`${status}-status-changed`, {
            detail: {
                invoice: invoice
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateStatusEvent);
    }
    private dispatchErrorEvent(title: string, text: string){
        const errorEvent = new CustomEvent('error-event', {
            detail: {
                error: {
                    title,
                    text
                }
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(errorEvent);
    }

    static styles = css`
        * {
            font-family: system-ui;
            font-style: normal;
            font-size: 14px;
            font-weight: 450;
            background: transparent;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .stepWrapper {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: var(--sp-widget-secondary-bg-color);
            overflow: hidden;

            & > *:not(custom-notification) {
                height: 100%;
            }

        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'payment-app': PaymentApp;
    }
}
