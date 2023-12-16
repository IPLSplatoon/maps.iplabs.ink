import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import icon from "../assets/icon-small.png";
import { variableStyles } from "../styles/Variable.styles";
import { containerStyles } from "../styles/Container.styles";
import { buttonStyles } from "../styles/Button.styles";
import { gsap } from "gsap";

@customElement('config-wrapper')
export class MPGConfigWrapper extends LitElement {
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
                gap: var(--gap);
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
                border: 0.15em solid var(--color);
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
        console.log(container.scrollLeft);
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
}