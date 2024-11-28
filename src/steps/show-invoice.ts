import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {getTokenStandart, roundUpAmount} from "../util.ts";
import {Cryptocurrency, Invoice, InvoiceProduct, Transaction} from "@simplepay-ai/api-client";

@customElement('show-invoice')
export class ShowInvoice extends LitElement {

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Array})
    transactions: Transaction[] = [];

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: Boolean})
    tokenAvailable: boolean = false;

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

    connectedCallback() {
        super.connectedCallback();

        this.leftAmount = Number(this.invoice?.total!) - Number(this.invoice?.paid!);
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if ((changedProperties.has('selectedTokenSymbol') || changedProperties.has('selectedNetworkSymbol') || changedProperties.has('leftAmount'))) {

            const currentToken = this.tokens.find((item) => {
                return item.symbol === this.selectedTokenSymbol && item.networks;
            })

            if (currentToken?.networks && currentToken.rates) {

                const currentNetwork = currentToken.networks.find((item) => item.symbol === this.selectedNetworkSymbol);

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
            this.tokenStandart = getTokenStandart(this.selectedNetworkSymbol);
        }

        if (changedProperties.has('transactions') && this.transactions.length > 0) {
            const transaction = this.transactions.find((item) => item.status === 'created' || item.status === 'processing' || item.status === 'confirming')
            this.activeTransaction = (transaction) ? transaction : null;
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
                        ${(this.invoice?.products && this.invoice?.products.length > 0) && 'hasProduct'}
                        `}
                             @click=${() => {
                                 if (this.invoice?.products && this.invoice?.products.length > 0) {
                                     this.openProductModal()
                                 }
                             }}
                        >

                            ${
                                    (this.invoice?.products.length === 0)
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
                                    (this.invoice?.products.length === 1 && this.invoice.products[0].count === 1)
                                            ? html`
                                                <div class="productImage">

                                                    ${
                                                            (this.invoice.products[0].product.image)
                                                                    ? html`
                                                                        <img .src=${this.invoice.products[0].product.image}
                                                                             alt="product image">
                                                                    `
                                                                    : html`
                                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                                             width="800px"
                                                                             height="800px" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                  stroke="#1C274C" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="#1C274C" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                        </svg>
                                                                    `
                                                    }
                                                </div>
                                            `
                                            : ''
                            }

                            ${
                                    ((this.invoice?.products && this.invoice?.products.length > 1) || (this.invoice?.products && this.invoice?.products.length === 1 && this.invoice.products[0].count > 1))
                                            ? html`
                                                <div class="productImage">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                         height="800px" viewBox="0 0 24 24" fill="none">
                                                        <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                              stroke="#1C274C" stroke-width="1"
                                                              stroke-linecap="round"/>
                                                        <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                              stroke="#1C274C" stroke-width="1"
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
                                (this.selectedTokenSymbol && this.selectedNetworkSymbol && this.tokenAvailable)
                                        ? html`
                                            <div class="tokenCard">
                                                <p>${this.tokenPrice} <span>${this.selectedTokenSymbol}</span></p>

                                                <token-icon
                                                        .id=${this.selectedTokenSymbol}
                                                        width="25"
                                                        height="25"
                                                        class="tokenIcon"
                                                ></token-icon>

                                            </div>

                                            <div class=${`
                                        networkCard
                                        ${(this.selectedNetworkSymbol === 'bsc') ? 'uppercase' : 'capitalize'}
                                        `}
                                            >

                                                <network-icon
                                                        .id=${this.selectedNetworkSymbol}
                                                        width="20"
                                                        height="20"
                                                        class="networkIcon"
                                                ></network-icon>

                                                ${this.selectedNetworkSymbol}

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
                        (Number(this.invoice?.total!) - Number(this.invoice?.paid!) > 0)
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
                                                                            (this.selectedTokenSymbol)
                                                                                    ? html`
                                                                                        <p><span>${this.tokenPrice}</span>
                                                                                            ${this.selectedTokenSymbol}</p>

                                                                                        <token-icon
                                                                                                .id=${this.selectedTokenSymbol}
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
                                                                        (this.selectedNetworkSymbol)
                                                                                ? html`
                                                                                    <div class=${`
                                            networkInfo
                                            ${(this.selectedNetworkSymbol === 'bsc') ? 'uppercase' : 'capitalize'}
                                            `}>
                                                                                        <p class="label">
                                                                                            Network:
                                                                                        </p>

                                                                                        <div class="value">
                                                                                            <network-icon
                                                                                                    .id=${this.selectedNetworkSymbol}
                                                                                                    width="20"
                                                                                                    height="20"
                                                                                                    class="networkIcon"
                                                                                            ></network-icon>

                                                                                            ${this.selectedNetworkSymbol}

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
                                                                    .disabled=${!this.selectedTokenSymbol || !this.selectedNetworkSymbol}
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
                                        this.invoice?.products && this.invoice?.products.length > 0 && this.invoice?.products.map((item: InvoiceProduct) => html`
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
                                                                                  stroke="#1C274C" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="#1C274C" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                        </svg>
                                                                    `
                                                    }


                                                </div>

                                                <div class="info">
                                                    <p class="name">${item.product.name}</p>
                                                    <p class="description">${item.product.description}</p>
                                                </div>

                                                <div class="priceWrapper">
                                                    <p class="price">${item.product.prices[0].price}
                                                        ${item.product.prices[0].currency.symbol}</p>
                                                    <p class="count">Count: ${item.count}</p>
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

                            <div class="tokensList">
                                ${this.tokens &&
                                this.tokens.map((token: Cryptocurrency) => {
                                    return token.networks?.map((network) => {
                                        const networkStandart = getTokenStandart(network.symbol);

                                        let formatPrice = 0;
                                        let leftPrice = (this.invoice) ? Number(this.invoice.total) - Number(this.invoice.paid) : 0;
                                        
                                        //@ts-ignore
                                        const price = leftPrice / token.rates['usd'];
                                        formatPrice = roundUpAmount(price.toString(), token.stable);

                                        return html`
                                            <div
                                                    @click=${() => {
                                                        this.dispatchTokenSelect(token.symbol, network.symbol);
                                                        this.closeTokenModal();
                                                    }}
                                                    class=${`tokenItem
                                                        ${this.selectedTokenSymbol === token.symbol && this.selectedNetworkSymbol === network.symbol ? 'selected' : ''}
                                                    `}
                                            >
                                                <div class="tokenContent">
                                                    <div class="tokenIconWrapper">
                                                        <token-icon
                                                                .id=${token.symbol}
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
                                                            <p>${token.symbol}</p>

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
                                                                            <p>~${formatPrice} ${token.symbol}</p>
                                                                        `
                                                                        : ''
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    });
                                })}
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
                                                                                .id=${item.cryptocurrency.symbol}
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
                                                                                        Amount: ${formatPrice} ${item.cryptocurrency.symbol}
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

    private dispatchTokenSelect(tokenSymbol: string, networkSymbol: string) {
        const updateEvent = new CustomEvent('updateSelectedToken', {
            detail: {
                tokenSymbol: tokenSymbol,
                networkSymbol: networkSymbol
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updateEvent);
    }

    private dispatchNextStep() {
        if (this.selectedNetworkSymbol && this.selectedTokenSymbol) {
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
            display: flex;
            flex-direction: column;
            height: 100%;
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 350ms;

            .mainSection {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;

                &::-webkit-scrollbar {
                    width: 2px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-scroll-color);
                }
            }

            .merchantInfo {
                padding: 1rem 1.5rem 0;

                .image {
                    margin: 0 auto;
                    width: 80px;
                    aspect-ratio: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    border: 1px solid var(--sp-widget-border-color);
                    background: var(--sp-widget-bg-color);
                    border-radius: 50%;

                    img {
                        width: 80px;
                        height: 80px;
                        object-fit: cover;
                    }

                    &.placeholder {
                        svg {
                            width: 40px;
                            height: 40px;
                            object-fit: cover;
                            color: var(--sp-widget-active-color);
                        }
                    }
                }

                .name {
                    margin-top: 12px;
                    font-size: 20px;
                    line-height: 1.2;
                    font-weight: 400;
                    color: var(--sp-widget-text-color);
                    text-align: center;
                }

                .description {
                    text-align: center;
                    margin-top: 12px;
                    font-size: 12px;
                    line-height: 1.2;
                    font-weight: 400;
                    color: var(--sp-widget-secondary-text-color);
                }
            }

            .productInfo {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 1rem;

                .status {
                    margin-bottom: 4px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 4px;

                    .circle {
                        aspect-ratio: 1;
                        width: 6px;
                        border-radius: 50%;
                    }

                    p {
                        text-transform: capitalize;
                        font-size: 12px;
                        font-weight: 400;
                        line-height: 1.2;
                    }

                    &.active {
                        .circle {
                            background: #2563EBFF;
                        }

                        p {
                            color: #2563EBFF;
                        }
                    }

                    &.closed {
                        .circle {
                            background: #F87171FF;
                        }

                        p {
                            color: #F87171FF;
                        }
                    }

                    &.success {
                        .circle {
                            background: #16A34AFF;
                        }

                        p {
                            color: #16A34AFF;
                        }
                    }

                    &.canceled {
                        .circle {
                            background: #DC2626FF;
                        }

                        p {
                            color: #DC2626FF;
                        }
                    }
                }

                .card {
                    padding: 8px;
                    width: 165px;
                    max-width: 165px;
                    height: 165px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border-radius: 12px;
                    background-color: var(--sp-widget-bg-color);

                    &.hasProduct {
                        cursor: pointer;
                    }

                    .title {
                        margin-top: 12px;
                        font-size: 16px;
                        line-height: 1.2;
                        font-weight: 500;
                        color: var(--sp-widget-text-color);

                        span {
                            padding-left: 5px;
                            color: var(--sp-widget-secondary-text-color);
                            font-size: 12px;
                            line-height: 1.2;
                            font-weight: 400;
                        }
                    }

                    .icon {
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        svg {
                            width: 40px;
                            height: 40px;
                            color: var(--sp-widget-active-color);
                        }
                    }

                    .productImage {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border: 1px solid var(--sp-widget-border-color);
                        background: var(--sp-widget-secondary-bg-color);
                        width: 60px;
                        aspect-ratio: 1;
                        border-radius: 50%;
                        overflow: hidden;

                        svg {
                            width: 45px;
                            height: 45px;
                            object-fit: cover;

                            path {
                                stroke: var(--sp-widget-active-color);
                            }
                        }

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }
                    }

                    .price {
                        font-weight: 700;
                        line-height: 1.2;
                        font-size: 25px;
                        margin-top: 4px;
                        color: var(--sp-widget-text-color);
                    }

                    .left {
                        margin-top: 12px;
                        font-size: 12px;
                        font-weight: 400;
                        line-height: 1.2;
                        color: var(--sp-widget-text-color);
                    }
                }

                .tokenCard {
                    margin-top: 12px;
                    padding: 8px 12px;
                    width: max-content;
                    min-width: 165px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 12px;
                    background-color: var(--sp-widget-bg-color);

                    p {
                        color: var(--sp-widget-function-button-text-color);
                        font-size: 13px;
                        line-height: 1.2;
                        font-weight: 500;

                        span {
                            color: var(--sp-widget-function-button-text-color);
                            font-size: 14px;
                            line-height: 1.2;
                            font-weight: 500;
                        }
                    }

                    .tokenIcon {
                        background: var(--sp-widget-bg-color);
                        border: 1px solid var(--sp-widget-border-color);
                        width: 25px;
                        aspect-ratio: 1;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                    }
                }

                .networkCard {
                    margin-top: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 1.2;
                    color: var(--sp-widget-text-color);

                    &.capitalize {
                        text-transform: capitalize;
                    }

                    &.uppercase {
                        text-transform: uppercase;
                    }

                    .networkIcon {
                        background: var(--sp-widget-bg-color);
                        border: 1px solid var(--sp-widget-border-color);
                        width: 20px;
                        aspect-ratio: 1;
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                    }

                    .badge {
                        color: var(--sp-widget-badge-text-color);
                        font-weight: 700;
                        padding: 2px 4px;
                        background: var(--sp-widget-badge-bg-color);
                        border: 1px solid var(--sp-widget-badge-border-color);
                        font-size: 10px;
                        border-radius: 4px;
                    }
                }

                .transactionsCard {
                    cursor: pointer;
                    padding: 8px 12px;
                    margin-top: 24px;
                    width: max-content;
                    min-width: 165px;
                    text-align: center;
                    border-radius: 8px;
                    background-color: var(--sp-widget-bg-color);
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 1.2;
                    color: var(--sp-widget-text-color);
                }

            }

            .footer {
                border-radius: 12px 12px 0 0;
                padding: 12px 8px 8px;
                background-color: var(--sp-widget-bg-color);

                .tokenInfo {
                    margin-bottom: 16px;

                    .label {
                        padding-left: 8px;
                        font-size: 12px;
                        font-weight: 400;
                        line-height: 1.2;
                        margin-bottom: 4px;
                        color: var(--sp-widget-text-color);
                    }

                    .tokenCard {
                        cursor: pointer;
                        height: 40px;
                        border-radius: 6px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 12px;
                        border: 1px solid var(--sp-widget-function-button-border-color);

                        p {
                            color: var(--sp-widget-function-button-text-color);
                            font-size: 14px;
                            font-weight: 400;
                            line-height: 1.2;

                            span {
                                color: var(--sp-widget-function-button-text-color);
                                font-size: 13px;
                                font-weight: 400;
                                line-height: 1.2;
                            }
                        }

                        .image {
                            width: 30px;
                            height: 30px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-border-color);
                            border-radius: 50%;

                            &.placeholder {
                                background: transparent;
                                border: 0;

                                svg {
                                    width: 20px;
                                    height: 20px;
                                    color: var(--sp-widget-active-color);
                                }
                            }
                        }

                        .tokenIcon {
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-border-color);
                            width: 25px;
                            aspect-ratio: 1;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;
                        }

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: var(--sp-widget-function-button-hover-color);
                                border: 1px solid var(--sp-widget-function-button-hover-border-color);
                            }
                        }
                    }

                    .networkInfo {
                        margin-top: 6px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 8px;

                        &.capitalize {
                            text-transform: capitalize;
                        }

                        &.uppercase {
                            text-transform: uppercase;
                        }

                        .label {
                            text-transform: none;
                            padding: 0;
                            font-size: 12px;
                            font-weight: 400;
                            line-height: 1.2;
                            margin: 0;
                            color: var(--sp-widget-text-color);
                        }

                        .value {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            font-size: 12px;
                            font-weight: 400;
                            line-height: 1.2;
                            color: var(--sp-widget-text-color);
                        }

                        .networkIcon {
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-border-color);
                            width: 20px;
                            aspect-ratio: 1;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;
                        }

                        .badge {
                            color: var(--sp-widget-badge-text-color);
                            font-weight: 700;
                            padding: 2px 4px;
                            background: var(--sp-widget-badge-bg-color);
                            border: 1px solid var(--sp-widget-badge-border-color);
                            font-size: 10px;
                            border-radius: 4px;
                        }
                    }
                }

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

                    &:disabled {
                        pointer-events: none;
                        touch-action: none;
                        opacity: 0.5;
                    }
                }
            }

            .productModal {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                display: flex;
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
                    background: color-mix(in srgb,
                    black 0%,
                    transparent) !important;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        background: color-mix(in srgb,
                        black 75%,
                        transparent) !important;
                    }
                }

                .contentWrapper {
                    width: 100%;
                    background: var(--sp-widget-bg-color);
                    z-index: 11;
                    border-radius: 12px 12px 0 0;
                    overflow: hidden;
                    height: auto;
                    max-height: 50%;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        transform: translateY(0);
                    }

                    .content {
                        padding: 1rem;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

                        .titleWrapper {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            p {
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: var(--sp-widget-text-color);
                            }
                        }

                        .closeButton {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            user-select: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                            width: 25px;
                            height: 25px;
                            background: var(--sp-widget-function-button-color);
                            border-radius: 6px;

                            svg {
                                width: 20px;
                                height: 20px;
                                color: var(--sp-widget-function-button-text-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 350ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-function-button-hover-color);

                                    svg {
                                        color: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }
                            }
                        }

                    }
                }

                .productsList {
                    margin-top: 20px;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
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
                        background: var(--sp-widget-scroll-color);
                    }

                    .productItem {
                        display: flex;
                        align-items: flex-start;
                        gap: 12px;
                        margin: 0 auto;
                        width: 95%;

                        .imageWrapper {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: 1px solid var(--sp-widget-border-color);
                            background: var(--sp-widget-secondary-bg-color);
                            width: 40px;
                            height: 40px;
                            border-radius: 8px;
                            overflow: hidden;

                            img {
                                width: 40px;
                                height: 40px;
                                object-fit: cover;
                            }

                            &.placeholder {
                                svg {
                                    width: 32px;
                                    height: 32px;
                                    object-fit: cover;

                                    path {
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }
                            }
                        }

                        .info {
                            flex: 1;

                            .name {
                                color: var(--sp-widget-text-color);
                                font-size: 14px;
                                font-weight: 500;
                            }

                            .description {
                                font-size: 12px;
                                color: var(--sp-widget-secondary-text-color);
                            }
                        }

                        .priceWrapper {
                            .price {
                                color: var(--sp-widget-text-color);
                                font-size: 14px;
                                font-weight: 500;
                                text-align: end;
                            }

                            .count {
                                font-size: 12px;
                                color: var(--sp-widget-secondary-text-color);
                                text-align: end;
                            }
                        }
                    }
                }
            }

            .tokenModal {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                display: flex;
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
                    background: color-mix(in srgb,
                    black 0%,
                    transparent) !important;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        background: color-mix(in srgb,
                        black 75%,
                        transparent) !important;
                    }
                }

                .contentWrapper {
                    width: 100%;
                    background: var(--sp-widget-bg-color);
                    z-index: 11;
                    border-radius: 12px 12px 0 0;
                    overflow: hidden;
                    height: auto;
                    max-height: 50%;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        transform: translateY(0);
                    }

                    .content {
                        padding: 1rem;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

                        .titleWrapper {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            p {
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: var(--sp-widget-text-color);
                            }
                        }

                        .closeButton {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            user-select: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                            width: 25px;
                            height: 25px;
                            background: var(--sp-widget-function-button-color);
                            border-radius: 6px;

                            svg {
                                width: 20px;
                                height: 20px;
                                color: var(--sp-widget-function-button-text-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 350ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-function-button-hover-color);

                                    svg {
                                        color: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }
                            }
                        }

                    }
                }

                .tokensList {
                    margin-top: 20px;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    padding: 0 4px;

                    &::-webkit-scrollbar {
                        width: 2px;
                    }

                    &::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--sp-widget-scroll-color);
                    }

                    .tokenItem {
                        user-select: none;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        padding: 8px;
                        border: 1px solid var(--sp-widget-function-button-border-color);
                        border-radius: 8px;
                        background: var(--sp-widget-function-button-color);
                        outline: 2px solid transparent;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 50ms;

                        &.selected {
                            border: 1px solid var(--sp-widget-active-color);
                        }

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: var(--sp-widget-function-button-hover-color);
                                border: 1px solid var(--sp-widget-function-button-hover-border-color);

                                &.selected {
                                    border: 1px solid var(--sp-widget-active-color);
                                }
                            }
                        }

                        .tokenContent {
                            flex: 1;
                            display: flex;
                            gap: 8px;
                            align-items: center;

                            img {
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                object-fit: cover;
                                border: 1px solid var(--sp-widget-border-color);
                                background: var(--sp-widget-bg-color);
                            }

                            .tokenIconWrapper {
                                position: relative;

                                .tokenIcon {
                                    position: relative;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-border-color);
                                    width: 32px;
                                    height: 32px;
                                    border-radius: 50%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    overflow: hidden;

                                    svg {
                                        width: 16px;
                                        height: 16px;
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }

                                .networkIcon {
                                    position: absolute;
                                    bottom: -2px;
                                    right: -3px;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-border-color);
                                    width: 16px;
                                    height: 16px;
                                    border-radius: 50%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    overflow: hidden;

                                    svg {
                                        width: 16px;
                                        height: 16px;
                                        stroke: var(--sp-widget-active-color);
                                    }
                                }
                            }

                            .info {
                                flex: 1;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;

                                .leftSection {
                                    display: flex;
                                    gap: 8px;
                                    align-items: center;

                                    p {
                                        font-weight: 500;
                                        color: var(--sp-widget-text-color);
                                    }
                                }

                                p {
                                    font-size: 12px;
                                    font-weight: 500;
                                    color: var(--sp-widget-secondary-text-color);
                                }
                            }

                            .badge {
                                color: var(--sp-widget-badge-text-color);
                                font-weight: 700;
                                padding: 2px 4px;
                                background: var(--sp-widget-badge-bg-color);
                                border: 1px solid var(--sp-widget-badge-border-color);
                                font-size: 10px;
                                border-radius: 4px;
                            }
                        }
                    }
                }
            }

            .transactionsModal {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                display: flex;
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
                    background: color-mix(in srgb,
                    black 0%,
                    transparent) !important;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        background: color-mix(in srgb,
                        black 75%,
                        transparent) !important;
                    }
                }

                .contentWrapper {
                    width: 100%;
                    background: var(--sp-widget-bg-color);
                    z-index: 11;
                    border-radius: 12px 12px 0 0;
                    overflow: hidden;
                    height: auto;
                    max-height: 50%;
                    display: flex;
                    flex-direction: column;
                    transform: translateY(100%);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.show {
                        transform: translateY(0);
                    }

                    .content {
                        padding: 1rem;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        height: auto;
                        max-height: 100%;

                        .titleWrapper {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;

                            p {
                                font-size: 20px;
                                line-height: 28px;
                                font-weight: 700;
                                color: var(--sp-widget-text-color);
                            }
                        }

                        .closeButton {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            user-select: none;
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                            width: 25px;
                            height: 25px;
                            background: var(--sp-widget-function-button-color);
                            border-radius: 6px;

                            svg {
                                width: 20px;
                                height: 20px;
                                color: var(--sp-widget-function-button-text-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 350ms;
                            }

                            @media (hover: hover) and (pointer: fine) {
                                &:hover {
                                    background: var(--sp-widget-function-button-hover-color);

                                    svg {
                                        color: var(--sp-widget-function-button-hover-text-color);
                                    }
                                }
                            }
                        }

                    }
                }

                .transactionsList {
                    margin-top: 20px;
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    padding: 0 4px;

                    &::-webkit-scrollbar {
                        width: 2px;
                    }

                    &::-webkit-scrollbar-track {
                        background: transparent;
                    }

                    &::-webkit-scrollbar-thumb {
                        background: var(--sp-widget-scroll-color);
                    }

                    .transactionItem {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 4px;
                        user-select: none;
                        cursor: pointer;
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--sp-widget-function-button-border-color);
                        border-radius: 8px;
                        background: var(--sp-widget-function-button-color);
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                border: 1px solid var(--sp-widget-function-button-hover-border-color);
                                background: var(--sp-widget-function-button-hover-color);
                            }
                        }

                        .leftSection {
                            flex: 1;
                        }

                        .rightSection {
                            .main,
                            .secondary {
                                text-align: end;
                            }
                        }

                        .main {
                            color: var(--sp-widget-text-color);
                            font-size: 14px;
                            font-weight: 500;
                        }

                        .secondary {
                            margin-top: 6px;
                            font-size: 12px;
                            color: var(--sp-widget-secondary-text-color);
                        }

                        .status {
                            margin-left: auto;
                            width: max-content;
                            color: var(--sp-widget-badge-text-color);
                            font-weight: 700;
                            padding: 2px 4px;
                            background: var(--sp-widget-badge-bg-color);
                            border: 1px solid var(--sp-widget-badge-border-color);
                            font-size: 10px;
                            border-radius: 4px;
                        }

                        .addressWrapper {
                            display: flex;
                            gap: 8px;
                            align-items: center;
                        }

                        .tokenIconWrapper {
                            position: relative;

                            .tokenIcon {
                                position: relative;
                                background: var(--sp-widget-bg-color);
                                border: 1px solid var(--sp-widget-border-color);
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;

                                svg {
                                    width: 16px;
                                    height: 16px;
                                    stroke: var(--sp-widget-active-color);
                                }
                            }

                            .networkIcon {
                                position: absolute;
                                bottom: -2px;
                                right: -3px;
                                background: var(--sp-widget-bg-color);
                                border: 1px solid var(--sp-widget-border-color);
                                width: 12px;
                                height: 12px;
                                border-radius: 50%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;

                                svg {
                                    width: 16px;
                                    height: 16px;
                                    stroke: var(--sp-widget-active-color);
                                }
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
        'show-invoice': ShowInvoice;
    }
}
