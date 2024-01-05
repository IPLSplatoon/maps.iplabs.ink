import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import { variableStyles } from "../styles/Variable.styles";
import { decodeAppContext } from "../helpers/AppContext";
import "./MPGHeaderWrapper.element.ts"
import "./MPGConfigWrapper.element.ts"
import { Mode } from "../types-interfaces/Types.ts";
import { maps, modeAbbreviations } from "../helpers/MapMode.ts";
import html2canvas from "html2canvas";
import { gsap } from "gsap";

@customElement('mpg-app-root')
export class MPGAppRoot extends LitElement {
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
    @property()
    mapOrder: "release" | "alphabetical" = "release";

    static styles = [
        variableStyles,
        css`
        :host {
            display: flex;
            max-width: calc(100dvw - var(--padding)  * 2);
            min-height: calc(100dvh - var(--padding) * 2);
            width: auto;
            height: 100%;
            padding: var(--padding);
            background: var(--bg);
            --color: white;
            color: var(--color);
            font-family: var(--serif);
            font-weight: 500;
            font-size: var(--font-size);
            
            --graphic-color-content: #000000; 
            --graphic-color-box: #00000010;
            --graphic-color-background: #FFFFFF;
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

        .graphic-wrapper {
            width: 100%;
            min-height: 75dvh;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-grow: 0;
        }

        #graphic-html {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--graphic-color-background);
            color: var(--graphic-color-content);
            white-space: nowrap;
            border-radius: 15px;
        }

        table {
            border-spacing: .35em;
        }
        
        td {
            padding: .15em;
            min-width: 2em;
            text-align: right;
        }

        tr:nth-child(even) > td {
            background: var(--graphic-color-box);
        }

        .circle {
            width: 1em;
            height: 1em;
            border-radius: 50%;
            background: var(--graphic-color-content);
            margin: auto;
        }

        .save-cover {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100dvw;
            height: 100dvh;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            color: white;
            font-size: 2em;
            font-weight: 700;
            z-index: 10;
        }

        @media only screen and (max-width: 47rem){ 
            :host {
                height: auto;
                min-height: calc(100dvh - var(--padding) * 2);
            }

            .graphic-wrapper {
                height: auto;
                min-height: min(100dvw, 60dvh);
            }
        }

        @media only screen and (max-height: 55rem){ 
            :host {
                height: auto;
                min-height: calc(100dvh - var(--padding) * 2);
            }
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
            }
        } catch (e) {
            console.error(e);
        }

        //worst code in the repo award
        this.addEventListener("image-save", () => {
            const saveCover = this.shadowRoot?.querySelector(".save-cover") as HTMLElement;
            const graphicContainer = this.shadowRoot?.getElementById("graphic-html") as HTMLElement;
            if (!graphicContainer && !saveCover) return;
            
            gsap.fromTo(saveCover, {
                opacity: 0,
            }, {
                duration: .15,
                display: "flex",
                opacity: 1,
                ease: "power2.out",
                onComplete: () => {

                    gsap.set(graphicContainer, {
                        position: "absolute",
                        top: "0",
                        left: "0",
                        borderRadius: "0px",
                    });

                    this.resizeGraphic(true);
                    html2canvas(graphicContainer as HTMLElement, {
                        width: 1200,
                        height: 1200,
                        scale: 1,
                        scrollX: 0,
                    }).then(canvas => {
                        const img = canvas.toDataURL("image/png");
                        const link = document.createElement("a");
                        link.download = "map-iplabs-ink-pool.png";
                        link.href = img;
                        link.click();
                        
                        gsap.set(graphicContainer, {
                            position: "",
                            top: "",
                            left: "",
                            borderRadius: "15px",
                        });
                        
                        gsap.to(saveCover, {
                            duration: .15,
                            opacity: 0,
                            ease: "power2.in",
                            display: "none"
                        });

                        this.resizeGraphic();
                    });
                }
            })
        });

        this.addEventListener("content-color-change", (e: Event) => {
            this.style.setProperty("--graphic-color-content", (e as CustomEvent).detail);
            this.style.setProperty("--graphic-color-box", `${(e as CustomEvent).detail}10`);
        });

        this.addEventListener("background-color-change", (e: Event) => {
            this.style.setProperty("--graphic-color-background", (e as CustomEvent).detail);
        });

        this.addEventListener("map-order-change", (e: Event) => {
            this.mapOrder = (e as CustomEvent).detail;
        });
    }

    render(): TemplateResult {
        return html`
        <div class="save-cover">Saving image...</div>
        <div class="primary-container">
            <header-wrapper .appContext=${this.appContext}></header-wrapper>
            <div class="graphic-wrapper">
                <div id="graphic-html">
                    ${this.getMapPoolGraphicTemplate()}
                </div>
            </div>
            <config-wrapper .appContext=${this.appContext}></config-wrapper>
        </div>
        `;
    }

    firstUpdated() {
        this.resizeGraphic();
        window.addEventListener("resize", () => {
            this.resizeGraphic();   
        });
        window.addEventListener("load", () => {
            this.resizeGraphic();
        });
    }

    private resizeGraphic(override: boolean = false) {
        const MARGIN = 30;

        const graphicContainer = this.shadowRoot?.getElementById("graphic-html");
        const graphic = graphicContainer?.firstElementChild as HTMLTableElement;
        const wrapper = graphicContainer?.parentElement;
        if (!wrapper || !wrapper) return;

        graphic.style.transform = `scale(1)`;
        graphicContainer.style.width = ``;
        graphicContainer.style.height = ``;

        const size = !override ? Math.min(wrapper?.clientWidth, wrapper?.clientHeight) : 1200;
        graphicContainer.style.width = `${size}px`;
        graphicContainer.style.height = `${size}px`;

        const boundingRect = graphic.getBoundingClientRect();
        const graphicSize = Math.max(boundingRect.width, boundingRect.height) + MARGIN;
        const ratio = size / graphicSize;
        graphic.style.transform = `scale(${ratio})`;
    }

    private getMapPoolGraphicTemplate(): TemplateResult | undefined {
        const templates: TemplateResult[] = [];

        let topRow: TemplateResult[] = [
            html`<th>Map</th>`
        ];
        
        const modes: Mode[] = [];
        for (let i = 0; i < modeAbbreviations.length; i++) {
            if (this.appContext.mapPool[modeAbbreviations[i]].length > 0) {
                modes.push(modeAbbreviations[i]);
                topRow.push(html`<th>${modeAbbreviations[i].toUpperCase()}</th>`);
            }
        }

        templates.push(html`<tr>${topRow}</tr>`);

        let sortedMaps = [...maps];
        if (this.mapOrder === "alphabetical") {
            sortedMaps = sortedMaps.sort((a, b) => a.localeCompare(b));
        }

        for (let i = 0; i < sortedMaps.length; i++) {
            const row: TemplateResult[] = [
                html`<td>${sortedMaps[i]}</td>`
            ];

            let used = false;
            for (let j = 0; j < modes.length; j++) {
                const mapPool = this.appContext.mapPool[modes[j]];
                const map = mapPool.find(map => map === sortedMaps[i]);
                if (map) {
                    row.push(html`<td><div class="circle"></div></td>`);
                    used = true;
                } else {
                    row.push(html`<td></td>`);
                }
            }

            if (used) {
                templates.push(html`<tr>${row}</tr>`);
            }
        }

        this.resizeGraphic();

        return html`<table>${templates}</table>`;
    }
}