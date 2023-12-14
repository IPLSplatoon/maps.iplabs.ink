import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import icon from "../assets/icon-small.png";
import { buttonStyles } from "../styles/Button.styles.ts";
import { containerStyles } from "../styles/Container.styles.ts";
import { variableStyles } from "../styles/Variable.styles.ts";
import { AppContext } from "../types-interfaces/Interfaces.ts";
import { encodeAppContext } from "../helpers/AppContext.ts";

@customElement('viewer-header')
export class ViewerHeader extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    mobileView?: "map-pool" | "map-list";

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        css`
            :host {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: var(--margin);
                height: 3.2em;
                font-size: var(--font-size);
                --container-color: rgba(245, 252, 217, 0.10);
                --color: var(--yellow);
                color: white;
            }

            .container {
                width: 100%;
                height: 100%;
                padding-left: var(--padding);
                padding-right: var(--padding);
                gap: var(--gap);
            }

            img {
                height: 3.2em;
            }

            .logo-text {
                font-size: 1.6em;
                font-weight: 700;
                font-family: var(--mono);
                text-transform: uppercase;
                white-space: nowrap;
                margin-left: calc(var(--gap) / 2);
            }

            .logo-subtext {
                font-size: .7em;
                font-weight: 600;
                font-family: var(--serif);
                text-transform: none;
                margin-top: auto;
            }

            .logo-container {
                display: flex;
                align-items: center;
                gap: var(--gap);
            }

            .mobile-switch-button {
                display: none;
            }

            .overflow.horizontal {
                display: flex;
                flex-direction: row;
                gap: var(--gap);
                flex-wrap: wrap;
            }

            .green {
                --color: var(--green);
            }

            .pink {
                --color: var(--pink);
            }

            @media only screen and (max-width: 47rem) { 
                :host {
                    flex-direction: column;
                    height: auto;
                    gap: var(--gap);
                }

                .logo-text {
                    font-size: 1.3em;
                    white-space: normal;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                img {
                    height: 2.5em;
                }

                .logo-container {
                    gap: calc(var(--gap) / 2);
                }

                .mobile-switch-button {
                    display: block;
                }
            }
        `
    ];

    render(): TemplateResult {
        return html`
        <div class="logo-container">
            <img src="${icon}" alt="Logo">
            <div class="logo-text">
                maps.iplabs.ink
                <span class="logo-subtext">Viewer</span>
            </div>
        </div>
        <div class="overflow horizontal" style="width: auto;">
            <button class="mobile-switch-button ${this.mobileView == "map-list" ? "green" : "pink"}" @click=${this.handleMobileSwitchClick}>
                ${this.mobileView === "map-list" ? "View Map Pool" : "View Map List"}
            </button>
            <button @click=${this.handleEnterEditorClick}>Enter Editor</button>
        </div>
        `;
    }

    private handleEnterEditorClick(): void {
        if (!this.appContext) return;
        window.location.assign("/?c=" + encodeAppContext(this.appContext));
    }

    private handleMobileSwitchClick(): void {
        const event = new CustomEvent("mobile-switch", {
            composed: true
        });
        this.dispatchEvent(event);
    }
}