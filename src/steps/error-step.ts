import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('error-step')
export class ErrorStep extends LitElement {
    @property({ type: String })
    title: string = '';

    @property({ type: String })
    text: string = '';

    @property({ type: Boolean })
    dark: boolean = false;

    render() {
        return html`
            <div class="stepContent">
                ${this.title ? html`<h2>${this.title}</h2>` : ''}
                ${this.text ? html`<p>${this.text}</p>` : ''}
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
            flex-direction: column;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 16px;
            text-align: center;
            gap: 16px;
            overflow-y: auto;
            background: var(--sp-primary-background);

            &::-webkit-scrollbar {
                width: 1px;
            }

            &::-webkit-scrollbar-track {
                background: transparent;
            }

            &::-webkit-scrollbar-thumb {
                background: var(--sp-border);
            }

            h2 {
                color: var(--sp-primary-font);
                font-weight: 700;
                font-size: 20px;
            }

            p {
                color: var(--sp-secondary-font);
                font-size: 14px;
                line-height: 20px;
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'error-step': ErrorStep;
    }
}
