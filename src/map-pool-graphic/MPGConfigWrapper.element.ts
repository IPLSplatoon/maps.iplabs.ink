import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import { variableStyles } from "../styles/Variable.styles";
import { containerStyles } from "../styles/Container.styles";
import { buttonStyles } from "../styles/Button.styles";
import { gsap } from "gsap";
import { selectStyles } from "../styles/Select.styles";

@customElement('config-wrapper')
export class MPGConfigWrapper extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    mapOrder?: "release" | "alphabetical";

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        selectStyles,
        css`
            :host {
                display: flex;
                gap: var(--margin);
                min-height: 3.2em;
                height: 3.2em;
                font-size: var(--font-size);
                --container-color: rgba(221, 252, 243, 0.15);
                --color: var(--green);
                color: var(--color);
            }

            .container {
                width: 100%;
                height: 100%;
                padding-left: var(--padding);
                padding-right: var(--padding);
                gap: var(--margin);
            }

            button {
                white-space: nowrap;
            }

            label {
                white-space: nowrap;
                display: flex;
                gap: var(--gap);
                align-items: center;
            }

            input[type="color"] {
                border: none;
                border-radius: 15em;
                width: 4em;
                block-size: 2em;
                font-size: 1em;
                background: #00000000;
                border: .075em solid var(--color);
                border-radius: 15px;
            }

            select {
                padding: .25em;
                border: .075em solid var(--color);
                border-radius: 15px;
            }

            @media only screen and (max-width: 47rem) { 
                :host {
                    height: auto;
                }

                .container.bg {
                    flex-direction: column;
                    align-items: flex-start;
                    padding: var(--padding);
                    overflow-y: none;
                }
            }
        `
    ];

    render(): TemplateResult {
        return html`
        <div class="container bg horizontal overflow" id="scrollTarget" @wheel=${this.handleWheelScroll}>
            <button @click=${this.handleSaveAsImage}>Save As Image</button>
            <label for="content-color">
                Content Color
                <input @change=${this.handleContentColorChange} type="color" id="content-color" name="content-color" value="#000000" />
            </label>
            <label for="background-color">
                Background Color
                <input @change=${this.handleBackgroundColorChange} type="color" id="background-color" name="background-color" value="#FFFFFF" />
            </label>
            <label for="map-order">Map Order
                <select id="map-order" name="map-order" @change=${this.handleMapOrderChange}>
                    <option value="release">Release</option>
                    <option value="alphabetical">Alphabetical</option>
                </select>
            </label>
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

    private handleSaveAsImage(): void {
        const event = new CustomEvent("image-save", {
            composed: true
        });
        this.dispatchEvent(event);
    }

    private handleContentColorChange(e: Event): void {
        const event = new CustomEvent("content-color-change", {
            composed: true,
            detail: (e.target as HTMLInputElement).value
        });
        this.dispatchEvent(event);
    }

    private handleBackgroundColorChange(e: Event): void {
        const event = new CustomEvent("background-color-change", {
            composed: true,
            detail: (e.target as HTMLInputElement).value
        });
        this.dispatchEvent(event);
    }

    private handleMapOrderChange(e: Event): void {
        const event = new CustomEvent("map-order-change", {
            composed: true,
            detail: (e.target as HTMLInputElement).value
        });
        this.dispatchEvent(event);
    }
}