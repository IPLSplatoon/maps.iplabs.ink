import { CSSResult, LitElement, html, css, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { variableStyles } from "../../styles/Variable.styles";
import { containerStyles } from "../../styles/Container.styles";
import { buttonStyles } from "../../styles/Button.styles";
import { modalStyles } from "../../styles/Modal.styles";
import { getModalCloseTimeline, getModalOpenTimeline } from "../../helpers/ModalAnimations";
import logo from "../../assets/icon.png"
import back from "../../assets/back-yellow.svg"

@customElement('about-modal')
export class AboutModal extends LitElement {
    static styles: CSSResult[] = [
        variableStyles,
        containerStyles,
        buttonStyles,
        modalStyles,
        css`
            :host {
                --container-color: rgba(245, 252, 217, 0.10);
                --wrapper-bg: linear-gradient(180deg, rgba(245, 252, 217, 0.00) 0%, rgba(245, 252, 217, 0.10) 100%);
                --color: var(--yellow);
                color: var(--color);
                font-size: var(--font-size);
            }

            .logo.wrapper {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                gap: calc(var(--gap) * 1.5);
                height: auto;
                font-weight: 700;
                font-family: var(--mono);
                text-transform: uppercase;
            }

            .logo.wrapper > * {
                font-size: 2em;
            }

            .logo img {
                height: 2em;
            }

            a {
                color: var(--color);
            }

            a:visited {
                color: var(--color);
            }
        `
    ];

    render(): TemplateResult {
        return html`
            <div class="modal" style="display: none">
                <div class="modal-body">
                    <div class="modal-header">
                        <button class="back" @click=${this.handleCloseEvent}><img src=${back}></button>
                        <div class="title">About</div>
                    </div>
                    <div class="modal-contain container bg">
                        <div class="wrapper logo">
                            <img src=${logo}>
                            <div>maps.iplabs.ink</div>
                        </div>
                        <div class="wrapper">
                            <div>Splatoon tournament map list generator build for the community, by the community.</div>
                            <div>Project was created by <a href="https://jpg.contact/" target="_blank">.jpg</a> for <a href="https://iplabs.ink/" target="_blank">Inkling Performance Labs</a>.</div>
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
}