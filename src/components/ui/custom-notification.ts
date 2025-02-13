import {html, LitElement, property, unsafeCSS} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {INotification} from '../../lib/types.ts';
//@ts-ignore
import style from "../../styles/widget-styles/custom-notification.css?inline";

@customElement('custom-notification')
export class CustomNotification extends LitElement {

    static styles = unsafeCSS(style);

    @property({type: Boolean})
    active: boolean = false;

    @property({type: Boolean})
    showNotification: boolean = false;

    @property({type: Boolean})
    showOverlay: boolean = false;

    @property({type: Boolean})
    showContent: boolean = false;

    @property({type: Boolean})
    dark: boolean = false;

    @property({type: Object})
    data: INotification | null = null;

    updated(changedProperties: Map<string | symbol, unknown>): void {
        super.updated(changedProperties);

        if (changedProperties.has('active')) {

            if (this.active) {
                this.showNotification = true;

                setTimeout(() => {
                    this.showOverlay = true;

                    setTimeout(() => {
                        this.showContent = true;
                    }, 200)
                }, 200)
            }
        }
    }

    render() {
        return html`
            <div class="notification ${(this.showNotification) ? 'show' : ''}">

                <div @click=${this.hideNotification} class="overlay ${(this.showOverlay) ? 'show' : ''}"></div>

                <div class="contentWrapper ${(this.showContent) ? 'show' : ''}">
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
                        ${this.data?.buttonText
                                ? html`
                                    <button class="mainButton" @click=${this.hideNotification}>
                                        ${this.data.buttonText}
                                    </button>
                                `
                                : ''}
                    </div>
                </div>
                
            </div>
        `;
    }

    private hideNotification() {

        this.showContent = false;

        setTimeout(() => {
            this.showOverlay = false;

            setTimeout(() => {
                this.showNotification = false;
            }, 200)
        }, 200)

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
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-notification': CustomNotification;
    }
}