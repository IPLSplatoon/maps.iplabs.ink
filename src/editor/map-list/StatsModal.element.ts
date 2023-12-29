import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { modalStyles } from "../../styles/Modal.styles";
import { getModalCloseTimeline, getModalOpenTimeline } from "../../helpers/ModalAnimations";
import back from "../../assets/back-pink.svg"
import { AppContext } from "../../types-interfaces/Interfaces";
import { checkboxStyles } from "../../styles/Checkbox.styles";
import { modeAbbreviationToWords, modeAbbreviations } from "../../helpers/MapMode";
import _ from "lodash";
import { Mode } from "../../types-interfaces/Types";

@customElement('stats-modal')
export class StatsModal extends LitElement {
    @property()
    appContext?: AppContext;
    @state()
    roundIndicesTracked?: number[] = [];
    @state()
    optionsVisible = false;

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        modalStyles,
        checkboxStyles,
        css`
            :host {
                --container-color: rgba(248, 216, 227, 0.15);
                --color: var(--pink);
                --wrapper-bg: linear-gradient(180deg, rgba(248, 216, 227, 0.00) 0%, rgba(248, 216, 227, 0.10) 100%);
                color: var(--color);
                font-size: var(--font-size);
            }

            .header {
                font-size: 1.3em;
                font-weight: 600;
            }

            .mode-wrapper {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: var(--gap);
            }

            .bar-wrapper {
                --width: 0%;
                width: calc(var(--width) - 2em - .12em);
                color: var(--color);
                padding-right: .75em;
                padding-left: 1.25em;
                background: linear-gradient(90deg, rgba(248, 216, 227, 0.10) 0%, rgba(248, 216, 227, 0.00) calc(100% - 2em));
                border: .12em solid var(--color);
                border-radius: 15px;
                height: 1.3em;
                display: flex;
                align-items: center;
                justify-content: flex-end;
                text-align: center;
                font-family: var(--mono);
                font-weight: 600;
            }
        `
    ];

    connectedCallback(){
        super.connectedCallback();
        this.roundIndicesTracked = Array.from(Array(this.appContext?.rounds.length).keys());
    }

    render(): TemplateResult {
        return html`
            <div class="modal" style="display: none">
                <div class="modal-body">
                    <div class="modal-header">
                        <button class="back" @click=${this.handleCloseEvent}><img src=${back}></button>
                        <div class="title">Map List Stats</div>
                    </div>
                    <div class="modal-contain container bg">
                        <div class="wrapper">
                            <button @click=${this.handleOptionsClick}>
                                ${this.optionsVisible ? "Collapse Stats Options ▲" : "Expand Stats Options ▼"}
                            </button>
                            ${this.getOptionsTemplates()}
                        </div>
                        ${this.getStatsTemplates()}
                    </div>
                </div>
            </div>
        `;
    }

    firstUpdated() {
        const tl = getModalOpenTimeline(this.shadowRoot?.firstElementChild as HTMLElement);
        tl.play();
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

    private getStatsTemplates(): TemplateResult[] {
        if (!this.appContext || !this.roundIndicesTracked) return [];

        const templates: TemplateResult[] = [];
        
        const stats = {} as any;
        for (let i = 0; i < modeAbbreviations.length; i++){
            const mapPool = this.appContext?.mapPool[modeAbbreviations[i]];
            if (!mapPool) continue;
            stats[modeAbbreviations[i]] = {} as any;
            for (let j = 0; j < mapPool.length; j++){
                stats[modeAbbreviations[i]][mapPool[j]] = 0;
            }
        }

        for (let i = 0; i < this.roundIndicesTracked.length; i++) {
            const round = this.appContext?.rounds[this.roundIndicesTracked[i]];
            if (!round) continue;

            for (let j = 0; j < round?.games.length; j++){
                const game = round?.games[j];
                if (game === "counterpick") continue;
                stats[game.mode][game.map]++;
            }
        }

        for (let i = 0; i < Object.keys(stats).length; i++){
            const mode = Object.keys(stats)[i];
            const mapStats = stats[mode];
            if (Object.keys(mapStats).length === 0) continue;

            let maxCount = _.max(_.values(mapStats));

            const mapStatsTemplates: TemplateResult[] = [];

            for (let j = 0; j < Object.keys(mapStats).length; j++){
                const map = Object.keys(mapStats)[j];
                const stat = mapStats[map];

                let widthStyle = (stat / maxCount) * 100;
                if (Number.isNaN(widthStyle)) widthStyle = 0;

                mapStatsTemplates.push(html`
                    <div>${map}</div>
                    <div class="bar-wrapper" style="--width: ${widthStyle}%">${stat}</div>
                `);
            }

            templates.push(html`
                <div class="wrapper">
                    <div class="header">${modeAbbreviationToWords(mode as Mode)}</div>
                    ${mapStatsTemplates}    
                </div>
            `);
        }

        return templates;
    }

    private handleOptionsClick(): void {
        this.optionsVisible = !this.optionsVisible;
    }

    private getOptionsTemplates(): TemplateResult[] {
        if (!this.appContext || !this.optionsVisible) return [];

        const templates: TemplateResult[] = [];

        for (let i = 0; i < this.appContext.rounds.length; i++) {
            const round = this.appContext.rounds[i];
            if (!round) continue;

            const selected = this.roundIndicesTracked?.indexOf(i) !== -1;

            templates.push(html`
                <label class="checkbox-container ${selected ? "selected" : ""}" for=${i}>${round.name}
                    <input type="checkbox" id=${i} @click=${this.handleOptionCheckboxChange} checked>
                </label>
            `);
        }

        return templates;
    }

    private handleOptionCheckboxChange(e: Event): void {
        if (!this.roundIndicesTracked) return;
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.id);
        if (target.checked){
            (e.target as HTMLElement).parentElement?.classList.add('selected');
            this.roundIndicesTracked = [...this.roundIndicesTracked, index]
        } else {
            (e.target as HTMLElement).parentElement?.classList.remove('selected');
            this.roundIndicesTracked = this.roundIndicesTracked?.filter((i) => i !== index);
        }
    }
}