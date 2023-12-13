import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext, Game, Round } from "../../types-interfaces/Interfaces";
import { selectStyles } from "../../styles/Select.styles";
import _ from "lodash";
import { getPlayStyleString, modeAbbreviationToWords, modeAbbreviations } from "../../helpers/MapMode";
import { Counterpick, Mode, Map, PlayStyle } from "../../types-interfaces/Types";
import { inputStyles } from "../../styles/Input.styles";

@customElement('round-element')
export class RoundElement extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    roundIndex: number = 0;
    @property()
    isEditMode: boolean = false;
    @state()
    errorMessage: string = "";
    
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
        inputStyles,
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

            .editor-container {
                --padding-gap: calc(var(--padding) / 2);
                padding: .75em calc(var(--padding) - var(--padding-gap));
                margin: .75em var(--padding-gap);
                display: flex;
                flex-direction: row;
                align-items: flex-end;
                flex-wrap: wrap;
                gap: var(--gap);
                border-radius: 15px;
                background: rgba(248, 216, 227, 0.10);
            }

            .editor-container > div {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: calc(var(--gap) / 2);
            }

            .editor-container > div > input, .editor-container > div > select {
                padding: .25em;
                border: .075em solid var(--color);
                border-radius: 15px;
            }
            
            .label {
                font-size: .8em;
                line-height: 1em;
            }

            input[type="text"] {
                width: 10em;
            }

            input[type="number"] {
                width: 3em;
            }

            /* keeps the number input arrows on the screen */
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button {
                opacity: 1;
            }

            .error {
                font-style: italic;
                font-size: .7em;
            }
        `
    ];

    render(): TemplateResult {
        this.round = this.appContext?.rounds[this.roundIndex] ?? this.round;

        const gameTemplates: TemplateResult[] = [];
        for (let i = 0; i < this.round.games.length; i++) {
            gameTemplates.push(this.getGameTemplate(this.round.games[i] as Game, i));
        }

        let template: TemplateResult;
        if (this.isEditMode) {
            template = html`
                <div class="editor-container" @keydown=${this.handleEditorKeyDown}>
                    <div>
                        <div class="label">Name</div>
                        <input id="name" type="text" value=${this.round.name}>    
                    </div>
                    <div>
                        <div class="label">Games</div>
                        <input id="games" type="number" value=${this.round.games.length} min="1" step="2">
                    </div>
                    <div>
                        <div class="label">Play Style</div>
                        <select id="playStyle">
                            <option value="bestOf" ?selected=${this.round.playStyle === "bestOf"}>Best of</option>
                            <option value="playAll" ?selected=${this.round.playStyle === "playAll"}>Play All</option>
                        </select>
                    </div>
                    <div style="flex-direction: row;">
                        <button @click=${this.handleEditSave}>Save</button>
                        <button @click=${this.handleEditCancel}>Cancel</button>
                        <button @click=${this.handleDeleteClick}>Delete</button>
                    </div>
                </div>
                ${this.getError()}
            `;
        } else {
            template = html`
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

        return html`
            ${template}
        `;
    }

    firstUpdated() {
        if (this.isEditMode){
            const nameInput = this.shadowRoot?.querySelector("#name") as HTMLInputElement;
            if (nameInput) {
                nameInput.select();
            }
        }
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
    
    private handleDeleteClick(): void {
        const roundsClone: Round[] = _.cloneDeep(this.appContext?.rounds) ?? [];
        if (!roundsClone) return;
        roundsClone.splice(this.roundIndex, 1);

        const roundsUpdate = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(roundsUpdate);
    }

    //v v v edit mode functions v v v

    private handleEditSave(e: Event): void {
        const wrapper = (e.target as HTMLElement).parentElement?.parentElement as HTMLElement;
        const name = (wrapper.querySelector("#name") as HTMLInputElement).value;
        const games = parseInt((wrapper.querySelector("#games") as HTMLInputElement).value);
        const playStyle = (wrapper.querySelector("#playStyle") as HTMLSelectElement).value;

        if (!name || name.length === 0) {
            this.errorMessage = "Name cannot be empty";
            return;
        }

        if (!games || games < 1) {
            this.errorMessage = "Must have at least one game";
            return;
        }

        const roundsClone: Round[] = _.cloneDeep(this.appContext?.rounds) ?? [];
        if (!roundsClone) return;
        const thisRoundClone = roundsClone[this.roundIndex];
        thisRoundClone.name = name;
        thisRoundClone.games = thisRoundClone.games.length < games ?
            this.addGames(games - thisRoundClone.games.length, thisRoundClone.games) : 
            thisRoundClone.games.slice(0, games);
        thisRoundClone.playStyle = playStyle as PlayStyle;

        const roundsUpdate = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(roundsUpdate);
        this.editExit();
    }

    private handleEditCancel(): void {
        this.editExit();
    }

    private editExit(): void {
        this.errorMessage = "";
        const event = new CustomEvent("round-edit-exit", {
            composed: true,
            detail: this.roundIndex
        });
        this.dispatchEvent(event);
    }

    private addGames(num: number, games: (Game | Counterpick)[]): (Game | Counterpick)[] {
        for (let i = 0; i < num; i++) {
            games.push("counterpick");
        }
        return games;
    }

    private getError(): TemplateResult {
        if (this.errorMessage) {
            return html`<div class="error">${this.errorMessage}</div>`;
        }
        return html``;
    }

    private handleEditorKeyDown(e: KeyboardEvent): void {
        if (e.key === "Enter") {
            this.handleEditSave(e);
        } else if (e.key === "Escape") {
            this.handleEditCancel();
        }
    }
}