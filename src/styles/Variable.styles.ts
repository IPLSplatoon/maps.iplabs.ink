import { CSSResult, css } from "lit";

export const variableStyles: CSSResult = css`
    :host {
        --bg: #0C161D;
        --green: #D9FCF3;
        --purple: #E1D9FC;
        --pink: #FCD9E3;
        --yellow: #F4FCD9;

        --serif: 'Montserrat', sans-serif;
        --mono: 'Roboto Mono', monospace;

        --margin: 1.1em;
        --padding: 1.1em;
        --gap: .667em;
        --font-size: 1.5rem;
    }

    ::-webkit-scrollbar {
        width: .4em;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--container-color)
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--color);
        border-radius: .2em;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: white;
    }

    @media only screen and (max-width: 1199px) {
        :host {
            --font-size: 1.2rem;
        }
    }
`