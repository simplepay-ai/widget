import {css, html, LitElement, property} from 'lit-element';
import {customElement} from 'lit/decorators.js';
import {INotification} from '../types.ts';

@customElement('custom-notification')
export class CustomNotification extends LitElement {

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
                            ${this.data?.text ? html` <p>${this.data.text}</p> ` : ''}
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
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0;
            display: flex;
            align-items: flex-end;
            overflow: hidden;

            &.show {
                height: 100%;
            }

            .overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                background: color-mix(in srgb,
                black 0%,
                transparent) !important;
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;

                &.show {
                    background: color-mix(in srgb,
                    black 75%,
                    transparent) !important;
                }
            }

            .contentWrapper {
                width: 100%;
                background: var(--sp-widget-bg-color);
                z-index: 11;
                border-radius: 25px 25px 0 0;
                overflow: hidden;
                max-height: 50%;
                transform: translateY(100%);
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 150ms;
                
                &.show{
                    transform: translateY(0);
                }
                
                .content {
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;

                    .titleWrapper {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        p {
                            font-size: 20px;
                            line-height: 28px;
                            font-weight: 700;
                            color: var(--sp-widget-text-color);
                        }
                    }

                    .closeButton {
                        margin-right: 8px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        cursor: pointer;
                        user-select: none;
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 350ms;
                        width: 25px;
                        height: 25px;
                        background: var(--sp-widget-function-button-color);
                        border-radius: 6px;

                        svg {
                            width: 20px;
                            height: 20px;
                            color: var(--sp-widget-function-button-text-color);
                            transition-property: all;
                            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                            transition-duration: 350ms;
                        }

                        @media (hover: hover) and (pointer: fine) {
                            &:hover {
                                background: var(--sp-widget-function-button-hover-color);

                                svg {
                                    color: var(--sp-widget-function-button-hover-text-color);
                                }
                            }
                        }
                    }
                    
                    .textWrapper{
                        margin: 1rem 0;
                        
                        p{
                            font-size: 13px;
                            font-weight: 400;
                            color: var(--sp-widget-secondary-text-color);
                        }
                    }

                    .mainButton {
                        margin-top: 1rem;
                        width: 100%;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        line-height: 20px;
                        font-weight: 500;
                        border-radius: 6px;
                        cursor: pointer;
                        height: 40px;
                        padding: 16px 8px;
                        color: var(--sp-widget-primary-button-text-color);
                        background: var(--sp-widget-primary-button-color);
                        border: 1px solid var(--sp-widget-primary-button-border-color);
                        transition-property: all;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 150ms;

                        @media(hover: hover) and (pointer: fine){
                            &:hover{
                                color: var(--sp-widget-primary-button-hover-text-color);
                                background: var(--sp-widget-primary-button-hover-color);
                                border: 1px solid var(--sp-widget-primary-button-hover-border-color);
                            }
                        }
                    }
                }
            }
        }

        //.notification {
        //    position: absolute;
        //    top: 5px;
        //    left: 5px;
        //    right: 5px;
        //    min-height: 50px;
        //    border: 1px solid var(--sp-widget-border-color);
        //    border-radius: 8px;
        //    background: var(--sp-widget-bg-color);
        //    padding: 15px 10px;
        //    z-index: 1;
        //    display: flex;
        //    align-items: flex-end;
        //    gap: 10px;
        //    transform: translateY(calc(-100% - 30px));
        //    transition-property: all;
        //    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        //    transition-duration: 350ms;
        //
        //    &.active {
        //        transform: translateY(5px);
        //    }
        //
        //    .content {
        //        flex: 1;
        //
        //        h2 {
        //            color: var(--sp-widget-text-color);
        //            font-size: 14px;
        //            font-weight: 700;
        //        }
        //
        //        p {
        //            font-size: 13px;
        //            font-weight: 400;
        //            color: var(--sp-widget-secondary-text-color);
        //            margin-top: 8px;
        //        }
        //    }
        //
        //    .buttonWrapper {
        //        button {
        //            color: var(--sp-widget-primary-button-text-color);
        //            background: var(--sp-widget-primary-button-color);
        //            border: 1px solid var(--sp-widget-primary-button-border-color);
        //            cursor: pointer;
        //            border-radius: 6px;
        //            font-size: 13px;
        //            line-height: 1;
        //            font-weight: 500;
        //            padding: 7px;
        //            transition-property: all;
        //            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        //            transition-duration: 150ms;
        //
        //            @media(hover: hover) and (pointer: fine){
        //                &:hover {
        //                    color: var(--sp-widget-primary-button-hover-text-color);
        //                    background: var(--sp-widget-primary-button-hover-color);
        //                    border: 1px solid var(--sp-widget-primary-button-hover-border-color);
        //                }
        //            }
        //        }
        //    }
        //    
        //    &.dark{
        //        background: var(--sp-widget-secondary-bg-color) !important;
        //    }
        //}
    `;
}

declare global {
    interface HTMLElementTagNameMap {
        'custom-notification': CustomNotification;
    }
}