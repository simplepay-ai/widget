import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {IProduct} from "../types.ts";
import {getTokenStandart, roundUpAmount} from "../util.ts";
import {App, Cryptocurrency} from "@simplepay-ai/api-client";
//@ts-ignore
import style from "../styles/preview-step.css?inline";

@customElement('preview-step')
export class PreviewStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    appInfo: App | null = null;

    @property({type: String})
    price: string = '';

    @property({type: Array})
    productsInfo: IProduct[] = [];

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

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

    @property({attribute: false, type: String})
    productsTotalAmount: string = '';

    @property({attribute: false, type: String})
    tokenPrice: string = '';

    @property({attribute: false, type: String})
    tokenStandart: string = '';

    connectedCallback() {
        super.connectedCallback();

        let productsSum = 0;
        if (this.productsInfo && this.productsInfo.length > 0) {
            for (let product of this.productsInfo) {
                productsSum += product.count * product.prices[0].price;
            }
        }

        this.productsTotalAmount = parseFloat(productsSum.toString()).toFixed(2);
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if ((changedProperties.has('selectedTokenSymbol') || changedProperties.has('selectedNetworkSymbol')) && this.price) {

            const currentToken = this.tokens.find((item) => {
                return item.symbol === this.selectedTokenSymbol && item.networks;
            })

            if (currentToken?.networks && currentToken.rates) {

                const currentNetwork = currentToken.networks.find((item) => item.symbol === this.selectedNetworkSymbol);

                if (currentNetwork) {

                    //@ts-ignore
                    const priceInToken = this.price / currentToken.rates['usd'];
                    this.tokenPrice = '~' + roundUpAmount(
                        priceInToken.toString(),
                        currentToken.stable
                    );

                } else {
                    this.tokenPrice = '';
                }

            } else {

            }


        }

        if (changedProperties.has('selectedTokenSymbol') || changedProperties.has('selectedNetworkSymbol')) {
            this.tokenStandart = getTokenStandart(this.selectedNetworkSymbol);
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>

                <div class="mainSection">
                    <div class="merchantInfo">
                        
                        ${
                                (this.appInfo?.image)
                                ? html`
                                            <div class="image">
                                                <img src=${this.appInfo.image}
                                                     alt="merchant image">
                                            </div>
                                        `
                                        : html`
                                            <div class="image placeholder">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                     stroke-linejoin="round">
                                                    <circle cx="12" cy="8" r="5"/>
                                                    <path d="M20 21a8 8 0 0 0-16 0"/>
                                                </svg>
                                            </div>
                                        `
                        }

                        <p class="name">${this.appInfo?.name}</p>
                        
                        ${
                                (this.appInfo?.description)
                                ? html`
                                            <p class="description">${this.appInfo.description}</p>
                                        `
                                        : ''
                        }
                        
                    </div>

                    <div class=${`
                productInfo
                ${(Number(this.price) < 1 && (!this.productsInfo || this.productsInfo.length === 0)) ? 'custom' : ''}
                ${(Number(this.price) >= 1 && (!this.productsInfo || this.productsInfo.length === 0)) ? 'price' : ''}
                ${(this.productsInfo && this.productsInfo.length > 0) ? 'product' : ''}
                `}>

                        ${
                                (Number(this.price) < 1 && (!this.productsInfo || this.productsInfo.length === 0))
                                        ? html`
                                            <div class="card">
                                                <svg class="image" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                                                     stroke-linecap="round" stroke-linejoin="round">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                                    <path d="M12 18V6"/>
                                                </svg>

                                                <p class="title">Payment</p>
                                            </div>
                                        `
                                        : ''
                        }

                        ${
                                (Number(this.price) >= 1 && (!this.productsInfo || this.productsInfo.length === 0))
                                        ? html`
                                            <div class="card">
                                                <svg class="image" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                                                     stroke-linecap="round" stroke-linejoin="round">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                                                    <path d="M12 18V6"/>
                                                </svg>

                                                <p class="title">Amount</p>
                                                <p class="price">${`$${this.price}`}</p>
                                            </div>
                                        `
                                        : ''
                        }

                        ${
                                (this.productsInfo && this.productsInfo.length > 0)
                                        ? html`
                                            <div class="card"
                                                 @click=${() => this.openProductModal()}
                                            >
                                                <div class="image">

                                                    ${
                                                            (this.productsInfo.length === 1 && this.productsInfo[0].image)
                                                                    ? html`
                                                                        <img .src=${this.productsInfo[0].image} alt="product image">
                                                                    `
                                                                    : html`
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                                             height="800px" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                        </svg>
                                                                    `
                                                    }

                                                </div>

                                                ${
                                                        (this.productsInfo.length === 1)
                                                                ? html`
                                                                    <div class="title">
                                                                        <p class="name">${this.productsInfo[0].name}</p>
                                                                        <span class="count">x${this.productsInfo[0].count}</span>
                                                                    </div>
                                                                `
                                                                : html`
                                                                    <p class="title">Total items: ${this.productsInfo.length}</p>
                                                                `
                                                }

                                                <p class="price">
                                                        $${this.productsTotalAmount}</p>

                                            </div>
                                        `
                                        : ''
                        }

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
                                        `}>

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

                    </div>
                </div>

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
                                                                    <p><span>${this.tokenPrice}</span> ${this.selectedTokenSymbol}</p>

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
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
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

                    <button class="mainButton"
                            @click=${this.dispatchNextStep}
                            .disabled=${!this.selectedTokenSymbol || !this.selectedNetworkSymbol}
                    >
                        Next
                    </button>

                </div>

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
                                        this.productsInfo.map((item: IProduct) => html`
                                            <div class="productItem">

                                                <div class=${`imageWrapper ${(!item.image) && 'placeholder'}`}>

                                                    ${
                                                            (item.image)
                                                                    ? html`
                                                                        <img src=${item.image} alt="product image">
                                                                    `
                                                                    : html`
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="800px"
                                                                             height="800px" viewBox="0 0 24 24" fill="none">
                                                                            <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                            <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
                                                                                  stroke="var(--sp-widget-active-color)" stroke-width="1"
                                                                                  stroke-linecap="round"/>
                                                                        </svg>
                                                                    `
                                                    }


                                                </div>

                                                <div class="info">
                                                    <p class="name">${item.name}</p>
                                                    <p class="description">${item.description}</p>
                                                </div>

                                                <div class="priceWrapper">
                                                    <p class="price">${item.prices[0].price}
                                                        ${item.prices[0].currency.symbol}</p>
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
                                        if (this.price) {
                                            //@ts-ignore
                                            const price = this.price / token.rates['usd'];
                                            formatPrice = roundUpAmount(price.toString(), token.stable);

                                        }

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
}

declare global {
    interface HTMLElementTagNameMap {
        'preview-step': PreviewStep;
    }
}
