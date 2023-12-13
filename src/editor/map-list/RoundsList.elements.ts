import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import "./Round.element.ts"
import "./RoundEditor.element.ts"
import _ from "lodash";

@customElement('rounds-list')
export class RoundsList extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    editModeIndex: number = -1;
    
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
        `
    ];

    constructor(){
        super();

        this.addEventListener("round-edit-enter", (e: Event) => {
            this.editModeIndex = (e as any).detail as number;
        });
        this.addEventListener("round-edit-exit", () => {
            this.editModeIndex = -1;
        });
        this.addEventListener("round-edit-move-down", () => {
            this.moveRoundDown(this.editModeIndex);
        });
        this.addEventListener("round-edit-move-up", () => {
            this.moveRoundUp(this.editModeIndex);
        });
    }

    render(): TemplateResult {
        const roundTemplates: TemplateResult[] = [];

        for (let i = 0; i < (this.appContext?.rounds.length ?? 0); i++){
            if (this.appContext?.rounds[i]){
                const isEditMode = this.editModeIndex === i;
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

        roundsClone?.push({
            name: roundName,
            playStyle: "bestOf",
            games: [
                "counterpick", "counterpick", "counterpick"
            ]
        });
        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 

        if (roundsClone?.length){
            this.editModeIndex = roundsClone.length - 1;
        }
    }

    private moveRoundDown(roundIndex: number): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);
        const round = roundsClone?.[roundIndex];
        if (round){
            roundsClone?.splice(roundIndex, 1);
            roundsClone?.splice(roundIndex + 1, 0, round);
        }
        this.editModeIndex++;
        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 
    }

    private moveRoundUp(roundIndex: number): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);
        const round = roundsClone?.[roundIndex];
        if (round){
            roundsClone?.splice(roundIndex, 1);
            roundsClone?.splice(roundIndex - 1, 0, round);
        }
        this.editModeIndex--;
        const event = new CustomEvent("rounds-update", {
            composed: true,
            detail: roundsClone
        });
        this.dispatchEvent(event); 
    }
}