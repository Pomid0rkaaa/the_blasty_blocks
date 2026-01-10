import { STATUS_META } from './data/status_meta.js';
import { ELEMENTS } from './data/elements.js';

const id = (value) => document.getElementById(value)  

export const UIElements = {
    level: id("level-display"),
    score: id("score-display"),
    gold: id("gold-display"),
    log: id("log-box"),
    log_peek: id("log-peek"),

    player: {
        hp_bar: id("player-hp-bar"),
        hp: id("player-hp-text"),
        shield: id("player-shield"),
        status: id("player-status"),
    },

    enemy: {
        hp: id("enemy-hp-text"),
        hp_bar: id("enemy-hp-bar"),
        intent: id("enemy-intent"),
        element: id("enemy-element"),
        label: id("enemy-label"),
        sprite: id("enemy"),
        status: id("enemy-status"),
    },

    feedback: id("feedback-overlay"),
    grid: id("grid-container"),
    hand: id("hand-container"),
    artifacts: id("artifacts-container"),
    achievements: id("achievements-container"),
    affinity: id("affinity-container"),
    hazard_badge: id("hazard-badge"),
    hazard_badge_text: id("hazard-badge-text"),
    final_score: id("final-score"),
    final_depth: id("final-depth"),

    codex: {
        status: id("codex-status"),
        hazards: id("codex-hazards"),
        enemy: id("codex-enemy"),
    },

    shop: {
        modal: id('shop-modal'),
        container: id('shop-container'),
        gold: id('shop-gold'),
        skip_button: id('shop-skip'),
    },
    //volume_button, volume_panel
    volume: {
        button: id("volume-btn"),
        panel: document.querySelector(".volume-panel"),
        music: id("music-volume"),
        label: id("music-vol-label"),
    },
    difficulty: id("difficulty-modal"),
    modal: {
        victory: id('victory-modal'),
        game_over: id("game-over-modal"),
        help: id("help-modal"),
        log: id("log-modal"),
        achievements: id("achievements-modal"),
    },
    hazard: {
        modal: id("hazard-modal"),
        icon: id("hazard-icon"),
        title: id("hazard-title"),
        desc: id("hazard-desc"),
        continue: id("hazard-continue"),
        header: id("hazard-header"),
    }
}

export class UI {
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
        UIElements.level.innerText = `DEPTH ${this.level}`;
        UIElements.score.innerText = this.score;
        UIElements.gold.innerText = this.gold;

        const hpPct = (this.hp / this.maxHp) * 100;
        UIElements.player.hp_bar.style.width = `${Math.max(0, hpPct)}%`;
        UIElements.player.hp.innerText = `${this.hp}/${this.maxHp}`;
        UIElements.player.shield.innerText = this.shield;

        if (this.shield >= 60)
            this.unlockAchievement("shield_wall");

        const eHpPct = (this.enemyHp / this.enemyMaxHp) * 100;
        UIElements.enemy.hp_bar.style.width = `${Math.max(0, eHpPct)}%`;
        UIElements.enemy.hp.innerText = `${this.enemyHp}/${this.enemyMaxHp}`;

        const enemyName = this.currentEnemy
            ? this.currentEnemy.name
            : "ВРАГ";
        const shieldTxt =
            this.enemyShield > 0 ? ` +${this.enemyShield} ARM` : "";
        UIElements.enemy.intent.innerText = `${enemyName} [ATK ${this.enemyAttack}${shieldTxt}]`;

        const el = ELEMENTS[this.currentEnemy?.element] || {
            icon: "⚔️",
            color: "#e2e8f0",
            name: "Физ.",
        };
        UIElements.enemy.element.textContent = el.icon;
        UIElements.enemy.element.title = `${el.name} (элемент врага)`;

        // Hazard badge
        if (this.hazard && this.hazard.id !== "none") {
            UIElements.hazard_badge.classList.remove("hidden");
            UIElements.hazard_badge_text.textContent = `${this.hazard.icon} ${this.hazard.name}`;
            if (this.hazard.kind === "boon") {
                UIElements.hazard_badge.className =
                    "text-[10px] px-2 py-1 rounded-full border border-emerald-300/35 bg-emerald-950/30 cursor-pointer";
            } else {
                UIElements.hazard_badge.className =
                    "text-[10px] px-2 py-1 rounded-full border border-red-300/25 bg-black/30 cursor-pointer";
            }
        } else {
            UIElements.hazard_badge.classList.add("hidden");
        }

        // Status chips
        UI.renderStatusChips(
            UIElements.enemy.status,
            this.enemyStatuses
        );
        UI.renderStatusChips(
            UIElements.player.status,
            this.playerStatuses
        );

        // Affinities
        UI.updateAffinitiesUI(this.affinities);
    }
}