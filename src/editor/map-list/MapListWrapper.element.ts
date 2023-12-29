import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import "./MapListTools.element.ts"
import "./RoundsList.element.ts"

@customElement('map-list-wrapper')
export class MapListWrapper extends LitElement {
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
                width: 100%;
                height: calc(100% - 3.2em - calc(var(--margin) / 3));
            }

            .container.bg {
                border-radius: 15px 15px 3px 3px;
                height: 100%;
            }
        `
    ]

    render(): TemplateResult {
        let tools = html`<map-list-tools .appContext=${this.appContext}></map-list-tools>`

        if (this.appContext?.rounds.length === 0) {
            tools = html``;
        }

        return html`
            <div class="container bg">
                ${tools}
                <rounds-list .appContext=${this.appContext}></rounds-list>
            </div>
        `;
    }
}