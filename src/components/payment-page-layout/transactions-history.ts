import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/payment-page-styles/transactions-history.css?inline";
import {PaymentPageStep} from "../../lib/types.ts";
import {Invoice, Transaction} from "@simplepay-ai/api-client";
import {roundUpAmount} from "../../lib/util.ts";

@customElement('transactions-history')
export class TransactionsHistory extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Object})
    invoice: Invoice | null = null;

    @property({type: Array})
    transactions: Transaction[] | null = null;

    private dispatchStepChange(step: PaymentPageStep) {
        const changeStepEvent = new CustomEvent('goToStep', {
            detail: {
                stepName: step,
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(changeStepEvent);
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

    render() {
        return html`
            <div class="transactionsHistory">
                <div class="header">
                    ${
                            (this.invoice?.status === 'active')
                                    ? html`
                                        <button
                                                @click=${() => this.dispatchStepChange('invoiceStep')}
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
                        Transactions History
                    </p>
                </div>
                
                ${
                        (Array.isArray(this.transactions) && this.transactions.length > 0)
                        ? html`
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
                                                 @click=${() => this.dispatchSelectTransaction(item.id)}
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
                                `
                                :
                                html`
                                    <div class="transactionsEmptyMessage">
                                        <p>There are no transactions for this invoice yet</p>
                                        
                                        <button class="mainButton"
                                                @click=${() => this.dispatchStepChange('invoiceStep')}
                                        >
                                            Create Transaction
                                        </button>
                                    </div>
                                `
                }

                
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'transactions-history': TransactionsHistory;
    }
}
