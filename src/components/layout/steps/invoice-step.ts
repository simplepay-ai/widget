import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {getTokenStandart, roundUpAmount} from "../../../lib/util.ts";
import {Cryptocurrency, Invoice, InvoiceProduct, Network, Transaction} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../../../styles/invoice-step.css?inline";

interface NetworkOption {
    value: string;
    label: string;
}

@customElement('invoice-step')
export class InvoiceStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Array})
    transactions: Transaction[] = [];

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

    @property({type: Object})
    selectedToken: Cryptocurrency | null = null;

    @property({type: Object})
    selectedNetwork: Network | null = null;

    @property({type: Boolean})
    tokenAvailable: boolean = false;

    @property({attribute: false, type: Array})
    invoiceProducts: InvoiceProduct[] = [];

    @property({attribute: false, type: Boolean})
    showProductModal: boolean = false;

    @property({attribute: false, type: Boolean})
    showProductModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    showProductModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    showTokenModal: boolean = false;

    @property({attribute: false, type: Boolean})
    showTokenModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    showTokenModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    showTransactionsModal: boolean = false;

    @property({attribute: false, type: Boolean})
    showTransactionsModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    showTransactionsModalContent: boolean = false;

    @property({attribute: false, type: String})
    tokenPrice: string = '';

    @property({attribute: false, type: String})
    tokenStandart: string = '';

    @property({attribute: false, type: Number})
    leftAmount: number = 0;

    @property({attribute: false, type: Object})
    activeTransaction: Transaction | null = null;

    @property({attribute: false, type: Array})
    private filteredTokens: Cryptocurrency[] = [];

    @property({attribute: false, type: Array})
    private networksList: NetworkOption[] = [];

    @property({attribute: false, type: String})
    private tokenSearch = '';

    @property({attribute: false, type: String})
    private networkSearch = '';

    @property({attribute: false, type: Boolean})
    private tokensEmpty = false;

    connectedCallback() {
        super.connectedCallback();

        const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!)
        this.leftAmount = (left < 0) ? 0 : left;

        this.filteredTokens = this.tokens;

        const allNetworks: NetworkOption[] = [];
        for (let token of this.tokens) {
            if (token.networks && token.networks.length > 0) {
                for (let network of token.networks) {
                    const check = allNetworks.find((item) => item.value === network.symbol);
                    if (!check) {
                        allNetworks.push({
                            label: network.name,
                            value: network.symbol
                        });
                    }
                }
            }
        }
        this.networksList = allNetworks;

        if (this.invoice?.payload?.products && this.invoice?.payload?.products.length > 0) {
            this.invoiceProducts = this.invoice?.payload?.products;
        }

        if (this.invoice?.products && this.invoice.products.length > 0) {
            this.invoiceProducts = this.invoice.products;
        }

    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('tokens')) {
            const filTokens = this.tokens.filter((item) => item.networks && item.networks.length > 0);
            this.tokensEmpty = filTokens.length === 0;
        }

        if ((changedProperties.has('selectedToken') || changedProperties.has('selectedNetwork') || changedProperties.has('leftAmount'))) {

            const currentToken = this.tokens.find((item) => {
                return item.id === this.selectedToken?.id && item.networks;
            })

            if (currentToken?.networks && currentToken.rates) {

                const currentNetwork = currentToken.networks.find((item) => item.id === this.selectedNetwork?.id);

                if (currentNetwork) {
                    //@ts-ignore
                    const priceInToken = this.leftAmount / currentToken.rates['usd'];
                    this.tokenPrice = '~' + roundUpAmount(
                        priceInToken.toString(),
                        currentToken.stable
                    );

                } else {
                    this.tokenPrice = '';
                }

            }
        }

        if (changedProperties.has('selectedTokenSymbol') || changedProperties.has('selectedNetworkSymbol')) {
            this.tokenStandart = getTokenStandart(this.selectedNetwork?.symbol || '');
        }

        if (changedProperties.has('transactions') && this.transactions.length > 0) {
            const transaction = this.transactions.find((item) => item.status === 'created' || item.status === 'processing' || item.status === 'confirming')
            this.activeTransaction = (transaction) ? transaction : null;
        }

        if (changedProperties.has('invoice') && this.invoice) {
            const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!)
            this.leftAmount = (left < 0) ? 0 : left;
            // this.leftAmount = Number(this.invoice?.total!) - Number(this.invoice?.paid!);
        }

        if (changedProperties.has('tokenSearch')) {
            this.filteredTokens = this.filterTokens(this.tokenSearch);
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>

                <div class="mainSection">

                    <div class="merchantInfo">

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

                        ${
                                (this.invoice?.app?.description)
                                        ? html`
                                            <p class="description">${this.invoice?.app?.description}</p>
                                        `
                                        : ''
                        }

                    </div>

                    <div class="productInfo">

                        <div class=${`
                        status
                        ${this.invoice?.status}
                        `}>
                            <div class="circle"></div>
                            <p>${this.invoice?.status}</p>
                        </div>

                        <div class=${`
                        card
                        ${(this.invoiceProducts && this.invoiceProducts.length > 0) && 'hasProduct'}
                        `}
                             @click=${() => {
                                 if (this.invoiceProducts && this.invoiceProducts.length > 0) {
                                     this.openProductModal()
                                 }
                             }}
                        >

                            ${
                                    (this.invoiceProducts.length === 0)
                                            ? html`
                                                <div class="icon">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                         stroke-width="1.5"
                                                         stroke-linecap="round" stroke-linejoin="round">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                                        <path d="M12 18V6"/>
                                                    </svg>
                                                </div>
                                            `
                                            : ''
                            }

                            ${
                                    (this.invoiceProducts.length === 1 && (this.invoiceProducts[0].count === 1 || !this.invoiceProducts[0].count))
                                            ? html`
                                                <div class="productImage">

                                                    ${
                                                            (this.invoiceProducts[0].product.image)
                                                                    ? html`
                                                                        <img .src=${this.invoiceProducts[0].product.image}
                                                                             alt="product image">
                                                                    `
                                                                    : html`
                                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                                             width="800px"
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
                                            `
                                            : ''
                            }

                            ${
                                    ((this.invoiceProducts && this.invoiceProducts.length > 1) || (this.invoiceProducts && this.invoiceProducts.length === 1 && this.invoiceProducts[0].count > 1))
                                            ? html`
                                                <div class="productImage">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                         height="800px" viewBox="0 0 24 24" fill="none">
                                                        <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                              stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                              stroke-linecap="round"/>
                                                        <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                              stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                              stroke-linecap="round"/>
                                                    </svg>
                                                </div>
                                            `
                                            : ''
                            }

                            <p class="title">Amount</p>
                            <p class="price">${`$${this.invoice?.total}`}</p>

                            <p class="left">Left: $${parseFloat(this.leftAmount.toString()).toFixed(2)}</p>
                        </div>

                        ${
                                (this.selectedToken && this.selectedNetwork && this.tokenAvailable)
                                        ? html`
                                            <div class="tokenCard">
                                                <p>${this.tokenPrice} <span>${this.selectedToken.symbol}</span></p>

                                                <token-icon
                                                        .id=${this.selectedToken.symbol.replace('x', '')}
                                                        width="25"
                                                        height="25"
                                                        class="tokenIcon"
                                                ></token-icon>

                                            </div>

                                            <div class=${`
                                        networkCard
                                        ${(this.selectedNetwork.symbol === 'bsc') ? 'uppercase' : 'capitalize'}
                                        `}
                                            >

                                                <network-icon
                                                        .id=${this.selectedNetwork.symbol}
                                                        width="20"
                                                        height="20"
                                                        class="networkIcon"
                                                ></network-icon>

                                                ${this.selectedNetwork.symbol}

                                                ${
                                                        (this.tokenStandart)
                                                                ? html`
                                                                    <div class="badge">
                                                                        ${this.tokenStandart}
                                                                    </div>
                                                                `
                                                                : ''
                                                }

                                            </div>
                                        `
                                        : ''
                        }

                        ${
                                (this.transactions && this.transactions.length > 0)
                                        ? html`
                                            <div class="transactionsCard"
                                                 @click=${() => this.openTransactionsModal()}>
                                                Show history
                                            </div>
                                        `
                                        : ''
                        }

                    </div>

                </div>

                ${
                        (this.invoice?.status === 'active')
                                ? html`
                                    <div class="footer">

                                        ${
                                                (!this.tokenAvailable)
                                                        ? html`
                                                            <div class="tokenInfo">
                                                                <p class="label">
                                                                    Token:
                                                                </p>

                                                                <div class="tokenCard" @click=${() => this.openTokenModal()}>

                                                                    ${
                                                                            (this.selectedToken)
                                                                                    ? html`
                                                                                        <p><span>${this.tokenPrice}</span>
                                                                                            ${this.selectedToken.symbol}</p>

                                                                                        <token-icon
                                                                                                .id=${this.selectedToken.symbol.replace('x', '')}
                                                                                                width="25"
                                                                                                height="25"
                                                                                                class="tokenIcon"
                                                                                        ></token-icon>
                                                                                    `
                                                                                    : html`
                                                                                        <p>Choose token</p>

                                                                                        <div class="image placeholder">
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                                                                                 height="24"
                                                                                                 viewBox="0 0 24 24" fill="none"
                                                                                                 stroke="currentColor"
                                                                                                 stroke-width="1.5" stroke-linecap="round"
                                                                                                 stroke-linejoin="round">
                                                                                                <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
                                                                                            </svg>
                                                                                        </div>
                                                                                    `
                                                                    }
                                                                </div>

                                                                ${
                                                                        (this.selectedNetwork)
                                                                                ? html`
                                                                                    <div class=${`
                                            networkInfo
                                            ${(this.selectedNetwork.symbol === 'bsc') ? 'uppercase' : 'capitalize'}
                                            `}>
                                                                                        <p class="label">
                                                                                            Network:
                                                                                        </p>

                                                                                        <div class="value">
                                                                                            <network-icon
                                                                                                    .id=${this.selectedNetwork.symbol}
                                                                                                    width="20"
                                                                                                    height="20"
                                                                                                    class="networkIcon"
                                                                                            ></network-icon>

                                                                                            ${this.selectedNetwork.symbol}

                                                                                            ${
                                                                                                    (this.tokenStandart)
                                                                                                            ? html`
                                                                                                                <div class="badge">
                                                                                                                    ${this.tokenStandart}
                                                                                                                </div>
                                                                                                            `
                                                                                                            : ''
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                `
                                                                                : ''
                                                                }
                                                            </div>
                                                        `
                                                        : ''
                                        }

                                        ${
                                                (this.activeTransaction)
                                                        ? html`
                                                            <button class="mainButton"
                                                                    @click=${() => this.dispatchSelectTransaction(this.activeTransaction?.id!)}
                                                            >
                                                                To active transaction
                                                            </button>
                                                        `
                                                        : html`
                                                            <button class="mainButton"
                                                                    @click=${this.dispatchNextStep}
                                                                    .disabled=${!this.selectedToken || !this.selectedNetwork}
                                                            >
                                                                Next
                                                            </button>
                                                        `
                                        }

                                    </div>
                                ` : ''
                }

                <div class="productModal ${(this.showProductModal) ? 'show' : ''}">

                    <div @click=${() => this.closeProductModal()}
                         class="overlay ${(this.showProductModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showProductModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>Products</p>
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
                                                    <p class="price">${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].price) ? item.product.prices[0].price : ''} ${(item.product.prices && item.product.prices.length > 0 && item.product.prices[0].currency.symbol) ? item.product.prices[0].currency.symbol : ''}</p>
                                                    <p class="count">Count: ${item.count || '---'}</p>
                                                </div>

                                            </div>
                                        `)
                                }

                            </div>
                        </div>
                    </div>

                </div>

                <div class="tokenModal ${(this.showTokenModal) ? 'show' : ''}">

                    <div @click=${() => this.closeTokenModal()}
                         class="overlay ${(this.showTokenModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showTokenModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>Tokens</p>
                                <div class="closeButton"
                                     @click=${() => this.closeTokenModal()}
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

                            <div class="tokensFilters">

                                <div class="tokenInputWrapper">
                                    <input
                                            class="tokenInput"
                                            type="text"
                                            .value=${this.tokenSearch}
                                            @input=${(event: CustomEvent | any) => {
                                                this.tokenSearch = event.target.value;
                                            }}
                                            placeholder= ${`Search token`}
                                    />
                                </div>

                                <div class="networkSelectWrapper">
                                    <select id="networkFilter"
                                            @change=${(event: CustomEvent | any) => {
                                                this.networkSearch = event.target.value;
                                            }}
                                            .value=${this.networkSearch}
                                    >
                                        <option value=""
                                                selected
                                        >
                                            All chains
                                        </option>
                                        ${
                                                this.networksList &&
                                                this.networksList.map((network) => {
                                                    return html`
                                                        <option value=${network.value}>
                                                            ${network.label}
                                                        </option>
                                                    `
                                                })
                                        }
                                    </select>
                                </div>

                            </div>

                            <div class="tokensList">

                                ${
                                        (this.tokensEmpty)
                                                ? html`
                                                    <div class="emptyTokens">
                                                        <p>No tokens are currently available in this store, but you can add them
                                                            to get started!</p>

                                                        <a href="https://console.simplepay.ai/settings/tokens-edit">
                                                            Add tokens
                                                        </a>
                                                    </div>
                                                `
                                                :
                                                html`
                                                    ${

                                                            (this.filteredTokens && this.filteredTokens.length > 0)
                                                                    ?
                                                                    this.filteredTokens.map((token: Cryptocurrency) => {
                                                                        if (token.networks && token.networks.length > 0) {
                                                                            return token.networks.filter((network) => {
                                                                                if (this.networkSearch === '') {
                                                                                    return network;
                                                                                }

                                                                                return network.symbol === this.networkSearch;

                                                                            }).map((network) => {
                                                                                const networkStandart = getTokenStandart(network.symbol);

                                                                                let formatPrice = 0;
                                                                                let leftPrice = (this.invoice) ? Number(this.invoice.total) - Number(this.invoice.paid) : 0;

                                                                                //@ts-ignore
                                                                                const price = leftPrice / token.rates['usd'];
                                                                                formatPrice = roundUpAmount(price.toString(), token.stable);

                                                                                return html`
                                                                                    <div
                                                                                            @click=${() => {
                                                                                                this.dispatchTokenSelect(token, network);
                                                                                                this.closeTokenModal();
                                                                                            }}
                                                                                            class=${`tokenItem
                                                        ${this.selectedToken?.id === token.id && this.selectedNetwork?.id === network.id ? 'selected' : ''}
                                                    `}
                                                                                    >
                                                                                        <div class="tokenContent">
                                                                                            <div class="tokenIconWrapper">
                                                                                                <token-icon
                                                                                                        .id=${token.symbol.replace('x', '')}
                                                                                                        width="32"
                                                                                                        height="32"
                                                                                                        class="tokenIcon"
                                                                                                ></token-icon>

                                                                                                <network-icon
                                                                                                        .id=${network.symbol}
                                                                                                        width="16"
                                                                                                        height="16"
                                                                                                        class="networkIcon"
                                                                                                ></network-icon>
                                                                                            </div>

                                                                                            <div class="info">
                                                                                                <div class="leftSection">
                                                                                                    <p>
                                                                                                        ${token.symbol}</p>

                                                                                                    ${networkStandart
                                                                                                            ? html`
                                                                                                                <div class="badge">
                                                                                                                    ${networkStandart}
                                                                                                                </div>
                                                                                                            `
                                                                                                            : ''}
                                                                                                </div>

                                                                                                ${
                                                                                                        (formatPrice !== 0)
                                                                                                                ? html`
                                                                                                                    <p>
                                                                                                                            ~${formatPrice}
                                                                                                                        ${token.symbol}</p>
                                                                                                                `
                                                                                                                : ''
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                `;
                                                                            });
                                                                        }
                                                                    })
                                                                    :
                                                                    html`
                                                                        <div class="tokensListEmpty">
                                                                            <p>No tokens found</p>
                                                                        </div>
                                                                    `
                                                    }
                                                `
                                }
                            </div>
                        </div>
                    </div>

                </div>

                <div class="transactionsModal ${(this.showTransactionsModal) ? 'show' : ''}">

                    <div @click=${() => this.closeTransactionsModal()}
                         class="overlay ${(this.showTransactionsModalOverlay) ? 'show' : ''}"></div>

                    <div class="contentWrapper ${(this.showTransactionsModalContent) ? 'show' : ''}">
                        <div class="content">
                            <div class="titleWrapper">
                                <p>Transactions</p>
                                <div class="closeButton"
                                     @click=${() => this.closeTransactionsModal()}
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

                            <div class="transactionsList">

                                ${
                                        this.transactions
                                                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                                                .map((item) => {

                                                    const date = new Date(item.updatedAt).toDateString()
                                                    const time = new Date(item.updatedAt).toTimeString()
                                                    const updateDate = `${date} ${time.split(':')[0]}:${time.split(':')[1]}`

                                                    const formatPrice = (item.amount) ? roundUpAmount(item.amount, item.cryptocurrency.stable).toString() : '---';

                                                    return html`
                                                        <div class="transactionItem"
                                                             @click=${() => {
                                                                 this.closeTransactionsModal();
                                                                 this.dispatchSelectTransaction(item.id);
                                                             }}
                                                        >
                                                            <div class="leftSection">

                                                                <div class="addressWrapper">
                                                                    <div class="tokenIconWrapper">
                                                                        <token-icon
                                                                                .id=${item.cryptocurrency.symbol.replace('x', '')}
                                                                                width="32"
                                                                                height="32"
                                                                                class="tokenIcon"
                                                                        ></token-icon>

                                                                        <network-icon
                                                                                .id=${item.network.symbol}
                                                                                width="16"
                                                                                height="16"
                                                                                class="networkIcon"
                                                                        ></network-icon>
                                                                    </div>
                                                                    <p class="main">
                                                                        ${item.from.slice(0, 6)}
                                                                            ...${item.from.slice(
                                                                                item.from.length - 4,
                                                                                item.from.length
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                ${
                                                                        (formatPrice !== '---')
                                                                                ? html`
                                                                                    <p class="secondary">
                                                                                        Amount: ${formatPrice}
                                                                                        ${item.cryptocurrency.symbol}
                                                                                    </p>
                                                                                `
                                                                                : ''
                                                                }
                                                            </div>
                                                            <div class="rightSection">
                                                                <div class="status">
                                                                    ${item.status}
                                                                </div>
                                                                <p class="secondary">
                                                                    ${updateDate}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    `
                                                })
                                }

                            </div>
                        </div>
                    </div>

                </div>

            </div>
        `;
    }

    private filterTokens(tokenName: string) {

        if (this.tokens.length === 0) {
            return [];
        }

        return this.tokens
            .filter((token) => {

                if (tokenName === '') {
                    return token;
                }

                return token.symbol.toLowerCase().includes(tokenName.toLowerCase()) || token.name.toLowerCase().includes(tokenName.toLowerCase());

            });
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

    private openTokenModal() {
        this.showTokenModal = true;

        setTimeout(() => {
            this.showTokenModalOverlay = true;

            setTimeout(() => {
                this.showTokenModalContent = true;
            }, 200)
        }, 200)
    }

    private closeTokenModal() {

        this.showTokenModalContent = false;

        setTimeout(() => {
            this.showTokenModalOverlay = false;

            setTimeout(() => {
                this.showTokenModal = false;

                this.tokenSearch = '';
                this.networkSearch = '';

            }, 200)
        }, 200)
    }

    private openTransactionsModal() {
        this.showTransactionsModal = true;

        setTimeout(() => {
            this.showTransactionsModalOverlay = true;

            setTimeout(() => {
                this.showTransactionsModalContent = true;
            }, 200)
        }, 200)
    }

    private closeTransactionsModal() {
        this.showTransactionsModalContent = false;

        setTimeout(() => {
            this.showTransactionsModalOverlay = false;

            setTimeout(() => {
                this.showTransactionsModal = false;
            }, 200)
        }, 200)
    }

    private dispatchTokenSelect(token: Cryptocurrency, network: Network) {
        const updateEvent = new CustomEvent('updateSelectedToken', {
            detail: {
                token: token,
                network: network
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updateEvent);
    }

    private dispatchNextStep() {
        if (this.selectedNetwork && this.selectedToken) {
            const nextStepEvent = new CustomEvent('nextStep', {
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(nextStepEvent);
        }
    }

    private dispatchSelectTransaction(transactionId: string) {
        if (transactionId) {
            const updateEvent = new CustomEvent('updateSelectedTransaction', {
                detail: {
                    transactionId: transactionId,
                },
                bubbles: true,
                composed: true
            });

            this.dispatchEvent(updateEvent);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'invoice-step': InvoiceStep;
    }
}
