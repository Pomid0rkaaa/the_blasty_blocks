import { STATUS } from './data/status';
import { ELEMENTS } from './data/elements';
import i18n from './i18n';

const id = (value: string) => document.getElementById(value);

export const UIElements = {
    level: id("level-display")!,
    score: id("score-display")!,
    gold: id("gold-display")!,
    log: id("log-box")!,
    log_peek: id("log-peek")!,

    player: {
        hp_bar: id("player-hp-bar")!,
        hp: id("player-hp-text")!,
        shield: id("player-shield")!,
        status: id("player-status")!,
    },

    enemy: {
        hp: id("enemy-hp-text")!,
        hp_bar: id("enemy-hp-bar")!,
        intent: id("enemy-intent")!,
        element: id("enemy-element")!,
        label: id("enemy-label")!,
        sprite: id("enemy")!,
        status: id("enemy-status")!,
    },

    feedback: id("feedback-overlay")!,
    grid: id("grid-container")!,
    hand: id("hand-container")!,
    artifacts: id("artifacts-container")!,
    achievements: id("achievements-container")!,
    affinity: id("affinity-container")!,
    hazard_badge: id("hazard-badge")!,
    hazard_badge_text: id("hazard-badge-text")!,
    final_score: id("final-score")!,
    final_depth: id("final-depth")!,

    codex: {
        status: id("codex-status")!,
        hazards: id("codex-hazards")!,
        enemy: id("codex-enemy")!,
    },

    shop: {
        modal: id('shop-modal')!,
        container: id('shop-container')!,
        gold: id('shop-gold')!,
        skip_button: id('shop-skip')!,
    },
    volume: {
        button: id("volume-btn")!,
        panel: document.querySelector(".volume-panel")!,
        music: id("music-volume") as HTMLInputElement,
        label: id("music-vol-label")!,
    },
    difficulty: id("difficulty-modal")!,
    modal: {
        victory: id('victory-modal')!,
        game_over: id("game-over-modal")!,
        help: id("help-modal")!,
        log: id("log-modal")!,
        achievements: id("achievements-modal")!,
    },
    hazard: {
        modal: id("hazard-modal")!,
        icon: id("hazard-icon")!,
        title: id("hazard-title")!,
        desc: id("hazard-desc")!,
        continue: id("hazard-continue")!,
        header: id("hazard-header")!,
    }
};

export class UI {
    static renderStatusChips(container: HTMLElement, statuses: any) {
        container.innerHTML = "";
        const entries = Object.entries(statuses).filter(
            ([, v]: [string, any]) => v > 0
        );

        entries.forEach(([k, v]) => {
            const meta = (STATUS as any)[k] || {
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

    static updateAffinitiesUI(affinities: Set<string>) {
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
            const el = (ELEMENTS as any)[id];
            const chip = document.createElement("div");
            chip.className = "artifact-icon";
            chip.style.borderColor = el.color;
            chip.innerHTML = `${el.icon}<div class="artifact-tooltip"><div class="font-bold" style="color:${el.color}">${el.name}</div><div class="text-slate-200 mt-1">${i18n.t("element.desc")}</div></div>`;
            UIElements.affinity.appendChild(chip);
        });
    }

    static updateUI(state: any) {
        UIElements.level.innerText = `DEPTH ${state.level}`;
        UIElements.score.innerText = state.score;
        UIElements.gold.innerText = state.gold;

        const hpPct = (state.hp / state.maxHp) * 100;
        UIElements.player.hp_bar.style.width = `${Math.max(0, hpPct)}%`;
        UIElements.player.hp.innerText = `${state.hp}/${state.maxHp}`;
        UIElements.player.shield.innerText = state.shield;

        if (state.shield >= 60)
            state.unlockAchievement("shield_wall");

        const eHpPct = (state.enemyHp / state.enemyMaxHp) * 100;
        UIElements.enemy.hp_bar.style.width = `${Math.max(0, eHpPct)}%`;
        UIElements.enemy.hp.innerText = `${state.enemyHp}/${state.enemyMaxHp}`;

        const enemyName = state.currentEnemy
            ? state.currentEnemy.name
            : i18n.t("label.enemy");
        const shieldTxt =
            state.enemyShield > 0 ? ` +${state.enemyShield} ARM` : "";
        UIElements.enemy.intent.innerText = `${enemyName} [ATK ${state.enemyAttack}${shieldTxt}]`;

        const el = (ELEMENTS as any)[state.currentEnemy?.element] || {
            icon: "⚔️",
            color: "#e2e8f0",
            name: i18n.t("element.physical"),
        };
        UIElements.enemy.element.textContent = el.icon;
        UIElements.enemy.element.title = i18n.t("enemy.element", {element: el.name})

        // Hazard badge
        if (state.hazard && state.hazard.id !== "none") {
            UIElements.hazard_badge.classList.remove("hidden");
            UIElements.hazard_badge_text.textContent = `${state.hazard.icon} ${state.hazard.name}`;
            if (state.hazard.kind === "boon") {
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
            state.enemyStatuses
        );
        UI.renderStatusChips(
            UIElements.player.status,
            state.playerStatuses
        );

        // Affinities
        UI.updateAffinitiesUI(state.affinities);
    }
}
