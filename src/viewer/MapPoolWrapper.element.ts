import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import { variableStyles } from "../styles/Variable.styles";
import { containerStyles } from "../styles/Container.styles";
import { modeAbbreviationToWords, modeAbbreviations } from "../helpers/MapMode";

@customElement('map-pool-wrapper')
export class ViewerMapPoolWrapper extends LitElement {
    @property()
    appContext?: AppContext;

    static styles = [
        variableStyles,
        containerStyles,
        css`
            :host {
                --container-color: rgba(221, 252, 243, 0.15);
                --wrapper-bg: linear-gradient(180deg, rgba(221, 252, 243, 0.00) 0%, rgba(221, 252, 243, 0.10) 100%);
                --color: var(--green);
                color: var(--color);
                width: 100%;
                flex: 1;
                min-width: 20em;
                height: 100%;
            }

            .container {
                overflow-y: auto;
                height: 100%;
            }

            ul {
                margin: 0;
            }
        `
    ];

    render(): TemplateResult {
        if (!this.appContext) return html``;

        let mapListTemplates: TemplateResult[] = [];
        for (let i = 0; i < modeAbbreviations.length; i++) {
            const mapPool = this.appContext.mapPool[modeAbbreviations[i]];
            console.log(mapPool);
            if (!mapPool || mapPool.length === 0) continue;
            const maps: TemplateResult[] = [];
            for (let j = 0; j < mapPool.length; j++){
                maps.push(html`<li>${mapPool[j]}</li>`);
            }
            mapListTemplates.push(html`
                <div class="wrapper">
                    <div>${modeAbbreviationToWords(modeAbbreviations[i])} Maps</div>
                    <ul>${maps}</ul>
                </div>
            `);
        }

        return html`
            <div class="container bg">
                ${mapListTemplates}
            </div>
        `;
    }
}