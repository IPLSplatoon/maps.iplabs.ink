import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../../types-interfaces/Interfaces";
import { variableStyles } from "../../styles/Variable.styles";
import "./AboutModal.element.ts";
import "./HeaderWrapper.element.ts";
import "../map-pool/MapPoolWrapper.element.ts";
import { gsap } from "gsap";
import close from "../../assets/close.svg";

@customElement('mobile-menu')
export class MobileMenu extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    menuOpen: boolean = false;

    static styles: CSSResult[] = [
        variableStyles,
        css`
            :host {
                display: flex;
                position: absolute;
                left: 0;
                top: 0;
                width: 100vw;
                height: 100vh;
                backdrop-filter: blur(12px) brightness(0.6);
            }

            .menu {
                background: var(--bg);
                width: 80vw;
                height: 100vh;
                max-width: 28em;
                overflow-y: auto;
            }
            
            .scroller {
                display: flex;
                flex-wrap: nowrap;
                flex-direction: column;
                align-items: flex-start;
                gap: var(--gap);
                padding: var(--padding) 0;
            }

            .close {
                padding: 0 var(--padding);
                width: auto;
                height: 3em;
            }
        `
    ];

    constructor() {
        super();
    }

    render(): TemplateResult {
        return html`
            <div class="menu">
                <div class="scroller">
                    <img class="close" src=${close} @click=${this.handleCloseClick}>
                    <header-wrapper .appContext=${this.appContext}></header-wrapper>
                    <map-pool-wrapper .appContext=${this.appContext}></map-pool-wrapper>
                </div>
            </div>
        `;
    }

    firstUpdated(): void {
        if (!this.shadowRoot) {
            gsap.set(this, {
                display: "flex"
            });
            return;
        }

        const tl = gsap.timeline();

        tl.fromTo(this, {
            opacity: 0
        }, {
            opacity: 1,
            duration: .2,
            display: "flex",
            ease: "power2.out"
        }, "<");

        tl.fromTo(this.shadowRoot.querySelector(".menu"), {
            x: -300
        }, {
            x: 0,
            duration: .2,
            ease: "power2.out"
        }, "<");
    }

    private handleCloseClick(): void {
        if (!this.shadowRoot) return;

        const tl = gsap.timeline();

        tl.to(this.shadowRoot.querySelector(".menu"), {
            x: -300,
            duration: .15,
            ease: "power2.in"
        });

        tl.to(this, {
            opacity: 0,
            duration: .15,
            ease: "power2.in",
            onComplete: () => {
                this.sendCloseEvent();
            }
        }, "<");
    }

    private sendCloseEvent(): void {
        console.log("close");
        const event = new CustomEvent("menu-close", {
            composed: true,
        });
        this.dispatchEvent(event);
    }
}