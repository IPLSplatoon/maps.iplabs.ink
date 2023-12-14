import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { variableStyles } from "../styles/Variable.styles.ts";
import * as _ from "lodash";
import "./header/HeaderWrapper.element.ts";
import { decodeAppContext, encodeAppContext } from "../helpers/AppContext.ts";
import "./map-pool/MapPoolWrapper.element.ts";
import "./map-list/MapListWrapper.element.ts";
import "./map-list-export/MapListExportWrapper.element.ts";
import { AppContext, MapPool, Round } from "../types-interfaces/Interfaces";
import { Mode } from "../types-interfaces/Types.ts";
import "../assets/icon-full.png";

@customElement('app-root')
export class AppRoot extends LitElement {
    @property()
    appContext: AppContext = {
        mapPool: {
            tw: [],
            sz: [],
            tc: [],
            rm: [],
            cb: []
        },
        rounds: []
    };

    static styles = [
        variableStyles,
        css`
        :host {
            display: flex;
            width: calc(100vw - var(--padding)  * 2);
            height: calc(100vh - var(--padding) * 2);
            padding: var(--padding);
            background: var(--bg);
            --color: white;
            color: var(--color);
            font-family: var(--serif);
            font-weight: 500;
            font-size: var(--font-size);
        }

        .primary-container {
            display: flex;
            flex-direction: column;
            gap: var(--margin);
            width: 100%;
            max-width: 70em;
            height: 100%;
            background: var(--bg);
            margin-left: auto;
            margin-right: auto;
        }
        
        .side-by-side {
            display: flex;
            flex-direction: row;
            gap: var(--margin);
            height: 100%;
            height: -webkit-fill-available;
            overflow: hidden;
        }

        .map-list-wrapper {
            display: flex;
            flex-direction: column;
            gap: calc(var(--margin) / 3);
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        `
    ]

    constructor(){
        super();

        try {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has("c") && urlParams.get("c") !== "") {
                const context = urlParams.get("c");
                if (context !== null) {
                    const decoded = decodeAppContext(context);
                    this.appContext = decoded;
                }
            } else {
                this.updateWindowState();
            }
        } catch (e) {
            console.error(e);
        }
        

        this.addEventListener("map-pool-update", (e: Event) => {
            console.log("map-pool-update event fired", (e as any).detail);
            this.updateMapPool((e as any).detail as MapPool);
        });

        this.addEventListener("rounds-update", (e: Event) => {
            console.log("rounds-update event fired", (e as any).detail);
            this.updateRounds((e as any).detail as Round[]);
        });

        this.addEventListener("app-context-update", (e: Event) => {
            console.log("app-context-update event fired", (e as any).detail);
            this.appContext = (e as any).detail as AppContext;
            this.updateWindowState();
        });
    }

    render(): TemplateResult {
        return html`
        <div class="primary-container">
            <header-wrapper .appContext=${this.appContext}></header-wrapper>
            <div class="side-by-side">
                <map-pool-wrapper .appContext=${this.appContext}></map-pool-wrapper>
                <div class="map-list-wrapper">
                    <map-list-wrapper .appContext=${this.appContext}></map-list-wrapper>
                    <map-list-export-wrapper .appContext=${this.appContext}></map-list-export-wrapper>
                </div>    
            </div>
        </div>  
        `;
    }

    private updateMapPool(mapPool: MapPool): void {
        const sanitizedRounds = this.getSanitizedRounds(this.appContext.rounds, mapPool);

        this.appContext = {
            mapPool: mapPool,
            rounds: sanitizedRounds
        }
        this.updateWindowState();
    }

    private updateRounds(rounds: Round[]): void {
        this.appContext = {
            mapPool: this.appContext.mapPool,
            rounds: rounds
        }
        this.updateWindowState();
    }

    private updateWindowState(): void {
        const encodedContext = encodeAppContext(this.appContext);
        if (encodedContext === "o$%2C0"){
            window.history.replaceState(null, "", "?");
        } else {
            window.history.replaceState(null, "", `?c=${encodedContext}`)
        }
    }

    //"clean" rounds of maps that are not in the map pool
    private getSanitizedRounds(rounds: Round[], mapPool: MapPool): Round[] { 
        const roundsClone: Round[] = _.cloneDeep(rounds);

        for (let i = 0; i < roundsClone.length; i++){
            const round = roundsClone[i];
            for (let j = 0; j < round.games.length; j++){
                const game = round.games[j];
                if (game !== "counterpick") {
                    const map = game.map;
                    if (mapPool[game.mode as Mode].indexOf(map) === -1){
                        round.games[j] = "counterpick";
                    }
                }
            }
        }

        return roundsClone;
    }
}