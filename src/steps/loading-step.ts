import { css, html, LitElement } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('loading-step')
export class LoadingStep extends LitElement {

    render() {
        return html`
            <div class="stepContent">
                <div class="spinner">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke-width="4" />
                        <path
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            </div>
        `;
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

        .stepContent {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: var(--sp-widget-bg-color);

            .spinner {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

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
        'loading-step': LoadingStep;
    }
}
