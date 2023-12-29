import { CSSResult, css } from "lit";

//styles assume variable styles are imported too

export const buttonStyles: CSSResult = css`
    button {
        font-size: var(--font-size);
        font-family: var(--mono);
        font-weight: 500;
        text-transform: Capitalize;
        text-align: left;
        background: none;
        border: .15em solid var(--color);
        border-radius: 1em;
        min-height: 2em;
        color: var(--color);
        padding: 0 .75em;
        cursor: pointer;
        transition-duration: 0.1s;
    }

    button:hover {
        background: var(--color);
        color: var(--bg);
        filter: drop-shadow(0px 0px 4px var(--color));
    }

    button:hover:active {
        transform: scale(0.96);
        filter: drop-shadow(0px 0px 5px var(--color));
    }
`