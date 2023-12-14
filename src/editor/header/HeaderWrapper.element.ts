import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AppContext } from "../../types-interfaces/Interfaces";
import icon from "../../assets/icon-small.png";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { gsap } from "gsap";
import "./AboutModal.element.ts";
import { isJsonAppContext } from "../../helpers/AppContext.ts";

@customElement('header-wrapper')
export class HeaderWrapper extends LitElement {
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

            img {
                height: 100%;
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

            about-modal {
                position: absolute;
                top: 0;
                left: 0;
            }

            @media only screen and (max-width: 999px) {
                :host {
                    height: 100%;
                    width: 100%;
                }

                img {
                    display: none;
                }

                .container.horizontal{
                    flex-wrap: wrap;
                }
                
                .container.bg {
                    padding: var(--padding);
                }

                .button-container {
                    justify-content: flex-start;
                }
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
        ${this.modals}
        <img src=${icon}>
        <div @wheel=${this.handleWheelScroll} class="container bg horizontal overflow" id="scrollTarget">
            <div @wheel=${this.handleWheelScroll} class="logo-text">
                maps.iplabs.ink
                <span class="logo-subtext">Editor</span>
            </div>
            <div class="container horizontal button-container">
                <button @click=${this.handleSaveClick}>Save</button>
                <button @click=${this.handleLoadClick}>Load</button>
                <button @click=${this.handleAboutClick}>About</button>
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

    private handleSaveClick(): void {
        var a = document.createElement("a");
        if (!this.appContext) return;
        var file = new Blob([JSON.stringify(this.appContext)], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = "maps-iplabs-ink.json";
        a.click();
    }

    private handleLoadClick(): void {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.addEventListener("change", (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (!result) return;
                const appContext = JSON.parse(result as string) as AppContext;

                if (!isJsonAppContext(appContext)) {
                    alert("File was not a valid maps.iplabs.ink editor file.");
                    return;
                }

                const appContextEvent = new CustomEvent("app-context-update", {
                    composed: true,
                    detail: appContext
                });
                this.dispatchEvent(appContextEvent);
            }
            reader.readAsText(file);
        });
        input.click();
    }

    private handleAboutClick(): void {
        const modal = html`<about-modal></about-modal>`;
        this.modals = [modal];
    }
}