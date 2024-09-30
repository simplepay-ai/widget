import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';
import { INotification } from '../types.ts';

@customElement('custom-notification')
export class CustomNotification extends LitElement {
    @property({ type: Boolean })
    active: boolean = false;

    @property({ type: Boolean })
    dark: boolean = false;

    @property({ type: Object })
    data: INotification | null = null;

    render() {
        return html`
            <div class=${`notification ${this.active ? 'active' : ''} ${this.dark ? 'dark' : ''}`}>
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
            border: 1px solid var(--sp-border);
            border-radius: 8px;
            background: var(--sp-primary-background);
            padding: 15px 10px;
            z-index: 1;
            display: flex;
            align-items: flex-end;
            gap: 10px;
            box-shadow: 0 5px 10px 1px #0000002e;
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
                    color: var(--sp-primary-font);
                    font-size: 14px;
                    font-weight: 700;
                }

                p {
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--sp-secondary-font);
                    margin-top: 8px;
                }
            }

            .buttonWrapper {
                button {
                    color: var(--sp-primary-background);
                    background: var(--sp-accent);
                    border: 0;
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 13px;
                    line-height: 1;
                    font-weight: 500;
                    padding: 7px;
                    transition-property: color, background-color, border-color,
                        text-decoration-color, fill, stroke;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;

                    &:hover {
                        background: color-mix(in srgb, var(--sp-accent) 90%, transparent);
                    }
                }
            }

            &.dark {
                box-shadow: 0 5px 10px 1px #000000;

                button {
                    color: var(--sp-primary-font) !important;
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-notification': CustomNotification;
    }
}