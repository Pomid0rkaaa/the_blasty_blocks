import { ACHIEVEMENTS } from './data/achievements.js';
import { ARTIFACTS } from './data/artifacts.js';
import { ELEMENTS } from './data/elements.js';
import { ENEMIES } from './data/enemies.js';
import { HAZARDS } from './data/hazards.js';
import { SHAPES } from './data/shapes.js';
import { STATUS_META } from './data/status_meta.js';
import { soundManager } from './soundManager.js';
import { UI } from './ui.js';
import { Logger } from './logger.js'

let GRID_SIZE = 8;

export class BlockGame {
    constructor() {
        this.resetRun();
        this.ui = UI.elements;
        this.init();
    }

    resetRun() {
        this.isMobile = window.innerWidth < 950;
        this.offsetY = this.isMobile ? -100 : 0

        this.grid = Array(GRID_SIZE)
            .fill()
            .map(() => Array(GRID_SIZE).fill(null));
        this.score = 0;
        this.gold = 0;
        this.level = 1;

        // Difficulty handling
        this.difficulty =
            this.difficulty !== undefined ? this.difficulty : 1; // 0=Easy, 1=Normal, 2=Hard

        let startHp = 100;
        if (this.difficulty === 0) startHp = 120;
        if (this.difficulty === 2) startHp = 80;

        this.maxHp = startHp;
        this.hp = startHp;
        this.shield = 0;

        this.artifacts = [];
        this.revived = false;

        this.currentEnemy = null;
        this.enemyMaxHp = 100;
        this.enemyHp = 100;
        this.enemyShield = 0;
        this.enemyAttack = 10;

        this.hand = [];
        this.draggedBlock = null;
        this.blocksPlaced = 0;

        this.paused = false;
        this.shopOpen = false;

        // God Mode
        this.godMode = this.godMode || false;

        // Elements/statuses
        this.affinities = new Set();
        this.enemyStatuses = {
            burn: 0,
            poison: 0,
            shock: 0,
            chill: 0,
        };
        this.playerStatuses = {
            burn: 0,
            poison: 0,
            shock: 0,
            weak: 0,
        };
        this.prismCounter = 0;
        this.clearsThisFight = 0;
        this.placeBonusThisFight = 0;
        this.medicThisTurn = 0;
        this.overchargeThisFight = 0;

        // Hazard / boons
        this.hazard = null;
        this.hazardMods = this.defaultHazardMods();
        this.tempHandPlus = 0;

        // Hand control
        this.freezeNextHand = 0; // from ice enemies
        this.lockedSlots = new Set();

        // Fight counters
        this.discardsThisFight = 0;
        this.lastHitWasCrit = false;
        this.damageTakenThisFight = 0;

        // Log
        Logger.clear();

        // Achievements
        this.achUnlocked = new Set();
        try {
            const arr = JSON.parse(
                localStorage.getItem("achUnlocked") || "[]"
            );
            if (Array.isArray(arr))
                arr.forEach((id) => this.achUnlocked.add(id));
        } catch { }
    }

    toggleGodMode() {
        this.godMode = !this.godMode;
        if (this.godMode) {
            Logger.log("GOD MODE ACTIVATED");
            this.gold += 9999;
            this.hp = 999;
            this.maxHp = 999;
            this.damageEnemy(999, true); // Kill current
            this.updateUI();
            this.spawnFloatingText(
                "GOD MODE",
                this.ui.playerHpBar,
                "#fbbf24"
            );
        } else {
            Logger.log("GOD MODE DEACTIVATED");
        }
    }

    showDifficultyModal() {
        document
            .getElementById("game-over-modal")
            .classList.add("hidden");
        document
            .getElementById("difficulty-modal")
            .classList.remove("hidden");
    }

    startGame(diff) {
        this.difficulty = diff;
        document
            .getElementById("difficulty-modal")
            .classList.add("hidden");
        this.restart();
    }

    defaultHazardMods() {
        return {
            damageMult: 1,
            noPreview: false,
            startRocks: 0,
            startHoles: 0,
            startGarbage: 0,
            hpCostPerCell: 0,
            randomShape: false,
            mask: null,

            // boons
            startShield: 0,
            startHeal: 0,
            startGold: 0,
            tempHandPlus: 0,
            startClean: 0,
            startEnemyChill: 0,
            gridSize: 8,
            cellSize: "36px",
        };
    }

    init() {
        this.renderGrid();
        this.spawnEnemy();
        this.fillHand();
        this.updateUI();
        Logger.log("Начало забега.");

        const dragMove = (e) => this.handleDragMove(e);
        const dragEnd = (e) => this.handleDragEnd(e);

        document.addEventListener("touchmove", dragMove, {
            passive: false,
        });
        document.addEventListener("touchend", dragEnd);
        document.addEventListener("mousemove", dragMove);
        document.addEventListener("mouseup", dragEnd);

        document.querySelector(".volume-panel")?.addEventListener(
            "touchstart",
            e => e.stopPropagation()
        );


        // Keys
        // this.keyBuffer = "";
        document.addEventListener("keydown", (e) => {
            if (e.key === "?") this.openHelp();
            if (e.key.toLowerCase() === "l") Logger.open();
            if (e.key.toLowerCase() === "a")
                this.openAchievements();

            // this.keyBuffer += e.key;
            // if (this.keyBuffer.length > 20)
            //     this.keyBuffer = this.keyBuffer.slice(-20);
            // if (this.keyBuffer.endsWith("21best"))
            //     this.toggleGodMode();
        });

        // Init audio and start music on first interaction
        document.body.addEventListener(
            "click",
            () => {
                if (
                    !soundManager.initialized &&
                    !soundManager.muted
                )
                    soundManager.init();
                soundManager.resume();
            },
            { once: true }
        );

        // Volume UI
        const vol = document.getElementById("music-volume");
        const label = document.getElementById("music-vol-label");
        const vInit = Math.round(soundManager.musicVolume * 100);
        vol.value = String(vInit);
        label.textContent = `${vInit}%`;
        vol.addEventListener("input", () => {
            const v = Math.min(
                100,
                Math.max(0, Number(vol.value) || 0)
            );
            label.textContent = `${v}%`;
            soundManager.setMusicVolume(v / 100);
        });

        // Hazard badge click opens info
        this.ui.hazardBadge.addEventListener("click", () => {
            if (this.hazard && this.hazard.id !== "none")
                this.openHazardInfo();
        });

        // Enemy click
        this.ui.enemySprite.addEventListener("click", () => {
            this.openHelp(true);
        });

        // Initial codex render
        this.renderCodex();
    }

    // ------------------------------
    // Achievements
    // ------------------------------
    saveAchievements() {
        localStorage.setItem(
            "achUnlocked",
            JSON.stringify([...this.achUnlocked])
        );
    }

    unlockAchievement(id) {
        if (this.achUnlocked.has(id)) return;
        this.achUnlocked.add(id);
        this.saveAchievements();
        const meta = ACHIEVEMENTS.find((a) => a.id === id);
        if (meta) {
            Logger.log(`Ачивка: ${meta.name}`);
            this.spawnFloatingText(
                `🏆 ${meta.name}`,
                this.ui.enemySprite,
                "#fde047"
            );
        }
    }

    renderAchievements() {
        const cont = document.getElementById(
            "achievements-container"
        );
        const sum = document.getElementById("ach-summary");
        if (!cont || !sum) return;
        cont.innerHTML = "";
        const total = ACHIEVEMENTS.length;
        const unlocked = ACHIEVEMENTS.filter((a) =>
            this.achUnlocked.has(a.id)
        ).length;
        sum.textContent = `${unlocked}/${total}`;

        ACHIEVEMENTS.forEach((a) => {
            const got = this.achUnlocked.has(a.id);
            const card = document.createElement("div");
            card.className = `bg-black/30 border rounded-lg p-3 flex items-start gap-3 ${got ? "border-emerald-400/40" : "border-white/10"
                }`;
            card.innerHTML = `
                        <div class="text-2xl" style="filter:${got ? "none" : "grayscale(1) opacity(0.35)"
                }">${a.icon}</div>
                        <div class="flex-1">
                            <div class="font-bold ${got ? "text-emerald-200" : "text-slate-200"
                }">${a.name} ${got
                    ? '<span class="text-[10px] text-emerald-300">(получено)</span>'
                    : '<span class="text-[10px] text-slate-500">(закрыто)</span>'
                }</div>
                            <div class="text-sm text-slate-300 mt-1">${a.desc
                }</div>
                        </div>
                    `;
            cont.appendChild(card);
        });
    }

    openAchievements() {
        document
            .getElementById("achievements-modal")
            .classList.remove("hidden");
        this.renderAchievements();
    }
    closeAchievements() {
        document
            .getElementById("achievements-modal")
            .classList.add("hidden");
    }
    resetAchievements() {
        this.achUnlocked = new Set();
        this.saveAchievements();
        this.renderAchievements();
        Logger.log("Ачивки сброшены.");
    }

