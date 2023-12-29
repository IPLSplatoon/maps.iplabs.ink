import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext, Game } from "../types-interfaces/Interfaces";
import { variableStyles } from "../styles/Variable.styles";
import { containerStyles } from "../styles/Container.styles";
import { Counterpick } from "../types-interfaces/Types";
import { getPlayStyleString, modeAbbreviationToWords } from "../helpers/MapMode";

@customElement('map-list-wrapper')
export class ViewerMapListWrapper extends LitElement {
    @property()
    appContext?: AppContext;

    static styles = [
        variableStyles,
        containerStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                color: var(--color);
                width: 100%;
                height: 100%;
            }

            .container {
                overflow-y: auto;
                height: 100%;
            }

            ol {
                margin: 0;
            }

            .round-title {
                font-size: 1.1em;
                font-weight: 600;
            }
        `
    ];

    render(): TemplateResult {
        if (!this.appContext) return html``;

        let roundsTemplates: TemplateResult[] = [];
        for (let i = 0; i < this.appContext.rounds.length; i++) {
            const round = this.appContext.rounds[i];
            const games: TemplateResult[] = [];
            for (let j = 0; j < round.games.length; j++) {
                const game = round.games[j] as Game | Counterpick;
                if (game === "counterpick") {
                    games.push(html`<li>Counterpick</li>`);
                } else {
                    games.push(html`<li>${modeAbbreviationToWords(game.mode)} on ${game.map}</li>`);
                }
            }
            roundsTemplates.push(html`
                <div class="wrapper">
                    <div class="round-title">${round.name} - ${getPlayStyleString(round.playStyle, round.games.length)}</div>
                    <ol>${games}</ol>
                </div>
            `);
        }

        return html`
            <div class="container bg">
                ${roundsTemplates}
            </div>
        `;
    }
}