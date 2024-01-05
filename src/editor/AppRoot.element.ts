import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../styles/Variable.styles.ts";
import * as _ from "lodash";
import "./header/HeaderWrapper.element.ts";
import { decodeAppContext, decodeLegacyMapPool, decodeLegacyRounds, encodeAppContext } from "../helpers/AppContext.ts";
import "./map-pool/MapPoolWrapper.element.ts";
import "./map-list/MapListWrapper.element.ts";
import "./map-list-export/MapListExportWrapper.element.ts";
import { AppContext, MapPool, Round } from "../types-interfaces/Interfaces";
import { Mode } from "../types-interfaces/Types.ts";
import { buttonStyles } from "../styles/Button.styles.ts";

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
    @state()
    mobileNav: "map-pool" | "map-list" = "map-list";

    static styles = [
        variableStyles,
        buttonStyles,
        css`
        :host {
            display: flex;
            width: calc(100dvw - var(--padding)  * 2);
            height: calc(100dvh - var(--padding) * 2);
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
            height: -webkit-fill-available;
            height: 100%;
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

        .mobile-nav {
            display: none;
        }

        @media only screen and (max-width: 47rem) {
            :host {
                min-height: calc(100dvh - var(--padding) * 2);
                height: auto;
                overflow-y: auto;
            }

            .mobile-nav {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                gap: var(--margin);
                width: 100%;
                font-size: .8em;
                padding: calc(var(--padding) / 2) 0;
            }

            .mobile-nav button {
                width: 100%;
                min-width: 7em;
                text-align: center;
            }

            .mobile-nav button.green {
                --color: var(--green);
                --on-background: rgba(221, 252, 243, 0.15);
            }

            .mobile-nav button.pink {
                --color: var(--pink);
                --on-background: rgba(248, 216, 227, 0.15);
            }

            .mobile-nav button.mobile-focus {
                width: calc(100% + 20em);
                background: var(--on-background);
            }

            .mobile-nav button.mobile-focus:hover {
                background: var(--color);
            }

            map-pool-wrapper.mobile-focus {
                display: flex;
            }

            map-pool-wrapper {
                display: none;
            }

            .map-list-wrapper.mobile-focus {
                display: flex;
            }

            .map-list-wrapper {
                display: none;
            }
        }
        `
    ]

    constructor(){
        super();

        try {
            const urlParams = new URLSearchParams(window.location.search);

            //check for legacy encodings
            if (urlParams.has("rounds") || urlParams.has("pool")) {
                if (!urlParams.has("3")) {
                    window.location.replace("/v1/?" + urlParams.toString());
                }

                if (urlParams.has("pool")) {
                    this.appContext.mapPool = decodeLegacyMapPool(urlParams.get("pool") as string, this.appContext.mapPool);
                }

                if (urlParams.has("rounds")) {
                    this.appContext.rounds = decodeLegacyRounds(urlParams.get("rounds") as string, this.appContext.rounds);
                }
            }

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
            // console.log("map-pool-update event fired", (e as any).detail);
            this.updateMapPool((e as any).detail as MapPool);
        });

        this.addEventListener("rounds-update", (e: Event) => {
            // console.log("rounds-update event fired", (e as any).detail);
            this.updateRounds((e as any).detail as Round[]);
        });

        this.addEventListener("app-context-update", (e: Event) => {
            // console.log("app-context-update event fired", (e as any).detail);
            this.appContext = (e as any).detail as AppContext;
            this.updateWindowState();
        });
    }

    render(): TemplateResult {
        return html`
        <div class="primary-container">
            <header-wrapper .appContext=${this.appContext}></header-wrapper>
            <div class="mobile-nav">
                <button class="green ${this.mobileNav == "map-pool" ? "mobile-focus" : ""}" @click=${this.handleMapPoolMobileClicked}>Map Pool</button>
                <button class="pink ${this.mobileNav == "map-list" ? "mobile-focus" : ""}" @click=${this.handleMapListMobileClicked}>Map List</button>
            </div>
            <div class="side-by-side">
                <map-pool-wrapper class="${this.mobileNav == "map-pool" ? "mobile-focus" : ""}" .appContext=${this.appContext}></map-pool-wrapper>
                <div class="map-list-wrapper ${this.mobileNav == "map-list" ? "mobile-focus" : ""}">
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
        const encodedContextObj = encodeAppContext(this.appContext);
        const encodedContext = encodedContextObj.encodedContext;
        const encodeVersion = encodedContextObj.encodeVersion;
        if (encodedContext === "()_"){
            window.history.replaceState(null, "", "?");
        } else {
            window.history.replaceState(null, "", `?c=${encodedContext}&v=${encodeVersion}`)
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

    private handleMapPoolMobileClicked() {
        this.mobileNav = "map-pool";
    }

    private handleMapListMobileClicked() {
        this.mobileNav = "map-list";
    }
}