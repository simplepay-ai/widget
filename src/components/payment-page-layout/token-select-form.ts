import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/token-select-form.css?inline";
import {TokenSelectMode} from "../../lib/types.ts";
import {getTokenStandart, roundUpAmount} from "../../lib/util.ts";
import {Cryptocurrency, Invoice, Network} from "@simplepay-ai/api-client";
import {I18n} from "i18n-js";

interface NetworkOption {
    value: string;
    label: string;
}

@customElement('token-select-form')
export class TokenSelectForm extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    i18n: I18n | null = null;

    @property({type: Boolean})
    private customServerMode: boolean = false;

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Array})
    tokens: Cryptocurrency[] = [];

    @property({type: Object})
    selectedToken: Cryptocurrency | null = null;

    @property({type: Object})
    selectedNetwork: Network | null = null;

    @property({type: Boolean})
    tokenAvailable: boolean = false;

    @property({type: String, attribute: false})
    mode: TokenSelectMode = 'tokensList';

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

    @property({attribute: false, type: String})
    tokenPrice: string = '';

    @property({attribute: false, type: Number})
    leftAmount: number = 0;

    @property({attribute: false, type: String})
    tokenStandart: string = '';

    constructor() {
        super();
        this._onLocaleChanged = this._onLocaleChanged.bind(this);
    }

    disconnectedCallback() {
        window.removeEventListener('localeChanged', this._onLocaleChanged);
        super.disconnectedCallback();
    }

    _onLocaleChanged() {
        this.requestUpdate();
    }

    connectedCallback() {
        super.connectedCallback();

        window.addEventListener('localeChanged', this._onLocaleChanged);

        if(this.tokenAvailable){
            this.changeMode('selectedToken');
        }

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

        if (changedProperties.has('selectedToken') || changedProperties.has('selectedNetwork')) {
            this.tokenStandart = getTokenStandart(this.selectedNetwork?.symbol || '');
        }

        if (changedProperties.has('invoice') && this.invoice) {
            const left = Number(this.invoice?.total!) - Number(this.invoice?.paid!)
            this.leftAmount = (left < 0) ? 0 : left;
        }

        if (changedProperties.has('tokenSearch')) {
            this.filteredTokens = this.filterTokens(this.tokenSearch);
        }
    }

    private changeMode(mode: TokenSelectMode) {
        this.mode = mode;
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

    render() {
        return html`
            <div class="formWrapper">
                
                ${
                        (this.mode === 'selectedToken')
                                ? html`
                                    <div class="selectedToken">
                                        <div class="header">
                                            <p class="title">
                                                ${this.i18n?.t('tokenSelectForm.selectedTokenTitle')}
                                            </p>

                                            ${
                                                    (!this.tokenAvailable)
                                                    ? html`
                                                                <button class="changeButton"
                                                                        @click=${() => this.changeMode('tokensList')}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                                         stroke-linecap="round" stroke-linejoin="round">
                                                                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                                                                        <path d="m15 5 4 4"/>
                                                                    </svg>

                                                                    ${this.i18n?.t('buttons.change')}
                                                                </button>
                                                            ` : ''
                                            }
                                        </div>

                                        <div class="tokenInfo">
                                            <div class="amountInfo">
                                                <p>${this.i18n?.t('tokenSelectForm.amountToken')}</p>
                                                <p>${`${this.tokenPrice} ${this.selectedToken?.symbol}`}</p>
                                            </div>
                                            <div class="cryptoInfo">
                                                <div class="iconsWrapper">
                                                    <token-icon
                                                            .id=${(this.selectedToken?.symbol) ? this.selectedToken?.symbol?.replace('x', '') : ''}
                                                            width="32"
                                                            height="32"
                                                            class="tokenIcon"
                                                    ></token-icon>

                                                    <network-icon
                                                            .id=${this.selectedNetwork?.symbol}
                                                            width="16"
                                                            height="16"
                                                            class="networkIcon"
                                                    ></network-icon>
                                                </div>

                                                <p>
                                                    ${this.selectedToken?.name}</p>

                                                ${this.tokenStandart
                                                        ? html`
                                                            <div class="badge">
                                                                ${this.tokenStandart}
                                                            </div>
                                                        `
                                                        : ''}
                                            </div>
                                        </div>
                                    </div>
                                ` : ''
                }

                ${
                        (this.mode === 'tokensList')
                                ? html`
                                    <div class="tokensList">

                                        <div class="header">
                                            ${
                                                    (this.selectedToken)
                                                    ? html`
                                                                <button
                                                                        @click=${() => {
                                                                            this.changeMode('selectedToken');
                                                                            this.tokenSearch = '';
                                                                            this.networkSearch = '';
                                                                        }}
                                                                        class="backButton"
                                                                >
                                                                    <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="24"
                                                                            height="24"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke-width="2"
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                    >
                                                                        <path d="m12 19-7-7 7-7"/>
                                                                        <path d="M19 12H5"/>
                                                                    </svg>
                                                                </button> 
                                                            ` : ''
                                            }

                                            <p class="title">
                                                ${
                                                        (this.selectedToken)
                                                                ? this.i18n?.t('tokenSelectForm.tokensListTitle')
                                                                : this.i18n?.t('tokenSelectForm.selectTokenTitle')
                                                }
                                            </p>
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
                                                        placeholder=${ this.i18n?.t('tokenSelectForm.filterPlaceholder') }
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
                                                        ${this.i18n?.t('tokenSelectForm.allNetworks')}
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
                                        <div class="tokens">

                                            ${
                                                    (this.tokensEmpty)
                                                            ? html`
                                                                <div class="emptyTokens">
                                                                    <p>${this.i18n?.t('tokenSelectForm.emptyMessage')}</p>

                                                                    ${
                                                                            (!this.customServerMode)
                                                                            ? html`
                                                                                        <a href="https://console.simplepay.ai/settings/tokens-edit">
                                                                                            ${this.i18n?.t('tokenSelectForm.addButton')}
                                                                                        </a>
                                                                                    ` : ''
                                                                    }
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
                                                                                                            this.changeMode('selectedToken');
                                                                                                            this.tokenSearch = '';
                                                                                                            this.networkSearch = '';
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
                                                                                    <div class="tokensEmpty">
                                                                                        <p>${this.i18n?.t('tokenSelectForm.noFoundMessage')}</p>
                                                                                    </div>
                                                                                `
                                                                }
                                                            `
                                            }

                                        </div>

                                    </div>
                                ` : ''
                }

            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'token-select-form': TokenSelectForm;
    }
}
