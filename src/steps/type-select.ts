import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {InvoiceType} from "../types.ts";

@customElement('type-select')
export class TypeSelect extends LitElement {

    @property({type: String})
    invoiceType: InvoiceType | '' = '';

    render() {
        return html`
            <div class="stepWrapper">

                <step-header
                        .title= ${'Select invoice type'}
                ></step-header>

                <div class="stepContent">

                    <div class=${`
                    typeButton
                    ${ (this.invoiceType === 'request') ? 'selected' : '' }
                    `}
                    @click=${() => this.SelectType('request')}
                    >
                        <p>Request</p>

                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                            <path d="M12 18V6"/>
                        </svg>
                    </div>

                    <div class=${`
                    typeButton
                    ${ (this.invoiceType === 'item') ? 'selected' : '' }
                    `}
                         @click=${() => this.SelectType('item')}
                    >
                        <p>Item</p>

                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>
                            <path d="M12 22V12"/>
                            <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/>
                            <path d="m7.5 4.27 9 5.15"/>
                        </svg>
                    </div>

                    <div class=${`
                    typeButton
                    ${ (this.invoiceType === 'cart') ? 'selected' : '' }
                    `}
                         @click=${() => this.SelectType('cart')}
                    >
                        <p>Cart</p>

                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="8" cy="21" r="1"/>
                            <circle cx="19" cy="21" r="1"/>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                        </svg>
                    </div>

                </div>

                <div class="stepFooter">
                    <button
                            class="mainButton"
                            @click=${this.dispatchNextStep}
                            .disabled=${this.invoiceType === ''}
                    >
                        Next
                    </button>
                </div>

            </div>
        `;
    }

    private SelectType(type: InvoiceType){
        const updateInvoiceTypeConfigEvent = new CustomEvent('updateInvoiceType', {
            detail: {
                invoiceType: type
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(updateInvoiceTypeConfigEvent);
    }

    private dispatchNextStep() {

        const nextStepEvent = new CustomEvent('nextStep', {
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

        .stepWrapper {
            height: 100%;
            display: flex;
            flex-direction: column;

            .stepContent {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 4px;
                
                &::-webkit-scrollbar {
                    width: 1px;
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--sp-widget-scroll-color);
                }

                .typeButton{
                    user-select: none;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    height: 50px;
                    padding: 10px 20px;
                    border: 1px solid var(--sp-widget-function-button-border-color);
                    border-radius: 8px;
                    background: var(--sp-widget-function-button-color);
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &.selected{
                        border: 1px solid var(--sp-widget-active-color);
                    }

                    p {
                        display: block;
                        flex: 1;
                        font-size: 14px;
                        font-weight: 500;
                        color: var(--sp-widget-function-button-text-color);
                    }

                    svg {
                        color: var(--sp-widget-active-color);
                    }

                    @media (hover: hover) and (pointer: fine) {
                        &:hover {
                            border: 1px solid var(--sp-widget-function-button-hover-border-color);
                            background: var(--sp-widget-function-button-hover-color);

                            &.selected {
                                border: 1px solid var(--sp-widget-active-color);
                            }
                        }
                    }
                }
                
            }

            .stepFooter {
                display: flex;
                align-items: center;
                justify-content: center;
                border-top: 1px solid var(--sp-widget-separator-color);
                padding: 8px;
                background: var(--sp-widget-bg-color);

                .mainButton {
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
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'type-select': TypeSelect;
    }
}
