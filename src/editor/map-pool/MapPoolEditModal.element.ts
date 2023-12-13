import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext, MapPool } from "../../types-interfaces/Interfaces";
import { modalStyles } from "../../styles/Modal.styles";
import { getModalCloseTimeline, getModalOpenTimeline } from "../../helpers/ModalAnimations";
import { maps, modeAbbreviationToWords } from "../../helpers/MapMode";
import _ from "lodash";
import back from "../../assets/back-green.svg"
import { Map, Mode } from "../../types-interfaces/Types";

@customElement('map-pool-edit-modal')
export class MapPoolWrapper extends LitElement {
    private selectedMaps: Map[] = [];

    @property()
    appContext?: AppContext;
    @property()
    targetMode?: Mode;
    @state()
    searchQuery: string = "";

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        modalStyles,
        css`
            :host {
                --container-color: rgba(221, 252, 243, 0.15);
                --wrapper-bg: linear-gradient(180deg, rgba(221, 252, 243, 0.00) 0%, rgba(221, 252, 243, 0.10) 100%);
                --color: var(--green);
                color: var(--color);
                font-size: var(--font-size);
            }

            .checkboxes {
                gap: calc(var(--gap) / 2);
            }

            .checkbox-container {
                display: flex;
                align-items: center;
                font-size: 1.2em;
                font-family: var(--mono);
                font-weight: 400;
                text-transform: Capitalize;
                border-radius: 15px;
                color: var(--color);
                transition-duration: 0.1s;                
                width: calc(100% - var(--padding) - 1.85em);
                padding: .25em 0;
                padding-right: .5em;
                margin-left: 1.85em;
                cursor: pointer;
                position: relative;
            }

            .checkbox-container::before {
                width: 1.1em;
                height: 1.1em;
                content: '';
                position: absolute;
                left: -1.85em;
                border: .08em solid var(--color);
                border-radius: .5em;
                transition-duration: 0.1s;
            }

            .checkbox-container:hover {
                background: var(--color);
                color: var(--bg);
                filter: drop-shadow(0px 0px 4px var(--color));
                padding-right: 0em;
                padding-left: .5em;
                font-weight: 500;
            }

            .checkbox-container input {
                display: none;
            }
            
            .checkbox-container.selected::before {
                background: var(--color);
                border-radius: .2em;
            }

            .checkbox-container.hide {
                opacity: .35;
                font-size: .9em;
            }

            .search {
                width: 100%;
                height: auto;
                border-radius: 15px;
                background: #00000000;
                color: var(--color);
                font-family: var(--serif);
                font-weight: 500;
                font-size: 1.2em;
                border: none;
                outline: none;
            }
            
            .search::placeholder {
                color: var(--color);
                opacity: .5;
            }
        `
    ];

    render(): TemplateResult {
        return html`
            <div class="modal" style="display: none">
                <div class="modal-body">
                    <div class="modal-header">
                        <button class="back" @click=${this.handleCloseEvent}><img src=${back}></button>
                        <div class="title">Editing ${modeAbbreviationToWords(this.targetMode ?? "tw")} Map Pool</div>
                    </div>
                    <div class="modal-contain container bg">
                        <div class="wrapper">
                            <input class="search" type="text" placeholder="Search for a map..." @change=${this.handleSearchChange}>
                        </div>
                        <div class="checkboxes wrapper">
                            ${this.getMapSelectors()}
                        </div>
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
        if (this.appContext){
            const clonedMapPool: MapPool = _.cloneDeep(this.appContext?.mapPool);
            clonedMapPool[this.targetMode ?? "tw"] = this.selectedMaps;
            const event = new CustomEvent("map-pool-update", {
                composed: true,
                detail: {
                    ...clonedMapPool
                }
            });
            this.dispatchEvent(event);
        }

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
    
    private getMapSelectors() : TemplateResult[] {
        const mapSelectors: TemplateResult[] = [];
        const referenceMapPool: Map[] = this.appContext?.mapPool[this.targetMode ?? "tw"] ?? [];

        for (let i = 0; i < maps.length; i++) {
            const map = maps[i];

            const searched = this.searchQuery === "" || map.toLowerCase().includes(this.searchQuery.toLowerCase());

            const isSelected = referenceMapPool?.indexOf(map) > -1;
            mapSelectors.push(html`
                <label class="checkbox-container ${isSelected ? "selected" : ""} ${searched ? "" : "hide"}" for=${map}>${map}
                    <input type="checkbox" id=${map} data-map=${map} ?checked=${isSelected} @click=${this.handleCheckboxChange}>
                </label>
            `);

            if (isSelected) {
                if (this.selectedMaps.indexOf(map) === -1) {
                    this.selectedMaps.push(map);
                }
            }
        }

        return mapSelectors;
    }

    private handleCheckboxChange(e: Event) {
        if ((e.target as HTMLInputElement).checked) {
            this.selectedMaps.push((e.target as HTMLInputElement).dataset.map as Map);

            (e.target as HTMLElement).parentElement?.classList.add('selected');
        } else {
            this.selectedMaps.splice(this.selectedMaps.indexOf((e.target as HTMLInputElement).dataset.map as Map), 1);

            (e.target as HTMLElement).parentElement?.classList.remove('selected');
        }
    }

    private handleSearchChange(e: Event) {
        this.searchQuery = (e.target as HTMLInputElement).value;
    }
}