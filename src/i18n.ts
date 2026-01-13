import ru from "./i18n/ru.json";
import en from "./i18n/en.json";
import ua from "./i18n/ua.json";

const dictionaries = { ru, en, ua } as const;

export type Language = keyof typeof dictionaries;
type I18nValue = string | string[];
type I18nDict = Record<string, I18nValue>;

export function isLanguage(lang: string): lang is Language {
    return lang in dictionaries;
}

export class I18n {
    lang: Language;
    dict: I18nDict;

    constructor(defaultLang: Language = "ru") {
        this.lang = defaultLang;
        this.dict = dictionaries[defaultLang];
    }

    load(lang: string) {
        if (!isLanguage(lang)) {
            console.warn(`[i18n] Invalid language: ${lang}`);
            return false;
        }

        this.lang = lang;
        this.dict = dictionaries[lang];
        this.updateDOM();
        return true;
    }

    t(key: string, vars: Record<string, string | number> = {}) {
        let value = this.dict[key];
        if (!value) return key;

        if (Array.isArray(value)) value = value.join("\n");

        for (const name in vars) {
            value = value.replaceAll(`\${${name}}`, String(vars[name]));
        }

        return value;
    }

    updateDOM() {
        document.querySelectorAll<HTMLElement>("[data-i18n]").forEach(el => {
            if (el.dataset.i18n) el.textContent = this.t(el.dataset.i18n);
        });

        document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach(el => {
            if (el.dataset.i18nHtml) el.innerHTML = this.t(el.dataset.i18nHtml);
        });

        document.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach(el => {
            if (el.dataset.i18nTitle) el.title = this.t(el.dataset.i18nTitle);
        });
    }
}

export default new I18n("ru");
