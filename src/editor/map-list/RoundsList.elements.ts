import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import "./Round.element.ts"
import _ from "lodash";

@customElement('rounds-list')
export class RoundsList extends LitElement {
    @property()
    appContext?: AppContext;
    @property()
    editModeIndexes: number[] = [];
    
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
            this.pushEditModeIndex((e as any).detail as number);
        });
        this.addEventListener("round-edit-exit", (e: Event) => {
            this.removeEditModeIndex((e as any).detail as number);
        });
    }

    render(): TemplateResult {
        const roundTemplates: TemplateResult[] = [];

        for (let i = 0; i < (this.appContext?.rounds.length ?? 0); i++){
            if (this.appContext?.rounds[i]){
                const isEditMode = this.editModeIndexes.indexOf(i) > -1;
                roundTemplates.push(html`
                    <round-element .appContext=${this.appContext} .roundIndex=${i} .isEditMode=${isEditMode}></round-element>
                `);
            }
        }

        return html`
            ${roundTemplates}
            <button class="add-round" @click=${this.handleAddRoundClick}>Add Round</button>
        `;
    }

    private handleAddRoundClick(): void {
        const roundsClone = _.cloneDeep(this.appContext?.rounds);
        roundsClone?.push({
            name: "New Round",
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
            this.pushEditModeIndex(roundsClone?.length - 1);
        }
    }

    private pushEditModeIndex(index: number): void {
        this.editModeIndexes = [...this.editModeIndexes, index];
    }

    private removeEditModeIndex(index: number): void {
        for (let i = 0; i < this.editModeIndexes.length; i++){
            if (this.editModeIndexes[i] === index){
                this.editModeIndexes.splice(i, 1);
            }
        }
        this.requestUpdate();
    }
}