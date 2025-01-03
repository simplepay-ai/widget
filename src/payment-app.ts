import {
    Client,
    Cryptocurrency,
    HttpError,
    Invoice, InvoiceCreateErrors, InvoiceEventType,
    Network, Product, Transaction, TransactionCreateErrors, TransactionEventType,
    ValidationError, WsClient, TransactionStatus
} from '@simplepay-ai/api-client';
import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {
    AppStep,
    AppTheme,
    CurrentPriceStep, ICartProduct,
    INotification, InvoiceType, IOpenButton,
    IProduct,
    OpenMode,
    WalletType
} from './types';
import './steps/step-header.ts';
import './steps/step-footer.ts';
import './steps/success-footer.ts';
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
import './steps/preview-step.ts';
import './steps/type-select.ts';
import './steps/new-set-price-step.ts';
import './steps/product-step.ts';
import './steps/cart-step.ts';
import './steps/show-invoice.ts';
import './steps/new-wallet-step.ts';
import {checkWalletAddress, generateUUID} from "./util.ts";
import themesConfig from '../themesConfig.json';
//@ts-ignore
import style from "./styles/payment-app.css?inline";

@customElement('payment-app')
export class PaymentApp extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: String})
    modal: string = '';

    @property({type: String})
    noPreview: string = '';

    @property({type: String})
    tokenSymbol: string = '';

    @property({type: String})
    networkSymbol: string = '';

    @property({
        converter: (attrValue: string | null) => {
            if (attrValue && parseFloat(attrValue) && parseFloat(attrValue) > 0)
                return parseFloat(attrValue).toFixed(2);
            else return undefined;
        },
        type: String
    })
    price: string = '0';

    @property({type: String})
    payload: string = '';

    @property({type: String})
    products: string = '';

    @property({type: String})
    clientId: string = '';

    @property({type: String})
    theme: AppTheme = 'light';

    @property({type: String})
    backToStoreUrl: string = '';

    @property({type: String})
    appId: string = '';

    @property({type: String})
    transactionId: string = '';

    @property({attribute: false, type: String})
    private openMode: OpenMode = 'auto';

    @property({attribute: false, type: Object})
    private openButtonParams: IOpenButton = {
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        title: 'Pay in crypto'
    };

    @property({attribute: false})
    private priceAvailable: boolean = false;

    @property({attribute: false})
    private appStep: AppStep = 'loading';

    @property({attribute: false})
    private tokens: Cryptocurrency[] | undefined = [];

    @property({attribute: false})
    private walletAddress: string = '';

    @property({attribute: false})
    private errorTitle: string = '';

    @property({attribute: false})
    private errorText: string = '';

    @property({attribute: false})
    private API: any = null;

    @property({attribute: false})
    private notificationShow: boolean = false;

    @property({attribute: false})
    private notificationData: INotification | null = null;

    @property({attribute: false})
    private cancelingTransaction: Boolean = false;

    @property({attribute: false})
    private connectorPaymentAwaiting: Boolean = false;

    @property({attribute: false})
    private productsInfo: IProduct[] = [];

    @property({attribute: false})
    private walletType: WalletType | '' = '';

    @property({attribute: false})
    private walletConnectorConfig = null;

    @property({attribute: false})
    private invoiceMessage = '';

    @property({attribute: false})
    private priceStep: CurrentPriceStep = 'priceEnter';

    @property({attribute: false})
    private showPaymentModal: boolean = false;

    @property({attribute: false})
    private showPaymentModalOverlay: boolean = false;

    @property({attribute: false})
    private showPaymentModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    private payloadMessage: boolean = false;

    @property({attribute: false})
    private appInfo: any;

    ////////////////

    @property({type: String})
    invoiceId: string = '';

    @property({attribute: false, type: String})
    private invoiceType: InvoiceType | '' = '';

    @property({attribute: false, type: Array})
    private appProducts: Product[] = [];

    @property({attribute: false, type: String})
    private invoiceProductId: string = '';

    @property({attribute: false, type: Array})
    private invoiceCart: ICartProduct[] = [];

    @property({attribute: false, type: String})
    private invoicePrice: string = '0';

    @property({attribute: false})
    private invoice: Invoice | null = null;

    @property({attribute: false})
    private transaction: Transaction | null = null;

    @property({attribute: false})
    private invoiceTransactions: Transaction[] = [];

    @property({attribute: false})
    private creatingInvoice: Boolean = false;

    @property({attribute: false})
    private creatingTransaction: Boolean = false;

    @property({attribute: false})
    private tokenAvailable: boolean = false;

    @property({attribute: false})
    private selectedToken: Cryptocurrency | null = null;

    @property({attribute: false})
    private selectedNetwork: Network | null = null;

    // @property({attribute: false})
    // private selectedTokenSymbol: string = '';
    //
    // @property({attribute: false})
    // private selectedNetworkSymbol: string = '';

    @property({attribute: false})
    private onlyTransaction: boolean = false;

    // @property({attribute: false})
    // private transactionInterval: any = null;

    constructor() {
        super();

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.nextStep();
            }
        });
    }

    async connectedCallback() {
        super.connectedCallback();

        if (this.modal) {

            const modalParams = JSON.parse(this.modal);
            this.openMode = (modalParams.open) ? modalParams.open : 'auto'

            if (modalParams.open === 'modal' && modalParams?.config) {

                const configKeys = Object.keys(modalParams.config);

                if (modalParams.config && configKeys.indexOf('triggerId') !== -1) {
                    this.openMode = 'trigger';

                    const triggerElement = document.getElementById(`${modalParams.config.triggerId}`);
                    if (triggerElement) {
                        triggerElement.addEventListener('click', () => this.openPaymentModal());
                    }
                }

                if (modalParams.config && (configKeys.indexOf('backgroundColor') !== -1 || configKeys.indexOf('textColor') !== -1 || configKeys.indexOf('title') !== -1)) {

                    this.openMode = 'button';

                    this.openButtonParams = {
                        backgroundColor: (modalParams.config.backgroundColor) ? modalParams.config.backgroundColor : '#3b82f6',
                        textColor: (modalParams.config.textColor) ? modalParams.config.textColor : '#ffffff',
                        title: (modalParams.config.title) ? modalParams.config.title : 'Pay in crypto'
                    }
                }
            }
        }

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

        // if (this.invoiceId) {
        // await this.getInvoice(this.invoiceId);
        // return;
        // }

        this.clientId = this.clientId ? this.clientId : generateUUID();

        if(this.invoiceId || this.transactionId) {

            this.API = new Client();

            if (this.transactionId) {
                this.onlyTransaction = true;
                this.getTransaction(this.transactionId).then(() => {
                    this.getInvoice(this.transaction?.invoiceId || '').then(async () => {
                        this.tokens = await this.getTokens(this.invoice?.app?.id || '')
                        this.getInvoiceTransactions(this.invoice?.id || '').then(() => {
                            this.subscribeInvoice(this.invoice?.id || '')
                        });
                    })
                });
                return;
            } else {

                this.getInvoice(this.invoiceId).then(async () => {
                    this.tokens = await this.getTokens(this.invoice?.app?.id || '')

                    if (this.tokens && this.tokens.length === 0) {
                        this.errorTitle = 'Error';
                        this.errorText =
                            'Currently, there are no tokens available for selection as a payment option on this project.';
                        this.goToStep('error');
                        this.dispatchErrorEvent('Empty Tokens', 'Currently, there are no tokens available for selection as a payment option on this project.');

                        return;
                    }
                    if (this.tokens && this.tokens.length > 0) {

                        const defaultToken = this.tokens?.find((item: Cryptocurrency) => item.symbol === this.tokenSymbol && item);
                        let defaultNetwork: Network | undefined = undefined;

                        if (defaultToken && defaultToken.networks && defaultToken.networks?.length > 0) {
                            const networks: Network[] = defaultToken.networks;
                            defaultNetwork = networks.find((item: Network) => item.symbol === this.networkSymbol);
                        }

                        if ((!defaultToken && this.tokenSymbol !== '') || (!defaultNetwork && this.networkSymbol !== '')) {

                            if (!defaultToken) {
                                this.errorTitle = 'Invalid Token Name';
                                this.errorText =
                                    'The token name you entered is incorrect. Please double-check the name and try again.';
                            }

                            if (!defaultNetwork) {
                                this.errorTitle = 'Invalid Token Network';
                                this.errorText =
                                    'The token network you selected is incorrect. Please verify the network and try again.';
                            }

                            if (!defaultNetwork && !defaultToken) {
                                this.errorTitle = 'Invalid Token Name and Network';
                                this.errorText =
                                    'The token name and network you entered is incorrect. Please verify the token name and network and try again.';
                            }

                            this.goToStep('error');

                            return;
                        }

                        if (defaultToken && defaultNetwork) {
                            this.selectedToken = defaultToken;
                            this.selectedNetwork = defaultNetwork;
                            // this.selectedTokenSymbol = defaultToken.symbol;
                            // this.selectedNetworkSymbol = defaultNetwork.symbol;
                            this.tokenAvailable = true;
                        }

                    }
                }).then(() => {
                    this.getInvoiceTransactions(this.invoiceId).then(() => {
                        this.subscribeInvoice(this.invoiceId).then(() => {
                            this.goToStep('showInvoice');
                        })
                    });
                });

                return;
            }

        }

        if (!this.appId) {
            this.errorTitle = 'Empty appId';
            this.errorText =
                'You did not pass the appId. In order to continue, the appId field must be filled in.';

            this.goToStep('error');

            return;
        }

        this.API = new Client({
            apiKey: this.appId
        });

        const products = await this.getProducts();
        if (products === 'error') {
            this.goToStep('error');
            return;
        }

        this.appInfo = await this.getApp();
        this.appProducts = products;
        this.goToStep('typeSelect');

    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        // if (changedProperties.has('invoice') && this.invoice?.id && !this.onlyTransaction) {
        //     this.goToStep('showInvoice');
        // }

        if (changedProperties.has('transaction') && this.transaction?.id && !this.onlyTransaction) {

            // if(!this.invoice){
            //     this.getInvoice(this.transaction.invoiceId);
            // }

            this.goToTransactionStep(this.transaction.status);
        }

        if((changedProperties.has('transaction') || changedProperties.has('invoice')) && this.transaction && this.onlyTransaction){
            if(this.invoice?.id){
                this.goToTransactionStep(this.transaction.status);
            }
        }

        // if(changedProperties.has('appStep') && (this.appStep === 'success' || this.appStep === 'showInvoice') && this.transactionInterval){
        //     clearInterval(this.transactionInterval);
        //     this.transactionInterval = null;
        // }

        // if(changedProperties.has('appStep') && this.invoice){
        //     this.getInvoiceTransactions(this.invoice.id);
        // }
        //
        // if(changedProperties.has('appStep') && this.invoice && this.appStep === 'showInvoice'){
        //     this.getInvoice(this.invoice.id);
        // }
    }

    render() {
        const content = html`
            ${this.appStep === 'loading'
                    ? html`
                        <loading-step></loading-step>`
                    : ''}
            ${this.appStep === 'error'
                    ? html`
                        <error-step
                                .title=${this.errorTitle}
                                .text=${this.errorText}
                        ></error-step>`
                    : ''}

            ${this.appStep === 'typeSelect'
                    ? html`
                        <type-select
                                .invoiceType=${this.invoiceType}
                                @updateInvoiceType=${(event: CustomEvent) => {
                                    this.invoiceType = event.detail.invoiceType;
                                }}
                                @nextStep=${this.nextStep}
                        ></type-select>`
                    : ''
            }

            ${this.appStep === 'newSetPrice'
                    ? html`
                        <new-set-price-step
                                .appInfo=${this.appInfo}
                                .price=${this.invoicePrice}
                                .creatingInvoice=${this.creatingInvoice}
                                @updatePrice=${(event: CustomEvent) => (this.invoicePrice = event.detail.price)}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                        ></new-set-price-step>`
                    : ''
            }

            ${this.appStep === 'setProduct'
                    ? html`
                        <product-step
                                .products=${this.appProducts}
                                .invoiceProductId=${this.invoiceProductId}
                                .creatingInvoice=${this.creatingInvoice}
                                @updateInvoiceProductId=${(event: CustomEvent) => (this.invoiceProductId = event.detail.invoiceProductId)}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                        ></product-step>`
                    : ''
            }

            ${this.appStep === 'setCart'
                    ? html`
                        <cart-step
                                .products=${this.appProducts}
                                .cart=${this.invoiceCart}
                                .creatingInvoice=${this.creatingInvoice}
                                @addToCart=${(event: CustomEvent) => {
                                    const productId = event.detail.productId;
                                    if (productId) {
                                        const check = this.invoiceCart.find((item: ICartProduct) => item.id === productId);

                                        if (check) {
                                            this.invoiceCart = [
                                                ...this.invoiceCart.filter((item: ICartProduct) => item.id !== productId),
                                                {
                                                    id: check.id,
                                                    count: check.count + 1
                                                }
                                            ]
                                        } else {
                                            this.invoiceCart = [
                                                ...this.invoiceCart,
                                                {
                                                    id: productId,
                                                    count: 1
                                                }
                                            ]
                                        }
                                    }
                                }}
                                @removeFromCart=${(event: CustomEvent) => {
                                    const productId = event.detail.productId;
                                    if (productId) {

                                        const check = this.invoiceCart.find((item: ICartProduct) => item.id === productId);
                                        if (check && check.count - 1 > 0) {
                                            this.invoiceCart = [
                                                ...this.invoiceCart.filter((item: ICartProduct) => item.id !== productId),
                                                {
                                                    id: check.id,
                                                    count: check.count - 1
                                                }
                                            ]
                                        } else {
                                            this.invoiceCart = [
                                                ...this.invoiceCart.filter((item: ICartProduct) => item.id !== productId),
                                            ]
                                        }
                                    }
                                }}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                        ></cart-step>`
                    : ''
            }

            ${this.appStep === 'showInvoice'
                    ? html`
                        <show-invoice
                                .invoice=${this.invoice}
                                .selectedToken=${this.selectedToken}
                                .selectedNetwork=${this.selectedNetwork}
                                .tokens=${this.tokens}
                                .tokenAvailable=${this.tokenAvailable}
                                .transactions=${this.invoiceTransactions}
                                @nextStep=${this.nextStep}
                                @updateSelectedToken=${(event: CustomEvent) => {
                                    this.selectedToken = event.detail.token;
                                    this.selectedNetwork = event.detail.network;
                                }}
                                @updateSelectedTransaction=${(event: CustomEvent) => {
                                    const transaction = this.invoiceTransactions.find((item) => item.id === event.detail.transactionId);
                                    if(transaction){
                                        this.transaction = transaction
                                        // this.setTransaction(transaction);   
                                    }
                                }}
                        >
                        </show-invoice>`
                    : ''}

            ${this.appStep === 'setNewWallet'
                    ? html`
                        <new-wallet-step
                                .invoice=${this.invoice}
                                .creatingTransaction=${this.creatingTransaction}
                                .walletAddress=${this.walletAddress}
                                .walletType=${this.walletType}
                                .selectedToken=${this.selectedToken}
                                .selectedNetwork=${this.selectedNetwork}
                                .walletConnectorConfig=${this.walletConnectorConfig}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                                @updateWalletType=${(event: CustomEvent) =>
                                        (this.walletType = event.detail.walletType)}
                                @updateWalletAddress=${(event: CustomEvent) =>
                                        (this.walletAddress = event.detail.walletAddress)}
                                @updateWalletConnectorConfig=${(event: CustomEvent) => {
                                    this.walletConnectorConfig = event.detail.walletConnectorConfig
                                }}
                                @nextStep=${this.nextStep}
                                @returnBack=${this.prevStep}
                        >
                        </new-wallet-step>`
                    : ''}

            ${this.appStep === 'payment'
                    ? html`
                        <payment-step
                                .transaction=${this.transaction}
                                .walletAddress=${this.walletAddress}
                                .invoice=${this.invoice}
                                .cancelingTransaction=${this.cancelingTransaction}
                                .connectorPaymentAwaiting=${this.connectorPaymentAwaiting}
                                .walletType=${this.walletType}
                                .walletConnectorConfig=${(this.walletType === 'Custom') ? null : this.walletConnectorConfig}
                                .hasReturnBack=${!this.onlyTransaction}
                                @cancelTransaction=${this.cancelTransaction}
                                @updatePaymentAwaiting=${(event: CustomEvent) =>
                                        (this.connectorPaymentAwaiting = event.detail.connectorPaymentAwaiting)}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                                @returnBack=${this.prevStep}
                        ></payment-step>`
                    : ''}
            ${this.appStep === 'processing'
                    ? html`
                        <processing-step
                                .invoice=${this.invoice}
                                .transaction=${this.transaction}
                                .hasReturnBack=${!this.onlyTransaction}
                                @nextStep=${this.nextStep}
                                @returnBack=${this.prevStep}
                        ></processing-step>`
                    : ''}
            ${this.appStep === 'success'
                    ? html`
                        <success-step
                                .invoice=${this.invoice}
                                .transaction=${this.transaction}
                                .backToStoreUrl=${this.backToStoreUrl}
                                .hasReturnBack=${!this.onlyTransaction}
                                @returnBack=${this.prevStep}
                        ></success-step>`
                    : ''}
            

            ${this.appStep === 'preview'
                    ? html`
                        <preview-step
                                .price=${this.price}
                                .productsInfo=${this.productsInfo}
                                .selectedTokenSymbol=${this.selectedToken?.symbol}
                                .selectedNetworkSymbol=${this.selectedNetwork?.symbol}
                                .tokens=${this.tokens}
                                .tokenAvailable=${this.tokenAvailable}
                                .appInfo=${this.appInfo}
                                @nextStep=${this.nextStep}
                                @updateSelectedToken=${() => {
                                    // this.selectedTokenSymbol = event.detail.tokenSymbol;
                                    // this.selectedNetworkSymbol = event.detail.networkSymbol;
                                }}
                        >
                        </preview-step>`
                    : ''}
            ${this.appStep === 'setPrice'
                    ? html`
                        <price-step
                                .appInfo=${this.appInfo}
                                .price=${this.price}
                                .priceAvailable=${this.priceAvailable}
                                .tokenAvailable=${this.tokenAvailable}
                                .payloadMessage=${this.payloadMessage}
                                .invoiceMessage=${this.invoiceMessage}
                                .currentPriceStep=${this.priceStep}
                                .selectedTokenSymbol=${this.selectedToken?.symbol}
                                .selectedNetworkSymbol=${this.selectedNetwork?.symbol}
                                .tokens=${this.tokens}
                                @updatePrice=${(event: CustomEvent) => (this.price = event.detail.price)}
                                @updateInvoiceMessage=${(event: CustomEvent) => (this.invoiceMessage = event.detail.invoiceMessage)}
                                @updateCurrentPriceStep=${(event: CustomEvent) => (this.priceStep = event.detail.currentPriceStep)}
                                @nextStep=${this.nextStep}
                                @updateSelectedToken=${() => {
                                    // this.selectedTokenSymbol = event.detail.tokenSymbol;
                                    // this.selectedNetworkSymbol = event.detail.networkSymbol;
                                }}
                        ></price-step>`
                    : ''}

            ${this.appStep === 'setToken'
                    ? html`
                        <token-step
                                .tokens=${this.tokens}
                                .selectedTokenSymbol=${this.selectedToken?.symbol}
                                .selectedNetworkSymbol=${this.selectedNetwork?.symbol}
                                .price=${this.price}
                                .returnButtonShow=${!this.priceAvailable || this.priceAvailable && this.noPreview !== 'true' || this.payloadMessage && this.noPreview === 'true'}
                                .productsInfo=${this.productsInfo}
                                @updateSelectedToken=${() => {
                                    // this.selectedTokenSymbol = event.detail.tokenSymbol;
                                    // this.selectedNetworkSymbol = event.detail.networkSymbol;
                                }}
                                @nextStep=${this.nextStep}
                                @returnBack=${this.prevStep}
                        ></token-step>`
                    : ''}
            ${this.appStep === 'setWallet'
                    ? html`
                        <wallet-step
                                .walletAddress=${this.walletAddress}
                                .walletType=${this.walletType}
                                .price=${this.price}
                                .productsInfo=${this.productsInfo}
                                .selectedTokenSymbol=${this.selectedToken?.symbol}
                                .selectedNetworkSymbol=${this.selectedNetwork?.symbol}
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

            <custom-notification
                    .active=${this.notificationShow}
                    .data=${this.notificationData}
                    .dark=${this.theme === 'dark'}
                    @updateNotification=${this.updateNotification}
            ></custom-notification>
        `

        if (this.openMode === 'auto') {
            return html`
                <div class=${`stepWrapper`}>
                    ${content}
                </div>
            `;
        }

        if (this.openMode === 'modal') {
            return html`
                <div class="paymentModal show">
                    <div class="paymentModalOverlay show"></div>
                    <div class="paymentModalContent show">
                        ${content}
                    </div>
                </div>
            `;
        }

        if (this.openMode === 'button') {
            return html`
                <button style=${`background-color: ${this.openButtonParams.backgroundColor}; color: ${this.openButtonParams.textColor};`}
                        class="openModalButton"
                        @click=${() => this.openPaymentModal()}
                >
                    ${this.openButtonParams.title}
                </button>

                <div class="paymentModal ${(this.showPaymentModal) ? 'show' : ''}">
                    <div class="paymentModalOverlay ${(this.showPaymentModalOverlay) ? 'show' : ''}"
                         @click=${() => this.closePaymentModal()}
                    ></div>
                    <div class="paymentModalContent ${(this.showPaymentModalContent) ? 'show' : ''}">
                        ${content}
                    </div>
                </div>
            `;
        }

        if (this.openMode === 'trigger') {
            return html`
                <div class="paymentModal ${(this.showPaymentModal) ? 'show' : ''}">
                    <div class="paymentModalOverlay ${(this.showPaymentModalOverlay) ? 'show' : ''}"
                         @click=${() => this.closePaymentModal()}
                    ></div>
                    <div class="paymentModalContent ${(this.showPaymentModalContent) ? 'show' : ''}">
                        ${content}
                    </div>
                </div>
            `;
        }
    }

    private openPaymentModal() {
        this.showPaymentModal = true;

        setTimeout(() => {
            this.showPaymentModalOverlay = true;

            setTimeout(() => {
                this.showPaymentModalContent = true;
            }, 200)
        }, 200)
    }

    private closePaymentModal() {
        this.showPaymentModalContent = false;

        setTimeout(() => {
            this.showPaymentModalOverlay = false;

            setTimeout(() => {
                this.showPaymentModal = false;
            }, 200)
        }, 200)
    }

    private setTheme(theme: AppTheme) {

        if (theme !== 'custom') {
            const currentThemeConfig: any = themesConfig.themes[theme];

            for (const colorName of Object.keys(currentThemeConfig)) {
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

    // private async checkTransaction(transactionId){
    //
    //     try{
    //         this.transaction = await this.API.transaction.get(transactionId);
    //
    //     }catch (e) {
    //         if (e instanceof ValidationError) {
    //             const error = e as ValidationError<InvoiceCreateErrors>;
    //             console.log(error.errors);
    //         }
    //
    //         if (e instanceof HttpError) {
    //             const error = e as HttpError;
    //             console.log(error.code);
    //         }
    //     }
    //
    //
    //
    //     //         invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
    //     //             console.log('invoice Rejected', invoice);
    //     //             this.invoice = invoice;
    //     //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //     //             this.goToStep('success');
    //     //         });
    //     //
    //     //         invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
    //     //             console.log('invoice Cancelled', invoice);
    //     //             this.invoice = invoice;
    //     //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //     //             this.goToStep('success');
    //     //         });
    //     //
    //     //         invoiceWS.on(InvoiceStatus.Success, (invoice) => {
    //     //             console.log('invoice Success', invoice);
    //     //             this.invoice = invoice;
    //     //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //     //             this.goToStep('success');
    //     //         });
    //     //
    //     //         invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
    //     //             console.log('invoice Expired', invoice);
    //     //             this.invoice = invoice;
    //     //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //     //             this.goToStep('success');
    //     //         });
    //
    // }

    // private async createInvoice() {
    //
    //     const ws = new WsClient();
    //     let invoiceId: string = '';
    //     let invoiceWS = null;
    //
    //     try {
    //
    //         invoiceWS = ws.appClientInvoice(this.appId, this.clientId);
    //
    //         let params: any = {
    //             type: 'payment',
    //             clientId: this.clientId,
    //             from: this.walletAddress,
    //             network: this.selectedNetworkSymbol,
    //             cryptocurrency: this.selectedTokenSymbol,
    //             currency: 'USD',
    //             appId: this.appId,
    //             payload: {}
    //         }
    //
    //         if(this.products){
    //
    //             const parsedProducts = (this.products === 'custom') ? this.products : JSON.parse(this.products);
    //
    //             if(Array.isArray(parsedProducts) && parsedProducts.length > 0){
    //                 params['products'] = [...parsedProducts.map((item) => {
    //                     item.count = Number(item.count);
    //                     return item
    //                 })];
    //             }
    //
    //             if(this.products === 'custom'){
    //                 params['price'] = Number(this.price);
    //
    //                 const parsedPayload = JSON.parse(this.payload);
    //                 params.payload.products = parsedPayload.products;
    //             }
    //
    //         }else{
    //             params.price = Number(this.price);
    //         }
    //
    //         if(this.invoiceMessage !== '') {
    //             params.payload.message = this.invoiceMessage;
    //         }
    //
    //         // if (this.products.length > 0) {
    //         //     params['products'] = this.products;
    //         // } else {
    //         //     params['price'] = Number(this.price);
    //         // }
    //
    //         // if (this.invoiceMessage !== '') {
    //         //     params['payload'] = {
    //         //         message: this.invoiceMessage
    //         //     };
    //         // }
    //
    //         const invoice = await this.API.invoice.create(params);
    //         invoiceId = invoice.id;
    //
    //         this.dispatchInvoiceChangedEvent('created', invoice);
    //
    //     } catch (error) {
    //         let errorTitle: string = '';
    //         let errorText: string = '';
    //
    //         if (error instanceof ValidationError) {
    //             const errorObject = error as ValidationError<InvoiceCreateErrors>;
    //             const fieldsError: string[] = [];
    //
    //             for (const [key, value] of Object.entries(errorObject.errors)) {
    //                 fieldsError.push(`${key} - ${value}`);
    //             }
    //
    //             errorTitle = 'Validation Error';
    //             errorText = `Please review the following fields in your request: ${fieldsError.join(', ')}. Ensure they meet the required format and try again.`;
    //
    //         } else if (error instanceof HttpError) {
    //             errorTitle = 'Request Error';
    //             errorText = `An error occurred while creating the invoice. Please try again later.`;
    //
    //         } else {
    //             errorTitle = 'Server Connection Error';
    //             errorText = `We were unable to connect to the server. Please check your internet connection and try again.`;
    //
    //         }
    //
    //         this.notificationData = {
    //             title: errorTitle,
    //             text: errorText,
    //             buttonText: 'Confirm'
    //         };
    //         this.notificationShow = true;
    //         this.creatingInvoice = false;
    //
    //         this.dispatchErrorEvent(`Invoice Creating ${errorTitle}`, errorText);
    //     }
    //
    //     if (invoiceWS) {
    //
    //         invoiceWS.on(InvoiceStatus.Processing, (invoice) => {
    //             console.log('invoice Processing', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('payment');
    //         });
    //
    //         invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
    //             console.log('invoice Confirming', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('processing');
    //         });
    //
    //         invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
    //             console.log('invoice Rejected', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('success');
    //         });
    //
    //         invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
    //             console.log('invoice Cancelled', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('success');
    //         });
    //
    //         invoiceWS.on(InvoiceStatus.Success, (invoice) => {
    //             console.log('invoice Success', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('success');
    //         });
    //
    //         invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
    //             console.log('invoice Expired', invoice);
    //             this.invoice = invoice;
    //             this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //             this.goToStep('success');
    //         });
    //
    //         setTimeout(async () => {
    //
    //             try {
    //                 const newInvoiceData = await this.API.invoice.get(invoiceId);
    //                 console.log('newInvoiceData', newInvoiceData)
    //                 this.invoice = newInvoiceData;
    //
    //                 if (newInvoiceData.status === 'processing') {
    //                     this.goToStep('payment');
    //                 }
    //             } catch (error) {
    //                 let errorTitle: string = '';
    //                 let errorText: string = '';
    //
    //                 if (error instanceof HttpError) {
    //                     errorTitle = 'Request Error';
    //                     errorText = `An error occurred while creating the invoice. Please try again later.`;
    //                 } else {
    //                     errorTitle = 'Server Connection Error';
    //                     errorText = `We were unable to connect to the server. Please check your internet connection and try again.`;
    //                 }
    //
    //                 this.notificationData = {
    //                     title: errorTitle,
    //                     text: errorText,
    //                     buttonText: 'Confirm'
    //                 };
    //                 this.notificationShow = true;
    //                 this.creatingInvoice = false;
    //                 this.dispatchErrorEvent(`Invoice Creating ${errorTitle}`, errorText);
    //             }
    //
    //         }, 1000);
    //     }
    //
    // }

    // private async getInvoice(invoiceId: string) {
    //
    //     const ws = new WsClient();
    //     const invoiceWS = ws.appClientInvoice(this.appId, this.clientId);
    //
    //     let result;
    //     try {
    //         result = await this.API.invoice.get(invoiceId);
    //     } catch (e) {
    //         console.log('e', e)
    //         this.errorTitle = 'Error';
    //         this.errorText =
    //             'There was an error with creating/receiving an invoice. Please try again later.';
    //         this.goToStep('error');
    //         this.dispatchErrorEvent('Fetch Invoice Error', 'There was an error with creating/receiving an invoice. Please try again later.');
    //         return;
    //     }
    //
    //     this.invoice = result;
    //     this.price = result.price || '';
    //
    //     if(result.products && result.products.length > 0) {
    //         this.productsInfo = await this.getProductsInfo(result.products)
    //     }else if(result.payload?.products && result.payload?.products.length > 0){
    //
    //         const resultProducts = [];
    //         for(let product of result.payload.products){
    //             const resultProductData = {
    //                 id: result.payload.products.indexOf(product) + 1,
    //                 name: product.name,
    //                 description: product.description,
    //                 image: product.image,
    //                 createdAt: '',
    //                 updatedAt: '',
    //                 prices: [
    //                     {
    //                         currency: {
    //                             id: '5e091838-d7bb-4365-a395-84d82d1ac7c2',
    //                             symbol: 'USD',
    //                             code: 840
    //                         },
    //                         price: product.price
    //                     }
    //                 ],
    //                 count: product.count,
    //             }
    //             resultProducts.push(resultProductData);
    //         }
    //         this.productsInfo = resultProducts;
    //
    //     }
    //
    //     this.dispatchInvoiceChangedEvent(result.status, result);
    //
    //     if (result.status === 'processing') {
    //
    //         this.goToStep('payment');
    //     } else if (result.status === 'confirming') {
    //
    //         this.goToStep('processing');
    //     } else if (
    //         result.status === 'rejected' ||
    //         result.status === 'canceled' ||
    //         result.status === 'success' ||
    //         result.status === 'expired'
    //     ) {
    //
    //         this.goToStep('success');
    //     }
    //
    //     invoiceWS.on(InvoiceStatus.Processing, (invoice) => {
    //         console.log('invoice Processing', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('payment');
    //     });
    //
    //     invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
    //         console.log('invoice Confirming', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('processing');
    //     });
    //
    //     invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
    //         console.log('invoice Rejected', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('success');
    //     });
    //
    //     invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
    //         console.log('invoice Cancelled', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('success');
    //     });
    //
    //     invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
    //         console.log('invoice Expired', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('success');
    //     });
    //
    //     invoiceWS.on(InvoiceStatus.Success, (invoice) => {
    //         console.log('invoice Success', invoice);
    //         this.invoice = invoice;
    //         this.dispatchInvoiceChangedEvent(invoice.status, invoice);
    //         this.goToStep('success');
    //     });
    // }

    private nextStep() {

        // if (this.appStep === 'preview') {
        //     if (!this.selectedTokenSymbol || !this.selectedNetworkSymbol) {
        //         return;
        //     }
        //
        //     this.priceStep = (this.priceAvailable) ? 'messageEnter' : 'priceEnter'
        //
        //     this.goToStep('setPrice');
        //     return;
        //
        // }
        //
        // if (this.appStep === 'setPrice') {
        //
        //     if (this.priceStep === 'priceEnter' && (!this.price || Number(this.price) < 1)) {
        //         return;
        //     }
        //     if (this.priceStep === 'messageEnter' && this.payloadMessage && (this.invoiceMessage.trim() === '' || this.invoiceMessage.length > 124)) {
        //         return;
        //     }
        //     if (this.priceStep === 'messageEnter' && this.payloadMessage && this.invoiceMessage.length > 124) {
        //         return;
        //     }
        //
        //     if (this.priceStep === 'priceEnter') {
        //         this.price = parseFloat(this.price).toFixed(2);
        //
        //         if (this.payloadMessage) {
        //             this.priceStep = 'messageEnter';
        //             return;
        //         }
        //
        //         if (this.noPreview === 'true' && !this.tokenAvailable) {
        //             this.goToStep('setToken');
        //             return;
        //         }
        //
        //         this.goToStep('setWallet');
        //         return;
        //     }
        //
        //     if (this.priceStep === 'messageEnter') {
        //
        //         if (this.noPreview === 'true' && !this.tokenAvailable) {
        //             this.goToStep('setToken');
        //             return;
        //         }
        //
        //         this.goToStep('setWallet');
        //         return;
        //
        //     }
        //
        // }
        //
        // if (this.appStep === 'setToken' && this.selectedTokenSymbol && this.selectedNetworkSymbol) {
        //     this.goToStep('setWallet');
        //     return;
        // }
        //
        // if (this.appStep === 'setWallet' && this.walletAddress && !checkWalletAddress(this.walletAddress, this.selectedNetworkSymbol)) {
        //     this.notificationData = {
        //         title: 'Invalid Wallet Address',
        //         text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
        //         buttonText: 'Confirm'
        //     };
        //     this.notificationShow = true;
        //
        //     this.dispatchErrorEvent('Invalid Wallet Address', 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.');
        // }
        //
        // if (this.appStep === 'setWallet' && this.walletAddress && checkWalletAddress(this.walletAddress, this.selectedNetworkSymbol)) {
        //
        //     this.creatingInvoice = true;
        //     // this.createInvoice();
        //
        // }

        ///////////////////////

        if (this.appStep === 'typeSelect' && this.invoiceType) {
            switch (this.invoiceType) {
                case "request":
                    this.goToStep('newSetPrice');
                    return;
                case "item":
                    this.goToStep('setProduct');
                    return;
                case "cart":
                    this.goToStep('setCart');
                    return;
                default:
                    return;
            }
        }

        if (this.appStep === 'newSetPrice' && this.invoicePrice && Number(this.invoicePrice) >= 1) {

            this.invoicePrice = parseFloat(this.invoicePrice).toFixed(2);
            this.createInvoice();
            return;
        }

        if (this.appStep === 'setProduct' && this.invoiceProductId) {
            this.createInvoice();
            return;
        }

        if (this.appStep === 'setCart' && this.invoiceCart.length > 0) {
            this.createInvoice();
            return;
        }

        if (this.appStep === 'showInvoice' && this.selectedToken && this.selectedNetwork) {
            this.creatingTransaction = false;
            this.goToStep('setNewWallet');
            return;
        }

        if(this.appStep === 'setNewWallet' && this.walletAddress && !checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')){
            this.notificationData = {
                title: 'Invalid Wallet Address',
                text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Invalid Wallet Address', 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.');
            return;
        }

        if(this.appStep === 'setNewWallet' && this.walletAddress && checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')){
            this.createTransaction();
            return;
        }
    }

    private async prevStep() {

        // if (this.appStep === 'setToken') {
        //
        //     if (this.priceAvailable && this.noPreview === 'true') {
        //         this.goToStep('setPrice');
        //         return;
        //     }
        //
        //     this.goToStep('setPrice');
        //     return;
        //
        // }

        // if (this.appStep === 'setWallet') {
        //
        //     this.walletAddress = '';
        //     this.walletType = '';
        //
        //     if (this.noPreview === 'true' && this.tokenAvailable) {
        //         this.goToStep('setPrice');
        //         return;
        //     }
        //
        //     if (this.noPreview === 'true' && !this.tokenAvailable) {
        //         this.goToStep('setToken');
        //         return;
        //     }
        //
        //     this.goToStep('preview');
        //     return;
        //
        // }

        ///////////////////////

        if (this.appStep === 'newSetPrice') {
            this.goToStep('typeSelect');
            return;
        }

        if (this.appStep === 'setProduct') {
            this.goToStep('typeSelect');
            return;
        }

        if (this.appStep === 'setCart') {
            this.goToStep('typeSelect');
            return;
        }

        if (this.appStep === 'setNewWallet') {
            this.goToStep('showInvoice');
            return;
        }

        if (this.appStep === 'payment') {
            this.goToStep('showInvoice');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'processing') {
            this.goToStep('showInvoice');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'success') {
            this.goToStep('showInvoice');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }
    }

    private goToStep(stepName: AppStep) {
        this.appStep = stepName;
    }

    // private setTransaction(transaction: Transaction){
    //     this.transaction = transaction;
    //     // if(!this.transactionInterval){
    //     //     this.transactionInterval = setInterval(() => this.updateTransaction(), 3000)
    //     // }
    // }

    // private async updateTransaction(){
    //     try {
    //         const updatedTransaction = await this.API.transaction.get(this.transaction?.id);
    //         if(updatedTransaction){
    //             this.transaction = updatedTransaction;
    //         }
    //     }catch (e){
    //         console.log('e', e)
    //     }
    // }

    private async getApp() {
        try {
            const result = await this.API.app.get(this.appId);
            return result;
        } catch (error) {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app data. Please try again later.';
            this.goToStep('error');
            this.dispatchErrorEvent('Fetch App Error', 'Failed to retrieve app data. Please try again later.');
        }
    }

    private async getTokens(appId: string) {
        try {
            const result: Cryptocurrency[] = await this.API.cryptocurrency.list({
                appId: appId,
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

    private async getProducts() {
        try {
            const result: Product[] = await this.API.product.list(this.appId);
            return result;
        } catch (error) {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app products data. Please try again later.';
            this.dispatchErrorEvent('Fetch Products Error', 'Failed to retrieve app products data. Please try again later.');
            return 'error';
        }
    }

    // private async getProductsInfo(products: IProductInvoice[]) {
    //     const result = [];
    //     for (let product of products) {
    //
    //         try {
    //             const productId = product.id || product.product?.id;
    //             const info = await this.API.product.get(productId);
    //             const count = products.find((item) => item.id === productId)?.count || product.count;
    //
    //             if (info) {
    //                 result.push({
    //                     ...info,
    //                     count: count
    //                 });
    //             }
    //
    //         } catch (e) {
    //             this.notificationData = {
    //                 title: 'Get Products Failed',
    //                 text: 'Failed to retrieve data for some products.',
    //                 buttonText: 'Confirm'
    //             };
    //             this.notificationShow = true;
    //
    //             this.dispatchErrorEvent('Fetch Products Error', 'Failed to retrieve data for some products.');
    //         }
    //     }
    //
    //     return result;
    // }

    // private dispatchInvoiceChangedEvent(status: string, invoice: Invoice) {
    //     const updateStatusEvent = new CustomEvent(`${status}-status-changed`, {
    //         detail: {
    //             invoice: invoice
    //         },
    //         bubbles: true,
    //         composed: true
    //     });
    //     this.dispatchEvent(updateStatusEvent);
    // }

    private dispatchInvoiceCreatedEvent(invoiceId: string) {
        const invoiceCreatedEvent = new CustomEvent(`invoice-created`, {
            detail: {
                invoiceId: invoiceId
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(invoiceCreatedEvent);
    }

    private dispatchErrorEvent(title: string, text: string) {
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

    /////////////////

    private async createInvoice() {

        this.creatingInvoice = true;

        const invoiceParams: any = {
            appId: this.appId,
            type: 'payment',
            clientId: generateUUID(),
            currency: 'USD',
        }

        switch (this.invoiceType) {
            case "request":
                invoiceParams.total = Number(this.invoicePrice);
                break;
            case "item":
                invoiceParams.products = [{
                    id: this.invoiceProductId,
                    count: 1
                }]
                break;
            case "cart":
                invoiceParams.products = this.invoiceCart;
                break;
            default:
                return;
        }

        try {
            const invoice = await this.API.invoice.create(invoiceParams, true);
            const fullInvoice = await this.API.invoice.get(invoice.id, true);

            if (fullInvoice.id) {
                // this.invoice = fullInvoice;
                this.dispatchInvoiceCreatedEvent(fullInvoice.id);
            }
        } catch (e) {

            if (e instanceof ValidationError) {
                const error = e as ValidationError<InvoiceCreateErrors>;
                console.log(error.errors);
            }

            if (e instanceof HttpError) {
                const error = e as HttpError;
                console.log(error.code);
            }

            this.notificationData = {
                title: 'Invoice create failed',
                text: 'Failed to create invoice. Please, try again later',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;
            this.creatingInvoice = false;

        }

    }
    private async createTransaction() {

        this.creatingTransaction = true;

        const transactionParams = {
            invoiceId: this.invoice?.id,
            from: this.walletAddress,
            network: this.selectedNetwork?.symbol,
            cryptocurrency: this.selectedToken?.symbol
        }

        try {
            this.transaction = await this.API.transaction.create(transactionParams);
            // this.cancelingTransaction = false;
            // this.goToStep('payment');

            // if(!this.transactionInterval){
            //     this.transactionInterval = setInterval(() => this.updateTransaction(), 3000)
            // }

        }catch (e) {
            if (e instanceof ValidationError) {
                const error = e as ValidationError<TransactionCreateErrors>;
                console.log(error.errors);
            }

            if (e instanceof HttpError) {
                const error = e as HttpError;
                console.log(error.code);
            }

            this.notificationData = {
                title: 'Transaction create failed',
                text: 'Failed to create transaction. Please, try again later',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;
            this.creatingTransaction = false;
        }

    }
    private async cancelTransaction() {

        if (!this.transaction?.id) {

            this.notificationData = {
                title: 'Error',
                text: 'Unable to retrieve the ID of transaction. Please try again later.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;
            this.dispatchErrorEvent('Transaction Canceling Error', 'Unable to retrieve the ID of transaction. Please try again later.');
            return;
        }

        try {
            this.cancelingTransaction = true;
            await this.API.transaction.cancel(this.transaction?.id);

            // if(!this.transactionInterval){
            //     this.transactionInterval = setInterval(() => this.updateTransaction(), 3000)
            // }

        } catch (error) {

            this.notificationData = {
                title: 'Error',
                text: 'Failed to cancel the invoice. Please try again later.',
                buttonText: 'Confirm'
            };
            this.cancelingTransaction = false;
            this.dispatchErrorEvent('Invoice Canceling Error', 'Failed to cancel the invoice. Please try again later.');
            return;

        }
    }

    private async getInvoice(invoiceId: string) {
        try {
            this.invoice = await this.API.invoice.get(invoiceId, true);
        } catch (e) {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve invoice data. Please try again later.';
            this.dispatchErrorEvent('Fetch Invoice Error', 'Failed to retrieve invoice data. Please try again later.');
            return 'error';
        }
    }
    private async getTransaction(transactionId: string) {
        try {
            this.transaction = await this.API.transaction.get(transactionId);

            // if(!this.transactionInterval){
            //     this.transactionInterval = setInterval(() => this.updateTransaction(), 3000)
            // }

        } catch (e) {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve transaction data. Please try again later.';
            this.dispatchErrorEvent('Fetch Transaction Error', 'Failed to retrieve transaction data. Please try again later.');
            return 'error';
        }
    }
    private async getInvoiceTransactions(invoiceId: string){

        try {
            this.invoiceTransactions = await this.API.transaction.list({
                invoiceId
            })
        }catch (e) {
            this.notificationData = {
                title: 'Get Invoice Transactions Failed',
                text: 'Failed to retrieve transactions of invoice.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Fetch Invoice Transactions Error', 'Failed to retrieve transactions of invoice.');
        }

    }

    private async subscribeInvoice(invoiceId: string){
        if(!invoiceId){
            return;
        }

        const ws = new WsClient();
        const invoiceChannel = ws.invoice(invoiceId);
        const transactionsChannel = ws.invoiceTransaction(invoiceId);

        invoiceChannel.on(InvoiceEventType.Success, (invoiceData) => {
            this.getInvoice(invoiceData.id);
        })

        transactionsChannel.on(TransactionEventType.Created, (transactionData) => {

            // console.log('Created', transactionData)
            //
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Processing, (transactionData) => {

            // console.log('Processing', transactionData)
            //
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Confirming, (transactionData) => {
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Rejected, (transactionData) => {
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Expired, (transactionData) => {
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Canceled, (transactionData) => {
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Success, (transactionData) => {
            // if(this.onlyTransaction && this.transactionId === transactionData.id){
            //     this.transaction = transactionData;
            //     // this.getTransaction(this.transactionId);
            //     return;
            // }
            //
            // if(!this.onlyTransaction){
            //
            //     if(this.transaction && this.transaction.id === transactionData.id){
            //         this.transaction = transactionData;
            //     }
            //
            //     this.getInvoiceTransactions(transactionData.invoiceId);
            //     return;
            //
            // }

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })

    }
    private goToTransactionStep(transactionStatus: TransactionStatus){
        switch (transactionStatus) {
            case "processing":
                if(this.appStep !== 'payment'){
                    this.goToStep('payment');
                }
                return;
            case "confirming":
                if(this.appStep !== 'processing'){
                    this.goToStep('processing');
                }
                return;
            case "rejected":
            case "canceled":
            case "success":
            case "expired":
                if(this.appStep !== 'success'){
                    this.goToStep('success');
                }
                return;
            default:
                break;
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'payment-app': PaymentApp;
    }
}
