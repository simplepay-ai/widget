import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {INotification} from '../../lib/types.ts';
//@ts-ignore
import style from "../../styles/payment-page-styles/toast-notification.css?inline";

@customElement('toast-notification')
export class ToastNotification extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Boolean})
    active: boolean = false;

    @property({type: Boolean})
    showNotification: boolean = false;

    @property({type: Boolean})
    dark: boolean = false;

    @property({type: Object})
    data: INotification | null = null;

    private hideNotification() {

        this.showNotification = false;

        const hideOptions = {
            detail: {
                notificationShow: false
            },
            bubbles: true,
            composed: true
        };
        const cleanOptions = {
            detail: {
                notificationData: {
                    title: '',
                    text: '',
                    buttonText: ''
                }
            },
            bubbles: true,
            composed: true
        };

        this.dispatchEvent(new CustomEvent('updateNotification', hideOptions));
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent('updateNotification', cleanOptions));
        }, 350);
    }

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('active')) {
            if (this.active) {
                this.showNotification = true;
            }
        }
    }

    render() {
        return html`
            <div class="notification ${(this.showNotification) ? 'show' : ''}">
                <div class="content">
                    <div class="titleWrapper">
                        ${this.data?.title ? html` <p>${this.data.title}</p> ` : ''}
                        <div class="closeButton"
                             @click=${this.hideNotification}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <path d="M18 6 6 18"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </div>
                    </div>
                    <div class="textWrapper">
                        ${
                                (this.data?.text && typeof this.data?.text === 'string')
                                        ? html`<p>${this.data.text}</p>`
                                        : ''
                        }
                        ${
                                (this.data?.text && Array.isArray(this.data?.text))
                                        ? this.data?.text.map((item: string) => html`
                                            <p>${item}</p>
                                        `)
                                        : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'toast-notification': ToastNotification;
    }
}