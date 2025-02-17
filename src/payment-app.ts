import {
    Client,
    Cryptocurrency,
    HttpError,
    Invoice, InvoiceCreateErrors, InvoiceEventType,
    Network, Product, Transaction, TransactionCreateErrors, TransactionEventType,
    ValidationError, WsClient, TransactionStatus, UserProfile
} from '@simplepay-ai/api-client';
import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {
    AppStep,
    AppTheme,
    ICartProduct,
    INotification, InvoiceType, IOpenButton,
    OpenMode, PaymentPageStep, ViewMode,
    WalletType
} from './lib/types.ts';
import './components/widget-layout/main-header.ts';
import './components/widget-layout/main-footer.ts';
import './components/widget-layout/success-footer.ts';
import './components/widget-layout/steps/loading-step.ts';
import './components/widget-layout/steps/error-step.ts';
import './components/widget-layout/steps/payment-step.ts';
import './components/widget-layout/steps/success-step.ts';
import './components/widget-layout/steps/processing-step.ts';
import './components/ui/token-icon.ts';
import './components/ui/network-icon.ts';
import './components/ui/custom-notification.ts';
import './components/widget-layout/steps/select-type-step.ts';
import './components/widget-layout/steps/price-step.ts';
import './components/widget-layout/steps/product-step.ts';
import './components/widget-layout/steps/cart-step.ts';
import './components/widget-layout/steps/invoice-step.ts';
import './components/widget-layout/steps/wallet-step.ts';
import './components/widget-layout/steps/created-invoice-step.ts';

import './components/payment-page-layout/loading-step-payment-page.ts';
import './components/payment-page-layout/error-step-payment-page.ts';
import './components/payment-page-layout/invoice-info.ts';
import './components/payment-page-layout/token-select-form.ts';
import './components/payment-page-layout/address-form.ts';
import './components/payment-page-layout/toast-notification.ts';
import './components/payment-page-layout/transactions-history.ts';
import './components/payment-page-layout/completed-transaction.ts';
import './components/payment-page-layout/awaiting-payment-transaction.ts';
import './components/payment-page-layout/processing-transaction.ts';

import {checkWalletAddress, generateUUID} from "./lib/util.ts";
import themesConfig from '../themesConfig.json';
//@ts-ignore
import style from "./styles/payment-app.css?inline";
import axios from "axios";