    // ------------------------------
    // Helpers
    // ------------------------------
    getCellTotal() {
        const rootStyles = getComputedStyle(
            document.documentElement
        );
        const cellSize =
            parseFloat(
                rootStyles.getPropertyValue("--cell-size")
            ) || 36;
        const gap =
            parseFloat(rootStyles.getPropertyValue("--grid-gap")) ||
            4;
        return cellSize + gap;
    }

    getGridPosFromPoint(clientX, clientY, layout) {
        const gridRect = this.ui.grid.getBoundingClientRect();
        const st = getComputedStyle(this.ui.grid);
        const pad = parseFloat(st.paddingLeft) || 8;
        const cellTotal = this.getCellTotal();

        const relX = clientX - gridRect.left - pad;
        const relY = clientY - gridRect.top - pad;

        if (!layout)
            return {
                row: Math.round(relY / cellTotal),
                col: Math.round(relX / cellTotal),
            };

        // Center the shape under the pointer
        const shapeCols = layout[0].length;
        const shapeRows = layout.length;

        // Cursor is center. TopLeft is Center - HalfShape.
        const col = Math.round(relX / cellTotal - shapeCols / 2);
        const row = Math.round(relY / cellTotal - shapeRows / 2);

        return { row, col };
    }

    cellIsFilled(val) {
        // With current rules: rocks/garbage count as filled; only null is empty.
        return val !== null;
    }

    hasArtifact(id) {
        return this.artifacts.some((a) => a.id === id);
    }

    artifactPrice(artifact) {
        const baseByRarity = { 1: 45, 2: 70, 3: 95 };
        let price = baseByRarity[artifact.rarity || 2] || 70;
        if (this.hasArtifact("coupon"))
            price = Math.floor(price * 0.8);
        return price;
    }

    addArtifact(artifact) {
        if (!artifact) return;
        if (this.hasArtifact(artifact.id)) return;
        this.artifacts.push(artifact);

        const icon = document.createElement("div");
        icon.className = "artifact-icon text-white";
        icon.style.borderColor = artifact.color;
        const priceInfo = artifact.rarity
            ? `<div class="mt-1 text-slate-300">Редкость: ${artifact.rarity}</div>`
            : "";
        icon.innerHTML = `${artifact.icon}<div class="artifact-tooltip"><div class="font-bold" style="color:${artifact.color}">${artifact.name}</div><div class="text-slate-200 mt-1">${artifact.desc}</div>${priceInfo}</div>`;
        this.ui.artifacts.appendChild(icon);

        // Passive immediate effects
        if (artifact.id === "flame") this.affinities.add("fire");
        if (artifact.id === "frost") this.affinities.add("ice");
        if (artifact.id === "venom") this.affinities.add("poison");
        if (artifact.id === "stormrune")
            this.affinities.add("storm");
        if (artifact.id === "halo") this.affinities.add("light");

        // On-pick effects
        if (artifact.id === "sturdy") {
            this.maxHp += 15;
            this.healPlayer(15);
            Logger.log("Амулет: +15 Max HP");
        }
        if (artifact.id === "glass_cannon") {
            this.maxHp = Math.floor(this.maxHp * 0.7);
            this.hp = Math.min(this.hp, this.maxHp);
            Logger.log("Стеклянная пушка: HP снижено");
        }
        if (artifact.id === "blood_pact") {
            this.gold += 100;
            this.hp -= 25;
            if (this.hp <= 0) this.hp = 1;
            Logger.log("Пакт: +100 золота, -25 HP");
        }
        if (artifact.id === "spike_armor") {
            this.shield += 15;
            this.addArtifact({
                id: "thorns",
                name: "Шипы (эффект)",
                desc: "Враг получает 5 урона при атаке",
                icon: "🌵",
                color: "#16a34a",
                rarity: 0,
            }); // reuse existing logic
            Logger.log("Шипастый доспех: броня + шипы");
        }
        if (artifact.id === "inferno_ring") {
            this.addStatus("enemy", "burn", 5);
        }

        if (this.artifacts.length >= 6)
            this.unlockAchievement("collector");
        if (this.artifacts.length >= 12)
            this.unlockAchievement("hoarder");

        this.renderCodex();
        this.updateUI();
    }

    addStatus(target, type, stacks) {
        if (this.hasArtifact("omni_prism")) stacks += 1;

        const table =
            target === "enemy"
                ? this.enemyStatuses
                : this.playerStatuses;
        if (!(type in table)) table[type] = 0;
        table[type] = Math.min(99, table[type] + stacks);

        // Achievement: any stack >= 8 on enemy
        if (target === "enemy" && table[type] >= 8)
            this.unlockAchievement("elementalist");
    }

    decayStatus(target, type, amount = 1) {
        const table =
            target === "enemy"
                ? this.enemyStatuses
                : this.playerStatuses;
        if (!(type in table)) return;
        table[type] = Math.max(0, table[type] - amount);
    }

    // ------------------------------
    // Help / Codex
    // ------------------------------
    renderCodex() {
        const s = document.getElementById("codex-status");
        const h = document.getElementById("codex-hazards");
        if (!s || !h) return;

        s.innerHTML = "";
        Object.values(STATUS_META).forEach((meta) => {
            const row = document.createElement("div");
            row.className = "flex gap-2 items-start";
            row.innerHTML = `<div class="mt-[1px]">${meta.icon}</div><div><div class="font-bold" style="color:${meta.color}">${meta.name}</div><div class="text-slate-200">${meta.desc}</div></div>`;
            s.appendChild(row);
        });

        h.innerHTML = "";
        HAZARDS.filter((x) => x.id !== "none").forEach((hz) => {
            const row = document.createElement("div");
            row.className = "flex gap-2 items-start";
            const tag =
                hz.kind === "boon"
                    ? '<span class="text-[10px] text-emerald-300">(благословение)</span>'
                    : '<span class="text-[10px] text-red-300">(опасность)</span>';
            row.innerHTML = `<div class="mt-[1px]">${hz.icon}</div><div><div class="font-bold text-slate-100">${hz.name} ${tag}</div><div class="text-slate-200">${hz.desc}</div></div>`;
            h.appendChild(row);
        });

        this.renderEnemyCodex();
    }

