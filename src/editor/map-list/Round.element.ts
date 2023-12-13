import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext, Game, Round } from "../../types-interfaces/Interfaces";
import { selectStyles } from "../../styles/Select.styles";
import _ from "lodash";
import { getPlayStyleString, modeAbbreviationToWords, modeAbbreviations } from "../../helpers/MapMode";
import { Counterpick, Mode, Map } from "../../types-interfaces/Types";

@customElement('round-element')
export class RoundElement extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    roundIndex: number = 0;
    
    private round: Round = {
        name: "",
        playStyle: "bestOf",
        games: []
    };

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        selectStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                color: var(--color);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
            }
            
            .top-row {
                display: flex;
                align-items: center;
                gap: var(--gap);
                margin-bottom: calc(var(--gap) / 2);
            }

            button {
                font-size: .75em;
            }

            .wrapper {
                gap: calc(var(--gap) / 2)
            }

            .game {
                display: flex;
                align-items: center;
                gap: calc(var(--gap) * 1.25);
                font-weight: 400;
            }

            .separator {
                width: .09em;
                height: 1.5em;
                background: var(--color);
            }

            .bold {
                font-weight: 600;
                font-size: 1.2em;
            }

            .label {
                font-size: .8em;
                line-height: 1em;
            }
        `
    ];

    render(): TemplateResult {
        this.round = this.appContext?.rounds[this.roundIndex] ?? this.round;

        const gameTemplates: TemplateResult[] = [];
        for (let i = 0; i < this.round.games.length; i++) {
            gameTemplates.push(this.getGameTemplate(this.round.games[i] as Game, i));
        }

        return html`
            <div class="wrapper">
                <div class="top-row">
                    <div class="bold">${this.round.name}</div>
                    <div class="label">${getPlayStyleString(this.round.playStyle, this.round.games.length)}</div>
                    <button @click=${this.handleEditClick}>Edit</button>
                </div>
                ${gameTemplates}
            </div>
        `;
    }

    private getGameTemplate(game: Game | Counterpick, index: number): TemplateResult {
        return html`
            <div class="game" data-index=${index}>
                <select @change=${this.modeOnChange}>${this.getModeOptions(game)}</select>
                ${this.mapChangeSelectorTemplate(game)}
            </div>
        `;
    }

    private mapChangeSelectorTemplate(game: Game | Counterpick): TemplateResult {
        if (game === "counterpick") {
            return html``
        } else {
            return html`
                <div class="separator"></div>
                <select @change=${this.mapOnChange}>${this.getMapPoolOptionsForMode(game)}</select>
            `;
        }
    }

    private getMapPoolOptionsForMode(game: Game): TemplateResult[] {
        const templates: TemplateResult[] = [];

        for (let i = 0; i < (this.appContext?.mapPool[game.mode].length ?? 0); i++) {
            const map = this.appContext?.mapPool[game.mode][i];
            const selected = map === game.map;
            if (map) {
                templates.push(html`<option value=${map} ?selected=${selected}>${map}</option>`);
            }
        }

        return templates;
    } 

    private getModeOptions(game: Game | Counterpick): TemplateResult {
        const modeOptions: TemplateResult[] = [];
        for (let i = 0; i < modeAbbreviations.length; i++) {
            const mode = modeAbbreviations[i] as Mode;
            const modeTemplate = html`
                <option value="${mode}" ?selected=${(game as Game).mode === mode}>${modeAbbreviationToWords(mode)}</option>
            `;
            if (this.appContext?.mapPool[mode].length ?? 0 > 0) {
                modeOptions.push(modeTemplate);
            }
        }

        return html`
            ${modeOptions}
            <option value="counterpick" ?selected=${game === "counterpick"}>Counterpick</option>
        ` 
    }

    private modeOnChange(event: Event): void {
        const roundsClone: Round[] = _.cloneDeep(this.appContext?.rounds) ?? [];

        const target = event.target as HTMLSelectElement;
        const index = parseInt(target.parentElement?.dataset.index ?? "0"); 
        const selectedMode = target.value as Mode | Counterpick;
        const round = roundsClone[this.roundIndex];

        console.log("picked", selectedMode);

        if (selectedMode !== "counterpick") {
            if (round.games[index] === "counterpick") {
                (round.games[index] as Game) = {
                    mode: selectedMode,
                    map: "Scorch Gorge"
                };  
            }
            (round.games[index] as Game).mode = selectedMode;

        } else {
            (round.games[index] as Counterpick) = "counterpick";
        }

        const roundsUpdate = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(roundsUpdate);
    }

    private mapOnChange(event: Event): void {   
        const roundsClone: Round[] = _.cloneDeep(this.appContext?.rounds) ?? [];
        if (!roundsClone) return;

        const target = event.target as HTMLSelectElement;
        const index = parseInt(target.parentElement?.dataset.index ?? "0"); 
        const selectedMap = target.value as Map;
        const round = roundsClone[this.roundIndex];
        (round.games[index] as Game).map = selectedMap;

        const roundsUpdate = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(roundsUpdate);
    }

    private handleEditClick(): void {
        const event = new CustomEvent("round-edit-enter", {
            composed: true,
            detail: this.roundIndex
        });
        this.dispatchEvent(event);
    }
}