import {Cryptocurrency} from '@simplepay-ai/api-client';
import {PropertyValues} from 'lit';
import {css, html, LitElement, property, query} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {IProduct} from "../types.ts";
import {getTokenStandart, roundUpAmount} from "../util.ts";

@customElement('token-step')
export class TokenStep extends LitElement {

    @property({ type: Array })
    productsInfo: IProduct[] = [];

    @property({type: Boolean})
    darkTheme: boolean = false;

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

        this.accordionHeight = this.accordionContentElement.offsetHeight;
        this.accordionActive = true;
        this.accordionContentElement.style.maxHeight = `${this.accordionHeight}px`;
    }

    render() {
        return html`
            <div class=${`stepWrapper ${this.darkTheme ? 'dark' : ''}`}>
                <step-header
                        .darkTheme=${this.darkTheme}
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
                        .darkTheme=${this.darkTheme}
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
            height: 100%;
            display: flex;
            flex-direction: column;

            .stepContent {
                flex: 1;
                overflow-y: auto;

                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-secondary-bg-color);
                }

                .tokensList {
                    padding: 16px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .tokenItem {
                        user-select: none;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        padding: 8px;
                        border: 1px solid var(--sp-widget-hint-color);
                        border-radius: 8px;
                        background: var(--sp-widget-bg-color);
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;

                        @media(hover: hover) and (pointer: fine){
                            &:hover{
                                background: color-mix(in srgb,
                                var(--sp-widget-bg-color) 60%,
                                transparent);
                            }
                        }
                        
                        &.selected {
                            outline: 2px solid var(--sp-widget-link-color);
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
                                border: 1px solid var(--sp-widget-hint-color);
                                background: var(--sp-widget-bg-color);
                            }

                            .tokenIconWrapper {
                                position: relative;

                                .tokenIcon {
                                    position: relative;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-hint-color);
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
                                        stroke: var(--sp-widget-link-color);
                                    }
                                }

                                .networkIcon {
                                    position: absolute;
                                    bottom: -2px;
                                    right: -3px;
                                    background: var(--sp-widget-bg-color);
                                    border: 1px solid var(--sp-widget-hint-color);
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
                                        stroke: var(--sp-widget-link-color);
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
                                        font-weight: 700;
                                        color: var(--sp-widget-text-color);
                                    }
                                }

                                p {
                                    font-size: 12px;
                                    font-weight: 700;
                                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                                }
                            }

                            .badge {
                                color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                                font-weight: 700;
                                padding: 2px 4px;
                                background: var(--sp-widget-secondary-bg-color);
                                border: 1px solid var(--sp-widget-hint-color);
                                font-size: 10px;
                                border-radius: 4px;
                            }
                        }
                    }
                }

                .accordion {
                    .tokenItem {
                        &.trigger {
                            background: var(--sp-widget-bg-color);

                            @media(hover: hover) and (pointer: fine){
                                &:hover{
                                    background: color-mix(in srgb,
                                    var(--sp-widget-bg-color) 60%,
                                    transparent);
                                }
                            }
                            
                            .imagePlaceholder {
                                position: relative;
                                background: #4faf95;
                                width: 32px;
                                height: 32px;
                                border-radius: 50%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                overflow: hidden;
                                border: 0;

                                svg {
                                    width: 16px;
                                    height: 16px;
                                    stroke: white;
                                }
                            }

                            .tokenContent {
                                width: 100%;

                                .info {
                                    padding: 0 8px;
                                    flex: 1;
                                    justify-content: space-between;

                                    p {
                                        font-size: 16px;
                                        color: var(--sp-widget-text-color);
                                    }
                                }
                            }

                            .arrow {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                                transform: rotate(0deg);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;

                                &.active {
                                    transform: rotate(180deg);
                                }
                            }
                        }
                    }

                    .content {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        align-items: flex-end;
                        overflow: hidden;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;
                        padding-right: 4px;

                        .tokenItem {
                            width: calc(100% - 24px);

                            &:first-child {
                                margin-top: 8px;
                            }

                            &:last-child {
                                margin-bottom: 4px;
                            }
                        }
                    }
                }
            }

            &.dark {
                .badge {
                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent) !important;
                    background: var(--sp-widget-bg-color) !important;
                    border-color: color-mix(
                            in srgb,
                            var(--sp-widget-hint-color) 15%,
                            transparent
                    ) !important;
                }

                .tokenItem {
                    background: color-mix(
                            in srgb,
                            var(--sp-widget-secondary-bg-color) 15%,
                            transparent
                    ) !important;
                    border-color: color-mix(
                            in srgb,
                            var(--sp-widget-hint-color) 15%,
                            transparent
                    ) !important;

                    @media(hover: hover) and (pointer: fine){
                        &:hover{
                            background: color-mix(
                                    in srgb,
                                    var(--sp-widget-secondary-bg-color) 20%,
                                    transparent
                            ) !important;
                        }   
                    }
                }

                .accordion {
                    .tokenItem {
                        &.trigger {
                            background: color-mix(
                                    in srgb,
                                    var(--sp-widget-secondary-bg-color) 15%,
                                    transparent
                            ) !important;
                            border-color: color-mix(
                                    in srgb,
                                    var(--sp-widget-hint-color) 15%,
                                    transparent
                            ) !important;

                            @media(hover: hover) and (pointer: fine){
                                &:hover{
                                    background: color-mix(
                                            in srgb,
                                            var(--sp-widget-secondary-bg-color) 20%,
                                            transparent
                                    ) !important;
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
        'token-step': TokenStep;
    }
}
