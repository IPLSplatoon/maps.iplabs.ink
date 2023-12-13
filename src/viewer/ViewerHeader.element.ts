import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import icon from "../assets/icon-small.png";
import { buttonStyles } from "../styles/Button.styles.ts";
import { containerStyles } from "../styles/Container.styles.ts";
import { variableStyles } from "../styles/Variable.styles.ts";
import { AppContext } from "../types-interfaces/Interfaces.ts";

@customElement('viewer-header')
export class ViewerHeader extends LitElement {
    @property()
    appContext?: AppContext;
    @state()
    modals: TemplateResult[] = [];

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
        `
    ];

    constructor() {
        super();
        this.addEventListener('modal-closed', () => {
            this.modals = [];
        });
    }

    render(): TemplateResult {
        return html`
        <div class="logo-container">
            <img src="${icon}" alt="Logo">
            <div class="logo-text">
                maps.iplabs.ink
                <span class="logo-subtext">Viewer</span>
            </div>
        </div>
        <button @click=${this.handleEnterEditorClick}>Enter Editor</button>
        `;
    }

    private handleEnterEditorClick(): void {
        const params = new URLSearchParams(window.location.search);
        window.location.replace(window.location.host + "?" + params.toString());
    }
}