@customElement('payment-app')
export class PaymentApp extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: String})
    viewMode: ViewMode = 'relative';

    @property({type: String})
    trigger: string | null = null;

    @property({type: String})
    triggerConfig: string | null = null;

    @property({type: String})
    tokenSymbol: string = '';

    @property({type: String})
    networkSymbol: string = '';

    @property({type: String})
    clientId: string = '';

    @property({type: String})
    theme: AppTheme = 'light';

    @property({type: String})
    backToStoreUrl: string = '';

    @property({type: String})
    appId: string = '';

    @property({type: String})
    invoiceId: string = '';

    @property({type: String})
    transactionId: string = '';

    @property({type: String})
    paymentType: InvoiceType | '' = '';

    @property({type: String})
    experimental: string = '';

    ///////////////////

    @property({attribute: false, type: String})
    private openMode: OpenMode = 'auto';

    @property({attribute: false, type: Object})
    private openButtonParams: IOpenButton = {
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        title: 'Pay in crypto'
    };

    @property({attribute: false})
    private appStep: AppStep = 'loadingStep';

    @property({attribute: false})
    private paymentPageStep: PaymentPageStep = 'loadingStep';

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
    private notificationData: INotification | null = null

    @property({attribute: false})
    private cancelingTransaction: Boolean = false;

    @property({attribute: false})
    private connectorPaymentAwaiting: Boolean = false;

    @property({attribute: false})
    private walletType: WalletType | '' = '';

    @property({attribute: false})
    private walletConnectorConfig = null;

    @property({attribute: false})
    private showPaymentModal: boolean = false;

    @property({attribute: false})
    private showPaymentModalOverlay: boolean = false;

    @property({attribute: false})
    private showPaymentModalContent: boolean = false;

    @property({attribute: false})
    private appInfo: any;

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

    @property({attribute: false})
    private onlyTransaction: boolean = false;

    @property({attribute: false})
    private paymentTypeSelected: boolean = false;

    @property({attribute: false})
    private newAppInvoice: Invoice | null = null;

    @property({attribute: false, type: Boolean})
    private isExperimentalMode: boolean = false;

    @property({attribute: false})
    private user: any = null;

    @property({attribute: false})
    private userProfile: UserProfile | null = null;

    @property({attribute: false, type: Boolean})
    private loginLoading: boolean = false;

    @property({attribute: false, type: Object})
    private tronWalletConnect = null;

    @property({attribute: false, type: Object})
    private tronLinkConfig = null;

    @property({attribute: false, type: Object})
    private tronWeb = null;

    @property({attribute: false, type: Object})
    activeTransaction: Transaction | null = null;

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

        this.isExperimentalMode = this.experimental === 'true';

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

        if (this.viewMode !== 'modal' && this.viewMode !== 'paymentPage' && this.viewMode !== 'relative') {
            this.errorTitle = 'Error';
            this.errorText =
                'Invalid viewMode: the provided attribute is not valid. Please ensure it matches one of the supported view modes: modal or relative (default).';
            this.goToWidgetStep('errorStep');
            this.dispatchErrorEvent('View Mode Error', 'Invalid viewMode: the provided attribute is not valid. Please ensure it matches one of the supported view modes: modal, paymentPage or relative (default).');

            return;
        }

        if (this.viewMode === 'modal') {
            this.openMode = 'modal'
        }

        if (this.viewMode === 'modal' && this.trigger === '') {
            this.errorTitle = 'Error';
            this.errorText =
                'Invalid trigger: the provided attribute is empty.';
            this.goToWidgetStep('errorStep');
            this.dispatchErrorEvent('Trigger Error', 'Invalid trigger: the provided attribute is empty.');

            return;
        }

        if (this.viewMode === 'modal' && this.trigger !== null && this.trigger !== '' && this.trigger !== 'button') {
            this.openMode = 'trigger';

            const triggerElement = document.getElementById(`${this.trigger}`);
            if (triggerElement) {
                triggerElement.addEventListener('click', () => this.openPaymentModal());
            }
        }

        if (this.viewMode === 'modal' && this.trigger !== null && this.trigger !== '' && this.trigger === 'button') {
            this.openMode = 'button'

            const buttonParams = (this.triggerConfig) ? JSON.parse(this.triggerConfig) : null;

            this.openButtonParams = {
                backgroundColor: (buttonParams && buttonParams.backgroundColor) ? buttonParams.backgroundColor : '#3b82f6',
                textColor: (buttonParams && buttonParams.textColor) ? buttonParams.textColor : '#ffffff',
                title: (buttonParams && buttonParams.title) ? buttonParams.title : 'Pay in crypto'
            }
        }

        if (this.viewMode === 'paymentPage') {
            this.openMode = 'paymentPage'
        }

        if (this.viewMode === 'paymentPage' && (!this.invoiceId && !this.transactionId)) {
            this.errorTitle = 'View Mode Error';
            this.errorText =
                'The paymentPage display mode is currently available only for viewing invoices and transactions. To access invoice creation options, please use the relative (default) or modal display mode.';
            this.goToPaymentPageStep('errorStep');
            this.dispatchErrorEvent('View Mode Error', 'The paymentPage display mode is currently available only for viewing invoices and transactions. To access invoice creation options, please use the relative (default) or modal display mode.');

            return;
        }

        if (this.clientId) {

            const isUUID = this.checkUUID(this.clientId);
            const isNumber = Boolean(Number(this.clientId));

            if (!isUUID && !isNumber) {
                this.errorTitle = 'Error';
                this.errorText =
                    'Invalid clientId: it must be either a number or a valid UUID v4 format.';
                this.goToWidgetStep('errorStep');
                this.goToPaymentPageStep('errorStep')
                this.dispatchErrorEvent('Client ID Error', 'Invalid clientId: it must be either a number or a valid UUID v4 format.');

                return;
            }

        } else {
            this.clientId = generateUUID();
        }

        if (this.invoiceId || this.transactionId) {

            this.API = new Client();

            if (this.transactionId) {
                this.onlyTransaction = true;
                this.getTransaction(this.transactionId).then((data) => {

                    if (data === 'error') {
                        this.errorTitle = 'Error';
                        this.errorText =
                            'Failed to retrieve transaction data. Please try again later.';
                        this.goToWidgetStep('errorStep');
                        this.goToPaymentPageStep('errorStep')
                        this.dispatchErrorEvent('Fetch Transaction Error', 'Failed to retrieve transaction data. Please try again later.');
                        return;
                    }

                    if (this.transaction) {
                        this.getInvoice(this.transaction?.invoiceId || '').then(async (data) => {

                            if (data === 'error') {
                                this.errorTitle = 'Error';
                                this.errorText =
                                    'Failed to retrieve invoice data. Please try again later.';
                                this.goToWidgetStep('errorStep');
                                this.goToPaymentPageStep('errorStep')
                                this.dispatchErrorEvent('Fetch Invoice Error', 'Failed to retrieve invoice data. Please try again later.');
                                return;
                            }


                            this.tokens = await this.getTokens(this.invoice?.app?.id || '')

                            // if (this.tokens && this.tokens.length === 0) {
                            //     this.errorTitle = 'Error';
                            //     this.errorText =
                            //         'Currently, there are no tokens available for selection as a payment option on this project.';
                            //     this.goToWidgetStep('errorStep');
                            //     this.dispatchErrorEvent('Empty Tokens', 'Currently, there are no tokens available for selection as a payment option on this project.');
                            //
                            //     return;
                            // }

                            this.getInvoiceTransactions(this.invoice?.id || '').then(() => {
                                this.subscribeInvoice(this.invoice?.id || '')

                                if (this.isExperimentalMode) {
                                    this.checkUser();
                                }
                            });
                        })
                    }
                });
                return;
            } else {

                this.getInvoice(this.invoiceId).then(async (data) => {

                    if (data === 'error') {
                        this.errorTitle = 'Error';
                        this.errorText =
                            'Failed to retrieve invoice data. Please try again later.';
                        this.goToWidgetStep('errorStep');
                        this.goToPaymentPageStep('errorStep')
                        this.dispatchErrorEvent('Fetch Invoice Error', 'Failed to retrieve invoice data. Please try again later.');
                        return;
                    }

                    this.tokens = await this.getTokens(this.invoice?.app?.id || '')

                    // if (this.tokens && this.tokens.length === 0) {
                    //     this.errorTitle = 'Error';
                    //     this.errorText =
                    //         'Currently, there are no tokens available for selection as a payment option on this project.';
                    //     this.goToWidgetStep('errorStep');
                    //     this.dispatchErrorEvent('Empty Tokens', 'Currently, there are no tokens available for selection as a payment option on this project.');
                    //
                    //     return;
                    // }
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

                            this.goToWidgetStep('errorStep');
                            this.goToPaymentPageStep('errorStep')

                            return;
                        }

                        if (defaultToken && defaultNetwork) {
                            this.selectedToken = defaultToken;
                            this.selectedNetwork = defaultNetwork;
                            this.tokenAvailable = true;
                        }

                    }
                }).then(() => {
                    if (this.invoice) {
                        this.getInvoiceTransactions(this.invoiceId).then(() => {
                            this.subscribeInvoice(this.invoiceId).then(() => {
                                this.goToWidgetStep('invoiceStep');
                                this.goToPaymentPageStep('invoiceStep')

                                if (this.isExperimentalMode) {
                                    this.checkUser();
                                }

                            })
                        });
                    }
                });

                return;
            }

        }

        if (!this.appId) {
            this.errorTitle = 'Empty appId';
            this.errorText =
                'You did not pass the appId. In order to continue, the appId field must be filled in.';

            this.goToWidgetStep('errorStep');
            this.goToPaymentPageStep('errorStep')

            return;
        }

        this.API = new Client({
            apiKey: this.appId
        });

        const appInfoResult = await this.getApp();
        if (appInfoResult === 'error') {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app data. Please try again later.';
            this.goToWidgetStep('errorStep');
            this.goToPaymentPageStep('errorStep')
            this.dispatchErrorEvent('Fetch App Error', 'Failed to retrieve app data. Please try again later.');
            return;
        }

        const products = await this.getProducts();
        if (products === 'error') {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app products data. Please try again later.';
            this.goToWidgetStep('errorStep');
            this.goToPaymentPageStep('errorStep')
            this.dispatchErrorEvent('Fetch Products Error', 'Failed to retrieve app products data. Please try again later.');
            return;
        }

        this.appInfo = appInfoResult;//await this.getApp();
        this.appProducts = products;

        if (this.paymentType) {
            switch (this.paymentType) {
                case "request":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToWidgetStep('priceStep');
                    return;
                case "item":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToWidgetStep('productStep');
                    return;
                case "cart":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToWidgetStep('cartStep');
                    return;
            }
        }

        this.goToWidgetStep('selectTypeStep');

        return;
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('transaction') && this.transaction?.id && !this.onlyTransaction) {
            this.goToTransactionStep(this.transaction.status);
        }

        if ((changedProperties.has('transaction') || changedProperties.has('invoice')) && this.transaction && this.onlyTransaction) {
            if (this.invoice?.id) {
                this.goToTransactionStep(this.transaction.status);
            }
        }

        if (changedProperties.has('user')) {
            this.getUserProfile();
        }

        if (changedProperties.has('invoiceTransactions') && this.invoiceTransactions.length > 0) {
            const transaction = this.invoiceTransactions.find((item) => item.status === 'created' || item.status === 'processing' || item.status === 'confirming')
            this.activeTransaction = (transaction) ? transaction : null;

            if (!transaction) {
                this.cancelingTransaction = false;
            }
        }
    }

    render() {
        const widgetContent = html`
            ${this.appStep === 'loadingStep'
                    ? html`
                        <loading-step></loading-step>`
                    : ''}
            ${this.appStep === 'errorStep'
                    ? html`
                        <error-step
                                .title=${this.errorTitle}
                                .text=${this.errorText}
                        ></error-step>`
                    : ''}

            ${this.appStep === 'selectTypeStep'
                    ? html`
                        <select-type-step
                                .invoiceType=${this.invoiceType}
                                @updateInvoiceType=${(event: CustomEvent) => (this.invoiceType = event.detail.invoiceType)}
                                @nextStep=${this.nextStep}
                        ></select-type-step>`
                    : ''
            }

            ${this.appStep === 'priceStep'
                    ? html`
                        <price-step
                                .appInfo=${this.appInfo}
                                .price=${this.invoicePrice}
                                .creatingInvoice=${this.creatingInvoice}
                                .paymentTypeSelected=${this.paymentTypeSelected}
                                @updatePrice=${(event: CustomEvent) => (this.invoicePrice = event.detail.price)}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                        ></price-step>`
                    : ''
            }

            ${this.appStep === 'productStep'
                    ? html`
                        <product-step
                                .products=${this.appProducts}
                                .invoiceProductId=${this.invoiceProductId}
                                .creatingInvoice=${this.creatingInvoice}
                                .paymentTypeSelected=${this.paymentTypeSelected}
                                @updateInvoiceProductId=${(event: CustomEvent) => (this.invoiceProductId = event.detail.invoiceProductId)}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                                @updateNotification=${(event: CustomEvent) => this.updateNotification(event)}
                        ></product-step>`
                    : ''
            }

            ${this.appStep === 'cartStep'
                    ? html`
                        <cart-step
                                .products=${this.appProducts}
                                .cart=${this.invoiceCart}
                                .creatingInvoice=${this.creatingInvoice}
                                .paymentTypeSelected=${this.paymentTypeSelected}
                                @addToCart=${(event: CustomEvent) => this.addToCart(event.detail.productId)}
                                @removeFromCart=${(event: CustomEvent) => this.removeFromCart(event.detail.productId)}
                                @nextStep=${this.nextStep}
                                @prevStep=${this.prevStep}
                                @updateNotification=${(event: CustomEvent) => this.updateNotification(event)}
                        ></cart-step>`
                    : ''
            }

            ${this.appStep === 'createdInvoiceStep'
                    ? html`
                        <created-invoice-step
                                .invoice=${this.newAppInvoice}
                                @prevStep=${this.prevStep}
                        ></created-invoice-step>`
                    : ''
            }

            ${this.appStep === 'invoiceStep'
                    ? html`
                        <invoice-step
                                .invoice=${this.invoice}
                                .selectedToken=${this.selectedToken}
                                .selectedNetwork=${this.selectedNetwork}
                                .tokens=${this.tokens}
                                .tokenAvailable=${this.tokenAvailable}
                                .transactions=${this.invoiceTransactions}
                                .experimentalMode=${this.isExperimentalMode}
                                .user=${this.user}
                                .userProfile=${this.userProfile}
                                .loginLoading=${this.loginLoading}
                                @nextStep=${this.nextStep}
                                @updateSelectedToken=${(event: CustomEvent) => {
                                    this.selectedToken = event.detail.token;
                                    this.selectedNetwork = event.detail.network;
                                }}
                                @updateSelectedTransaction=${(event: CustomEvent) => {
                                    const transaction = this.invoiceTransactions.find((item) => item.id === event.detail.transactionId);
                                    if (transaction) {
                                        this.transaction = transaction
                                    }
                                }}
                                @login=${this.login}
                        >
                        </invoice-step>`
                    : ''}

            ${this.appStep === 'walletStep'
                    ? html`
                        <wallet-step
                                .invoice=${this.invoice}
                                .creatingTransaction=${this.creatingTransaction}
                                .walletAddress=${this.walletAddress}
                                .walletType=${this.walletType}
                                .selectedToken=${this.selectedToken}
                                .selectedNetwork=${this.selectedNetwork}
                                .walletConnectorConfig=${this.walletConnectorConfig}
                                .tronWalletConnect=${this.tronWalletConnect}
                                .tronLinkConfig=${this.tronLinkConfig}
                                .tronWeb=${this.tronWeb}
                                .theme=${this.theme}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                                @updateWalletType=${(event: CustomEvent) =>
                                        (this.walletType = event.detail.walletType)}
                                @updateWalletAddress=${(event: CustomEvent) =>
                                        (this.walletAddress = event.detail.walletAddress)}
                                @updateWalletConnectorConfig=${(event: CustomEvent) => {
                                    this.walletConnectorConfig = event.detail.walletConnectorConfig
                                }}
                                @updateTronWalletConnect=${(event: CustomEvent) => {
                                    this.tronWalletConnect = event.detail.tronWalletConnect
                                }}
                                @updateTronLinkConfig=${(event: CustomEvent) => {
                                    this.tronLinkConfig = event.detail.tronLinkConfig
                                }}
                                @updateTronWeb=${(event: CustomEvent) => {
                                    this.tronWeb = event.detail.tronWeb
                                }}
                                @nextStep=${this.nextStep}
                                @returnBack=${this.prevStep}
                        >
                        </wallet-step>`
                    : ''}

            ${this.appStep === 'paymentStep'
                    ? html`
                        <payment-step
                                .transaction=${this.transaction}
                                .walletAddress=${this.walletAddress}
                                .invoice=${this.invoice}
                                .cancelingTransaction=${this.cancelingTransaction}
                                .connectorPaymentAwaiting=${this.connectorPaymentAwaiting}
                                .walletType=${this.walletType}
                                .walletConnectorConfig=${(this.walletType === 'Custom') ? null : this.walletConnectorConfig}
                                .tronWalletConnect=${(this.walletType === 'Custom') ? null : this.tronWalletConnect}
                                .tronLinkConfig=${(this.walletType === 'Custom') ? null : this.tronLinkConfig}
                                .tronWeb=${(this.walletType === 'Custom') ? null : this.tronWeb}
                                .hasReturnBack=${!this.onlyTransaction}
                                @cancelTransaction=${this.cancelTransaction}
                                @updatePaymentAwaiting=${(event: CustomEvent) =>
                                        (this.connectorPaymentAwaiting = event.detail.connectorPaymentAwaiting)}
                                @updateNotification=${(event: CustomEvent) =>
                                        this.updateNotification(event)}
                                @returnBack=${this.prevStep}
                        ></payment-step>`
                    : ''}
            ${this.appStep === 'processingStep'
                    ? html`
                        <processing-step
                                .invoice=${this.invoice}
                                .transaction=${this.transaction}
                                .hasReturnBack=${!this.onlyTransaction}
                                @nextStep=${this.nextStep}
                                @returnBack=${this.prevStep}
                        ></processing-step>`
                    : ''}
            ${this.appStep === 'successStep'
                    ? html`
                        <success-step
                                .invoice=${this.invoice}
                                .transaction=${this.transaction}
                                .backToStoreUrl=${this.backToStoreUrl}
                                .hasReturnBack=${!this.onlyTransaction}
                                @returnBack=${this.prevStep}
                        ></success-step>`
                    : ''}

            <custom-notification
                    .active=${this.notificationShow}
                    .data=${this.notificationData}
                    .dark=${this.theme === 'dark'}
                    @updateNotification=${this.updateNotification}
            ></custom-notification>
        `
        const paymentPageContent = html`

            ${this.paymentPageStep === 'loadingStep'
                    ? html`
                        <loading-step-payment-page></loading-step-payment-page>`
                    : ''}

            ${this.paymentPageStep === 'errorStep'
                    ? html`
                        <error-step-payment-page
                                .title=${this.errorTitle}
                                .text=${this.errorText}
                        ></error-step-payment-page>`
                    : ''}

            ${['invoiceStep', 'transactionsHistoryStep', 'awaitingPaymentStep', 'processingTransactionStep', 'successTransactionStep'].includes(this.paymentPageStep)
                    ? html`
                        <div class=${`paymentPageContent`}>

                            <div class="leftSection">

                                <invoice-info
                                        .theme=${this.theme}
                                        .currentStep=${this.paymentPageStep}
                                        .invoice=${this.invoice}
                                        .user=${this.user}
                                        .userProfile=${this.userProfile}
                                        .loginLoading=${this.loginLoading}
                                        .hasTransactions=${(this.invoiceTransactions) ? this.invoiceTransactions.length > 0 : false}
                                        .hasActiveTransaction=${Boolean(this.activeTransaction)}
                                        @login=${this.login}
                                        @goToStep=${(event: CustomEvent) => {
                                            this.goToPaymentPageStep(event.detail.stepName)
                                            this.transaction = null;
                                        }}
                                        @goToTransactionStep=${() => {
                                            if (this.activeTransaction) {
                                                this.goToTransactionStep(this.activeTransaction.status)
                                            }
                                        }}
                                >
                                </invoice-info>

                            </div>

                            <div class="rightSection">

                                ${
                                        (this.paymentPageStep === 'invoiceStep' && this.invoice?.status === 'active' && !this.activeTransaction)
                                                ? html`
                                                    <div class="createTransactionForm">

                                                        ${
                                                                (this.creatingTransaction)
                                                                        ? html`
                                                                            <div class="creatingTransaction">

                                                                                <div class="spinner">
                                                                                    <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                    >
                                                                                        <circle cx="12" cy="12" r="10"
                                                                                                stroke-width="4"/>
                                                                                        <path
                                                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                                        />
                                                                                    </svg>

                                                                                    <p>Creating transaction ...</p>
                                                                                </div>

                                                                            </div>
                                                                        ` :
                                                                        html`
                                                                            <token-select-form
                                                                                    .tokens=${this.tokens}
                                                                                    .invoice=${this.invoice}
                                                                                    .selectedToken=${this.selectedToken}
                                                                                    .selectedNetwork=${this.selectedNetwork}
                                                                                    .tokenAvailable=${this.tokenAvailable}
                                                                                    @updateSelectedToken=${(event: CustomEvent) => {
                                                                                        this.selectedToken = event.detail.token;
                                                                                        this.selectedNetwork = event.detail.network;
                                                                                    }}
                                                                            ></token-select-form>

                                                                            <address-form
                                                                                    .walletAddress=${this.walletAddress}
                                                                                    .walletType=${this.walletType}
                                                                                    .selectedToken=${this.selectedToken}
                                                                                    .selectedNetwork=${this.selectedNetwork}
                                                                                    .walletConnectorConfig=${this.walletConnectorConfig}
                                                                                    .tronWalletConnect=${this.tronWalletConnect}
                                                                                    .tronLinkConfig=${this.tronLinkConfig}
                                                                                    .tronWeb=${this.tronWeb}
                                                                                    .theme=${this.theme}
                                                                                    @updateWalletType=${(event: CustomEvent) =>
                                                                                            (this.walletType = event.detail.walletType)}
                                                                                    @updateWalletAddress=${(event: CustomEvent) => {
                                                                                        this.walletAddress = event.detail.walletAddress
                                                                                    }}
                                                                                    @updateWalletConnectorConfig=${(event: CustomEvent) => {
                                                                                        this.walletConnectorConfig = event.detail.walletConnectorConfig
                                                                                    }}
                                                                                    @updateTronWalletConnect=${(event: CustomEvent) => {
                                                                                        this.tronWalletConnect = event.detail.tronWalletConnect
                                                                                    }}
                                                                                    @updateTronLinkConfig=${(event: CustomEvent) => {
                                                                                        this.tronLinkConfig = event.detail.tronLinkConfig
                                                                                    }}
                                                                                    @updateTronWeb=${(event: CustomEvent) => {
                                                                                        this.tronWeb = event.detail.tronWeb
                                                                                    }}
                                                                                    @updateNotification=${(event: CustomEvent) =>
                                                                                            this.updateNotification(event)}
                                                                            ></address-form>

                                                                            ${
                                                                                    (this.selectedToken && this.selectedNetwork && this.walletAddress && this.walletType)
                                                                                            ? html`
                                                                                                <button class="mainButton"
                                                                                                        .disabled=${!this.selectedToken || !this.selectedNetwork || !this.walletAddress || !this.walletType}
                                                                                                        @click=${() => this.createTransaction()}
                                                                                                >
                                                                                                    Create Transaction
                                                                                                </button>
                                                                                            ` : ''
                                                                            }
                                                                        `
                                                        }

                                                    </div>
                                                ` : ''
                                }

                                ${
                                        (this.paymentPageStep === 'invoiceStep' && this.invoice?.status === 'active' && this.activeTransaction)
                                                ? html`
                                                    <div class="hasActiveTransaction">

                                                        <div class="message">
                                                            <p>This invoice already has active transaction in progress</p>
                                                        </div>

                                                        <button class="mainButton"
                                                                @click=${() => {
                                                                    this.transaction = this.activeTransaction;
                                                                    this.goToTransactionStep(this.activeTransaction?.status!)
                                                                }}
                                                        >
                                                            To Active Transaction
                                                        </button>

                                                    </div>
                                                ` : ''
                                }

                                ${
                                        (this.paymentPageStep === 'awaitingPaymentStep')
                                                ? html`
                                                    <awaiting-payment-transaction
                                                            .invoice=${this.invoice}
                                                            .transaction=${this.transaction}
                                                            .cancelingTransaction=${this.cancelingTransaction}
                                                            .connectorPaymentAwaiting=${this.connectorPaymentAwaiting}
                                                            .walletType=${this.walletType}
                                                            .walletConnectorConfig=${(this.walletType === 'Custom') ? null : this.walletConnectorConfig}
                                                            .tronWalletConnect=${(this.walletType === 'Custom') ? null : this.tronWalletConnect}
                                                            .tronLinkConfig=${(this.walletType === 'Custom') ? null : this.tronLinkConfig}
                                                            .tronWeb=${(this.walletType === 'Custom') ? null : this.tronWeb}
                                                            @cancelTransaction=${this.cancelTransaction}
                                                            @updatePaymentAwaiting=${(event: CustomEvent) =>
                                                                    (this.connectorPaymentAwaiting = event.detail.connectorPaymentAwaiting)}
                                                            @updateNotification=${(event: CustomEvent) =>
                                                                    this.updateNotification(event)}
                                                            @goToStep=${(event: CustomEvent) => {
                                                                this.goToPaymentPageStep(event.detail.stepName)
                                                                this.transaction = null;
                                                            }}
                                                    >
                                                    </awaiting-payment-transaction>
                                                ` : ''
                                }

                                ${
                                        (this.paymentPageStep === 'processingTransactionStep')
                                                ? html`
                                                    <processing-transaction
                                                            .invoice=${this.invoice}
                                                            .transaction=${this.transaction}
                                                            @goToStep=${(event: CustomEvent) => {
                                                                this.goToPaymentPageStep(event.detail.stepName)
                                                                this.transaction = null;
                                                            }}
                                                    ></processing-transaction>
                                                ` : ''
                                }

                                ${
                                        (this.paymentPageStep === 'successTransactionStep')
                                                ? html`
                                                    <completed-transaction
                                                            .invoice=${this.invoice}
                                                            .transaction=${this.transaction}
                                                            .backToStoreUrl=${this.backToStoreUrl}
                                                            @goToStep=${(event: CustomEvent) => {
                                                                this.goToPaymentPageStep(event.detail.stepName)
                                                                this.transaction = null;
                                                            }}
                                                    ></completed-transaction>
                                                ` : ''
                                }

                                ${
                                        (this.paymentPageStep === 'transactionsHistoryStep' || (this.invoice?.status !== 'active' && this.paymentPageStep === 'invoiceStep'))
                                                ? html`
                                                    <transactions-history
                                                            .invoice=${this.invoice}
                                                            .transactions=${this.invoiceTransactions}
                                                            @goToStep=${(event: CustomEvent) => {
                                                                this.goToPaymentPageStep(event.detail.stepName)
                                                            }}
                                                            @updateSelectedTransaction=${(event: CustomEvent) => {
                                                                const transaction = this.invoiceTransactions.find((item) => item.id === event.detail.transactionId);
                                                                if (transaction) {
                                                                    this.transaction = transaction
                                                                }
                                                            }}
                                                    ></transactions-history>
                                                ` : ''
                                }

                            </div>

                        </div>`
                    : ''}

            <toast-notification
                    .active=${this.notificationShow}
                    .data=${this.notificationData}
                    @updateNotification=${this.updateNotification}
            ></toast-notification>
        `

        if (this.openMode === 'auto') {
            return html`
                <div class=${`stepWrapper`}>
                    ${widgetContent}
                </div>
            `;
        }

        if (this.openMode === 'modal') {
            return html`
                <div class="paymentModal show">
                    <div class="paymentModalOverlay show"></div>
                    <div class="paymentModalContent show">
                        ${widgetContent}
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
                        ${widgetContent}
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
                        ${widgetContent}
                    </div>
                </div>
            `;
        }

        if (this.openMode === 'paymentPage') {
            return html`
                <div class=${`paymentPage ${this.theme}`}>
                    ${paymentPageContent}
                </div>
            `;
        }
    }

    private async login() {

        this.loginLoading = true;

        axios.get('https://api.simplepay.ai/id/sessions/whoami', {withCredentials: true})
            .then((response) => {
                this.user = response.data;
                this.loginLoading = false;
            })
            .catch(() => {
                this.user = null;
                const idApp = 'https://id.simplepay.ai/login';
                const returnHref = location.href;
                location.href = `${idApp}?return_to=${returnHref}`

                this.loginLoading = false;
            })
    }

    private checkUser() {
        this.loginLoading = true;

        axios.get('https://api.simplepay.ai/id/sessions/whoami', {withCredentials: true})
            .then((response) => {
                this.user = response.data;
                this.loginLoading = false;

                // this.saveInvoice();
            })
            .catch(() => {
                this.user = null;
                this.loginLoading = false;
            })
    }

    private async getUserProfile() {
        if (this.API && this.user) {
            try {
                this.userProfile = await this.API.user.profile.get();
            } catch (e) {
                console.log('getUserProfile error', e)
                this.userProfile = null;
            }
        } else {
            this.userProfile = null;
        }
    }

    private async saveInvoice() {
        if (this.API && this.user) {
            await (this.API as Client).app.get(this.invoice?.app?.id || '').then(async () => {
                await (this.API as Client).user.invoice.link({
                    invoiceId: this.invoice?.id || ''
                })
            })
        }
    }

    private checkUUID(id: string) {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(id);
    }

    private addToCart(productId: string) {
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
    }

    private removeFromCart(productId: string) {
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
    }

    private openPaymentModal() {

        document.body.style.overflow = 'hidden';
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
                document.body.style.overflow = 'auto';
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

    private nextStep() {

        if (this.appStep === 'selectTypeStep' && this.invoiceType) {
            switch (this.invoiceType) {
                case "request":
                    this.goToWidgetStep('priceStep');
                    return;
                case "item":
                    this.goToWidgetStep('productStep');
                    return;
                case "cart":
                    this.goToWidgetStep('cartStep');
                    return;
                default:
                    return;
            }
        }

        if (this.appStep === 'priceStep' && this.invoicePrice && Number(this.invoicePrice) >= 1) {

            this.invoicePrice = parseFloat(this.invoicePrice).toFixed(2);
            this.createInvoice();
            return;
        }

        if (this.appStep === 'productStep' && this.invoiceProductId) {
            this.createInvoice();
            return;
        }

        if (this.appStep === 'cartStep' && this.invoiceCart.length > 0) {
            this.createInvoice();
            return;
        }

        if (this.appStep === 'invoiceStep' && this.selectedToken && this.selectedNetwork) {
            this.creatingTransaction = false;
            this.goToWidgetStep('walletStep');
            return;
        }

        if (this.appStep === 'walletStep' && this.walletAddress && !checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')) {
            this.notificationData = {
                title: 'Invalid Wallet Address',
                text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Invalid Wallet Address', 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.');
            return;
        }

        if (this.appStep === 'walletStep' && this.walletAddress && checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')) {
            this.createTransaction();
            return;
        }
    }

    private async prevStep() {

        if (this.appStep === 'priceStep') {
            this.goToWidgetStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'productStep') {
            this.goToWidgetStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'cartStep') {
            this.goToWidgetStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'createdInvoiceStep') {

            if (this.paymentType) {

                switch (this.paymentType) {
                    case "request":
                        this.goToWidgetStep('priceStep');
                        return;
                    case "item":
                        this.goToWidgetStep('productStep');
                        return;
                    case "cart":
                        this.goToWidgetStep('cartStep');
                        return;
                    default:
                        this.goToWidgetStep('selectTypeStep');
                        return;
                }
            }

            this.goToWidgetStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'walletStep') {
            this.goToWidgetStep('invoiceStep');
            return;
        }

        if (this.appStep === 'paymentStep') {
            this.goToWidgetStep('invoiceStep');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'processingStep') {
            this.goToWidgetStep('invoiceStep');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'successStep') {
            this.goToWidgetStep('invoiceStep');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }
    }

    private goToWidgetStep(stepName: AppStep) {
        this.appStep = stepName;
    }

    private goToPaymentPageStep(stepName: PaymentPageStep) {
        this.paymentPageStep = stepName;

        this.cancelingTransaction = false;
        this.creatingTransaction = false;
    }

    private async getApp() {
        try {
            return await this.API.app.get(this.appId);
        } catch (error) {
            return 'error';
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
            this.goToWidgetStep('errorStep');
            this.goToPaymentPageStep('errorStep')
            this.dispatchErrorEvent('Fetch Tokens Error', 'Failed to retrieve token data. Please try again later.');
        }
    }

    private async getProducts() {
        try {
            const result: Product[] = await this.API.product.list(this.appId);
            return result;
        } catch (error) {
            return 'error';
        }
    }

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

    private async createInvoice() {

        this.creatingInvoice = true;

        const invoiceParams: any = {
            appId: this.appId,
            type: 'payment',
            clientId: this.clientId,
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
                this.newAppInvoice = fullInvoice;
                this.dispatchInvoiceCreatedEvent(fullInvoice.id);

                this.goToWidgetStep('createdInvoiceStep');

                this.creatingInvoice = false;
                this.invoicePrice = '0';
                this.invoiceProductId = '';
                this.invoiceCart = [];
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

        } catch (e) {
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

        if (this.user) {
            await this.saveInvoice();
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
            await this.API.transaction.cancel(this.transaction?.id)
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
            return 'error';
        }
    }

    private async getTransaction(transactionId: string) {
        try {
            this.transaction = await this.API.transaction.get(transactionId);
        } catch (e) {
            return 'error';
        }
    }

    private async getInvoiceTransactions(invoiceId: string) {

        try {
            this.invoiceTransactions = await this.API.transaction.list({
                invoiceId
            })
        } catch (e) {
            this.notificationData = {
                title: 'Get Invoice Transactions Failed',
                text: 'Failed to retrieve transactions of invoice.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Fetch Invoice Transactions Error', 'Failed to retrieve transactions of invoice.');
        }

    }

    private async subscribeInvoice(invoiceId: string) {
        if (!invoiceId) {
            return;
        }

        const ws = new WsClient();
        const invoiceChannel = ws.invoice(invoiceId);
        const transactionsChannel = ws.invoiceTransaction(invoiceId);

        invoiceChannel.on(InvoiceEventType.Success, (invoiceData) => {
            this.getInvoice(invoiceData.id);
        })

        transactionsChannel.on(TransactionEventType.Created, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Processing, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Confirming, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Rejected, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Expired, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Canceled, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Success, (transactionData) => {

            if (this.transaction && this.transaction.id === transactionData.id) {
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })

    }

    private goToTransactionStep(transactionStatus: TransactionStatus) {
        switch (transactionStatus) {
            case "processing":

                if (this.openMode === 'paymentPage') {
                    if (this.paymentPageStep !== 'awaitingPaymentStep') {
                        this.goToPaymentPageStep('awaitingPaymentStep')
                    }
                } else {
                    if (this.appStep !== 'paymentStep') {
                        this.goToWidgetStep('paymentStep');
                    }
                }

                return;
            case "confirming":

                if (this.openMode === 'paymentPage') {
                    if (this.paymentPageStep !== 'processingTransactionStep') {
                        this.goToPaymentPageStep('processingTransactionStep')
                    }
                } else {
                    if (this.appStep !== 'processingStep') {
                        this.goToWidgetStep('processingStep');
                    }
                }

                return;
            case "rejected":
            case "canceled":
            case "success":
            case "expired":

                if (this.openMode === 'paymentPage') {
                    if (this.paymentPageStep !== 'successTransactionStep') {
                        this.goToPaymentPageStep('successTransactionStep')
                    }
                } else {
                    if (this.appStep !== 'successStep') {
                        this.goToWidgetStep('successStep');
                    }
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
