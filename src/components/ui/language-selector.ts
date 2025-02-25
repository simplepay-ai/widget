import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {I18n} from "i18n-js";

@customElement('language-selector')
export class LanguageSelector extends LitElement {

    @property({type: Object})
    i18n: I18n | null = null;

    _handleChange(e: any) {
        if (this.i18n) {
            this.i18n.locale = e.target.value;
            window.dispatchEvent(new CustomEvent('localeChanged'));
        }
    }

    private updateSelectArrow() {
        const color = getComputedStyle(document.documentElement)
            .getPropertyValue('--sp-widget-text-color')
            .trim();

        const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'%3E%3C/path%3E%3C/svg%3E`;

        document.documentElement.style.setProperty('--select-background-image', `url("${svg}")`);
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateSelectArrow();
    }

    render() {
        return html`
            <select @change=${this._handleChange} 
                    class=${`
                    custom-select
                    `}
            >
                <option value="en" ?selected=${this.i18n && this.i18n.locale === 'en'}>English</option>
                <option value="fr" ?selected=${this.i18n && this.i18n.locale === 'fr'}>French</option>
            </select>
        `;
    }

    static styles = css`
        * {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 14px;
            font-weight: 450;
            background: transparent;
            margin: 0;
            padding: 0;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        select {
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            outline: none;
            border: none;
            cursor: pointer;
        }

        .custom-select {
            background-color: var(--sp-widget-bg-color);
            color: var(--sp-widget-text-color);
            border: 1px solid var(--sp-widget-separator-color);
            padding: 8px 10px;
            font-size: 12px;
            border-radius: 6px;
            min-width: 90px;
            max-width: 90px;
            background-image: var(--select-background-image);
            background-repeat: no-repeat;
            background-position: right 10px center;
            transition: border-color 0.15s ease;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'language-selector': LanguageSelector;
    }
}