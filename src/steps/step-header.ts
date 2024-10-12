import { Cryptocurrency } from '@simplepay-ai/api-client';
import { css, html, LitElement, property } from 'lit-element';
import { customElement } from 'lit/decorators.js';

@customElement('step-header')
export class StepHeader extends LitElement {
    @property({ type: Boolean })
    darkTheme: boolean = false;

    @property({ type: String })
    title: string = '';

    @property({ type: Boolean })
    hasBackButton: boolean = false;

    @property({ type: Boolean })
    backButtonDisabled: boolean = false;

    @property({ type: Boolean })
    showToken: boolean = false;

    @property({ type: Object })
    token: any = null;

    @property({ type: Array })
    tokens: Cryptocurrency[] = [];

    @property({ type: Boolean })
    showAddress: boolean = false;

    @property({ type: String })
    walletAddress: string = '';

    @property({ type: Boolean })
    hasShareButton: boolean = false;

    @property({ type: Object })
    sharedData: any = null;

    @property({ type: Boolean })
    navigatorCheck: boolean = false;

    connectedCallback() {
        super.connectedCallback();

        if (this.hasShareButton && this.sharedData) {
            this.navigatorCheck = navigator.canShare(this.sharedData);
        }
    }

    render() {
        return html`
            <div class=${`stepHeader ${this.darkTheme ? 'dark' : ''}`}>
                <div class="stepTitle">
                    <div class="leftSection">
                        ${this.hasBackButton
                            ? html`
                                  <button
                                      @click=${this.dispatchReturnBack}
                                      class="backButton"
                                      ?disabled=${this.backButtonDisabled}
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
                                          <path d="m12 19-7-7 7-7" />
                                          <path d="M19 12H5" />
                                      </svg>
                                  </button>
                              `
                            : ''}

                        <p>${this.title}</p>
                    </div>

                    <div class="rightSection">
                        ${this.showToken && this.token
                            ? html`
                                  <div class="tokenIconWrapper">
                                      <token-icon
                                          .id=${this.token.tokenSymbol}
                                          width="32"
                                          height="32"
                                          class="tokenIcon"
                                      ></token-icon>

                                      <network-icon
                                          .id=${this.token.networkSymbol}
                                          width="16"
                                          height="16"
                                          class="networkIcon"
                                      ></network-icon>
                                  </div>

                                  ${this.token.tokenSymbol}
                                  ${this.token.networkStandart
                                      ? html`
                                            <div class="badge">${this.token.networkStandart}</div>
                                        `
                                      : ''}
                              `
                            : ''}
                        ${this.showAddress && this.walletAddress
                            ? html`
                                  <div class="badge withAddress">
                                      <div class="network"></div>

                                      ${this.walletAddress.slice(0, 6)}
                                      ...${this.walletAddress.slice(
                                          this.walletAddress.length - 4,
                                          this.walletAddress.length
                                      )}
                                  </div>
                              `
                            : ''}
                        ${this.hasShareButton && this.sharedData && this.navigatorCheck
                            ? html`
                                  <div
                                      class="shareButton"
                                      @click=${() => this.shareData(this.sharedData)}
                                  >
                                      <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          stroke-width="2"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      >
                                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                          <polyline points="16 6 12 2 8 6" />
                                          <line x1="12" x2="12" y1="2" y2="15" />
                                      </svg>
                                  </div>
                              `
                            : ''}
                    </div>
                </div>
            </div>
        `;
    }

    private async shareData(sharedData: any) {
        try {
            await navigator.share(sharedData);
        } catch (error) {
            console.log('share error', error);
        }
    }

    private dispatchReturnBack() {
        const options = {
            bubbles: true,
            composed: true
        };
        this.dispatchEvent(new CustomEvent('returnBack', options));
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

        .stepHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--sp-widget-hint-color);
            background: var(--sp-widget-bg-color);
            padding: 16px;

            .stepTitle {
                display: flex;
                gap: 16px;
                align-items: center;
                width: 100%;
                justify-content: space-between;

                .leftSection {
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    .backButton {
                        border: 0;
                        cursor: pointer;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: var(--sp-widget-button-color);
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;

                        @media(hover: hover) and (pointer: fine){
                            &:hover{
                                background: color-mix(in srgb, var(--sp-widget-button-color) 90%, transparent);
                            }
                        }
                        
                        &:disabled {
                            pointer-events: none;
                            touch-action: none;
                            opacity: 0.5;
                        }

                        svg {
                            stroke: var(--sp-widget-button-text-color);
                            width: 16px;
                            height: 16px;
                        }
                    }

                    p {
                        font-size: 20px;
                        line-height: 28px;
                        font-weight: 700;
                        color: var(--sp-widget-text-color);

                        &:first-letter {
                            text-transform: capitalize;
                        }
                    }
                }

                .rightSection {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 700;
                    color: var(--sp-widget-text-color);
                    flex: 1;
                    justify-content: end;

                    .tokenIconWrapper {
                        position: relative;

                        .tokenIcon {
                            position: relative;
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-hint-color);
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;

                            svg {
                                width: 16px;
                                height: 16px;
                                stroke: var(--sp-widget-link-color);
                            }
                        }

                        .networkIcon {
                            position: absolute;
                            bottom: -2px;
                            right: -3px;
                            background: var(--sp-widget-bg-color);
                            border: 1px solid var(--sp-widget-hint-color);
                            width: 16px;
                            height: 16px;
                            border-radius: 50%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            overflow: hidden;

                            svg {
                                width: 16px;
                                height: 16px;
                                stroke: var(--sp-widget-link-color);
                            }
                        }
                    }

                    .badge {
                        color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                        font-weight: 700;
                        padding: 2px 4px;
                        background: var(--sp-widget-secondary-bg-color);
                        border: 1px solid var(--sp-widget-hint-color);
                        font-size: 10px;
                        border-radius: 4px;

                        &.withAddress {
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 4px;
                            font-size: 12px;
                            color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent);
                            font-weight: 700;

                            .network {
                                border-radius: 50%;
                                background: var(--sp-widget-bg-color);
                                width: 17px;
                                aspect-ratio: 1;
                            }
                        }
                    }

                    .shareButton {
                        border: 1px solid var(--sp-widget-hint-color);
                        border-radius: 6px;
                        color: var(--sp-widget-text-color);
                        background: var(--sp-widget-secondary-bg-color);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                        font-size: 12px;
                        aspect-ratio: 1;
                        width: 32px;

                        svg {
                            width: 14px;
                            height: 14px;
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

                .badge {
                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent) !important;
                    background: var(--sp-widget-bg-color) !important;
                    border-color: color-mix(
                            in srgb,
                            var(--sp-widget-hint-color) 15%,
                            transparent
                    ) !important;

                    .network{
                        background: color-mix(
                                in srgb,
                                var(--sp-widget-secondary-bg-color) 15%,
                                transparent
                        ) !important;
                    }
                }

                .shareButton {
                    color: color-mix(in srgb, var(--sp-widget-text-color) 50%, transparent) !important;
                    background: var(--sp-widget-bg-color) !important;
                    border-color: var(--sp-widget-bg-color) !important;
                }
            }
        }
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'step-header': StepHeader;
    }
}
