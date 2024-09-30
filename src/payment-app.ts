import { Client, Cryptocurrency, Invoice, InvoiceStatus, WsClient } from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import { AppStep } from './types';
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
    price: string = '';

    @property({ type: String })
    clientId: string = '';

    @property({ type: Boolean })
    dark: boolean = false;

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

    async connectedCallback() {
        super.connectedCallback();

        this.API = new Client();

        this.clientId = this.clientId ? this.clientId : '';
        this.price = this.price ? this.price : '';
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

        if (!this.price) {
            this.goToStep('setPrice');
            return;
        }

        this.goToStep('setToken');
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.dark ? 'dark' : ''}`}>
                ${this.appStep === 'loading'
                    ? html` <loading-step .dark=${this.dark}></loading-step>`
                    : ''}
                ${this.appStep === 'error'
                    ? html` <error-step
                          .dark=${this.dark}
                          .title=${this.errorTitle}
                          .text=${this.errorText}
                      ></error-step>`
                    : ''}
                ${this.appStep === 'setPrice'
                    ? html` <price-step
                          .dark=${this.dark}
                          .price=${this.price}
                          @updatePrice=${(event: CustomEvent) => (this.price = event.detail.price)}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></price-step>`
                    : ''}
                ${this.appStep === 'setToken'
                    ? html` <token-step
                          .dark=${this.dark}
                          .tokens=${this.tokens}
                          .selectedTokenSymbol=${this.selectedTokenSymbol}
                          .selectedNetworkSymbol=${this.selectedNetworkSymbol}
                          .price=${this.price}
                          .returnButtonShow=${!this.priceAvailable}
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
                          .dark=${this.dark}
                          .walletAddress=${this.walletAddress}
                          .price=${this.price}
                          .tokens=${this.tokens}
                          .selectedTokenSymbol=${this.selectedTokenSymbol}
                          .selectedNetworkSymbol=${this.selectedNetworkSymbol}
                          @updateWalletAddress=${(event: CustomEvent) =>
                              (this.walletAddress = event.detail.walletAddress)}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></wallet-step>`
                    : ''}
                ${this.appStep === 'payment'
                    ? html` <payment-step
                          .dark=${this.dark}
                          .price=${this.price}
                          .walletAddress=${this.walletAddress}
                          .invoice=${this.invoice}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                          @cancelInvoice=${this.cancelInvoice}
                      ></payment-step>`
                    : ''}
                ${this.appStep === 'processing'
                    ? html` <processing-step
                          .dark=${this.dark}
                          .price=${this.price}
                          .invoice=${this.invoice}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></processing-step>`
                    : ''}
                ${this.appStep === 'success'
                    ? html` <success-step
                          .dark=${this.dark}
                          .price=${this.price}
                          .invoice=${this.invoice}
                          .backToStoreUrl=${this.backToStoreUrl}
                          @nextStep=${this.nextStep}
                          @returnBack=${this.prevStep}
                      ></success-step>`
                    : ''}
            </div>
        `;
    }

    private nextStep() {
        if (this.appStep === 'setPrice' && this.price) {
            this.goToStep('setToken');
            return;
        }

        if (this.appStep === 'setToken' && this.selectedTokenSymbol && this.selectedNetworkSymbol) {
            this.goToStep('setWallet');
            return;
        }

        if (this.appStep === 'setWallet' && this.walletAddress) {
            this.createInvoice();
        }
    }

    private async createInvoice() {
        const ws = new WsClient();

        const invoiceWS = ws.appClientInvoice(this.appId, this.clientId);

        const invoice = await this.API.invoice.create({
            type: 'payment',
            clientId: this.clientId,
            from: this.walletAddress,
            network: this.selectedNetworkSymbol,
            cryptocurrency: this.selectedTokenSymbol,
            currency: 'USD',
            price: Number(this.price),
            appId: this.appId
        });

        invoiceWS.on(InvoiceStatus.Processing, (invoice) => {
            console.log('invoice Processing', invoice);
            this.invoice = invoice;
            this.goToStep('payment');
        });

        invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
            console.log('invoice Confirming', invoice);
            this.invoice = invoice;
            this.goToStep('processing');
        });

        invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
            console.log('invoice Rejected', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
            console.log('invoice Cancelled', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Success, (invoice) => {
            console.log('invoice Success', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
            console.log('invoice Expired', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        setTimeout(async () => {
            const newInvoiceData = await this.API.invoice.get(invoice.id);
            this.invoice = newInvoiceData;

            if (newInvoiceData.status === 'processing') {
                this.goToStep('payment');
            }
        }, 1000);
    }

    private async cancelInvoice(){
        if(this.invoiceId){
            await this.API.invoice.cancel(this.invoiceId);
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
            return;
        }

        this.invoice = result;
        this.price = result.price || '';

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
            this.goToStep('payment');
        });

        invoiceWS.on(InvoiceStatus.Confirming, (invoice) => {
            console.log('invoice Confirming', invoice);
            this.invoice = invoice;
            this.goToStep('processing');
        });

        invoiceWS.on(InvoiceStatus.Rejected, (invoice) => {
            console.log('invoice Rejected', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Canceled, (invoice) => {
            console.log('invoice Cancelled', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Expired, (invoice) => {
            console.log('invoice Expired', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });

        invoiceWS.on(InvoiceStatus.Success, (invoice) => {
            console.log('invoice Success', invoice);
            this.invoice = invoice;
            this.goToStep('success');
        });
    }

    private prevStep() {
        if (this.appStep === 'setToken') {
            if (!this.priceAvailable) {
                this.goToStep('setPrice');
                return;
            }
        }

        if (this.appStep === 'setWallet') {
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
            console.log('getTokens error', error);
        }
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

        :host {
            --sp-primary-background: #ffffff;
            --sp-secondary-background: #f4f4f5;

            --sp-primary-font: #000000;
            --sp-secondary-font: #71717a;

            --sp-border: #e4e4e7;
            --sp-accent: #3b82f6;

            .dark {
                --sp-primary-background: #000000 !important;
                --sp-secondary-background: #9d9d9d !important;

                --sp-primary-font: #ffffff !important;
                --sp-secondary-font: #a1a1aaff !important;

                --sp-border: #27272aff !important;
                --sp-accent: #3b82f6 !important;
            }
        }

        .stepWrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: var(--sp-secondary-background);

            & > * {
                height: 100%;
            }

            &.dark {
                background: var(--sp-primary-background) !important;
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'payment-app': PaymentApp;
    }
}
