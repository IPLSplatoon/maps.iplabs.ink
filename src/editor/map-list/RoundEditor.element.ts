import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext, Game, Round } from "../../types-interfaces/Interfaces";
import { selectStyles } from "../../styles/Select.styles";
import _ from "lodash";
import { Counterpick, PlayStyle } from "../../types-interfaces/Types";
import { inputStyles } from "../../styles/Input.styles";

@customElement('round-editor')
export class RoundEditor extends LitElement {

    @property()
    appContext?: AppContext;
    @property()
    roundIndex: number = 0;
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
                display: flex;
                align-items: center;
                flex-wrap: nowrap;
                width: 100%;
                border-bottom: .05em solid var(--container-color);
            }

            button {
                font-size: .75em;
            }

            .wrapper {
                gap: calc(var(--gap) / 2)
            }

            .button-container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-left: calc(var(--padding) * .5);
                margin-right: calc(var(--padding) * -.5);
                height: 100%;
            }

            .button-container button {
                padding: 0 .25em;
                border: none;
                font-size: 1.2em;
                height: .25em;
            }

            .editor-container {
                padding: var(--padding);
                margin: var(--padding);
                display: flex;
                flex-direction: row;
                align-items: flex-end;
                flex-wrap: wrap;
                gap: var(--gap);
                border-radius: 15px;
                background: linear-gradient(180deg, rgba(248, 216, 227, 0.00) -150%, rgba(248, 216, 227, 0.10) 100%);
                width: 100%;
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
        return html`
            ${this.getMoveButtons()}
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
                ${this.getError()}
            </div>
        `;
    }

    firstUpdated() {
        const nameInput = this.shadowRoot?.querySelector("#name") as HTMLInputElement;
        if (nameInput) {
            nameInput.select();
        }
    }

    private handleDeleteClick(): void {
        const roundsClone: Round[] = _.cloneDeep(this.appContext?.rounds) ?? [];
        if (!roundsClone) return;
        roundsClone.splice(this.roundIndex, 1);

        const exitEvent = new CustomEvent("round-edit-exit", {
            composed: true
        });
        this.dispatchEvent(exitEvent);
        
        const roundsUpdate = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(roundsUpdate);
    }

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
            composed: true
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

    private getMoveButtons() : TemplateResult {
        if (this.roundIndex === 0 && this.appContext?.rounds.length === 1) {
            return html``;
        }
        if (this.roundIndex === 0) {
            return html`
                <div class="button-container">
                    <button @click=${this.handleMoveDownClick}>↓</button>
                </div>
            `;
        }
        if (this.appContext && this.roundIndex === this.appContext?.rounds.length - 1) {
            return html`
                <div class="button-container">
                    <button @click=${this.handleMoveUpClick}>↑</button>
                </div>
            `;
        }
        return html`
            <div class="button-container">
                <button @click=${this.handleMoveUpClick}>↑</button>
                <button @click=${this.handleMoveDownClick}>↓</button>
            </div>
        `;
    }
    
    private handleMoveUpClick(): void {
        const event = new CustomEvent("round-edit-move-up", {
            composed: true,
            detail: this.roundIndex
        });
        this.dispatchEvent(event);
    }

    private handleMoveDownClick(): void {
        const event = new CustomEvent("round-edit-move-down", {
            composed: true,
            detail: this.roundIndex
        });
        this.dispatchEvent(event);
    }
}