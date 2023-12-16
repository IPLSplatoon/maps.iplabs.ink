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

    @media (prefers-contrast: more) {
        :host {
            --bg: #000000;
            --green: #D9FCF3;
            --purple: #E1D9FC;
            --pink: #FCD9E3;
            --yellow: #F4FCD9;
        }
    }

    @media (forced-colors: inactive) {

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

    }

    @media only screen and (max-width: 75rem) {
        :host {
            --font-size: 1.25rem;
        }
    }

    @media only screen and (max-width: 60rem) {
        :host {
            --font-size: 1rem;
            --margin: .8em;
            --padding: .8em;
        }
    }

    /*mobile mode start*/
    @media only screen and (max-width: 47rem) { 
        :host {
            --font-size: 1.2rem;
        }
    }

    @media only screen and (max-width: 34rem) {
        :host {
            --font-size: 1rem;
            --margin: .8em;
            --padding: .8em;
        }
    }
    
    @media (forced-colors: active) {

    }
`