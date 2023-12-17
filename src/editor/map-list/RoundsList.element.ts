import { CSSResult, LitElement, html, css, TemplateResult, PropertyDeclaration } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles.ts";
import { containerStyles } from "../../styles/Container.styles.ts";
import { buttonStyles } from "../../styles/Button.styles.ts";
import { AppContext, Game } from "../../types-interfaces/Interfaces.ts";
import "./Round.element.ts"
import "./RoundEditor.element.ts"
import _ from "lodash";
import { Counterpick } from "../../types-interfaces/Types.ts";

@customElement('rounds-list')
export class RoundsList extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    editModeIndices: number[] = [];
    
    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                overflow-y: auto;
                height: calc(100% - 3.2em);
                border-radius: 0 0 3px 3px;
                color: var(--color);
            }

            .add-round{
                margin: var(--margin);
            }

            @media only screen and (max-width: 47rem) {
                :host {
                    height: auto;
                    min-height: 50vh;
                }
            }
        `
    ];

    constructor(){
        super();

        this.addEventListener("round-edit-enter", (e: Event) => {
            this.editModeIndices = [...this.editModeIndices, (e as CustomEvent).detail]
        });
        this.addEventListener("round-edit-exit", (e: Event) => {
            const index = this.editModeIndices.indexOf((e as CustomEvent).detail);
            if (index !== -1){
                this.editModeIndices.splice(index, 1);
            }
            this.requestUpdate();
        });
        this.addEventListener("round-edit-move-down", (e: Event) => {
            this.moveRoundDown((e as CustomEvent).detail);
        });
        this.addEventListener("round-edit-move-up", (e: Event) => {
            this.moveRoundUp((e as CustomEvent).detail);
        });
        this.addEventListener("round-delete", (e: Event) => {
            const index = this.editModeIndices.indexOf((e as CustomEvent).detail);
            if (index !== -1){
                this.editModeIndices.splice(index, 1);
            }
            for (let i = 0; i < this.editModeIndices.length; i++){
                if (this.editModeIndices[i] > (e as CustomEvent).detail){
                    this.editModeIndices[i] = this.editModeIndices[i] - 1;
                }
            }
            this.requestUpdate();
        });
    }

    update(changedProperties: Map<string | number | symbol, unknown>){
        super.update(changedProperties);

        console.log(this.editModeIndices);
    }

    render(): TemplateResult {
        const roundTemplates: TemplateResult[] = [];

        for (let i = 0; i < (this.appContext?.rounds.length ?? 0); i++){
            if (this.appContext?.rounds[i]){
                const isEditMode = this.editModeIndices.indexOf(i) !== -1;
                if (isEditMode){
                    roundTemplates.push(html`
                        <round-editor .appContext=${this.appContext} .roundIndex=${i}></round-editor>
                    `);
                } else {
                    roundTemplates.push(html`
                        <round-element .appContext=${this.appContext} .roundIndex=${i}></round-element>
                    `);
                }
            }
        }

        return html`
            ${roundTemplates}
            <button class="add-round" @click=${this.handleAddRoundClick}>Add Round</button>
        `;
    }

    private handleAddRoundClick(): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);

        let roundName = "New Round";
        const lastRoundName = roundsClone?.[roundsClone?.length - 1]?.name ?? "Round 0";
        //if last round name ends with a number
        if (lastRoundName?.match(/\d+$/)){
            roundName = lastRoundName.replace(/\d+$/, (match) => {
                return (parseInt(match) + 1).toString();
            });
        }

        const lastRoundPlayStyle = roundsClone?.[roundsClone?.length - 1]?.playStyle ?? "bestOf";

        const lastRoundGameCount = roundsClone?.[roundsClone?.length - 1]?.games?.length ?? 3;
        let games: (Game | Counterpick)[] = [];
        for (let i = 0; i < lastRoundGameCount; i++){
            games.push("counterpick");
        }

        roundsClone?.push({
            name: roundName,
            playStyle: lastRoundPlayStyle,
            games: games
        });
        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 

        if (roundsClone?.length){
            this.editModeIndices = [...this.editModeIndices, roundsClone?.length - 1];
        }
    }

    private moveRoundDown(roundIndex: number): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);
        const editModeIndicesClone = _.cloneDeep(this.editModeIndices);
        if (!roundsClone || !editModeIndicesClone) return;

        const round = roundsClone?.[roundIndex];
        if (round){
            roundsClone?.splice(roundIndex, 1);
            roundsClone?.splice(roundIndex + 1, 0, round);
        }
        
        const i = editModeIndicesClone.indexOf(roundIndex);

        if (roundIndex + 1 < roundsClone.length){
            const j = editModeIndicesClone.indexOf(roundIndex + 1);
            if (j !== -1) {
                editModeIndicesClone[j]--;
            }
        }

        editModeIndicesClone[i] = editModeIndicesClone[i] + 1;

        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 

        this.editModeIndices = editModeIndicesClone;
    }

    private moveRoundUp(roundIndex: number): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);
        const editModeIndicesClone = _.cloneDeep(this.editModeIndices);
        if (!roundsClone || !editModeIndicesClone) return;

        const round = roundsClone?.[roundIndex];
        if (round){
            roundsClone?.splice(roundIndex, 1);
            roundsClone?.splice(roundIndex - 1, 0, round);
        }
        
        const i = editModeIndicesClone.indexOf(roundIndex);

        if (roundIndex - 1 >= 0){
            const j = editModeIndicesClone.indexOf(roundIndex - 1);
            if (j !== -1) {
                editModeIndicesClone[j]++;
            }
        }

        editModeIndicesClone[i] = editModeIndicesClone[i] - 1;

        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 

        this.editModeIndices = editModeIndicesClone;
    }
}