import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import { INotification } from '../types.ts';

@customElement('custom-notification')
export class CustomNotification extends LitElement {

    @property({ type: Boolean })
    darkTheme: boolean = false;

    @property({ type: Boolean })
    active: boolean = false;

    @property({ type: Object })
    data: INotification | null = null;

    render() {
        return html`
            <div class=${`notification ${this.darkTheme ? 'dark' : ''} ${this.active ? 'active' : ''}`}>
                <div class="content">
                    ${this.data?.title ? html` <h2>${this.data.title}</h2> ` : ''}
                    ${this.data?.text ? html` <p>${this.data.text}</p> ` : ''}
                </div>

                ${this.data?.buttonText
            ? html`
                          <div class="buttonWrapper">
                              <button @click=${this.hideNotification}>
                                  ${this.data.buttonText}
                              </button>
                          </div>
                      `
            : ''}
            </div>
        `;
    }

    private hideNotification() {
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

        .notification {
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            min-height: 50px;
            border: 1px solid var(--sp-widget-hint-color);
            border-radius: 8px;
            background: var(--sp-widget-bg-color);
            padding: 15px 10px;
            z-index: 1;
            display: flex;
            align-items: flex-end;
            gap: 10px;
            transform: translateY(calc(-100% - 30px));
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 350ms;

            &.active {
                transform: translateY(5px);
            }

            .content {
                flex: 1;

                h2 {
                    color: var(--sp-widget-text-color);
                    font-size: 14px;
                    font-weight: 700;
                }

                p {
                    font-size: 13px;
                    font-weight: 400;
                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                    margin-top: 8px;
                }
            }

            .buttonWrapper {
                button {
                    color: var(--sp-widget-button-text-color);
                    background: var(--sp-widget-button-color);
                    border: 0;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 13px;
                    line-height: 1;
                    font-weight: 500;
                    padding: 7px;
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    @media(hover: hover) and (pointer: fine){
                        &:hover {
                            background: color-mix(in srgb, var(--sp-widget-button-color) 90%, transparent);
                        }
                    }
                }
            }

            &.dark {
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
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-notification': CustomNotification;
    }
}