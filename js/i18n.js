export class I18n {
    constructor(defaultLang = "ru") {
        this.lang = defaultLang;
        this.dict = {};
    }

    async load(lang) {
        try {
            const url = new URL(`js/i18n/${lang}.json`, window.location.href);
            const res = await fetch(url);

            if (!res.ok) {
                console.warn(`[i18n] File not found: ${url}`);
                this.dict = undefined;
                return false;
            }

            this.dict = await res.json();
            this.lang = lang;
            this.updateDOM();
            return true;
        } catch (err) {
            console.error(`[i18n] Failed to load ${lang}:`, err);
            this.dict = undefined;
            return false;
        }
    }

    t(key, vars = {}) {
        if (!this.dict) return key;
        let text = this.dict[key];
        if (!text) return key;
        for (const name in vars) {
            text = text.replaceAll("${"+name+"}", vars[name]);
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