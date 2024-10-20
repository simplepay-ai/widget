import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {IProduct} from "../types.ts";

@customElement('step-footer')
export class StepFooter extends LitElement {

    @property({ type: Array })
    productsInfo: IProduct[] = [];

    @property({type: String})
    price: string = '';

    @property({type: Boolean})
    hasButton: boolean = false;

    @property({type: Boolean})
    hasCancelButton: boolean = false;

    @property({type: Boolean})
    hasExplorerButton: boolean = false;

    @property({type: String})
    explorerLink: string = '';

    @property({type: String})
    buttonText: string = '';

    @property({type: Boolean})
    buttonDisabled: boolean = false;

    @property({type: Boolean})
    hasTimer: boolean = false;

    @property({type: Boolean})
    hasBackButton: boolean = false;

    @property({type: String})
    backButtonUrl: string = '';

    @property({type: Number})
    timerTimeStart: number = 0;

    @property({type: Number})
    timerTimeCurrent: number = 0;

    @property({attribute: false})
    timerTimeStartLocal: number = 0;

    @property({attribute: false})
    timerTimeCurrentLocal: number = 0;

    @property({attribute: false})
    progressStart: number = 252;

    @property({attribute: false})
    progressCurrent: number = 252;

    @property({ attribute: false })
    totalSum: number = 0;

    @property({ attribute: false })
    productInfoOpen: boolean = false;

    @property({ attribute: false })
    productInfoOverlayActive: boolean = false;

