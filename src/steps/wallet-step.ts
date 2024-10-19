import {Cryptocurrency} from '@simplepay-ai/api-client';
import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {checkWalletAddress, getTokenStandart} from "../util.ts";
import {IProduct, WalletType} from "../types.ts";

@customElement('wallet-step')
export class WalletStep extends LitElement {

    @property({type: Array})
    productsInfo: IProduct[] = [];

    @property({type: String})
    price: string = '';

    @property({type: String})
    walletAddress: string = '';

    @property({type: String})
    selectedTokenSymbol: string = '';

    @property({type: String})
    selectedNetworkSymbol: string = '';

    @property({type: String})
    selectedWalletType: WalletType | '' = '';

    @property({type: Boolean})
    creatingInvoice: boolean = false;

    @property({attribute: false, type: String})
    private inputValue = '';

    @property({attribute: false, type: Boolean})
    private buttonDisabled = true;

    @property({attribute: false, type: Boolean})
    private showWalletModal = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalOverlay: boolean = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalContent: boolean = false;

    @property({attribute: false, type: Boolean})
    private showWalletModalError: boolean = false;

    @property({attribute: false, type: String})
    private walletModalErrorText: string = '';

    connectedCallback() {
        super.connectedCallback();

        if (this.walletAddress) {
            this.inputValue = this.walletAddress;
            this.buttonDisabled = this.walletAddress === '';
        }
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('walletAddress')) {
            this.inputValue = this.walletAddress;
        }
    }

    render() {
        return html`
            <div class=${`stepWrapper`}>
                <step-header
                        .title= ${'Connect wallet'}
                        .hasBackButton=${true}
                        .backButtonDisabled=${this.creatingInvoice}
                        .showToken=${true}
                        .token="${{
                            tokenSymbol: this.selectedTokenSymbol,
                            networkStandart: getTokenStandart(this.selectedNetworkSymbol),
                            networkSymbol: this.selectedNetworkSymbol
                        }}"
                ></step-header>

                ${this.creatingInvoice
                        ? html`
                            <div class="stepContent">
                                <div class="spinner">
                                    <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                    >
                                        <circle cx="12" cy="12" r="10" stroke-width="4"/>
                                        <path
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>

                                    <p>Creating invoice ...</p>
                                </div>
                            </div>
                        `
                        : html`
                            <div class="stepContent">

                                <div @click=${() => this.selectWalletType('MetaMask')}
                                     class=${`
                                     walletType
                                     ${(this.selectedWalletType === 'MetaMask') ? 'selected' : ''}
                                     `}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                                    </svg>
                                    <p>By wallet address</p>
                                </div>

                                <div @click=${this.openWalletModal}
                                     class=${`
                                     walletType
                                     ${(this.selectedWalletType === 'Custom') ? 'selected' : ''}
                                     `}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                                    </svg>
                                    <p>By wallet address</p>
                                </div>

                                <div class="walletModal ${(this.showWalletModal) ? 'show' : ''}">

                                    <div @click=${this.hideWalletModal}
                                         class="overlay ${(this.showWalletModalOverlay) ? 'show' : ''}"></div>

                                    <div class="contentWrapper ${(this.showWalletModalContent) ? 'show' : ''}">
                                        <div class="content">
                                            <div class="titleWrapper">
                                                <p>Wallet address</p>
                                                <div class="closeButton"
                                                     @click=${this.hideWalletModal}
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

                                            <div class="inputWrapper">
                                                <label for="address">
                                                    <div class="input">
                                                        <input
                                                                id="address"
                                                                type="text"
                                                                value=${this.inputValue}
                                                                @input=${this.inputHandler}
                                                                placeholder=${`Enter your ${this.selectedNetworkSymbol} address`}
                                                        />

                                                        <div class="pasteButton" @click=${() => this.pasteData()}>
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
                                                                <rect
                                                                        width="8"
                                                                        height="4"
                                                                        x="8"
                                                                        y="2"
                                                                        rx="1"
                                                                        ry="1"
                                                                />
                                                                <path
                                                                        d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                                                                />
                                                                <path d="M16 4h2a2 2 0 0 1 2 2v4"/>
                                                                <path d="M21 14H11"/>
                                                                <path d="m15 10-4 4 4 4"/>
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    <p class=${`
                                        descriptionText
                                        ${(this.showWalletModalError) ? 'error' : ''}
                                        `}>
                                                        ${
                                                                (this.showWalletModalError)
                                                                        ? this.walletModalErrorText
                                                                        : 'Enter the address of the wallet you will use to complete the payment. We need this to track and verify the on-chain transaction as our service is fully decentralized'
                                                        }
                                                    </p>

                                                </label>
                                            </div>

                                            <button class="mainButton"
                                                    @click=${this.selectCustomWallet}
                                                    .disabled=${this.showWalletModalError || this.inputValue.trim() === ''}
                                            >
                                                Select address
                                            </button>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        `
                }

                <step-footer
                        .price=${this.price}
                        .hasButton=${true}
                        .buttonDisabled=${this.buttonDisabled || this.creatingInvoice}
                        .buttonText=${'Confirm'}
                        .productsInfo=${this.productsInfo}
                        @footerButtonClick=${this.dispatchNextStep}
                ></step-footer>
            </div>
        `;
    }

    private selectWalletType(type: WalletType){

    }

    private openWalletModal() {
        this.showWalletModal = true;

        setTimeout(() => {
            this.showWalletModalOverlay = true;

            setTimeout(() => {
                this.showWalletModalContent = true;
            }, 200)
        }, 200)
    }
    private hideWalletModal() {
        this.showWalletModalContent = false;

        setTimeout(() => {
            this.showWalletModalOverlay = false;

            setTimeout(() => {
                this.showWalletModal = false;
            }, 200)
        }, 200)
    }
    private selectCustomWallet() {

        if (!checkWalletAddress(this.inputValue, this.selectedNetworkSymbol)) {

            this.walletModalErrorText = 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.';
            this.showWalletModalError = true;
            this.buttonDisabled = true;

            return;
        }

        this.updateWalletAddress(this.inputValue.trim());
        this.updateWalletType('Custom');

        this.hideWalletModal();

        this.buttonDisabled = false;
    }

    private pasteData() {
        try {
            navigator.clipboard.readText().then((clipText) => {
                this.inputValue = clipText;
                this.updateWalletAddress(clipText);
            });
        } catch (error) {
            console.log('Paste data error', error);
        }
    }
    private inputHandler(event: CustomEvent | any) {

        const address = event.target.value;

        this.showWalletModalError = false;
        this.walletModalErrorText = '';

        if (address === '') {
            this.updateWalletAddress('');
            return;
        }

        this.inputValue = address;
        this.updateWalletAddress(address);
    }

    private dispatchNextStep() {

        if (!this.inputValue || this.inputValue === '') {
            return;
        }

        if (!checkWalletAddress(this.inputValue, this.selectedNetworkSymbol)) {
            const options = {
                detail: {
                    notificationData: {
                        title: 'Invalid Wallet Address',
                        text: 'The wallet address you entered is invalid. Please check the address for any errors and ensure it is correctly formatted.',
                        buttonText: 'Confirm'
                    },
                    notificationShow: true
                },
                bubbles: true,
                composed: true
            };
            this.dispatchEvent(new CustomEvent('updateNotification', options));

            return;
        }

        const nextStepEvent = new CustomEvent('nextStep', {
            bubbles: true,
            composed: true
        });

        this.updateWalletAddress(this.inputValue);
        this.dispatchEvent(nextStepEvent);
    }

    private updateWalletAddress(address: string) {
        const updateWalletAddressEvent = new CustomEvent('updateWalletAddress', {
            detail: {
                walletAddress: address
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateWalletAddressEvent);
    }
    private updateWalletType(type: WalletType) {
        const updateWalletTypeEvent = new CustomEvent('updateWalletType', {
            detail: {
                walletType: type
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateWalletTypeEvent);
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
                padding: 16px;
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

                .spinner {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;

                    p {
                        margin-top: 8px;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--sp-widget-text-color);
                    }

                    svg {
                        width: 20px;
                        height: 20px;
                        animation: spin 1s linear infinite;
                    }

                    circle {
                        stroke: var(--sp-widget-active-color);
                        opacity: 0.25;
                    }

                    path {
                        fill: var(--sp-widget-active-color);
                        opacity: 0.75;
                    }
                }

                .walletType {
                    user-select: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px;
                    border: 1px solid var(--sp-widget-function-button-border-color);
                    border-radius: 8px;
                    background: var(--sp-widget-function-button-color);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.selected {
                        border: 1px solid var(--sp-widget-active-color);
                    }

                    svg {
                        color: var(--sp-widget-active-color);
                        width: 24px;
                        aspect-ratio: 1;
                    }

                    p {
                        display: block;
                        flex: 1;
                        font-size: 13px;
                        font-weight: 700;
                        color: var(--sp-widget-function-button-text-color);
                    }

                    @media (hover: hover) and (pointer: fine) {
                        &:hover {
                            border: 1px solid var(--sp-widget-function-button-hover-border-color);
                            background: var(--sp-widget-function-button-hover-color);
                        }
                    }
                }

                .walletModal {
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
                        border-radius: 25px 25px 0 0;
                        overflow: hidden;
                        max-height: 50%;
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

                            .inputWrapper {
                                margin-top: 1rem;

                                label {
                                    font-size: 14px;
                                    line-height: 1;
                                    font-weight: 500;
                                }

                                input {
                                    display: flex;
                                    height: 40px;
                                    width: 100%;
                                    border-radius: 6px;
                                    border: 1px solid var(--sp-widget-input-border-color);
                                    background: var(--sp-widget-input-bg-color);
                                    padding: 8px 12px;
                                    font-size: 16px;
                                    line-height: 20px;
                                    color: var(--sp-widget-input-color);
                                    outline: none;
                                    transition-property: all;
                                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                    transition-duration: 50ms;

                                    &::placeholder {
                                        font-size: 14px;
                                        line-height: 20px;
                                        color: var(--sp-widget-input-placeholder-color);
                                    }

                                    &:focus-visible {
                                        border: 1px solid var(--sp-widget-input-active-border-color);
                                    }
                                }

                                .input {
                                    margin-top: 4px;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;

                                    .pasteButton {
                                        padding: 11px;
                                        width: 42px;
                                        aspect-ratio: 1;
                                        border: 1px solid var(--sp-widget-function-button-border-color);
                                        border-radius: 6px;
                                        color: var(--sp-widget-function-button-text-color);
                                        background: var(--sp-widget-function-button-color);
                                        cursor: pointer;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        gap: 4px;
                                        font-size: 12px;
                                        transition-property: all;
                                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                        transition-duration: 150ms;

                                        svg {
                                            width: 16px;
                                            height: 16px;
                                        }

                                        @media (hover: hover) and (pointer: fine) {
                                            &:hover {
                                                border: 1px solid var(--sp-widget-function-button-hover-border-color);
                                                color: var(--sp-widget-function-button-hover-text-color);
                                                background: var(--sp-widget-function-button-hover-color);
                                            }
                                        }
                                    }
                                }

                                .descriptionText {
                                    padding-left: 8px;
                                    margin-top: 8px;
                                    font-size: 12px;
                                    line-height: 16px;
                                    color: var(--sp-widget-secondary-text-color);
                                    text-align: left;

                                    &.error {
                                        color: var(--sp-widget-destructive-text-color);
                                    }
                                }
                            }

                            .mainButton {
                                margin-top: 2rem;
                                width: 100%;
                                -webkit-user-select: none;
                                -moz-user-select: none;
                                -ms-user-select: none;
                                user-select: none;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 14px;
                                line-height: 20px;
                                font-weight: 500;
                                border-radius: 6px;
                                cursor: pointer;
                                height: 40px;
                                padding: 16px 8px;
                                color: var(--sp-widget-primary-button-text-color);
                                background: var(--sp-widget-primary-button-color);
                                border: 1px solid var(--sp-widget-primary-button-border-color);
                                transition-property: all;
                                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                                transition-duration: 150ms;

                                @media (hover: hover) and (pointer: fine) {
                                    &:hover {
                                        color: var(--sp-widget-primary-button-hover-text-color);
                                        background: var(--sp-widget-primary-button-hover-color);
                                        border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                                    }
                                }

                                &:disabled {
                                    pointer-events: none;
                                    touch-action: none;
                                    opacity: 0.5;
                                }
                            }
                        }
                    }
                }
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'wallet-step': WalletStep;
    }
}
