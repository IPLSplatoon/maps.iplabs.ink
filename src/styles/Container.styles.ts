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
`