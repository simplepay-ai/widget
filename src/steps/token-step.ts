import {Cryptocurrency} from '@simplepay-ai/api-client';
import {PropertyValues} from 'lit';
import {html, LitElement, property, query, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {IProduct} from "../types.ts";
import {getTokenStandart, roundUpAmount} from "../util.ts";
//@ts-ignore
import style from "../styles/token-step.css?inline";

@customElement('token-step')
export class TokenStep extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Array})
    productsInfo: IProduct[] = [];

    @property({type: String})
    price: string = '';

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: Boolean})
    returnButtonShow: boolean = false;

    @property({attribute: false, type: Boolean})
    private buttonDisabled = true;

    @property({attribute: false, type: Array})
    private stableCoins: Cryptocurrency[] = [];

    @property({attribute: false, type: Array})
    private otherCoins: Cryptocurrency[] = [];

    @property({attribute: false, type: Number})
    private accordionHeight: number = 0;

    @property({attribute: false, type: Boolean})
    accordionActive: boolean = false;

    @query('#accordionContent')
    accordionContentElement: any;

    connectedCallback() {
        super.connectedCallback();
        this.buttonDisabled = !this.selectedTokenSymbol || !this.selectedNetworkSymbol;

        if (this.tokens) {
            this.stableCoins = this.tokens.filter((token: Cryptocurrency) => token.stable);
            this.otherCoins = this.tokens.filter((token: Cryptocurrency) => !token.stable);
        }
    }

    firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        this.accordionHeight = this.accordionContentElement?.offsetHeight;
        this.accordionActive = true;
        this.accordionContentElement.style.maxHeight = `${this.accordionHeight}px`;
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title= ${'Choose token'}
                        .hasBackButton=${this.returnButtonShow}
                ></step-header>

                <div class="stepContent">

                    <div class="tokensList">

                        ${this.stableCoins && this.stableCoins.length > 0
                                ? html`
                                    <div class="accordion">
                                        <div class="trigger tokenItem" @click=${this.toggleAccordion}>
                                            <div class="tokenContent">
                                                <div class="imagePlaceholder">
                                                    <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            stroke-width="3"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                    >
                                                        <line x1="12" x2="12" y1="2" y2="22"/>
                                                        <path
                                                                d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                                                        />
                                                    </svg>
                                                </div>

                                                <div class="info">
                                                    <p>Stable coins</p>

                                                    <div
                                                            class=${`
                                        arrow
                                        ${this.accordionActive ? 'active' : ''}
                                        `}
                                                    >
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
                                                            <path d="m6 9 6 6 6-6"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="accordionContent" class="content">
                                            ${this.stableCoins &&
                                            this.stableCoins.map((token: Cryptocurrency) => {
                                                return token.networks?.map((network) => {
                                                    const networkStandart = getTokenStandart(
                                                            network.symbol
                                                    );
                                                    //@ts-ignore
                                                    const price = this.price / token.rates['usd'];
                                                    const formatPrice = roundUpAmount(
                                                            price.toString(),
                                                            token.stable
                                                    );

                                                    return html`
                                                        <div
                                                                @click=${() =>
                                                                        this.selectToken(token.symbol, network.symbol)}
                                                                class=${`tokenItem
                                                ${this.selectedTokenSymbol === token.symbol && this.selectedNetworkSymbol === network.symbol ? 'selected' : ''}
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
                                                                        <p>${token.symbol}</p>

                                                                        ${networkStandart
                                                                                ? html`
                                                                                    <div class="badge">
                                                                                        ${networkStandart}
                                                                                    </div>
                                                                                `
                                                                                : ''}
                                                                    </div>

                                                                    <p>~${formatPrice} ${token.symbol}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `;
                                                });
                                            })}
                                        </div>
                                    </div>
                                `
                                : ''
                        }

                        ${this.otherCoins &&
                        this.otherCoins.map((token: Cryptocurrency) => {
                            return token.networks?.map((network) => {
                                const networkStandart = getTokenStandart(network.symbol);

                                //@ts-ignore
                                const price = this.price / token.rates['usd'];
                                const formatPrice = roundUpAmount(price.toString(), token.stable);

                                return html`
                                    <div
                                            @click=${() =>
                                                    this.selectToken(token.symbol, network.symbol)}
                                            class=${`tokenItem
                                    ${this.selectedTokenSymbol === token.symbol && this.selectedNetworkSymbol === network.symbol ? 'selected' : ''}
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
                                                    <p>${token.symbol}</p>

                                                    ${networkStandart
                                                            ? html`
                                                                <div class="badge">
                                                                    ${networkStandart}
                                                                </div>
                                                            `
                                                            : ''}
                                                </div>

                                                <p>~${formatPrice} ${token.symbol}</p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            });
                        })}
                    </div>
                </div>

                <step-footer
                        .price=${this.price}
                        .hasButton=${true}
                        .buttonDisabled=${this.buttonDisabled}
                        .buttonText=${'Next'}
                        .productsInfo=${this.productsInfo}
                        @footerButtonClick=${this.dispatchNextStep}
                ></step-footer>
            </div>
        `;
    }

    private toggleAccordion() {
        this.accordionActive = !this.accordionActive;
        this.accordionContentElement.style.maxHeight = this.accordionActive
            ? `${this.accordionHeight}px`
            : '0px';
    }

    private selectToken(tokenSymbol: string, networkSymbol: string) {
        this.dispatchTokenSelect(tokenSymbol, networkSymbol);
        this.buttonDisabled = false;
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
        'token-step': TokenStep;
    }
}
