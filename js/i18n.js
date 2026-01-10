export class I18n {
    constructor(defaultLang = "ru") {
        this.lang = defaultLang;
        this.dict = {};
    }

    async load(lang) {
        const res = await fetch(`./i18n/${lang}.json`);
        this.dict = await res.json();
        this.lang = lang;
        this.updateDOM();
    }

    t(key, vars = {}) {
        let text = this.dict[key];
        if (!text) return key;
        for (const name in vars) {
            text = text.replaceAll(`{${name}}`, vars[name]);
        }
        return text;
    }

    updateDOM() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll("[data-i18n-html]").forEach(el => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });
    }
}

export default new I18n("ru")