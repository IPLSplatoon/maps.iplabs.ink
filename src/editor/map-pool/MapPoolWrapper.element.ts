import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext } from "../../types-interfaces/Interfaces";
import "./MapPoolEditModal.element"
import { Mode } from "../../types-interfaces/Types";
import { maps, modeAbbreviations } from "../../helpers/MapMode";
import { encodeAppContext, encodeLegacyMapPool } from "../../helpers/AppContext";

@customElement('map-pool-wrapper')
export class MapPoolWrapper extends LitElement {
    @property()
    appContext?: AppContext;
    @state()
    modals: TemplateResult[] = [];
    
    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        css`
            :host {
                --container-color: rgba(221, 252, 243, 0.15);
                --wrapper-bg: linear-gradient(180deg, rgba(221, 252, 243, 0.00) 0%, rgba(221, 252, 243, 0.10) 100%);
                --color: var(--green);
                color: var(--color);
                width: 100%;
                flex: 1;
                min-width: 17em;
                height: 100%;
            }

            .container {
                overflow-y: auto;
                height: 100%;
            }

            .map-pool-selector {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: auto;
                min-height: 2.7em;
                padding: 0 1em;
                border-radius: calc(2.7em / 2); 
                text-align: left;
            }

            .small {
                font-size: .6em;
                font-weight: 500;
                font-family: var(--serif);
                text-transform: none;
                margin-bottom: .15em
            }
        `
    ]

    constructor(){
        super();

        this.addEventListener('modal-closed', () => {
            this.modals = [];
        });
    }

    render(): TemplateResult {
        return html`
            <div class="container bg">
                <div class="wrapper">
                    <div>Edit Map Pool</div>
                    <button class="map-pool-selector" mode="tw" @click=${this.handleTWClicked}>
                        <div>Turf War Maps<div>
                        <div class="small">${this.getCountString(this.appContext?.mapPool.tw.length)} selected</div>
                    </button>
                    <button class="map-pool-selector" mode="sz" @click=${this.handleSZClicked}>
                        <div>Splat Zones Maps<div>
                        <div class="small">${this.getCountString(this.appContext?.mapPool.sz.length)} selected</div>
                    </button>
                    <button class="map-pool-selector" mode="tc" @click=${this.handleTCClicked}>
                        <div>Tower Control Maps<div>
                        <div class="small">${this.getCountString(this.appContext?.mapPool.tc.length)} selected</div>
                    </button>
                    <button class="map-pool-selector" mode="rm" @click=${this.handleRMClicked}>
                        <div>Rainmaker Maps<div>
                        <div class="small">${this.getCountString(this.appContext?.mapPool.rm.length)} selected</div>
                    </button>
                    <button class="map-pool-selector" mode="cb" @click=${this.handleCBClicked}>
                        <div>Clam Blitz Maps<div>
                        <div class="small">${this.getCountString(this.appContext?.mapPool.cb.length)} selected</div>
                    </button>
                </div>
                <div class="wrapper">
                    <div>Map Pool Tools</div>
                    <button @click=${this.handleMapPoolGraphicClick}>Map Pool Graphic</button>
                    <button @click=${this.handleUseInSendouInkClick}>Use in sendou.ink</button>
                </div>
            </div>
            ${this.modals}
        `;
    }

    private getCountString(count: number | undefined) {
        if (count === 0) return "None";
        if (count === maps.length) return "All";
        return `${count}`;
    }       

    //other implimentations were buggy, trust me
    private handleTWClicked() {
        this.openModal('tw');
    }

    private handleSZClicked() {
        this.openModal('sz');
    }

    private handleTCClicked() {
        this.openModal('tc');
    }

    private handleRMClicked() {
        this.openModal('rm');
    }

    private handleCBClicked() {
        this.openModal('cb');
    }

    private openModal(mode: Mode) {
        const modal = html`<map-pool-edit-modal .appContext=${this.appContext} .targetMode=${mode}></map-pool-edit-modal>`;
        this.modals = [modal];
    }

    private handleMapPoolGraphicClick(): void {
        if (!this.appContext) return;
        
        let maps = false;
        for (let i = 0; i < modeAbbreviations.length; i++) {
            if (this.appContext.mapPool[modeAbbreviations[i]].length > 0) {
                maps = true;
                break;
            }
        }

        if (!maps) {
            alert("You need to have at least one map in your map pool to generate a graphic.");
            return;
        }

        window.open("/map-pool-graphic/?c=" + encodeAppContext(this.appContext));
    }

    private handleUseInSendouInkClick(): void {
        const encode = encodeLegacyMapPool(this.appContext!);
        window.open("https://sendou.ink/maps?pool=" + encode);
    }
}