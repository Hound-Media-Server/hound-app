import { toAlpha2 } from "@cospired/i18n-iso-languages";

/*
    Convert en-US to en
*/
export function parseBCP47(lang: string) {
    lang = lang.toLowerCase();
    if (lang.includes("-")) {
        return lang.split("-")[0];
    }
    return lang;
}

export function get2LetterLangCode(lang: string) {
    lang = lang.toLowerCase();
    lang = parseBCP47(lang);
    return toAlpha2(lang)
}