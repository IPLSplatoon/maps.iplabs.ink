import { CSSResult, css } from "lit";

//styles assume variable styles are imported too

export const modalStyles: CSSResult = css`
    .modal {
        position: fixed;
        top: 0; 
        left: 0;
        width: calc(100vw - var(--padding) * 2);
        height: calc(100vh - var(--padding) * 2);
        padding: var(--padding);
        background: var(--bg);
        color: var(--color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .modal .title {
        font-size: 1.4em;
        font-weight: 600;
    }

    .modal-body {
        display: flex;
        flex-direction: column;
        gap: var(--margin);
        height: 100%;
        width: 100%;
        max-width: 45em;
    }

    .modal-header {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        gap: var(--margin);
        height: 3.2em;
        align-items: center;
        width: 100%;
    }

    .modal-contain.container {
        min-height: 0;
        height: 100%;
        overflow-y: auto;
    }

    .back {
        border: none;
        background: none;
        width: 2.7em;
        height: 2.7em;
        margin: -.5em;
        padding: .5em;
        border-radius: 100%;
    }

    .back:hover {
        background: none;
        border: 1px solid var(--color);
    }

    .back > img {
        width: 100%;
        height: 100%;
    }

    @media only screen and (max-width: 34rem) {
        .modal {
            width: 100vw;
            height: 100vh;
            padding: 0;
        }

        .modal-body {
            gap: 0;
        }

        .modal-header {
            padding: var(--padding);
        }

        .back {
            width: 4em;
            border-radius: 2em;
        }

        .title {
            margin-right: 2em;
            text-wrap: pretty;
        }

        .modal-contain.container {
            border-radius: 15px 15px 0 0;
        }
    }

    @media (forced-colors: active) {
        .back {
            filter: saturate(0) brightness(2);
        }
    }
`