    async connectedCallback() {
        super.connectedCallback();

        if(this.hasTimer) {
            this.timerTimeStartLocal = this.timerTimeStart;
            this.timerTimeCurrentLocal = this.timerTimeCurrent;

            const oneStep: number = this.progressStart / this.timerTimeStartLocal;
            this.progressCurrent =
                this.progressStart -
                (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * oneStep;

            setInterval(() => this.calcTimer(oneStep), 1000);
        }

        if(this.productsInfo && this.productsInfo.length > 0){
            for(let product of this.productsInfo){
                this.totalSum += product.count * product.prices[0].price
            }
        }
    }

    render() {
        return html`
            <div class=${`stepFooter`}>
                
                ${
                        this.hasCancelButton
                                ? html`
                                    <button
                                            class="secondaryButton"
                                            @click=${this.dispatchCancelInvoice}
                                            ?disabled=${this.buttonDisabled}
                                    >
                                        Cancel payment
                                    </button>
                                `
                                : ''
                }
                
                ${
                        !this.hasCancelButton && this.productsInfo.length === 0
                            ? html`
                                    <div class="product">
                                        <div class="image placeholder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                                <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                            </svg>
                                        </div>

                                        <div class="price">
                                            <p>Total:</p>
                                            <p>${this.price ? `${this.price} USD` : 'Custom'}</p>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${
                        !this.hasCancelButton && this.productsInfo.length > 0
                                ? html`
                                    <div class="product">
                                        <div class=${`image ${ (this.productsInfo.length !== 1 || !this.productsInfo[0].image) && 'placeholder' }`}>
                                            
                                            ${
                                                    (this.productsInfo.length === 1 && this.productsInfo[0].image)
                                                        ? html`
                                                                <img
                                                                        src=${ this.productsInfo[0].image }
                                                                        alt="product image"
                                                                />
                                                            `
                                                            : html`
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                                                    <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                                                </svg>
                                                            `
                                            }
                                        </div>

                                        <div class="productsInfo"
                                             @click=${this.toggleProductInfo}
                                        >
                                            <div class="info">
                                                <div class="row">
                                                    <p>Items:</p>
                                                    <p>${this.productsInfo.length}</p>
                                                </div>
                                                <div class="row">
                                                    <p>Total:</p>
                                                    <p>${parseFloat(this.totalSum.toString()).toFixed(2)} USD</p>
                                                </div>
                                            </div>

                                            <div class="toggleButton">
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
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                `
                                : ''
                }

                ${this.hasButton
                        ? html`
                            <button
                                    class="mainButton"
                                    @click=${this.dispatchNextStep}
                                    ?disabled=${this.buttonDisabled}
                            >
                                ${this.buttonText}
                            </button>
                        `
                        : ''}
                ${this.hasBackButton
                        ? html`
                            <a href=${this.backButtonUrl}>
                                <button class="mainButton">Back to Store</button>
                            </a>
                        `
                        : ''}
                ${this.hasExplorerButton
                        ? html`
                            <a href=${this.explorerLink} target="_blank">
                                <button class="mainButton withIcon">
                                    View in explorer
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
                                        <path
                                                d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
                                        />
                                        <path d="m21 3-9 9"/>
                                        <path d="M15 3h6v6"/>
                                    </svg>
                                </button>
                            </a>
                        `
                        : ''}
                ${this.hasTimer
                        ? html`
                            <div class="timerWrapper">
                                <div class="loader">
                                    <svg
                                            width="78"
                                            height="78"
                                            viewBox="-9.75 -9.75 97.5 97.5"
                                            version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style="transform:rotate(-90deg)"
                                    >
                                        <circle
                                                class="timerBg"
                                                r="40"
                                                cx="38"
                                                cy="38"
                                                fill="transparent"
                                                stroke-width="12"
                                                stroke-dasharray="252"
                                                stroke-dashoffset="0"
                                        ></circle>
                                        <circle
                                                class=${`
                            timerProgress
                            `}
                                                r="40"
                                                cx="38"
                                                cy="38"
                                                stroke-width="12"
                                                stroke-linecap="round"
                                                stroke-dashoffset=${this.progressCurrent}
                                                fill="transparent"
                                                stroke-dasharray="252px"
                                        ></circle>
                                    </svg>
                                </div>

                                <div class="info">
                                    <p class="title">Expiration time</p>
                                    <p
                                            id="timerTime"
                                            class=${`timerLeft
                        `}
                                    >
                                        ${new Date(this.timerTimeCurrentLocal * 1000)
                                                .toISOString()
                                                .slice(14, 19)}
                                    </p>
                                </div>
                            </div>
                        `
                        : ''}
            </div>

            ${
                    this.productsInfo.length > 0
                            ? html`
                                <div class="fullProductInfo ${ (this.productInfoOpen) ? 'show' : '' }">
                                    
                                    <div @click=${this.toggleProductInfo} class="overlay ${ (this.productInfoOverlayActive) ? 'active' : '' }"></div>

                                    <div class="contentWrapper">
                                        <div class="content">
                                            <div class="titleWrapper">
                                                <p class="infoTitle">Products</p>
                                                <div class="closeButton"
                                                     @click=${this.toggleProductInfo}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </div>
                                            </div>
                                            <div class="productsList">

                                                ${
                                                        this.productsInfo.map((item: IProduct) => html`
                                                    <div class="productItem">

                                                        <div class=${`imageWrapper ${ (!item.image) && 'placeholder' }`}>

                                                            ${
                                                                    (item.image)
                                                                            ? html`
                                                                                <img src=${item.image} alt="product image">
                                                            `
                                                                            : html`
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                                                    <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="#1C274C" stroke-width="1" stroke-linecap="round"/>
                                                                </svg>
                                                            `
                                                            }
                                                            
                                                            
                                                        </div>

                                                        <div class="info">
                                                            <p class="name">${item.name}</p>
                                                            <p class="description">${item.description}</p>
                                                        </div>

                                                        <div class="priceWrapper">
                                                            <p class="price">${item.prices[0].price} ${item.prices[0].currency.symbol}</p>
                                                            <p class="count">Count: ${item.count}</p>
                                                        </div>

                                                    </div>
                                                `)
                                                }

                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                `
                            : ''
            }
        `;
    }

    private toggleProductInfo(){
        if(this.productInfoOpen){

            this.productInfoOverlayActive = !this.productInfoOverlayActive;

            setTimeout(() => {
                this.productInfoOpen = !this.productInfoOpen;
            }, 150)

        }else{
            this.productInfoOpen = !this.productInfoOpen;

            setTimeout(() => {
                this.productInfoOverlayActive = !this.productInfoOverlayActive;
            }, 150)
        }
    }

    private calcTimer(step: number) {
        if (this.timerTimeCurrentLocal !== 0) {
            this.timerTimeCurrentLocal -= 1;
            this.progressCurrent =
                this.progressStart - (this.timerTimeStartLocal - this.timerTimeCurrentLocal) * step;
        }
    }

    private dispatchCancelInvoice(){
        const cancelEvent = new CustomEvent('footerCancelClick', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(cancelEvent);
    }

    private dispatchNextStep() {
        const nextStepEvent = new CustomEvent('footerButtonClick', {
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(nextStepEvent);
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

        .stepFooter {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-top: 1px solid var(--sp-widget-separator-color);
            padding: 16px;
            background: var(--sp-widget-bg-color);
            z-index: 10;
            position: relative;
            
            .product {
                display: flex;
                gap: 7px;
                z-index: 2;
                position: relative;

                .image {
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
                    
                    &.placeholder{
                        svg {
                            width: 32px;
                            height: 32px;
                            object-fit: cover;

                            path{
                                stroke: var(--sp-widget-text-color);
                            }
                        }
                    }
                }

                .price {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align: left;

                    p {
                        white-space: nowrap;
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                    }
                }

                .productsInfo {
                    user-select: none;
                    padding-left: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: left;
                    gap: 5px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    @media(hover: hover) and (pointer: fine){
                        &:hover{
                            background: var(--sp-widget-function-button-hover-color);
                        }   
                    }

                    .toggleButton {
                        width: 18px;
                        color: var(--sp-widget-secondary-text-color);
                        aspect-ratio: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform: rotate(-90deg);
                    }

                    .row {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }

                    p {
                        white-space: nowrap;
                        font-size: 12px;
                        line-height: 16px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                    }
                }
            }

            a:has(.mainButton),
            a:has(.secondaryButton){
                text-decoration: none;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 175px;
            }

            .mainButton {
                z-index: 2;
                position: relative;
                max-width: 175px;
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
                width: 100%;
                height: 40px;
                padding: 16px 8px;
                color: var(--sp-widget-primary-button-text-color);
                background: var(--sp-widget-primary-button-color);
                border: 1px solid var(--sp-widget-primary-button-border-color);
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;

                @media(hover: hover) and (pointer: fine){
                    &:hover{
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

                &.withIcon {
                    display: flex;
                    align-items: center;
                    gap: 6px;

                    svg {
                        width: 15px;
                        height: 15px;
                    }
                }
            }
            
            .secondaryButton{
                z-index: 2;
                position: relative;
                max-width: 175px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                line-height: 20px;
                font-weight: 500;
                border-radius: 6px;
                cursor: pointer;
                width: 100%;
                height: 40px;
                padding: 16px 8px;
                color: var(--sp-widget-cancel-button-text-color);
                background: var(--sp-widget-cancel-button-color);
                border: 1px solid var(--sp-widget-cancel-button-border-color);
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;

                @media(hover: hover) and (pointer: fine){
                    &:hover{
                        background: var(--sp-widget-cancel-button-hover-color);
                        border: 1px solid var(--sp-widget-cancel-button-hover-border-color);
                    }
                }

                &:disabled {
                    pointer-events: none;
                    touch-action: none;
                }
            }

            .timerWrapper {
                z-index: 2;
                position: relative;
                display: flex;
                align-items: center;
                gap: 8px;

                .loader {
                    width: 40px;
                    height: 40px;

                    svg {
                        width: 100%;
                        height: 100%;

                        .timerBg {
                            stroke: var(--sp-widget-border-color);
                        }

                        .timerProgress {
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 550ms;
                            stroke: var(--sp-widget-active-color);
                        }
                    }
                }

                .title {
                    font-size: 12px;
                    color: var(--sp-widget-text-color);
                    font-weight: 700;
                    text-align: left;
                }

                .timerLeft {
                    font-size: 16px;
                    font-weight: 600;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 350ms;
                    color: var(--sp-widget-active-color);
                    text-align: left;
                }
            }
        }

        .fullProductInfo {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-end;
            padding-bottom: 73px;
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 350ms;

            &.show {
                top: 0;
            }

            .overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                background: color-mix(
                        in srgb,
                        black 0%,
                        transparent
                ) !important;
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 350ms;

                &.active {
                    background: color-mix(
                            in srgb,
                            black 75%,
                            transparent
                    ) !important;
                }
            }
            
            .contentWrapper{
                width: 100%;
                height: auto;
                max-height: 50%;
                background: var(--sp-widget-bg-color);
                z-index: 2;
                border-radius: 25px 25px 0 0;
                overflow: hidden;

                .content {
                    padding: 1rem 4px;
                    display: flex;
                    flex-direction: column;

                    .titleWrapper{
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .infoTitle {
                        font-size: 20px;
                        line-height: 28px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);
                        padding: 0 8px;
                    }

                    .closeButton{
                        margin-right: 8px;
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

                        svg{
                            width: 20px;
                            height: 20px;
                            color: var(--sp-widget-function-button-text-color);
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                        }

                        @media(hover: hover) and (pointer: fine) {
                            &:hover{
                                background: var(--sp-widget-function-button-hover-color);

                                svg{
                                    color: var(--sp-widget-function-button-hover-text-color);
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
                            background: var(--sp-widget-secondary-bg-color);
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

                                &.placeholder{
                                    svg {
                                        width: 32px;
                                        height: 32px;
                                        object-fit: cover;
                                        
                                        path{
                                            stroke: var(--sp-widget-text-color);
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
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'step-footer': StepFooter;
    }
}
