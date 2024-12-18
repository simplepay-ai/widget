import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {InvoiceType} from "../types.ts";
//@ts-ignore
import style from "../styles/type-select.css?inline";

@customElement('type-select')
export class TypeSelect extends LitElement {

    static styles = unsafeCSS(style);

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
}

declare global {
    interface HTMLElementTagNameMap {
        'type-select': TypeSelect;
    }
}
