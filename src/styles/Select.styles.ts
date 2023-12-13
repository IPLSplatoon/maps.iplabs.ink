import { CSSResult, css } from "lit";

export const selectStyles: CSSResult = css`
    select {
        font-size: var(--font-size);
        font-family: var(--mono);
        text-transform: Capitalize;
        text-align: left;
        background: none;
        color: var(--color);
        padding: .25em 0;
        padding-right: .5em;
        cursor: pointer;
        transition-duration: 0.1s;
        border: none;
        border-radius: 15px;
        width: auto;
    }

    select:hover { 
        background: var(--color);
        color: var(--bg);
        filter: drop-shadow(0px 0px 4px var(--color));
        padding-right: .25em;
        padding-left: .25em;
        font-weight: 500;
    }

    select option {
        background: var(--bg);
        color: var(--color);
    }
`;
