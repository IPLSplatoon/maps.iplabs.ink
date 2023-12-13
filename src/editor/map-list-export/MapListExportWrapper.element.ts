import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { AppContext, Game } from "../../types-interfaces/Interfaces";
import gsap from "gsap";
import { encodeAppContext } from "../../helpers/AppContext";
import { Counterpick } from "../../types-interfaces/Types";
import { modeAbbreviationToWords } from "../../helpers/MapMode";

@customElement('map-list-export-wrapper')
export class MapListExportWrapper extends LitElement {
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
                display: flex;
                --container-color: rgba(224, 218, 252, 0.15);
                --color: var(--purple);
                color: var(--color);
                height: 3.2em;
                border-radius: 3px 3px 15px 15px;
            }

            .container.bg {
                border-radius: 3px 3px 15px 15px;
                width: 100%;
                height: 100%;
                padding-left: var(--padding);
                padding-right: var(--padding);
                gap: var(--gap);
                white-space: nowrap;
            }
        `
    ]

    render(): TemplateResult {
        if (this.appContext?.rounds.length === 0){
            return html`<div class="container bg">Add rounds to export</div>`;
        }
        return html`
            <div id="scrollTarget" class="container bg horizontal overflow" @wheel=${this.handleWheelScroll}>
                <div @wheel=${this.handleWheelScroll}>Export Map List</div>
                <button @click=${this.handleShareLinkClicked}>Share Link To View</button>
                <button @click=${this.handleDiscordMessageClicked}>Discord Message</button>
                <button @click=${this.handleIPLOverlayJSONClicked}>IPL Overlay JSON</button>
            </div>
        `;
    }

    private handleWheelScroll(e: WheelEvent): void {
        const scrollAmount = e.deltaY / 1.5;
        const container = this.shadowRoot?.getElementById("scrollTarget") as HTMLDivElement;
        if (Math.abs(e.deltaY) >= 100){
            gsap.to(container, {
                scrollLeft: container.scrollLeft + scrollAmount,
                ease: "power2.inOut",
                duration: 0.05
            });
        } else {
            container.scrollLeft += scrollAmount;
        }
    }

    private handleShareLinkClicked(): void {
        if (!this.appContext) return;

        const location = window.location.host + "/viewer/";
        const params = "?c=" + encodeAppContext(this.appContext);

        navigator.clipboard.writeText(location + params);
        alert("Link copied to clipboard.");
    }

    private handleDiscordMessageClicked(): void {
        if (!this.appContext) return;

        let message = "";

        for (let i = 0; i < this.appContext?.rounds.length; i++) {
            const round = this.appContext?.rounds[i];
            message += `\`${round?.name}\``;
            for (let j = 0; j < round?.games.length; j++) {
                const game = round?.games[j];
                if (game === "counterpick") {
                    message += `\n${j + 1}: Counterpick`;
                } else {
                    message += `\n${j + 1}: ${modeAbbreviationToWords(game?.mode)} on ${game.map}`;
                }
            }
            if (i !== this.appContext.rounds.length - 1) {
                message += "\n\n";
            }
        }

        navigator.clipboard.writeText(message);
        alert("Message copied to clipboard.");
    }

    private handleIPLOverlayJSONClicked(): void {
        if (!this.appContext) return;

        const iplRounds = [];

        for (let i = 0; i < this.appContext.rounds.length; i++) {
            const round = this.appContext.rounds[i];
            const roundGames = [];
            for (let j = 0; j < round.games.length; j++) {
                const game = round.games[j] as Game | Counterpick;
                if (game === "counterpick") {
                    roundGames.push({
                        map: "Unknown Map",
                        mode: "Unknown Mode"
                    });
                } else {
                    roundGames.push({
                        map: game.map,
                        mode: modeAbbreviationToWords(game.mode)
                    });
                }
            }

            let playStyle: string = "BEST_OF";
            if (round.playStyle === "playAll") {
                playStyle = "PLAY_ALL";
            }

            iplRounds.push({
                "name": round.name,
                "type": playStyle,
                "maps": roundGames
            });
        }

        var a = document.createElement("a");
        var file = new Blob([JSON.stringify(iplRounds, null, 4)], { type: 'text/plain' });
        a.href = URL.createObjectURL(file);
        a.download = "ipl-rounds.json";
        a.click();
    }
}