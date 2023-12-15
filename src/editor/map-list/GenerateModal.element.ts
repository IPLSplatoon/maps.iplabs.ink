import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { modalStyles } from "../../styles/Modal.styles";
import { getModalCloseTimeline, getModalOpenTimeline } from "../../helpers/ModalAnimations";
import back from "../../assets/back-pink.svg"
import { AppContext } from "../../types-interfaces/Interfaces";
import { selectStyles } from "../../styles/Select.styles";
import { checkboxStyles } from "../../styles/Checkbox.styles";
import { generateButtonStyles } from "../../styles/GenerateButton.styles";
import { modeAbbreviationToWords, modeAbbreviations } from "../../helpers/MapMode";
import { GenerateMode, Mode } from "../../types-interfaces/Types";
import _ from "lodash";
import { generateRounds } from "../../helpers/MapGeneration";

@customElement('generate-modal')
export class GenerateModal extends LitElement {
    @property()
    appContext?: AppContext;
    @state()
    error: string = "";

    private generateMode: GenerateMode = "Replace All";
    private modesToGenerateWith: Mode[] = [];
    private dnmRoundIndices: number[] = [];
    private counterpickRoundIndices: number[] = [];

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        modalStyles,
        selectStyles,
        checkboxStyles,
        generateButtonStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                color: var(--color);
                font-size: var(--font-size);
            }

            select {
                border: .075em solid var(--color);
                width: 100%;
            }

            .generate-wrapper {
                background: #30333b;
                position: absolute;
                bottom: 0;
                left: 0;
                width: calc(100% - 2 * var(--padding));
                height: 3.2em;
                padding: 0 var(--padding);
                border-radius: 0 0 15px 15px;
                border-top: .05em solid var(--container-color);
                display: flex;
                align-items: center;
                gap: var(--gap);
                z-index: 10;
            }

            .modal-contain > *:last-child {
                margin-bottom: 3.2em;
            }

            .round-wrapper {
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                flex-wrap: wrap;
                gap: var(--gap);
            }

            .round-wrapper > .name {
                min-width: 6em;
            }

            .round-wrapper > .checkbox-container {
                width: auto;
                font-size: .8em;
            }

            .header {
                font-size: 1.1em;
                font-weight: 600;
            }

            .error {
                font-style: italic;
                font-size: .9em;
                white-space: normal;
            }
        `
    ];

    render(): TemplateResult {
        let hasModes = false;
        for (let i = 0; i < modeAbbreviations.length; i++){
            const mode = modeAbbreviations[i];
            if (this.appContext?.mapPool[mode].length ?? 0 > 0){
                hasModes = true;
                break;
            }
        }

        let modalContainer: TemplateResult;
        if (!hasModes) {
            modalContainer = html`
                <div class="wrapper">
                    You must add maps to the map pool before you can generate maps.
                </div>
            `;
        } else {
            modalContainer = html`
                <div class="generate-wrapper">
                    <button class="generate" @click=${this.onGenerateClick}>Generate</button>
                    <div class="error">${this.error}</div>
                </div>
                <div class="wrapper">
                    <div class="header">Generate Mode</div>
                    <select @change=${this.handleGenerateModeChange}>
                        <option>Replace All</option>
                        <option>Replace Counterpicks</option>
                        <option>Replace Non-Counterpicks</option>
                    </select>
                </div>
                <div class="wrapper">
                    <div class="header">Modes to generate with</div>
                    ${this.getModesToGenerateWith()}
                </div>
                <div class="wrapper">
                    <div class="header">Round Options</div>
                    ${this.getRoundOptions()}
                </div>
            `;
        }

        return html`
            <div class="modal" style="display: none">
                <div class="modal-body">
                    <div class="modal-header">
                        <button class="back" @click=${this.handleCloseEvent}><img src=${back}></button>
                        <div class="title">Generating Maps</div>
                    </div>
                    <div class="modal-contain container bg">
                        ${modalContainer}
                    </div>
                </div>
            </div>
        `;
    }

    firstUpdated() {
        for (let i = 0; i < modeAbbreviations.length; i++){
            const mode = modeAbbreviations[i];
            if (this.appContext?.mapPool[mode].length === 0) continue;
            this.modesToGenerateWith.push(mode);
        }

        const tl = getModalOpenTimeline(this.shadowRoot?.firstElementChild as HTMLElement);
        tl.play();
    }

    private onGenerateClick() {
        if (!this.appContext) return;

        //error checking
        if (this.modesToGenerateWith.length === 0) {
            this.error = "You must select at least one mode to generate with.";
            return;
        }
        if (this.dnmRoundIndices.length === this.appContext?.rounds.length) {
            this.error = "You cannot select Do Not Modify for all rounds.";
            return;
        }
        this.error = "";

        const generatedRounds = generateRounds(this.appContext.rounds, this.appContext?.mapPool, this.generateMode, this.modesToGenerateWith, this.dnmRoundIndices, this.counterpickRoundIndices);
        
        const event = new CustomEvent('rounds-update', {
            composed: true,
            detail: generatedRounds
        });
        this.dispatchEvent(event);

        this.handleCloseEvent();
    }

    private handleCloseEvent() {
        const tlOptions: GSAPTimelineVars = {
            onComplete: () => {
                const event = new CustomEvent('modal-closed', {
                    composed: true
                });
                this.dispatchEvent(event);
            }
        }
        const tl = getModalCloseTimeline(this.shadowRoot?.firstElementChild as HTMLElement, tlOptions);
        tl.play();
    }

    private getModesToGenerateWith(): TemplateResult[] {
        if (!this.appContext) return [];
        
        const templates: TemplateResult[] = [];

        for (let i = 0; i < modeAbbreviations.length; i++) {
            const mode = modeAbbreviations[i];
            if (this.appContext.mapPool[mode].length === 0) continue;
            templates.push(html`
            <label class="checkbox-container selected" for=${mode}>${modeAbbreviationToWords(mode)}
                <input type="checkbox" id=${mode} data-mode=${mode} @click=${this.handleModeToGenerateWithChange} checked>
            </label>
        `);
        }
        
        return templates;
    }

    private handleGenerateModeChange(e: Event) {
        this.generateMode = (e.target as HTMLInputElement).value as GenerateMode;
    }

    private handleModeToGenerateWithChange(e: Event) {
        if ((e.target as HTMLInputElement).checked) {
            (e.target as HTMLElement).parentElement?.classList.add('selected');
            this.modesToGenerateWith.push((e.target as HTMLInputElement).dataset.mode as Mode);
        } else {
            (e.target as HTMLElement).parentElement?.classList.remove('selected');
            const index = this.modesToGenerateWith.indexOf((e.target as HTMLInputElement).dataset.mode as Mode);
            this.modesToGenerateWith.splice(index, 1);
        }
    }

    private getRoundOptions(): TemplateResult[] {
        if (!this.appContext) return [];

        const templates: TemplateResult[] = [];

        for (let i = 0; i < this.appContext.rounds.length; i++) {
            const round = this.appContext.rounds[i];
            templates.push(html`
                <div class="round-wrapper">
                    <div class="name">
                        ${round.name}
                    </div>
                    <label class="checkbox-container" for=${"dnm-round" + i}>Do not modify
                        <input type="checkbox" id=${"dnm-round" + i} data-round=${i} @click=${this.handleDNMRoundChange}>
                    </label>
                    <label class="checkbox-container" for=${"counterpick-round" + i}>Counterpicking
                        <input type="checkbox" id=${"counterpick-round" + i} data-round=${i} @click=${this.handleCounterpickRoundChange}>
                    </label>
                </div>
            `);
        }

        return templates;
    }    

    private handleDNMRoundChange(e: Event) {
        if ((e.target as HTMLInputElement).checked) {
            (e.target as HTMLElement).parentElement?.classList.add('selected');
            this.dnmRoundIndices.push(parseInt((e.target as HTMLInputElement).dataset.round as string));
        } else {
            (e.target as HTMLElement).parentElement?.classList.remove('selected');
            const index = this.dnmRoundIndices.indexOf(parseInt((e.target as HTMLInputElement).dataset.round as string));
            this.dnmRoundIndices.splice(index, 1);
        }
    }

    private handleCounterpickRoundChange(e: Event) {
        if ((e.target as HTMLInputElement).checked) {
            (e.target as HTMLElement).parentElement?.classList.add('selected');
            this.counterpickRoundIndices.push(parseInt((e.target as HTMLInputElement).dataset.round as string));
        } else {
            (e.target as HTMLElement).parentElement?.classList.remove('selected');
            const index = this.counterpickRoundIndices.indexOf(parseInt((e.target as HTMLInputElement).dataset.round as string));
            this.counterpickRoundIndices.splice(index, 1);
        }
    }
}