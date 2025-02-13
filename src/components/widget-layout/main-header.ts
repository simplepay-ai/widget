import {html, LitElement, property, unsafeCSS} from 'lit-element';
import { customElement } from 'lit/decorators.js';
//@ts-ignore
import style from "../../styles/widget-styles/main-header.css?inline";

@customElement('main-header')
export class MainHeader extends LitElement {

    static styles = unsafeCSS(style);

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
            <div class=${`stepHeader`}>
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
                                          .id=${this.token.tokenSymbol.replace('x', '')}
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
                                      
                                      ${`${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(this.walletAddress.length - 4, this.walletAddress.length)}`}
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
}

declare global {
    interface HTMLElementTagNameMap {
        'main-header': MainHeader;
    }
}
