import { LitElement, html, css, TemplateResult, CSSResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../../types-interfaces/Interfaces";
import icon from "../../assets/icon-small.png";
import { variableStyles } from "../../styles/Variable.styles";
import "./AboutModal.element.ts";
import menu from "../../assets/menu.svg";
import "./MobileMenu.element.ts";

@customElement('moblie-header-wrapper')
export class MobileHeaderWrapper extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    menu: TemplateResult[] = [];

    static styles: CSSResult[] = [
        variableStyles,
        css`
            :host {
                display: flex;
                align-items: center;
                gap: calc(var(--margin) * 1.5);
                height: 3.2em;
                padding: var(--padding);
                font-size: var(--font-size);
                --container-color: rgba(245, 252, 217, 0.10);
                --color: var(--yellow);
                color: var(--color);
                position: sticky;
            }

            .menu {
                height: 65%;
                width: auto;
            }

            .icon {
                height: 100%;
                width: auto;
            }
        `
    ];

    constructor() {
        super();

        this.addEventListener("menu-close", () => {
            this.menu = [];
        });
    }

    render(): TemplateResult {
        return html`
            <img class="menu" src=${menu} @click=${this.handleMenuOnClick}>
            <img class="icon" src=${icon}>
            ${this.menu}
        `;
    }

    private handleMenuOnClick(): void {
        this.menu = [html`<mobile-menu .appContext=${this.appContext}>`];
    }
}