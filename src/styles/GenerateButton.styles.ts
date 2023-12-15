import { CSSResult, css } from "lit";

//styles assume variable and button styles are imported too

export const generateButtonStyles: CSSResult = css`
    button.generate {
        background: conic-gradient(from 270deg at 50% 50%, #F5FCD9 90deg, #F8D8E3 180deg, #E0DAFC 270deg, #DDFCF3 360deg);
        border: none;
        color: var(--bg);
        font-weight: 600;
    }

    button.generate:hover {
        background: conic-gradient(from 200deg at 50% 50%, #F5FCD9 90deg, #F8D8E3 180deg, #E0DAFC 270deg, #DDFCF3 360deg);
    }
`;