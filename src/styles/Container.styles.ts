import { CSSResult, css } from "lit";

//styles assume variable styles are imported too

export const containerStyles: CSSResult = css`
    .container{
        display: flex;
        flex-direction: column;
        width: 100%;
        min-height: 100%;
        height: -max-content;
    }

    .container.horizontal{
        flex-direction: row;
        align-items: center;
        flex-wrap: nowrap;
    }

    .container.bg {
        background: var(--container-color);
        border-radius: 15px;
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap);
        background: var(--wrapper-bg);
        padding: var(--padding);
    }

    .overflow.horizontal {
        overflow-x: scroll;
        scrollbar-width: none;
    }

    .overflow.horizontal::-webkit-scrollbar {
        display: none;
    }

    @media (forced-colors: active) {
        .container {
            width: calc(100% - .2em);
            min-height: calc(100% - .2em);
            height: auto;
            border: .1em solid var(--container-color);
        }

        .wrapper {
            border: .1em solid var(--container-color);
        }
    }

    @media (prefers-contrast: more) {

        .container {
            color: white !important;
            --color: white !important;
        }

        .wrapper {
            color: white !important;
            --color: white !important;
        }

    }
`