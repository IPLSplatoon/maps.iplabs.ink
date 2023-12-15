import { CSSResult, css } from "lit";

//styles assume variable styles are imported too

export const checkboxStyles: CSSResult = css`
    .checkbox-container {
        display: flex;
        align-items: center;
        font-size: 1.2em;
        font-family: var(--mono);
        font-weight: 400;
        text-transform: Capitalize;
        border-radius: 15px;
        color: var(--color);
        transition-duration: 0.1s;                
        width: calc(100% - var(--padding) - 1.85em);
        padding: .25em 0;
        padding-right: .5em;
        margin-left: 1.85em;
        cursor: pointer;
        position: relative;
    }

    .checkbox-container::before {
        width: 1.1em;
        height: 1.1em;
        content: '';
        position: absolute;
        left: -1.85em;
        border: .08em solid var(--color);
        border-radius: .5em;
        transition-duration: 0.1s;
    }

    .checkbox-container:hover {
        background: var(--color);
        color: var(--bg);
        filter: drop-shadow(0px 0px 4px var(--color));
        padding-right: 0em;
        padding-left: .5em;
        font-weight: 500;
    }

    .checkbox-container input {
        display: none;
    }

    .checkbox-container.selected::before {
        background: var(--color);
        border-radius: .2em;
    }

    .checkbox-container.hide {
        opacity: .35;
        font-size: .9em;
    }
`;