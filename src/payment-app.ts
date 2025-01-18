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
    ICartProduct,
    INotification, InvoiceType, IOpenButton,
    OpenMode, ViewMode,
    WalletType
} from './lib/types.ts';
import './components/layout/main-header.ts';
import './components/layout/main-footer.ts';
import './components/layout/success-footer.ts';
import './components/layout/steps/loading-step.ts';
import './components/layout/steps/error-step.ts';
import './components/layout/steps/payment-step.ts';
import './components/layout/steps/success-step.ts';
import './components/layout/steps/processing-step.ts';
import './components/ui/token-icon.ts';
import './components/ui/network-icon.ts';
import './components/ui/custom-notification.ts';
import './components/layout/steps/select-type-step.ts';
import './components/layout/steps/price-step.ts';
import './components/layout/steps/product-step.ts';
import './components/layout/steps/cart-step.ts';
import './components/layout/steps/invoice-step.ts';
import './components/layout/steps/wallet-step.ts';
import './components/layout/steps/created-invoice-step.ts';
import {checkWalletAddress, generateUUID} from "./lib/util.ts";
import themesConfig from '../themesConfig.json';
//@ts-ignore
import style from "./styles/payment-app.css?inline";

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

        if(this.viewMode !== 'modal' && this.viewMode !== 'relative'){
            this.errorTitle = 'Error';
            this.errorText =
                'Invalid viewMode: the provided attribute is not valid. Please ensure it matches one of the supported view modes: modal or relative (default).';
            this.goToStep('errorStep');
            this.dispatchErrorEvent('View Mode Error', 'Invalid viewMode: the provided attribute is not valid. Please ensure it matches one of the supported view modes: modal or relative (default).');

            return;
        }

        if(this.viewMode === 'modal'){
            this.openMode = 'modal'
        }

        if(this.viewMode === 'modal' && this.trigger === ''){
            this.errorTitle = 'Error';
            this.errorText =
                'Invalid trigger: the provided attribute is empty.';
            this.goToStep('errorStep');
            this.dispatchErrorEvent('Trigger Error', 'Invalid trigger: the provided attribute is empty.');

            return;
        }

        if(this.viewMode === 'modal' && this.trigger !== null && this.trigger !== '' && this.trigger !== 'button'){
            this.openMode = 'trigger';

            const triggerElement = document.getElementById(`${this.trigger}`);
            if (triggerElement) {
                triggerElement.addEventListener('click', () => this.openPaymentModal());
            }
        }

        if(this.viewMode === 'modal' && this.trigger !== null && this.trigger !== '' && this.trigger === 'button'){
            this.openMode = 'button'

            const buttonParams = (this.triggerConfig) ? JSON.parse(this.triggerConfig) : null;

            this.openButtonParams = {
                backgroundColor: (buttonParams && buttonParams.backgroundColor) ? buttonParams.backgroundColor : '#3b82f6',
                textColor: (buttonParams && buttonParams.textColor) ? buttonParams.textColor : '#ffffff',
                title: (buttonParams && buttonParams.title) ? buttonParams.title : 'Pay in crypto'
            }
        }

        if(this.clientId){

            const isUUID = this.checkUUID(this.clientId);
            const isNumber = Boolean( Number(this.clientId) );

            if(!isUUID && !isNumber){
                this.errorTitle = 'Error';
                this.errorText =
                    'Invalid clientId: it must be either a number or a valid UUID v4 format.';
                this.goToStep('errorStep');
                this.dispatchErrorEvent('Client ID Error', 'Invalid clientId: it must be either a number or a valid UUID v4 format.');

                return;
            }

        }else{
            this.clientId = generateUUID();
        }

        if(this.invoiceId || this.transactionId) {

            this.API = new Client();

            if (this.transactionId) {
                this.onlyTransaction = true;
                this.getTransaction(this.transactionId).then((data) => {

                    if(data === 'error'){
                        this.errorTitle = 'Error';
                        this.errorText =
                            'Failed to retrieve transaction data. Please try again later.';
                        this.goToStep('errorStep');
                        this.dispatchErrorEvent('Fetch Transaction Error', 'Failed to retrieve transaction data. Please try again later.');
                        return;
                    }

                    if(this.transaction){
                        this.getInvoice(this.transaction?.invoiceId || '').then(async (data) => {

                            if(data === 'error'){
                                this.errorTitle = 'Error';
                                this.errorText =
                                    'Failed to retrieve invoice data. Please try again later.';
                                this.goToStep('errorStep');
                                this.dispatchErrorEvent('Fetch Invoice Error', 'Failed to retrieve invoice data. Please try again later.');
                                return;
                            }


                            this.tokens = await this.getTokens(this.invoice?.app?.id || '')

                            // if (this.tokens && this.tokens.length === 0) {
                            //     this.errorTitle = 'Error';
                            //     this.errorText =
                            //         'Currently, there are no tokens available for selection as a payment option on this project.';
                            //     this.goToStep('errorStep');
                            //     this.dispatchErrorEvent('Empty Tokens', 'Currently, there are no tokens available for selection as a payment option on this project.');
                            //
                            //     return;
                            // }

                            this.getInvoiceTransactions(this.invoice?.id || '').then(() => {
                                this.subscribeInvoice(this.invoice?.id || '')
                            });
                        })
                    }
                });
                return;
            } else {

                this.getInvoice(this.invoiceId).then(async (data) => {

                    if(data === 'error'){
                        this.errorTitle = 'Error';
                        this.errorText =
                            'Failed to retrieve invoice data. Please try again later.';
                        this.goToStep('errorStep');
                        this.dispatchErrorEvent('Fetch Invoice Error', 'Failed to retrieve invoice data. Please try again later.');
                        return;
                    }

                    this.tokens = await this.getTokens(this.invoice?.app?.id || '')

                    // if (this.tokens && this.tokens.length === 0) {
                    //     this.errorTitle = 'Error';
                    //     this.errorText =
                    //         'Currently, there are no tokens available for selection as a payment option on this project.';
                    //     this.goToStep('errorStep');
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

                            this.goToStep('errorStep');

                            return;
                        }

                        if (defaultToken && defaultNetwork) {
                            this.selectedToken = defaultToken;
                            this.selectedNetwork = defaultNetwork;
                            this.tokenAvailable = true;
                        }

                    }
                }).then(() => {
                    if(this.invoice){
                        this.getInvoiceTransactions(this.invoiceId).then(() => {
                            this.subscribeInvoice(this.invoiceId).then(() => {
                                this.goToStep('invoiceStep');
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

            this.goToStep('errorStep');

            return;
        }

        this.API = new Client({
            apiKey: this.appId
        });

        const appInfoResult = await this.getApp();
        if(appInfoResult === 'error'){
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app data. Please try again later.';
            this.goToStep('errorStep');
            this.dispatchErrorEvent('Fetch App Error', 'Failed to retrieve app data. Please try again later.');
            return;
        }

        const products = await this.getProducts();
        if (products === 'error') {
            this.errorTitle = 'Error';
            this.errorText =
                'Failed to retrieve app products data. Please try again later.';
            this.goToStep('errorStep');
            this.dispatchErrorEvent('Fetch Products Error', 'Failed to retrieve app products data. Please try again later.');
            return;
        }

        this.appInfo = appInfoResult;//await this.getApp();
        this.appProducts = products;

        if(this.paymentType){
            switch (this.paymentType) {
                case "request":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToStep('priceStep');
                    return;
                case "item":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToStep('productStep');
                    return;
                case "cart":
                    this.invoiceType = this.paymentType;
                    this.paymentTypeSelected = true;
                    this.goToStep('cartStep');
                    return;
            }
        }

        this.goToStep('selectTypeStep');

        return;
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('transaction') && this.transaction?.id && !this.onlyTransaction) {
            this.goToTransactionStep(this.transaction.status);
        }

        if((changedProperties.has('transaction') || changedProperties.has('invoice')) && this.transaction && this.onlyTransaction){
            if(this.invoice?.id){
                this.goToTransactionStep(this.transaction.status);
            }
        }

    }

    render() {
        const content = html`
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
                                @nextStep=${this.nextStep}
                                @updateSelectedToken=${(event: CustomEvent) => {
                                    this.selectedToken = event.detail.token;
                                    this.selectedNetwork = event.detail.network;
                                }}
                                @updateSelectedTransaction=${(event: CustomEvent) => {
                                    const transaction = this.invoiceTransactions.find((item) => item.id === event.detail.transactionId);
                                    if(transaction){
                                        this.transaction = transaction
                                    }
                                }}
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

    private checkUUID(id: string) {
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidV4Regex.test(id);
    }

    private addToCart(productId: string){
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

    private removeFromCart(productId: string){
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
                    this.goToStep('priceStep');
                    return;
                case "item":
                    this.goToStep('productStep');
                    return;
                case "cart":
                    this.goToStep('cartStep');
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
            this.goToStep('walletStep');
            return;
        }

        if(this.appStep === 'walletStep' && this.walletAddress && !checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')){
            this.notificationData = {
                title: 'Invalid Wallet Address',
                text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                buttonText: 'Confirm'
            };
            this.notificationShow = true;

            this.dispatchErrorEvent('Invalid Wallet Address', 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.');
            return;
        }

        if(this.appStep === 'walletStep' && this.walletAddress && checkWalletAddress(this.walletAddress, this.selectedNetwork?.type || '')){
            this.createTransaction();
            return;
        }
    }

    private async prevStep() {

        if (this.appStep === 'priceStep') {
            this.goToStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'productStep') {
            this.goToStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'cartStep') {
            this.goToStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'createdInvoiceStep') {

            if(this.paymentType){

                switch (this.paymentType) {
                    case "request":
                        this.goToStep('priceStep');
                        return;
                    case "item":
                        this.goToStep('productStep');
                        return;
                    case "cart":
                        this.goToStep('cartStep');
                        return;
                    default:
                        this.goToStep('selectTypeStep');
                        return;
                }
            }

            this.goToStep('selectTypeStep');
            return;
        }

        if (this.appStep === 'walletStep') {
            this.goToStep('invoiceStep');
            return;
        }

        if (this.appStep === 'paymentStep') {
            this.goToStep('invoiceStep');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'processingStep') {
            this.goToStep('invoiceStep');
            this.onlyTransaction = false;
            this.transaction = null;
            this.cancelingTransaction = false;
            this.creatingTransaction = false;
            return;
        }

        if (this.appStep === 'successStep') {
            this.goToStep('invoiceStep');
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
            this.goToStep('errorStep');
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

                this.goToStep('createdInvoiceStep');

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

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Processing, (transactionData) => {

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Confirming, (transactionData) => {

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Rejected, (transactionData) => {

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Expired, (transactionData) => {

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Canceled, (transactionData) => {

            if(this.transaction && this.transaction.id === transactionData.id){
                this.transaction = transactionData;
            }

            this.getInvoiceTransactions(transactionData.invoiceId);
            return;
        })
        transactionsChannel.on(TransactionEventType.Success, (transactionData) => {

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
                if(this.appStep !== 'paymentStep'){
                    this.goToStep('paymentStep');
                }
                return;
            case "confirming":
                if(this.appStep !== 'processingStep'){
                    this.goToStep('processingStep');
                }
                return;
            case "rejected":
            case "canceled":
            case "success":
            case "expired":
                if(this.appStep !== 'successStep'){
                    this.goToStep('successStep');
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
