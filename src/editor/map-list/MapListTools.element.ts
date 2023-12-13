import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import { gsap } from "gsap";

@customElement('map-list-tools')
export class MapListTools extends LitElement {
    @property()
    appContext?: AppContext;
    
    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                height: 3.2em;
                white-space: nowrap;
                color: var(--color);
                overflow-x: hidden;
                width: 100%;
            }

            .wrapper {
                flex-direction: row;
                align-items: center;
                flex-wrap: nowrap;
                justify-content: flex-start;
                min-width: fit-content;
                width: calc(100% - 2 * var(--padding));
                padding: 0 var(--padding);
                height: 100%;
            }

            button.generate {
                background: conic-gradient(from 270deg at 50% 50%, #F5FCD9 90deg, #F8D8E3 180deg, #E0DAFC 270deg, #DDFCF3 360deg);
                border: none;
                color: var(--bg);
                font-weight: 600;
            }

            button.generate:hover {
                background: conic-gradient(from 200deg at 50% 50%, #F5FCD9 90deg, #F8D8E3 180deg, #E0DAFC 270deg, #DDFCF3 360deg);
            }
        `
    ]

    render(): TemplateResult {
        return html`
            <div class="wrapper" @wheel=${this.handleWheelScroll}>
                <div>Map List Tools</div>
                <button class="generate">Generate</button>
                <button>Stats</button>
                <button @click=${this.handleResetClick}>Reset</button>
            </div>
        `;
    }

    private handleWheelScroll(e: WheelEvent): void {
        const scrollAmount = e.deltaY / 1.5;
        const container = this as HTMLElement;
        gsap.to(container, {
            scrollLeft: container.scrollLeft + scrollAmount,
            ease: "power2.inOut",
            duration: 0.05
        });
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
}