    renderEnemyCodex() {
        const el = document.getElementById("codex-enemy");
        if (!el) return;
        const e = this.currentEnemy;
        if (!e) {
            el.textContent = "—";
            return;
        }
        const meta = ELEMENTS[e.element] || {
            icon: "⚔️",
            name: "Физ.",
        };
        const bossTag = this.level % 5 === 0 ? "БОСС" : "ВРАГ";
        el.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="font-bold text-slate-100">${bossTag}: ${e.name
            } <span class="opacity-80">${meta.icon}</span></div>
                            <div class="text-slate-300 mt-1">${e.desc || "—"
            }</div>
                        </div>
                        <div class="text-right text-slate-200">
                            <div>ATK: <b>${this.enemyAttack}</b></div>
                            <div>HP: <b>${this.enemyHp}/${this.enemyMaxHp
            }</b></div>
                            <div>ARM: <b>${this.enemyShield}</b></div>
                        </div>
                    </div>
                `;
    }

    openHelp(focusEnemy = false) {
        const modal = document.getElementById("help-modal");
        modal.classList.remove("hidden");
        this.renderCodex();
        if (focusEnemy) {
            setTimeout(() => {
                const block =
                    document.getElementById("codex-enemy");
                block?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 50);
        }
    }

    closeHelp() {
        document
            .getElementById("help-modal")
            .classList.add("hidden");
    }

    openHazardInfo() {
        if (!this.hazard) return;
        const modal = document.getElementById("hazard-modal");
        const icon = document.getElementById("hazard-icon");
        const title = document.getElementById("hazard-title");
        const desc = document.getElementById("hazard-desc");
        const btn = document.getElementById("hazard-continue");
        const header = document.getElementById("hazard-header");

        icon.textContent = this.hazard.icon || "⚠️";
        title.textContent = this.hazard.name;
        desc.textContent = this.hazard.desc;

        if (this.hazard.kind === "boon") {
            header.textContent = "БЛАГОСЛОВЕНИЕ";
            header.className =
                "text-lg font-black text-emerald-200 pixel-font";
        } else {
            header.textContent = "ОПАСНОСТЬ";
            header.className =
                "text-lg font-black text-red-200 pixel-font";
        }

        this.paused = true;
        modal.classList.remove("hidden");
        btn.onclick = () => {
            modal.classList.add("hidden");
            this.paused = false;
        };
    }

    // ------------------------------
    // Game flow
    // ------------------------------
    restart() {
        this.resetRun();
        document
            .getElementById("game-over-modal")
            .classList.add("hidden");
        document
            .getElementById("victory-modal")
            .classList.add("hidden");
        document
            .getElementById("hazard-modal")
            .classList.add("hidden");
        document
            .getElementById("shop-modal")
            .classList.add("hidden");
        document
            .getElementById("help-modal")
            .classList.add("hidden");
        document
            .getElementById("log-modal")
            .classList.add("hidden");
        document
            .getElementById("achievements-modal")
            .classList.add("hidden");

        this.ui.artifacts.innerHTML = "";
        this.ui.affinity.innerHTML = "";
        this.renderGrid();
        this.spawnEnemy();
        this.fillHand();
        this.updateUI();
        Logger.clear();
        Logger.log("Новый забег.");
        this.renderCodex();
    }

    chooseEnemyTemplate() {
        const isBossFloor = this.level % 5 === 0;
        const pool = ENEMIES.filter((e) =>
            isBossFloor ? e.kind === "boss" : e.kind === "enemy"
        );
        return pool[Math.floor(Math.random() * pool.length)];
    }

    rollHazard() {
        // Weighted random across all entries
        const list = HAZARDS;
        const total = list.reduce((s, h) => s + (h.weight || 1), 0);
        let t = Math.random() * total;
        for (const h of list) {
            t -= h.weight || 1;
            if (t <= 0) return h;
        }
        return HAZARDS.find((h) => h.id === "none");
    }

    applyHazard(hazard) {
        this.hazard = hazard;
        this.hazardMods = this.defaultHazardMods();
        if (hazard && hazard.mods) {
            this.hazardMods = {
                ...this.hazardMods,
                ...hazard.mods,
            };
        }
        this.tempHandPlus = this.hazardMods.tempHandPlus || 0;
    }

    showHazardIfNeeded() {
        if (!this.hazard || this.hazard.id === "none") {
            this.paused = false;
            return;
        }
        this.openHazardInfo();
    }

    pickTrackForTheme(theme) {
        const map = {
            "theme-magma": "magma",
            "theme-ice": "ice",
            "theme-storm": "storm",
            "theme-void": "void",
            "theme-forest": "forest",
            "theme-ocean": "ocean",
            "theme-desert": "desert",
            "theme-neon": "neon",
            "theme-cosmos": "dream",
            "theme-crypt": "forest",
            "theme-lab": "arcade",
            "theme-blood": "ashen",
            "theme-ruins": "ruins",
            "theme-aurora": "aurora",
            "theme-arcade": "arcade",
            "theme-ashen": "ashen",
            "theme-sakura": "sakura",
            "theme-abyss": "abyss",
            "theme-toxic": "toxic",
            "theme-tundra": "tundra",
            "theme-gilded": "gilded",
            "theme-dream": "dream",
        };
        return map[theme] || "deep";
    }

    spawnEnemy() {
        const enemyTemplate = this.chooseEnemyTemplate();
        this.currentEnemy = enemyTemplate;

        const isBossFloor = this.level % 5 === 0;
        this.ui.enemyLabel.textContent = isBossFloor
            ? "БОСС"
            : "ВРАГ";

        document.body.className = `h-screen w-screen flex flex-col items-center justify-between p-2 select-none ${enemyTemplate.theme}`;

        // music theme
        const track = this.pickTrackForTheme(enemyTemplate.theme);
        if (Math.random() < 0.15) {
            const ids = Object.keys(soundManager.tracks);
            soundManager.setTrack(
                ids[Math.floor(Math.random() * ids.length)]
            );
        } else {
            soundManager.setTrack(track);
        }

        const baseHp = 105 * (1 + this.level * 0.22);
        const baseAtk = 8 + this.level * 1.6;

        let diffHpMult = 1;
        let diffAtkMult = 1;

        if (this.difficulty === 0) {
            diffHpMult = 0.8;
            diffAtkMult = 0.8;
        }
        if (this.difficulty === 2) {
            diffHpMult = 1.25;
            diffAtkMult = 1.25;
        }

        // Hazard Buff
        if (this.hazardMods.enemyBuff) {
            diffHpMult *= this.hazardMods.enemyBuff;
            diffAtkMult *= this.hazardMods.enemyBuff;
        }

        this.enemyMaxHp = Math.floor(
            baseHp * enemyTemplate.hpMod * diffHpMult
        );
        this.enemyHp = this.enemyMaxHp;
        this.enemyShield = 0;
        this.enemyAttack = Math.max(
            4,
            Math.floor(baseAtk * enemyTemplate.atkMod * diffAtkMult)
        );

        // Reset statuses
        this.enemyStatuses = {
            burn: 0,
            poison: 0,
            shock: 0,
            chill: 0,
        };
        this.medicThisTurn = 0;
        this.clearsThisFight = 0;
        this.placeBonusThisFight = 0;
        this.discardsThisFight = 0;
        this.lastHitWasCrit = false;
        this.damageTakenThisFight = 0;
        this.overchargeThisFight = 0;

        // Start shield
        if (this.hasArtifact("crystal")) this.shield += 20;

        // Heal after battle
        if (this.hasArtifact("regen")) this.healPlayer(5);

        // Start enemy chill if glacier
        if (this.hasArtifact("glacier"))
            this.addStatus("enemy", "chill", 2);

        // Halo: cleanse 1 negative
        if (this.hasArtifact("halo")) {
            const keys = ["burn", "poison", "shock", "weak"];
            const hasAny = keys.some(
                (k) => (this.playerStatuses[k] || 0) > 0
            );
            if (hasAny) {
                const pick = keys.find(
                    (k) => (this.playerStatuses[k] || 0) > 0
                );
                this.playerStatuses[pick] = Math.max(
                    0,
                    (this.playerStatuses[pick] || 0) - 1
                );
                Logger.log("Ореол: очищение статуса");
            }
        }

        // Visual
        this.ui.enemySprite.className = `enemy-sprite hover-anim rounded-xl flex justify-center items-center mb-2 ${enemyTemplate.style}`;
        this.ui.enemySprite.classList.remove("shake");

        // Hazard/boon
        const hazard = this.rollHazard();
        this.applyHazard(hazard);

        // Apply hazard effects on grid
        this.applyStartGridEffects();
        if (this.hazardMods.gridSize && this.hazardMods.gridSize !== GRID_SIZE) {
            this.resizeGrid(this.hazardMods.gridSize, this.hazardMods.cellSize);
            Logger.log(
                `Благословение: сетка ${this.hazardMods.gridSize}x${this.hazardMods.gridSize}`
            );
        }

        // Grid cleanser artifact
        if (this.hasArtifact("cleanser"))
            this.removeRandomFilledCells(3);

        // Boon starts
        if (this.hazardMods.startShield) {
            this.shield += this.hazardMods.startShield;
            Logger.log(
                `Благословение: +${this.hazardMods.startShield} щита`
            );
        }
        if (this.hazardMods.startHeal) {
            this.healPlayer(this.hazardMods.startHeal);
            Logger.log(
                `Благословение: +${this.hazardMods.startHeal} HP`
            );
        }
        if (this.hazardMods.startGold) {
            this.gold += this.hazardMods.startGold;
            Logger.log(
                `Благословение: +${this.hazardMods.startGold} золота`
            );
        }
        if (this.hazardMods.startClean) {
            this.removeRandomFilledCells(
                this.hazardMods.startClean
            );
            Logger.log(
                `Благословение: очищение (${this.hazardMods.startClean})`
            );
        }
        if (this.hazardMods.startEnemyChill) {
            this.addStatus(
                "enemy",
                "chill",
                this.hazardMods.startEnemyChill
            );
        }

        this.updateUI();
        this.renderEnemyCodex();
        this.showHazardIfNeeded();

        if (this.level >= 10) this.unlockAchievement("depth10");
        if (this.level >= 20) this.unlockAchievement("depth20");

        if (isBossFloor) Logger.log(`БОСС: ${enemyTemplate.name}`);
        else Logger.log(`Враг: ${enemyTemplate.name}`);
    }

    resizeGrid(newSize, scale = "36px") {
        GRID_SIZE = newSize;
        document.documentElement.style.setProperty(
            "--grid-size",
            String(newSize)
        );
        document.documentElement.style.setProperty(
            "--cell-size",
            scale
        );
        
        this.grid = Array.from({ length: newSize }, () =>
            Array.from({ length: newSize }, () => null)
        );
        this.renderGrid();
    }

    applyStartGridEffects() {
        // Per-fight soft cleanup: remove some filled cells to prevent permanent lockouts.
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const v = this.grid[r][c];
                if (v !== null && Math.random() > 0.68) {
                    this.grid[r][c] = null;
                    this.setCellClass(r, c, "cell");
                }
            }
        }

        // Mask first (shape changes) -> now rocks instead of holes
        if (this.hazardMods.mask)
            this.applyMask(this.hazardMods.mask);

        if (this.hazardMods.startRocks)
            this.spawnRocks(this.hazardMods.startRocks);
        // Compatibility: if something still calls startHoles, treat as rocks
        if (this.hazardMods.startHoles)
            this.spawnRocks(this.hazardMods.startHoles);
        if (this.hazardMods.startGarbage)
            this.spawnGarbage(this.hazardMods.startGarbage);
        if (this.hazardMods.startMines)
            this.spawnMines(this.hazardMods.startMines);

        // Artifact: trowel (remove 2 rocks/garbage)
        if (this.hasArtifact("trowel")) {
            const removed = this.removeRandomSpecificCells(
                ["ROCK", "GARBAGE"],
                2
            );
            if (removed > 0) Logger.log(`Кельма: очищено ${removed}`);
        }
    }

    applyMask(type) {
        const setMask = (r, c) => {
            if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE)
                return;
            if (this.grid[r][c] === null) {
                this.grid[r][c] = "MASK"; // Special type: Clips shapes, conducts lines, permanent
                this.setCellClass(r, c, "cell rock maskrock");
            }
        };

        if (type === "tiny") {
            for (let i = 0; i < GRID_SIZE; i++) {
                setMask(0, i);
                setMask(GRID_SIZE - 1, i);
                setMask(i, 0);
                setMask(i, GRID_SIZE - 1);
            }
            return;
        }

        if (type === "shatter") {
            const target = 10 + Math.floor(Math.random() * 6);
            let tries = 0;
            let count = target;
            while (count > 0 && tries < 400) {
                tries++;
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);
                if (this.grid[r][c] === null) {
                    setMask(r, c);
                    count--;
                }
            }
            return;
        }

        if (type === "diamond") {
            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++) {
                    const d = Math.abs(r - 3.5) + Math.abs(c - 3.5);
                    if (d > 3.6) setMask(r, c);
                }
            return;
        }

        if (type === "checker") {
            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++) {
                    if ((r + c) % 2 === 1) setMask(r, c);
                }
            return;
        }

        if (type === "spiral") {
            // Fill with mask
            for (let r = 0; r < GRID_SIZE; r++)
                for (let c = 0; c < GRID_SIZE; c++) {
                    this.grid[r][c] = "MASK";
                    this.setCellClass(r, c, "cell rock maskrock");
                }

            const carve = (r, c) => {
                if (
                    r < 0 ||
                    c < 0 ||
                    r >= GRID_SIZE ||
                    c >= GRID_SIZE
                )
                    return;
                this.grid[r][c] = null;
                this.setCellClass(r, c, "cell");
            };

            let top = 0,
                left = 0,
                bottom = GRID_SIZE - 1,
                right = GRID_SIZE - 1;
            while (top <= bottom && left <= right) {
                for (let c = left; c <= right; c++) carve(top, c);
                top++;
                for (let r = top; r <= bottom; r++) carve(r, right);
                right--;
                if (top <= bottom) {
                    for (let c = right; c >= left; c--)
                        carve(bottom, c);
                    bottom--;
                }
                if (left <= right) {
                    for (let r = bottom; r >= top; r--)
                        carve(r, left);
                    left++;
                }
            }
            return;
        }
    }

    spawnRocks(count) {
        let tries = 0;
        while (count > 0 && tries < 400) {
            tries++;
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (this.grid[r][c] === null) {
                this.grid[r][c] = "ROCK";
                this.setCellClass(r, c, "cell rock");
                count--;
            }
        }
    }

    spawnGarbage(count) {
        let tries = 0;
        while (count > 0 && tries < 500) {
            tries++;
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (this.grid[r][c] === null) {
                this.grid[r][c] = "GARBAGE";
                this.setCellClass(r, c, "cell garbage");
                count--;
            }
        }
    }

    spawnMines(count) {
        let tries = 0;
        while (count > 0 && tries < 500) {
            tries++;
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            if (this.grid[r][c] === null) {
                this.grid[r][c] = "MINE";
                this.setCellClass(r, c, "cell mine");
                count--;
            }
        }
    }

    removeRandomSpecificCells(allowedValues, count) {
        const filled = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const v = this.grid[r][c];
                if (allowedValues.includes(v)) filled.push([r, c]);
            }
        }
        let removed = 0;
        for (let i = 0; i < count && filled.length > 0; i++) {
            const idx = Math.floor(Math.random() * filled.length);
            const [r, c] = filled.splice(idx, 1)[0];
            this.grid[r][c] = null;
            this.setCellClass(r, c, "cell");
            removed++;
        }
        return removed;
    }

    removeRandomFilledCells(count) {
        const filled = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const v = this.grid[r][c];
                if (v !== null && v !== "HOLE") filled.push([r, c]);
            }
        }
        for (let i = 0; i < count && filled.length > 0; i++) {
            const idx = Math.floor(Math.random() * filled.length);
            const [r, c] = filled.splice(idx, 1)[0];
            this.grid[r][c] = null;
            this.setCellClass(r, c, "cell");
        }
    }

    healEnemy(amt) {
        this.enemyHp = Math.min(
            this.enemyMaxHp,
            this.enemyHp + amt
        );
        this.updateUI();
    }

    healPlayer(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.updateUI();
    }

    // ------------------------------
    // Grid render
    // ------------------------------
    renderGrid() {
        this.ui.grid.innerHTML = "";
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.index = i;
            this.ui.grid.appendChild(cell);
        }
    }

    setCellClass(r, c, cls) {
        const idx = r * GRID_SIZE + c;
        const el = this.ui.grid.children[idx];
        if (!el) return;
        el.className = cls;
    }

    // ------------------------------
    // Hand + blocks
    // ------------------------------
    getHandSize() {
        let size = 3;
        if (this.hasArtifact("architect")) size += 1;
        size += this.tempHandPlus || 0;
        return size;
    }

    checkCanFit(shape, clipMode) {
        const layout = shape.layout;
        const rows = layout.length;
        const cols = layout[0].length;
        const rStart = clipMode ? -rows + 1 : 0;
        const rEnd = clipMode ? GRID_SIZE - 1 : GRID_SIZE - rows;
        const cStart = clipMode ? -cols + 1 : 0;
        const cEnd = clipMode ? GRID_SIZE - 1 : GRID_SIZE - cols;
        for (let r = rStart; r <= rEnd; r++) {
            for (let c = cStart; c <= cEnd; c++) {
                if (this.isValidPosition(r, c, layout)) return true;
            }
        }
        return false;
    }

    fillHand() {
        this.ui.hand.innerHTML = "";
        this.hand = [];
        this.lockedSlots = new Set();
        this.medicThisTurn = 0;

        if (this.hasArtifact("bulwark") && this.shield === 0) {
            this.shield += 8;
            Logger.log("Бастион: +8 щита");
        }

        const size = this.getHandSize();
        const clipMode = !!this.hazardMods.mask;
        let validShapesCache = [];

        const pickShape = () => {
            // 75% chance to ensure playability
            if (Math.random() < 0.75) {
                if (validShapesCache.length === 0) {
                    validShapesCache = SHAPES.filter((s) =>
                        this.checkCanFit(s, clipMode)
                    );
                    if (validShapesCache.length === 0)
                        validShapesCache = [...SHAPES]; // Panic fallback
                }
                return validShapesCache[
                    Math.floor(
                        Math.random() * validShapesCache.length
                    )
                ];
            }
            return SHAPES[
                Math.floor(Math.random() * SHAPES.length)
            ];
        };

        const pickRandomShape = () => {
            const trim = (matrix) => {
                const rows = matrix.length, cols = matrix[0].length;
                let firstRow = -1, lastRow = -1, firstCol = -1, lastCol = -1;
                for (let r = 0; r < rows; r++)
                    for (let c = 0; c < cols; c++)
                        if (matrix[r][c] === 1) {
                            if (firstRow === -1) firstRow = r;
                            lastRow = r;
                            if (firstCol === -1 || c < firstCol) firstCol = c;
                            if (c > lastCol) lastCol = c;
                        }

                if (firstRow === -1) return [[1]];
                return matrix.slice(firstRow, lastRow + 1).map(row => row.slice(firstCol, lastCol + 1));
            }

            let layout = trim(Array(3).fill().map(() => Array(3).fill(0).map(() => (Math.random() < 0.5 ? 1 : 0))));

            let colors = ["bg-cyan-500", "bg-purple-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-fuchsia-500", "bg-yellow-400"]

            return {
                name: "random",
                color: colors[Math.floor(Math.random()*colors.length)],
                layout: layout
            };
        }

        for (let i = 0; i < size; i++) {
            const shapeData = this.hazardMods.randomShape ? pickRandomShape() : pickShape();
            this.createHandBlock({ ...shapeData }, i);
        }

        if (this.freezeNextHand > 0) {
            const toLock = Math.min(this.freezeNextHand, size);
            const indices = [...Array(size).keys()]
                .sort(() => Math.random() - 0.5)
                .slice(0, toLock);
            indices.forEach((i) => this.lockedSlots.add(i));
            this.freezeNextHand = Math.max(
                0,
                this.freezeNextHand - 1
            );
        }

        this.updateHandLocks();
        this.updateUI();
    }

    updateHandLocks() {
        this.hand.forEach((b, idx) => {
            if (!b) return;
            if (this.lockedSlots.has(idx)) {
                b.element.classList.add("frozen");
                b.element.title = "Заморожено";
            }
        });
    }

    createHandBlock(shapeData, index) {
        const container = document.createElement("div");
        container.className =
            "block-container cursor-grab active:cursor-grabbing p-2 transition-transform hover:scale-105";

        const miniGrid = document.createElement("div");
        miniGrid.className = "mini-grid";
        miniGrid.style.gridTemplateColumns = `repeat(${shapeData.layout[0].length}, 20px)`;
        miniGrid.style.gridTemplateRows = `repeat(${shapeData.layout.length}, 20px)`;

        shapeData.layout.forEach((row) => {
            row.forEach((cell) => {
                const div = document.createElement("div");
                if (cell)
                    div.className = `mini-cell ${shapeData.color}`;
                miniGrid.appendChild(div);
            });
        });

        container.appendChild(miniGrid);
        this.ui.hand.appendChild(container);

        const blockObj = {
            ...shapeData,
            id: index,
            element: container,
        };
        this.hand[index] = blockObj;

        const startDrag = (e) => {
            e.preventDefault();
            if (this.paused) return;
            if (this.hp <= 0) return;

            soundManager.playPickup();
            this.startDrag(blockObj, e);
        };

        container.addEventListener("mousedown", startDrag);
        container.addEventListener("touchstart", startDrag);
    }

    startDrag(block, e) {
        this.draggedBlock = block;
        const clientX = e.touches
            ? e.touches[0].clientX
            : e.clientX;
        const clientY = e.touches
            ? e.touches[0].clientY+this.offsetY
            : e.clientY+this.offsetY;

        const ghost = block.element.cloneNode(true);
        ghost.classList.add("drag-ghost");
        ghost.id = "drag-ghost";
        document.body.appendChild(ghost);

        ghost.style.left = `${clientX}px`;
        ghost.style.top = `${clientY}px`;
        block.element.style.opacity = "0";
    }

    handleDragMove(e) {
        if (!this.draggedBlock) return;
        if (this.paused) return;
        e.preventDefault();

        const clientX = e.touches
            ? e.touches[0].clientX
            : e.clientX;
        const clientY = e.touches
            ? e.touches[0].clientY+this.offsetY
            : e.clientY+this.offsetY;

        const ghost = document.getElementById("drag-ghost");
        if (ghost) {
            ghost.style.left = `${clientX}px`;
            ghost.style.top = `${clientY}px`;
        }

        this.clearPreviews();

        if (
            this.hazardMods.noPreview &&
            !this.hasArtifact("lantern")
        )
            return;

        const { row, col } = this.getGridPosFromPoint(
            clientX,
            clientY,
            this.draggedBlock.layout
        );
        const isValid = this.isValidPosition(
            row,
            col,
            this.draggedBlock.layout
        );
        this.drawPreview(
            row,
            col,
            this.draggedBlock.layout,
            !isValid
        );
    }

    handleDragEnd(e) {
        if (!this.draggedBlock) return;
        const ghost = document.getElementById("drag-ghost");
        if (ghost) ghost.remove();

        const clientX = e.changedTouches
            ? e.changedTouches[0].clientX
            : e.clientX;
        const clientY = e.changedTouches
            ? e.changedTouches[0].clientY+this.offsetY
            : e.clientY+this.offsetY;

        const { row, col } = this.getGridPosFromPoint(
            clientX,
            clientY,
            this.draggedBlock.layout
        );

        if (
            !this.paused &&
            this.isValidPosition(row, col, this.draggedBlock.layout)
        ) {
            this.placeBlock(row, col, this.draggedBlock);
            this.draggedBlock.element.remove();
            this.hand[this.draggedBlock.id] = null;
            this.checkHandEmpty();
        } else {
            this.draggedBlock.element.style.opacity = "1";
            soundManager.playInvalid();
        }

        this.clearPreviews();
        this.draggedBlock = null;
    }

    // In masked fights we allow "clipping": cells that fall outside the grid are ignored.
    // This makes placement on strange-shaped arenas feel fair.
    isValidPosition(r, c, layout) {
        const clip = !!this.hazardMods.mask;
        let anyPlaced = false;

        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[0].length; j++) {
                if (layout[i][j] !== 1) continue;
                const rr = r + i;
                const cc = c + j;

                if (
                    rr < 0 ||
                    cc < 0 ||
                    rr >= GRID_SIZE ||
                    cc >= GRID_SIZE
                ) {
                    if (clip) continue;
                    return false;
                }

                const cellVal = this.grid[rr][cc];
                if (clip && cellVal === "MASK") continue; // Clip
                if (cellVal !== null) return false; // Block

                anyPlaced = true;
            }
        }
        return anyPlaced;
    }

    clearPreviews() {
        Array.from(this.ui.grid.children).forEach((c) =>
            c.classList.remove("preview", "invalid")
        );
    }

    drawPreview(r, c, layout, invalid) {
        const clip = !!this.hazardMods.mask;
        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[0].length; j++) {
                if (layout[i][j] !== 1) continue;
                const rr = r + i;
                const cc = c + j;
                if (
                    rr < 0 ||
                    cc < 0 ||
                    rr >= GRID_SIZE ||
                    cc >= GRID_SIZE
                )
                    continue;

                if (clip && this.grid[rr][cc] === "MASK") continue;

                const idx = rr * GRID_SIZE + cc;
                const el = this.ui.grid.children[idx];
                if (!el) continue;
                el.classList.add(invalid ? "invalid" : "preview");
            }
        }
    }

    placeBlock(r, c, block) {
        soundManager.playPlace();

        let cellsPlaced = 0;
        const layout = block.layout;
        const clip = !!this.hazardMods.mask;

        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[0].length; j++) {
                if (layout[i][j] !== 1) continue;
                const rr = r + i;
                const cc = c + j;

                if (
                    rr < 0 ||
                    cc < 0 ||
                    rr >= GRID_SIZE ||
                    cc >= GRID_SIZE
                )
                    continue;

                if (clip && this.grid[rr][cc] === "MASK") continue;
                if (this.grid[rr][cc] !== null) continue;

                this.grid[rr][cc] = block.color;
                const idx = rr * GRID_SIZE + cc;
                const cellEl = this.ui.grid.children[idx];
                cellEl.className = `cell filled ${block.color}`;
                cellEl.animate(
                    [
                        { transform: "scale(0.5)" },
                        { transform: "scale(1)" },
                    ],
                    { duration: 160 }
                );
                cellsPlaced++;
            }
        }

        // Hazard: HP per cell
        if (this.hazardMods.hpCostPerCell > 0) {
            const cost =
                cellsPlaced * this.hazardMods.hpCostPerCell;
            this.hp -= cost;
            this.damageTakenThisFight += cost;
            Logger.log(`Шипы: -${cost} HP`);
            this.spawnFloatingText(
                cost,
                this.ui.playerHpBar,
                "#ef4444"
            );
            soundManager.playDamage();
            if (this.hp <= 0) {
                this.hp = 0;
                this.loseGame();
                return;
            }
        }

        // Artifact: Fortify
        if (this.hasArtifact("fortify")) this.shield += cellsPlaced;

        // Artifact: medic
        if (this.hasArtifact("surgeon") && this.medicThisTurn < 8) {
            const heal = Math.min(1, 8 - this.medicThisTurn);
            this.medicThisTurn += heal;
            this.healPlayer(heal);
        }

        // Element application from artifacts
        if (this.hasArtifact("flame"))
            this.addStatus("enemy", "burn", 1);
        if (this.hasArtifact("venom") && cellsPlaced >= 3)
            this.addStatus("enemy", "poison", 2);

        // Damage from placed cells
        let placeDamage = cellsPlaced;

        // Focus: single cell bonus
        if (this.hasArtifact("focus") && cellsPlaced === 1)
            placeDamage += 6;

        // Crusher scales with clears
        if (this.hasArtifact("crusher"))
            placeDamage += this.clearsThisFight;

        // Gemcutter scales with line clears this fight
        if (this.hasArtifact("gemcutter"))
            placeDamage += this.placeBonusThisFight;

        // Overcharge from crits
        placeDamage += this.overchargeThisFight || 0;

        if (this.hasArtifact("gambler") && Math.random() < 0.25) {
            placeDamage *= 2;
            Logger.log("Азарт: JACKPOT!");
            this.spawnFloatingText(
                "JACKPOT!",
                this.ui.enemySprite,
                "#fbbf24"
            );
        }

        this.damageEnemy(placeDamage, false);

        // Thunder artifact
        if (this.hasArtifact("thunder")) {
            this.blocksPlaced++;
            if (this.blocksPlaced % 3 === 0) {
                this.addStatus("enemy", "shock", 1);
                this.damageEnemy(10, true);
                Logger.log("Грозовой удар: +10");
                this.spawnFloatingText(
                    "ZAP!",
                    this.ui.enemySprite,
                    "#facc15"
                );
            }
        }

        this.checkLines();
        this.updateUI();
    }

    // ------------------------------
    // Lines
    // ------------------------------
    checkLines() {
        let rowsToClear = [];
        let colsToClear = [];

        for (let r = 0; r < GRID_SIZE; r++) {
            if (this.grid[r].every((val) => this.cellIsFilled(val)))
                rowsToClear.push(r);
        }

        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (!this.cellIsFilled(this.grid[r][c]))
                    full = false;
            }
            if (full) colsToClear.push(c);
        }

        const linesCleared =
            rowsToClear.length + colsToClear.length;
        if (linesCleared > 0) {
            this.performClear(
                rowsToClear,
                colsToClear,
                linesCleared
            );
        }
    }

    async performClear(rows, cols, count) {
        soundManager.playClear();
        this.clearsThisFight += count;

        let damage = count * 20 * (count > 1 ? 1.5 : 1);
        if (this.hasArtifact("sniper") && count === 1) damage += 12;
        if (this.hasArtifact("combo") && count >= 2) damage += 10;

        let shieldGain = count * 5;
        if (this.hasArtifact("battery")) shieldGain += count * 3;
        this.shield += shieldGain;

        if (this.hasArtifact("vampire")) {
            this.healPlayer(count * 2);
            Logger.log(`Кровавое касание: +${count * 2} HP`);
            this.spawnFloatingText(
                "HEAL",
                this.ui.playerHpBar,
                "#22c55e"
            );
        }

        if (this.hasArtifact("goldlines")) {
            const gg = count * 2;
            this.gold += gg;
            Logger.log(`Золотые линии: +${gg} золота`);
        }

        if (this.hasArtifact("frost"))
            this.addStatus("enemy", "chill", 2);
        if (this.hasArtifact("stormrune"))
            this.addStatus("enemy", "shock", 2);
        if (this.hasArtifact("gemcutter"))
            this.placeBonusThisFight += count;

        if (this.hasArtifact("prism")) {
            const picks = ["fire", "ice", "storm", "poison"];
            const el = picks[this.prismCounter % picks.length];
            this.prismCounter++;
            if (el === "fire") {
                this.addStatus("enemy", "burn", 3);
                this.spawnFloatingText(
                    "🔥",
                    this.ui.enemySprite,
                    "#fb7185"
                );
            }
            if (el === "ice") {
                this.addStatus("enemy", "chill", 2);
                this.spawnFloatingText(
                    "❄️",
                    this.ui.enemySprite,
                    "#67e8f9"
                );
            }
            if (el === "storm") {
                this.addStatus("enemy", "shock", 2);
                this.spawnFloatingText(
                    "⚡",
                    this.ui.enemySprite,
                    "#facc15"
                );
            }
            if (el === "poison") {
                this.addStatus("enemy", "poison", 3);
                this.spawnFloatingText(
                    "☠️",
                    this.ui.enemySprite,
                    "#22c55e"
                );
            }
        }

        const cellsToClear = new Set();
        rows.forEach((r) => {
            for (let c = 0; c < GRID_SIZE; c++)
                cellsToClear.add(r * GRID_SIZE + c);
        });
        cols.forEach((c) => {
            for (let r = 0; r < GRID_SIZE; r++)
                cellsToClear.add(r * GRID_SIZE + c);
        });

        cellsToClear.forEach((idx) =>
            this.ui.grid.children[idx].classList.add("line-clear")
        );
        await new Promise((r) => setTimeout(r, 280));

        cellsToClear.forEach((idx) => {
            const r = Math.floor(idx / GRID_SIZE);
            const c = idx % GRID_SIZE;
            const val = this.grid[r][c];
            // Keep MASK/ROCK, but allow lines to clear
            if (val === "ROCK" || val === "MASK") {
                this.ui.grid.children[idx].classList.remove(
                    "line-clear"
                );
                this.ui.grid.children[idx].animate(
                    [
                        { filter: "brightness(1.5)" },
                        { filter: "brightness(1)" },
                    ],
                    { duration: 300 }
                );
            } else {
                if (val === "MINE") {
                    this.damageEnemy(30, true);
                    Logger.log("Мина взорвана! +30 урона");
                    this.spawnFloatingText(
                        "BOOM!",
                        this.ui.enemySprite,
                        "#ef4444"
                    );
                    soundManager.playCrit();
                }
                this.grid[r][c] = null;
                this.ui.grid.children[idx].className = "cell";
            }
        });

        if (this.hasArtifact("magnet"))
            this.removeRandomFilledCells(1);
        if (count >= 1) this.unlockAchievement("first_clear");
        if (count >= 4) this.unlockAchievement("mega_clear");

        this.damageEnemy(Math.floor(damage), true);
    }

    // ------------------------------
    // Damage + statuses
    // ------------------------------
    tickStatusesBeforeEnemyActs() {
        // Enemy DOT
        let dotDmg = 0;
        let corrosionArmor = 0;

        if (this.enemyStatuses.burn > 0) {
            const mult = this.hasArtifact("alchemist") ? 1.5 : 1;
            dotDmg += Math.ceil(this.enemyStatuses.burn * 1 * mult);
            this.decayStatus("enemy", "burn", 1);
        }
        if (this.enemyStatuses.poison > 0) {
            const mult = this.hasArtifact("alchemist") ? 1.5 : 1;
            const p = Math.ceil(
                Math.max(
                    1,
                    Math.floor(this.enemyStatuses.poison / 2)
                ) * mult
            );
            dotDmg += p;
            if (
                this.hasArtifact("corrosive") &&
                this.enemyShield > 0
            ) {
                corrosionArmor = Math.min(this.enemyShield, 1);
            }
            this.decayStatus("enemy", "poison", 1);
        }

        if (dotDmg > 0) {
            this.damageEnemy(dotDmg, false, true);
            this.spawnFloatingText(
                dotDmg,
                this.ui.enemySprite,
                "#22c55e"
            );
            if (corrosionArmor > 0) {
                this.enemyShield -= corrosionArmor;
                this.spawnFloatingText(
                    "-ARM",
                    this.ui.enemySprite,
                    "#22c55e"
                );
            }
        }

        // Artifact: cinder
        if (
            this.hasArtifact("cinder") &&
            this.enemyStatuses.burn > 0
        ) {
            this.damageEnemy(3, false, true);
            this.spawnFloatingText(
                3,
                this.ui.enemySprite,
                "#fb7185"
            );
        }

        // Player DOT
        if (this.playerStatuses.burn > 0) {
            const burn = this.playerStatuses.burn;
            this.hp -= burn;
            this.damageTakenThisFight += burn;
            this.spawnFloatingText(
                burn,
                this.ui.playerHpBar,
                "#fb7185"
            );
            this.decayStatus("player", "burn", 1);
        }
        if (this.playerStatuses.poison > 0) {
            const p = Math.max(
                1,
                Math.floor(this.playerStatuses.poison / 2)
            );
            this.hp -= p;
            this.damageTakenThisFight += p;
            this.spawnFloatingText(
                p,
                this.ui.playerHpBar,
                "#22c55e"
            );
            this.decayStatus("player", "poison", 1);
        }

        if (this.hp <= 0) {
            if (this.hasArtifact("phoenix") && !this.revived) {
                this.hp = Math.floor(this.maxHp / 2);
                this.revived = true;
                Logger.log("Перо феникса!");
                this.spawnFloatingText(
                    "PHOENIX!",
                    this.ui.playerHpBar,
                    "#f97316"
                );
                soundManager.playWin();
            } else {
                this.hp = 0;
                this.loseGame();
            }
        }
    }

    damageEnemy(amount, isCrit = false, isDot = false) {
        if (this.enemyHp <= 0) return;

        // Weak debuff on player reduces damage
        if (this.playerStatuses.weak > 0)
            amount = Math.floor(amount * 0.75);

        // Hazard global mult
        amount = Math.floor(
            amount * (this.hazardMods.damageMult || 1)
        );
        if (this.hazardMods.glassMultiplier)
            amount = Math.floor(
                amount * this.hazardMods.glassMultiplier
            );

        // Glass Cannon
        if (this.hasArtifact("glass_cannon")) {
            amount = Math.ceil(amount * 1.5);
        }

        // Lifesteal boon
        if (this.hazardMods.lifesteal && amount > 0) {
            this.healPlayer(this.hazardMods.lifesteal);
        }

        // God Mode
        if (this.godMode) amount *= 10;

        // Rage
        if (
            this.hasArtifact("rage") &&
            this.hp / this.maxHp < 0.3
        ) {
            amount = Math.ceil(amount * 1.5);
            isCrit = true;
        }

        // Executioner
        if (
            this.hasArtifact("executioner") &&
            this.enemyHp / this.enemyMaxHp < 0.4
        ) {
            amount = Math.ceil(amount * 1.3);
        }

        // Shock increases next hit then clears
        if (!isDot && this.enemyStatuses.shock > 0) {
            const mult = 1 + 0.25 * this.enemyStatuses.shock;
            amount = Math.ceil(amount * mult);
            this.enemyStatuses.shock = 0;
            isCrit = true;
        }

        // Enemy shield
        if (this.enemyShield > 0) {
            if (this.enemyShield >= amount) {
                this.enemyShield -= amount;
                amount = 0;
                this.spawnFloatingText(
                    "BLOCK",
                    this.ui.enemySprite,
                    "#60a5fa"
                );
            } else {
                amount -= this.enemyShield;
                this.enemyShield = 0;
            }
        }

        this.lastHitWasCrit = isCrit && amount > 0;

        if (amount > 0) {
            this.enemyHp -= amount;
            if (isCrit) soundManager.playCrit();
            else soundManager.playHit();

            this.spawnFloatingText(
                amount,
                this.ui.enemySprite,
                isCrit ? "#fde047" : "#ffffff"
            );
            this.ui.enemySprite.classList.add("shake");
            setTimeout(
                () => this.ui.enemySprite.classList.remove("shake"),
                450
            );

            if (isCrit) {
                this.ui.feedback.classList.remove("hidden");
                this.ui.feedback.classList.add("animate-bounce");
                setTimeout(
                    () => this.ui.feedback.classList.add("hidden"),
                    900
                );

                // Overcharge artifact
                if (this.hasArtifact("overcharge"))
                    this.overchargeThisFight += 1;
            }
        }

        if (this.enemyHp <= 0) {
            this.enemyHp = 0;
            setTimeout(() => this.winLevel(), 450);
        }

        // Score & gold
        let scoreGain = Math.max(0, amount);
        if (this.hasArtifact("midas"))
            scoreGain = Math.floor(scoreGain * 1.5);
        this.score += scoreGain;

        let goldGain = Math.max(0, Math.floor(amount / 10));
        if (isCrit) goldGain += 1;
        if (this.hasArtifact("midas"))
            goldGain = Math.ceil(goldGain * 1.15);
        if (this.hasArtifact("brilliance") && isCrit && amount > 0)
            goldGain += 2;

        if (this.hazardMods.noGold) goldGain = 0;
        if (this.hazardMods.doubleGold) goldGain *= 2;

        this.gold += goldGain;

        if (this.gold >= 200) this.unlockAchievement("rich");
        if (this.gold >= 400) this.unlockAchievement("very_rich");

        this.updateUI();
    }

    spawnFloatingText(text, target, color) {
        if (!target || !target.getBoundingClientRect) return;
        const rect = target.getBoundingClientRect();
        const el = document.createElement("div");
        el.innerText =
            typeof text === "number"
                ? `-${Math.floor(text)}`
                : String(text);
        el.className = "damage-number";
        el.style.left = rect.left + rect.width / 2 + "px";
        el.style.top = rect.top + "px";
        el.style.color = color;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    checkHandEmpty() {
        if (this.hand.every((b) => b === null)) {
            setTimeout(() => {
                this.enemyTurn();
                if (this.hp > 0 && this.enemyHp > 0)
                    this.fillHand();
            }, 420);
        }
    }

    discardHand() {
        if (this.paused) return;
        if (this.hp <= 0 || this.enemyHp <= 0) return;

        this.discardsThisFight++;

        Logger.log("Сброс: ход врагу.");
        soundManager.playInvalid();

        // Recycle artifact
        if (this.hasArtifact("recycle")) {
            this.removeRandomFilledCells(2);
            Logger.log("Переработка: -2 клетки");
        }

        this.ui.hand.innerHTML = "";
        this.hand = this.hand.map(() => null);

        setTimeout(() => {
            this.enemyTurn();
            if (this.hp > 0 && this.enemyHp > 0) this.fillHand();
            this.updateUI();
        }, 250);
    }

    enemyTurn() {
        if (this.enemyHp <= 0) return;
        if (this.paused) return;

        // Tick DOTs and statuses
        this.tickStatusesBeforeEnemyActs();
        if (this.hp <= 0 || this.enemyHp <= 0) return;

        // Time warp
        if (this.hasArtifact("warp") && Math.random() < 0.15) {
            Logger.log("Искажение времени: ход врага пропущен.");
            this.spawnFloatingText(
                "WARP!",
                this.ui.playerHpBar,
                "#a78bfa"
            );
            soundManager.playClear();
            this.updateUI();
            return;
        }

        // Chill effect: slow/skip enemy
        let effectiveAtk = this.enemyAttack;
        if (this.enemyStatuses.chill > 0) {
            const slow = Math.min(
                0.6,
                0.15 * this.enemyStatuses.chill
            );
            effectiveAtk = Math.max(
                1,
                Math.floor(effectiveAtk * (1 - slow))
            );
            if (
                this.enemyStatuses.chill >= 3 &&
                Math.random() < 0.22
            ) {
                Logger.log("Враг заморожен: ход пропущен.");
                this.spawnFloatingText(
                    "FROZEN!",
                    this.ui.enemySprite,
                    "#67e8f9"
                );
                soundManager.playClear();
                this.decayStatus("enemy", "chill", 2);
                this.updateUI();
                return;
            }
            this.decayStatus("enemy", "chill", 1);
        }

        // Enemy ability
        if (this.currentEnemy && this.currentEnemy.ability) {
            this.currentEnemy.ability(this);
        }

        let dmg = effectiveAtk;

        // Spiked shield reflect
        if (this.hasArtifact("spikes") && this.shield > 0) {
            this.damageEnemy(Math.min(this.shield, 30), false);
            this.spawnFloatingText(
                "REFLECT",
                this.ui.enemySprite,
                "#fb923c"
            );
        }

        // Player shock increases incoming
        if (this.playerStatuses.shock > 0) {
            dmg = Math.ceil(
                dmg * (1 + 0.25 * this.playerStatuses.shock)
            );
            this.playerStatuses.shock = 0;
        }

        // Shield absorb
        let absorbedFully = false;
        if (this.shield > 0) {
            if (this.shield >= dmg) {
                this.shield -= dmg;
                dmg = 0;
                absorbedFully = true;
            } else {
                dmg -= this.shield;
                this.shield = 0;
            }
        }

        if (this.godMode) dmg = 0;

        if (dmg > 0) {
            this.hp -= dmg;
            this.damageTakenThisFight += dmg;
            Logger.log(`Враг атакует: -${dmg} HP`);
            soundManager.playDamage();
            document.body.classList.add("shake");
            setTimeout(
                () => document.body.classList.remove("shake"),
                420
            );

            if (this.hasArtifact("thorns")) {
                this.damageEnemy(5, false);
                Logger.log("Шипы: враг получает 5");
            }

            if (this.hasArtifact("gold_tooth")) {
                this.gold += 1;
                this.spawnFloatingText(
                    "+1G",
                    this.ui.playerHpBar,
                    "#fbbf24"
                );
            }

            this.spawnFloatingText(
                dmg,
                this.ui.playerHpBar,
                "#ef4444"
            );

            // Elemental on-hit from enemy element
            const el = this.currentEnemy?.element;
            if (el === "fire") this.addStatus("player", "burn", 1);
            if (el === "ice") this.addStatus("player", "weak", 1);
            if (el === "poison")
                this.addStatus("player", "poison", 1);
            if (el === "storm")
                this.addStatus("player", "shock", 1);
        } else {
            Logger.log("Урон поглощён щитом.");
            if (absorbedFully && this.hasArtifact("mirrorplate")) {
                this.damageEnemy(6, false);
                Logger.log("Зеркальная броня: 6 урона");
                this.spawnFloatingText(
                    "MIRROR",
                    this.ui.enemySprite,
                    "#a5b4fc"
                );
            }
        }

        // Scavenger
        if (this.hasArtifact("scavenger") && Math.random() < 0.2) {
            this.removeRandomFilledCells(1);
            Logger.log("Сборщик: убрал 1 клетку");
        }

        // Hazard: Slippery/Random Discard
        if (
            this.hazardMods.randomDiscard &&
            this.hand.some((b) => b !== null)
        ) {
            // find random non-null index
            const indices = this.hand
                .map((b, i) => (b ? i : -1))
                .filter((i) => i !== -1);
            if (indices.length > 0) {
                const idx =
                    indices[
                    Math.floor(Math.random() * indices.length)
                    ];
                const el = this.hand[idx].element;
                el.style.opacity = "0";
                setTimeout(() => el.remove(), 200);
                this.hand[idx] = null;
                Logger.log("Скользкий пол: фигура потеряна");
                this.checkHandEmpty();
            }
        }

        if (this.hp <= 0) {
            if (this.hasArtifact("phoenix") && !this.revived) {
                this.hp = Math.floor(this.maxHp / 2);
                this.revived = true;
                Logger.log("Перо феникса!");
                this.spawnFloatingText(
                    "PHOENIX!",
                    this.ui.playerHpBar,
                    "#f97316"
                );
                soundManager.playWin();
            } else {
                this.hp = 0;
                this.loseGame();
            }
        }

        this.updateUI();
    }

    // ------------------------------
    // Rewards + Shop
    // ------------------------------
    rollShop() {
        // Shop chance: baseline 22%, higher with map
        const base = this.hasArtifact("map") ? 0.35 : 0.22;
        return Math.random() < base;
    }

    openShopThenRewards() {
        this.shopOpen = true;
        const modal = document.getElementById("shop-modal");
        const container = document.getElementById("shop-container");
        const goldEl = document.getElementById("shop-gold");
        const skipBtn = document.getElementById("shop-skip");

        container.innerHTML = "";

        const stock = this.generateShopStock().map((it) => ({
            ...it,
            sold: false,
        }));
        const uiCards = [];

        const refresh = () => {
            goldEl.textContent = this.gold;
            uiCards.forEach(({ item, btn }) => {
                if (item.sold) {
                    btn.textContent = "КУПЛЕНО";
                    btn.className =
                        "mt-2 px-3 py-2 rounded font-bold bg-slate-700 text-slate-300 cursor-not-allowed";
                    btn.disabled = true;
                    return;
                }
                const afford = this.gold >= item.price;
                btn.disabled = !afford;
                btn.textContent = afford ? "КУПИТЬ" : "НЕ ХВАТАЕТ";
                btn.className = `mt-2 px-3 py-2 rounded font-bold ${afford
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-slate-700 text-slate-300 cursor-not-allowed"
                    }`;
            });
        };

        stock.forEach((item) => {
            const card = document.createElement("div");
            card.className =
                "bg-slate-800/80 p-4 rounded-lg border border-slate-600 flex flex-col gap-2";

            card.innerHTML = `
                        <div class="flex items-start justify-between gap-2">
                            <div class="text-3xl">${item.icon}</div>
                            <div class="text-right">
                                <div class="text-[10px] text-slate-400 tracking-widest">ЦЕНА</div>
                                <div class="text-lg font-black text-amber-200 pixel-font">${item.price}</div>
                            </div>
                        </div>
                        <div class="font-bold text-yellow-300">${item.name}</div>
                        <div class="text-xs text-slate-200">${item.desc}</div>
                        <button class="mt-2 px-3 py-2 rounded font-bold">КУПИТЬ</button>
                    `;

            const btn = card.querySelector("button");
            uiCards.push({ item, btn });

            btn.onclick = () => {
                if (item.sold) return;
                if (this.gold < item.price) {
                    soundManager.playInvalid();
                    refresh();
                    return;
                }
                const ok = this.buyShopItem(item);
                if (!ok) {
                    soundManager.playInvalid();
                    refresh();
                    return;
                }
                item.sold = true;
                this.unlockAchievement("shopper");
                refresh();
            };

            container.appendChild(card);
        });

        skipBtn.onclick = () => {
            modal.classList.add("hidden");
            this.shopOpen = false;
            this.generateRewards();
            document
                .getElementById("victory-modal")
                .classList.remove("hidden");
        };

        refresh();
        modal.classList.remove("hidden");
    }

    generateShopStock() {
        const stock = [];

        stock.push({
            type: "stat",
            id: "heal",
            name: "Аптечка",
            desc: "+25 HP",
            icon: "🧃",
            price: this.hasArtifact("coupon") ? 32 : 40,
            apply: () => this.healPlayer(25),
        });
        stock.push({
            type: "stat",
            id: "shield",
            name: "Пластина",
            desc: "+25 щита",
            icon: "🛡️",
            price: this.hasArtifact("coupon") ? 36 : 45,
            apply: () => {
                this.shield += 25;
            },
        });
        stock.push({
            type: "stat",
            id: "clean",
            name: "Сапёр",
            desc: "Убрать 5 случайных клеток (кроме дыр)",
            icon: "🧽",
            price: this.hasArtifact("coupon") ? 44 : 55,
            apply: () => this.removeRandomFilledCells(5),
        });

        const available = ARTIFACTS.filter(
            (a) => !this.hasArtifact(a.id)
        );
        if (available.length > 0) {
            const bag = [];
            available.forEach((a) => {
                const r = a.rarity || 2;
                const w = r === 1 ? 5 : r === 2 ? 3 : 1;
                for (let i = 0; i < w; i++) bag.push(a);
            });
            const pick =
                bag[Math.floor(Math.random() * bag.length)];
            stock.push({
                type: "artifact",
                ...pick,
                price: this.artifactPrice(pick),
                apply: () => this.addArtifact(pick),
            });
        } else {
            stock.push({
                type: "stat",
                id: "gold",
                name: "Сундучок",
                desc: "+60 золота",
                icon: "🧰",
                price: this.hasArtifact("coupon") ? 52 : 65,
                apply: () => {
                    this.gold += 60;
                },
            });
        }

        return stock.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    buyShopItem(item) {
        if (this.gold < item.price) return false;
        this.gold -= item.price;
        if (item.apply) item.apply();
        soundManager.playPlace();
        this.updateUI();
        Logger.log(`Покупка: ${item.name}`);
        return true;
    }

    generateRewards() {
        const container =
            document.getElementById("reward-container");
        container.innerHTML = "";

        const choices = [];

        // Always: one heal-ish
        choices.push({
            type: "stat",
            id: "heal",
            name: "Зелье",
            desc: "+30 HP",
            icon: "❤️",
        });

        // One upgrade
        const r = Math.random();
        if (r < 0.3)
            choices.push({
                type: "stat",
                id: "maxhp",
                name: "Выносливость",
                desc: "+10 Max HP",
                icon: "💪",
            });
        else if (r < 0.6)
            choices.push({
                type: "stat",
                id: "shield",
                name: "Броня",
                desc: "+20 щита",
                icon: "🛡️",
            });
        else
            choices.push({
                type: "stat",
                id: "gold",
                name: "Кошель",
                desc: "+40 золота",
                icon: "🪙",
            });

        // One artifact
        const available = ARTIFACTS.filter(
            (a) => !this.hasArtifact(a.id)
        );
        if (available.length > 0) {
            const bag = [];
            available.forEach((a) => {
                const rr = a.rarity || 2;
                const w = rr === 1 ? 5 : rr === 2 ? 3 : 1;
                for (let i = 0; i < w; i++) bag.push(a);
            });
            const art = bag[Math.floor(Math.random() * bag.length)];
            choices.push({ type: "artifact", ...art });
        } else {
            choices.push({
                type: "stat",
                id: "full",
                name: "Полный отдых",
                desc: "Полное лечение",
                icon: "💖",
            });
        }

        choices.forEach((choice) => {
            const card = document.createElement("div");
            card.className =
                "flex-1 bg-slate-800/80 p-4 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 hover:border-white hover:scale-[1.03] transition-all flex flex-col items-center gap-2";

            const price =
                choice.type === "artifact"
                    ? ` <span class=\"text-[10px] text-slate-400\">(редк. ${choice.rarity || 2
                    })</span>`
                    : "";
            card.innerHTML = `
                        <div class="text-3xl">${choice.icon}</div>
                        <div class="font-bold text-yellow-300 text-center">${choice.name}${price}</div>
                        <div class="text-xs text-slate-200 text-center">${choice.desc}</div>
                    `;
            card.onclick = () => this.selectReward(choice);
            container.appendChild(card);
        });
    }

    selectReward(reward) {
        if (reward.type === "stat") {
            if (reward.id === "heal") this.healPlayer(30);
            if (reward.id === "maxhp") {
                this.maxHp += 10;
                this.healPlayer(10);
            }
            if (reward.id === "full") this.healPlayer(1000);
            if (reward.id === "shield") this.shield += 20;
            if (reward.id === "gold") this.gold += 40;
        } else if (reward.type === "artifact") {
            this.addArtifact(reward);
        }

        soundManager.playPlace();
        this.nextLevel();
    }

    nextLevel() {
        this.level++;
        document
            .getElementById("victory-modal")
            .classList.add("hidden");

        // Cleanup if too full
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (
                    this.grid[r][c] &&
                    this.grid[r][c] !== "HOLE" &&
                    Math.random() > 0.72
                ) {
                    this.grid[r][c] = null;
                    this.setCellClass(r, c, "cell");
                }
            }
        }

        this.spawnEnemy();
        this.fillHand();
        this.updateUI();
    }

    winLevel() {
        soundManager.playWin();

        const isBoss = this.level % 5 === 0;
        let bonus = 14 + Math.floor(this.level * 2);
        if (isBoss) bonus += 25;
        if (this.hasArtifact("luckycoin")) bonus += 10;
        if (this.hasArtifact("payday")) bonus += 5;

        if (this.hazardMods.noGold) bonus = 0;
        if (this.hazardMods.doubleGold) bonus *= 2;

        this.gold += bonus;
        Logger.log(`Победа! +${bonus} золота`);

        // Achievements
        if (isBoss) {
            this.unlockAchievement("boss_slayer");
            if (this.discardsThisFight === 0)
                this.unlockAchievement("perfect_boss");
        }
        if (this.hp < 10) this.unlockAchievement("survivor");
        if (this.damageTakenThisFight === 0)
            this.unlockAchievement("untouched");

        // Antidote
        if (this.hasArtifact("antidote")) {
            let reduced = 0;
            ["burn", "poison", "shock", "weak"].forEach((k) => {
                const before = this.playerStatuses[k] || 0;
                if (before > 0) {
                    this.playerStatuses[k] = Math.max(
                        0,
                        before - 1
                    );
                    reduced++;
                }
            });
            if (reduced > 0)
                Logger.log("Сыворотка: статусы ослаблены");
        }

        // Decide shop
        if (this.rollShop()) {
            Logger.log("Найдена лавка.");
            this.openShopThenRewards();
        } else {
            this.generateRewards();
            document
                .getElementById("victory-modal")
                .classList.remove("hidden");
        }

        this.updateUI();
    }

    loseGame() {
        soundManager.playLose();
        document.getElementById("final-score").innerText =
            this.score;
        document.getElementById("final-depth").innerText =
            this.level;
        document
            .getElementById("game-over-modal")
            .classList.remove("hidden");
    }

    updateUI() {
        UI.updateUI.call(this);
    }
}