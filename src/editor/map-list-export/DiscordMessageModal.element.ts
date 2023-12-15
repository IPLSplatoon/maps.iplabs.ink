import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { modalStyles } from "../../styles/Modal.styles";
import { getModalCloseTimeline, getModalOpenTimeline } from "../../helpers/ModalAnimations";
import back from "../../assets/back-purple.svg"
import { AppContext } from "../../types-interfaces/Interfaces";
import { modeAbbreviationToWords } from "../../helpers/MapMode";

@customElement('discord-message-modal')
export class DiscordMessageModal extends LitElement {
    @property()
    appContext?: AppContext;
    @state()
    copyButtonText = "Copy to Clipboard"

    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        modalStyles,
        css`
            :host {
                --container-color: rgba(224, 218, 252, 0.15);
                --wrapper-bg: linear-gradient(180deg, rgba(224, 218, 252, 0.00) 0%, rgba(224, 218, 252, 0.10) 100%);
                --color: var(--purple);
                color: var(--color);
                font-size: var(--font-size);
            }

            .wrapper {
                height: inherit;
                gap: var(--margin);
            }

            textarea {
                padding: var(--padding);
                width: 100%;
                -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
                -moz-box-sizing: border-box;    /* Firefox, other Gecko */
                box-sizing: border-box;         /* Opera/IE 8+ */
                height: 100%;
                font-size: var(--font-size);
                background: var(--container-color);
                color: var(--color);
                border: none;
                border-radius: 15px;
                resize: none;
            }
        `
    ];

    render(): TemplateResult {
        return html`
            <div class="modal" style="display: none">
                <div class="modal-body">
                    <div class="modal-header">
                        <button class="back" @click=${this.handleCloseEvent}><img src=${back}></button>
                        <div class="title">Map List Discord Message</div>
                    </div>
                    <div class="modal-contain container bg">
                        <div class="wrapper">
                            <textarea readonly>${this.getDiscordMessage()}</textarea>
                            <button @click=${this.handleCopyClick}>${this.copyButtonText}</button>
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

    private getDiscordMessage(): string {
        if (!this.appContext) return "";

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

        return message;
    }

    private handleCopyClick() {
        navigator.clipboard.writeText(this.getDiscordMessage());
        this.copyButtonText = "Copied!";
        setTimeout(() => {
            this.copyButtonText = "Copy to Clipboard";
        }, 3000);
    }
}