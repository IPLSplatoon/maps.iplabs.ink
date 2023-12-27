import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import icon from "../assets/icon-small.png";
import { variableStyles } from "../styles/Variable.styles";
import { containerStyles } from "../styles/Container.styles";
import { buttonStyles } from "../styles/Button.styles";
import { gsap } from "gsap";
import { encodeAppContext } from "../helpers/AppContext";

@customElement('header-wrapper')
export class MPGHeaderWrapper extends LitElement {
    @property()
    appContext?: AppContext;

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        css`
            :host {
                display: flex;
                gap: var(--margin);
                height: 3.2em;
                font-size: var(--font-size);
                --container-color: rgba(245, 252, 217, 0.10);
                --color: var(--yellow);
                color: var(--color);
            }

            .container {
                width: 100%;
                height: 100%;
                padding-left: var(--padding);
                padding-right: var(--padding);
                gap: var(--gap);
            }

            .logo-main {
                height: 100%;
            }

            .logo-mobile {
                display: none;
                height: 75%;
            }

            .logo-text {
                font-size: 1.4em;
                font-weight: 700;
                font-family: var(--mono);
                text-transform: uppercase;
                white-space: nowrap;
            }

            .logo-subtext {
                font-size: .7em;
                font-weight: 600;
                font-family: var(--serif);
                text-transform: none;
            }

            .button-container {
                justify-content: flex-end;
                padding: 0;
            }

            button {
                white-space: nowrap;
            }

            about-modal {
                position: absolute;
                top: 0;
                left: 0;
            }

            @media only screen and (max-width: 60rem) {
                :host {
                    height: 2.8em;
                }       
            }

            @media only screen and (max-width: 34rem) {
                :host {
                    height: auto;
                }

                .container.horizontal {
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .container.bg {
                    padding: calc(var(--padding) / 2) var(--padding);
                }
                
                button {
                    font-size: .85em;
                    border: none;
                    text-decoration: underline;
                    padding: 0 var(--gap);
                    min-height: 0;
                }
                
                .logo-main {
                    display: none;
                }

                .logo-mobile {
                    display: block;
                    height: 2em;
                }

                .logo-text {
                    display: grid;
                }

                .button-container {
                    justify-content: flex-start;
                }
        `
    ];

    render(): TemplateResult {
        return html`
        <img class="logo-main" src=${icon} alt="maps.iplabs.ink logo">
        <div @wheel=${this.handleWheelScroll} class="container bg horizontal overflow" id="scrollTarget">
            <img class="logo-mobile" src=${icon} alt="maps.iplabs.ink logo">
            <div @wheel=${this.handleWheelScroll} class="logo-text">
                maps.iplabs.ink
                <span class="logo-subtext">Map Pool Graphic</span>
            </div>
            <div class="container horizontal button-container">
                <button @click=${this.handleEnterEditorClick}>Enter Editor</button>
            </div>  
        </div>
        `;
    }

    private handleWheelScroll(e: WheelEvent): void {
        const scrollAmount = e.deltaY / 1.5;
        const container = this.shadowRoot?.getElementById("scrollTarget") as HTMLDivElement;
        if (Math.abs(e.deltaY) >= 100){
            gsap.to(container, {
                scrollLeft: container.scrollLeft + scrollAmount,
                ease: "power2.inOut",
                duration: 0.05
            });
        } else {
            container.scrollLeft += scrollAmount;
        }
    }

    private handleEnterEditorClick(): void {
        if (!this.appContext) return;
        const encodedContext = encodeAppContext(this.appContext);
        window.location.assign("/?c=" + encodedContext.encodedContext + "&v=" + encodedContext.encodeVersion);
    }
}