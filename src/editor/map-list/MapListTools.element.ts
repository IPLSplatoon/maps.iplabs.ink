import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import { gsap } from "gsap";
import "./GenerateModal.element.ts";
import { generateButtonStyles } from "../../styles/GenerateButton.styles.ts";

@customElement('map-list-tools')
export class MapListTools extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    modals: TemplateResult[] = [];

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        generateButtonStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                height: 3.2em;
                white-space: nowrap;
                color: var(--color);
                width: 100%;
                overflow: hidden;
            }

            .wrapper {
                flex-direction: row;
                align-items: center;
                flex-wrap: nowrap;
                justify-content: flex-start;
                width: calc(100% - 2 * var(--padding));
                padding: 0 var(--padding);
                height: 100%;
            }
        `
    ];

 
    constructor(){
        super();

        this.addEventListener('modal-closed', () => {
            this.modals = [];
        });
    }

    render(): TemplateResult {
        return html`
            <div id="scrollTarget" class="wrapper horizontal overflow" @wheel=${this.handleWheelScroll}>
                <div>Map List Tools</div>
                <button class="generate" @click=${this.handleGenerateClick}>Generate</button>
                <button>Stats</button>
                <button @click=${this.handleResetClick}>Reset</button>
            </div>
            ${this.modals}
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

    private handleResetClick(): void {
        if (this.appContext?.rounds.length === 0 || !this.appContext) return;
        if (confirm("Are you sure you want to reset the map list?\nYour map pool will stay the same.\nThe rounds you've created will be deleted.")){
            const event = new CustomEvent("rounds-update", {
                composed: true,
                detail: []
            });
            this.dispatchEvent(event);
        }
    }

    private handleGenerateClick(): void {
        if (!this.appContext) return;
        this.modals = [html`<generate-modal .appContext=${this.appContext}></generate-modal>`];
    }
}