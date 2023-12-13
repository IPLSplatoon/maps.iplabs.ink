import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AppContext } from "../../types-interfaces/Interfaces";
import icon from "../../assets/icon-small.png";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { gsap } from "gsap";
import "./AboutModal.element.ts";

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
                height: calc(100%);
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
        <img src=${icon}>
        <div @wheel=${this.handleWheelScroll} class="container bg horizontal overflow" id="scrollTarget">
            <div @wheel=${this.handleWheelScroll} class="logo-text">maps.iplabs.ink <span class="logo-subtext">Editor</span></div>
            <div class="container horizontal button-container">
                <button @click=${this.handleAboutClick}>About</button>
            </div>  
        </div>
        ${this.modals}
        `;
    }

    private handleWheelScroll(e: WheelEvent): void {
        const scrollAmount = e.deltaY / 1.5;
        const container = this.shadowRoot?.getElementById("scrollTarget") as HTMLDivElement;
        gsap.to(container, {
            scrollLeft: container.scrollLeft + scrollAmount,
            ease: "power2.inOut",
            duration: 0.05
        })
    }

    private handleAboutClick(): void {
        const modal = html`<about-modal></about-modal>`;
        this.modals = [modal];
    }
}