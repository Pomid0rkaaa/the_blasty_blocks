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
        let value = this.dict[key];
        if (!value) return key;
        if (Array.isArray(value)) {value = value.join("\n")}
        for (const name in vars) {
            value = value.replaceAll("${"+name+"}", vars[name]);
        }
        return value;
    }

    updateDOM() {
        document.querySelectorAll("[data-i18n]").forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll("[data-i18n-html]").forEach(el => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });
        document.querySelectorAll("[data-i18n-title]").forEach(el => {
            el.title = this.t(el.dataset.i18nTitle);
        });
    }
}

export default new I18n("ru")