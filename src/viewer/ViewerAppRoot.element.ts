import { LitElement, TemplateResult, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppContext } from "../types-interfaces/Interfaces";
import { variableStyles } from "../styles/Variable.styles";
import { decodeAppContext } from "../helpers/AppContext";
import "./MapPoolWrapper.element.ts";
import "./MapListWrapper.element.ts";
import "./ViewerHeader.element.ts"

@customElement('viewer-app-root')
export class ViewerAppRoot extends LitElement {
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
                window.location.replace(window.location.host);
            }
        } catch (e) {
            console.error(e);
        }

        console.log(this.appContext);
    }

    render(): TemplateResult {
        return html`
        <div class="primary-container">
            <viewer-header .appContext=${this.appContext}></viewer-header>
            <div class="side-by-side">
                <map-pool-wrapper .appContext=${this.appContext}></map-pool-wrapper>
                <map-list-wrapper .appContext=${this.appContext}></map-list-wrapper>
            </div>
        </div>  
        `;
    }
}