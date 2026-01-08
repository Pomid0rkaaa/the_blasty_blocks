import { UIElements } from "./ui.js";

export class Logger {

    static #logLines = [];
    
    static log(msg) {
        const t = new Date();
        const stamp = `${String(t.getMinutes()).padStart(
            2,
            "0"
        )}:${String(t.getSeconds()).padStart(2, "0")}`;
        this.#logLines.unshift(`[${stamp}] ${msg}`);
        this.#logLines = this.#logLines.slice(0, 72);
        if (UIElements.log)
            UIElements.log.textContent = this.#logLines.join("\n");
        if (UIElements.logPeek) UIElements.logPeek.textContent = msg;
    }

    static open() {
        document
            .getElementById("log-modal")
            .classList.remove("hidden");
        if (UIElements.log) UIElements.log.scrollTop = 0;
    }
    static close() {
        document
            .getElementById("log-modal")
            .classList.add("hidden");
    }
    static clear() {
        this.#logLines = [];
        if (UIElements.log) UIElements.log.textContent = "";
        if (UIElements.logPeek) UIElements.logPeek.textContent = "—";
    }
}