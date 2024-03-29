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
import { checkboxStyles } from "../../styles/Checkbox.styles";

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
        checkboxStyles,
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

            .top-bar {
                flex-direction: row;
                align-items: center;
                flex-wrap: wrap;
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
                        <div class="wrapper top-bar">
                            <button @click=${this.handleSelectAll}>Select All</button>
                            <button @click=${this.handleDeselectAll}>Deselect All</button>
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

    private handleSelectAll() {
        const checkboxes = this.shadowRoot?.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) return;
            checkbox.checked = true;
            checkbox.parentElement?.classList.add('selected');
        });
        this.selectedMaps = [...maps];
    }

    private handleDeselectAll() {
        const checkboxes = this.shadowRoot?.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) return;
            checkbox.checked = false;
            checkbox.parentElement?.classList.remove('selected');
        });
        this.selectedMaps = [];
    }
}