import { STATUS_META } from './data/status_meta.js';
import { ELEMENTS } from './data/elements.js';

export const UIElements = {
    level: document.getElementById("level-display"),
    score: document.getElementById("score-display"),
    gold: document.getElementById("gold-display"),
    log: document.getElementById("log-box"),
    logPeek: document.getElementById("log-peek"),

    playerHpBar: document.getElementById("player-hp-bar"),
    playerHpText: document.getElementById("player-hp-text"),
    playerShield: document.getElementById("player-shield"),
    playerStatus: document.getElementById("player-status"),

    enemyHpBar: document.getElementById("enemy-hp-bar"),
    enemyHpText: document.getElementById("enemy-hp-text"),
    enemyIntent: document.getElementById("enemy-intent"),
    enemyElement: document.getElementById("enemy-element"),
    enemyLabel: document.getElementById("enemy-label"),
    enemySprite: document.getElementById("enemy"),
    enemyStatus: document.getElementById("enemy-status"),

    feedback: document.getElementById("feedback-overlay"),
    grid: document.getElementById("grid-container"),
    hand: document.getElementById("hand-container"),
    artifacts: document.getElementById(
        "artifacts-container"
    ),
    affinity: document.getElementById("affinity-container"),
    hazardBadge: document.getElementById("hazard-badge"),
    hazardBadgeText:
        document.getElementById("hazard-badge-text"),
}

export class UI {
    static elements = UIElements;
    static renderStatusChips(container, statuses) {
        container.innerHTML = "";
        const entries = Object.entries(statuses).filter(
            ([k, v]) => v > 0
        );

        entries.forEach(([k, v]) => {
            const meta = STATUS_META[k] || {
                icon: "•",
                color: "#e2e8f0",
                name: k,
                desc: "",
            };
            const chip = document.createElement("span");
            chip.className = "status-chip";
            chip.style.borderColor = meta.color;
            chip.title = `${meta.name}: ${v}. ${meta.desc}`;
            chip.innerHTML = `<span>${meta.icon}</span><span class="font-bold" style="color:${meta.color}">${v}</span>`;
            container.appendChild(chip);
        });
    }

    static updateAffinitiesUI(affinities) {
        UIElements.affinity.innerHTML = "";
        const order = [
            "fire",
            "ice",
            "storm",
            "poison",
            "void",
            "earth",
            "light",
        ];
        order.forEach((id) => {
            if (!affinities.has(id)) return;
            const el = ELEMENTS[id];
            const chip = document.createElement("div");
            chip.className = "artifact-icon";
            chip.style.borderColor = el.color;
            chip.innerHTML = `${el.icon}<div class="artifact-tooltip"><div class="font-bold" style="color:${el.color}">${el.name}</div><div class="text-slate-200 mt-1">Стихийная синергия активна</div></div>`;
            UIElements.affinity.appendChild(chip);
        });
    }

    static updateUI() {
        this.ui.level.innerText = `DEPTH ${this.level}`;
        this.ui.score.innerText = this.score;
        this.ui.gold.innerText = this.gold;

        const hpPct = (this.hp / this.maxHp) * 100;
        this.ui.playerHpBar.style.width = `${Math.max(0, hpPct)}%`;
        this.ui.playerHpText.innerText = `${this.hp}/${this.maxHp}`;
        this.ui.playerShield.innerText = this.shield;

        if (this.shield >= 60)
            this.unlockAchievement("shield_wall");

        const eHpPct = (this.enemyHp / this.enemyMaxHp) * 100;
        this.ui.enemyHpBar.style.width = `${Math.max(0, eHpPct)}%`;
        this.ui.enemyHpText.innerText = `${this.enemyHp}/${this.enemyMaxHp}`;

        const enemyName = this.currentEnemy
            ? this.currentEnemy.name
            : "ВРАГ";
        const shieldTxt =
            this.enemyShield > 0 ? ` +${this.enemyShield} ARM` : "";
        this.ui.enemyIntent.innerText = `${enemyName} [ATK ${this.enemyAttack}${shieldTxt}]`;

        const el = ELEMENTS[this.currentEnemy?.element] || {
            icon: "⚔️",
            color: "#e2e8f0",
            name: "Физ.",
        };
        this.ui.enemyElement.textContent = el.icon;
        this.ui.enemyElement.title = `${el.name} (элемент врага)`;

        // Hazard badge
        if (this.hazard && this.hazard.id !== "none") {
            this.ui.hazardBadge.classList.remove("hidden");
            this.ui.hazardBadgeText.textContent = `${this.hazard.icon} ${this.hazard.name}`;
            if (this.hazard.kind === "boon") {
                this.ui.hazardBadge.className =
                    "text-[10px] px-2 py-1 rounded-full border border-emerald-300/35 bg-emerald-950/30 cursor-pointer";
            } else {
                this.ui.hazardBadge.className =
                    "text-[10px] px-2 py-1 rounded-full border border-red-300/25 bg-black/30 cursor-pointer";
            }
        } else {
            this.ui.hazardBadge.classList.add("hidden");
        }

        // Status chips
        UI.renderStatusChips(
            this.ui.enemyStatus,
            this.enemyStatuses
        );
        UI.renderStatusChips(
            this.ui.playerStatus,
            this.playerStatuses
        );

        // Affinities
        UI.updateAffinitiesUI(this.affinities);
    }
}