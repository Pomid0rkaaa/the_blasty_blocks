import { ELEMENTS } from "./data/elements";
import { HAZARDS } from "./data/hazards";
import { SHAPES } from "./data/shapes";
import { STATUS } from "./data/status";
import { soundManager } from "./SoundManager";
import { UI, UIElements } from "./UI";
import { Logger } from "./Logger";
import { Shop } from "./Shop";
import { Rewards } from "./Rewards";
import { Context } from "./Context";
import { Enemy } from "./Enemy";
import { EnemyContext } from "./EnemyContext";
import { Player } from "./Player";
import { PlayerContext } from "./PlayerContext";
import i18n from "./I18n";
import type {
	Artifact,
	Hazard,
	GridCell,
	HandShape,
	Difficulty,
} from "./types";


export class Game {
    gridSize: number = 8;
    player!: Player;
    playerContext: PlayerContext;
	rewards: Rewards;
	shop: Shop;
	isMobile: boolean = false;
	offsetY: number = 0;
	grid: (GridCell | string | null)[][] = [];
	score: number = 0;
	level: number = 1;
	difficulty: Difficulty = "NORMAL";
	artifacts: Artifact[] = [];
    enemy!: Enemy;
    enemyContext: EnemyContext;
	hand: (HandShape | null)[] = [];
	draggedBlock: HandShape | null = null;
	blocksPlaced: number = 0;
	paused: boolean = false;
	affinities: Set<string> = new Set();
	prismCounter: number = 0;
	clearsThisFight: number = 0;
	placeBonusThisFight: number = 0;
	medicThisTurn: number = 0;
	overchargeThisFight: number = 0;
	hazard: Hazard | null = null;
	hazardMods: any = {};
	tempHandPlus: number = 0;
	freezeNextHand: number = 0; // from ice enemies
	lockedSlots: Set<number> = new Set();
	discardsThisFight: number = 0;
	lastHitWasCrit: boolean = false;
	damageTakenThisFight: number = 0;
    revived: boolean = false;

	constructor() {
		this.rewards = new Rewards(new Context(this));
		this.shop = new Shop(new Context(this));
        this.enemyContext = new EnemyContext(this);
        this.playerContext = new PlayerContext(this);
		this.init();
	}

	resetRun() {
        this.enemy = new Enemy(this.enemyContext);
        this.player = new Player(this.playerContext);
		this.isMobile = window.innerWidth < 950;
		this.offsetY = this.isMobile ? -100 : 0;

		this.grid = Array(this.gridSize)
			.fill(null)
			.map(() => Array(this.gridSize).fill(null));
		this.score = 0;
		this.level = 1;

		// Difficulty handling
		this.difficulty =
			this.difficulty !== undefined ? this.difficulty : "NORMAL";

		this.artifacts = [];

		this.hand = [];
		this.draggedBlock = null;
		this.blocksPlaced = 0;

		this.paused = false;

		// Elements/statuses
		this.affinities = new Set();
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
        this.revived = false;

		// Log
		Logger.clear();
	}

	showDifficultyModal() {
		UIElements.modal.game_over.classList.add("hidden");
		UIElements.difficulty.classList.remove("hidden");
	}

	startGame(diff: Difficulty) {
		this.difficulty = diff;
		UIElements.difficulty.classList.add("hidden");
		this.restart();
	}

	defaultHazardMods() {
		return {
			damageMult: 1,
			startRocks: 0,
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
		const dragMove = (e: any) => this.handleDragMove(e);
		const dragEnd = (e: any) => this.handleDragEnd(e);

		document.addEventListener("touchmove", dragMove, {
			passive: false,
		});
		document.addEventListener("touchend", dragEnd);
		document.addEventListener("mousemove", dragMove);
		document.addEventListener("mouseup", dragEnd);

		UIElements.volume.panel.addEventListener("touchstart", (e) =>
			e.stopPropagation()
		);

		document.addEventListener("keydown", (e) => {
			if (e.key === "?") this.openHelp();
			if (e.key.toLowerCase() === "l") Logger.open();
		});

		// Init audio and start music on first interaction
		document.body.addEventListener(
			"click",
			() => {
				if (!soundManager.initialized && !soundManager.muted)
					soundManager.init();
				soundManager.resume();
			},
			{ once: true }
		);

		// Volume UI
		const vol = UIElements.volume.music;
		const label = UIElements.volume.label;
		const vInit = Math.round(soundManager.musicVolume * 100);
		vol.value = String(vInit);
		label.textContent = `${vInit}%`;
		vol.addEventListener("input", () => {
			const v = Math.min(100, Math.max(0, Number(vol.value) || 0));
			label.textContent = `${v}%`;
			soundManager.setMusicVolume(v / 100);
		});

		// Hazard badge click opens info
		UIElements.hazard_badge.addEventListener("click", () => {
			if (this.hazard && this.hazard.id !== "none") this.openHazardInfo();
		});

		// Enemy click
		UIElements.enemy.sprite.addEventListener("click", () => {
			this.openHelp(true);
		});
	}

	// ------------------------------
	// Helpers
	// ------------------------------
	getCellTotal() {
		const rootStyles = getComputedStyle(document.documentElement);
		const cellSize =
			parseFloat(rootStyles.getPropertyValue("--cell-size")) || 36;
		const gap = parseFloat(rootStyles.getPropertyValue("--grid-gap")) || 4;
		return cellSize + gap;
	}

	getGridPosFromPoint(clientX: number, clientY: number, layout: number[][]) {
		const gridRect = UIElements.grid.getBoundingClientRect();
		const st = getComputedStyle(UIElements.grid);
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

	cellIsFilled(val: any) {
		return val !== null;
	}

	hasArtifact(id: string) {
		return this.artifacts.some((a) => a.id === id);
	}

	artifactPrice(artifact: any) {
		const baseByRarity = { 1: 45, 2: 70, 3: 95 };
		let price = (baseByRarity as any)[artifact.rarity || 2] || 70;
		if (this.hasArtifact("coupon")) price = Math.floor(price * 0.8);
		return price;
	}

	checkAffinityCaps(artifact: any) {
		if (!artifact) return;
		if (this.hasArtifact(artifact.id)) return;
		this.artifacts.push(artifact);
	}

	addArtifact(artifact: any) {
		if (!artifact) return;
		if (this.hasArtifact(artifact.id)) return;
		this.artifacts.push(artifact);

		const icon = document.createElement("div");
		icon.className = "artifact-icon text-white";
		icon.style.borderColor = artifact.color;
		const priceInfo = artifact.rarity
			? `<div class="mt-1 text-slate-300">${i18n.t("artifact.rarity", {
					rarity: artifact.rarity,
			  })}</div>`
			: "";
		icon.innerHTML = `${artifact.icon}<div class="artifact-tooltip"><div class="font-bold" style="color:${artifact.color}">${artifact.name}</div><div class="text-slate-200 mt-1">${artifact.desc}</div>${priceInfo}</div>`;
		UIElements.artifacts.appendChild(icon);

		// Passive immediate effects
		if (artifact.id === "flame") this.affinities.add("fire");
		if (artifact.id === "frost") this.affinities.add("ice");
		if (artifact.id === "venom") this.affinities.add("poison");
		if (artifact.id === "stormrune") this.affinities.add("storm");
		if (artifact.id === "halo") this.affinities.add("light");

		// On-pick effects
		if (artifact.id === "sturdy") {
			this.player.MAX_HP += 15;
			this.player.HP += 15;
			Logger.log(i18n.t("artifact.strurdy.pickup"));
		}
		if (artifact.id === "glass_cannon") {
			this.player.MAX_HP = Math.floor(this.player.MAX_HP * 0.7);
			Logger.log(i18n.t("artifact.glass_cannon.pickup"));
		}
		if (artifact.id === "blood_pact") {
			this.player.GOLD += 100;
			this.player.HP -= 25;
			if (this.player.HP <= 0) this.player.HP = 1;
			Logger.log(i18n.t("artifact.blood_pact.pickup"));
		}
		if (artifact.id === "thorns") {
			this.player.DEF += 15;
			Logger.log(i18n.t("artifact.thorns.pickup"));
		}
		if (artifact.id === "inferno_ring") {
			this.enemy.status.add("burn", 5);
		}

		this.renderCodex();
		this.updateUI();
	}

	// ------------------------------
	// Help / Codex
	// ------------------------------
	renderCodex() {
		UIElements.codex.status.innerHTML = "";
		Object.values(STATUS).forEach((s) => {
			const row = document.createElement("div");
			row.className = "flex gap-2 items-start";
			row.innerHTML = `<div class="mt-px">${s.icon}</div><div><div class="font-bold" style="color:${s.color}">${s.name}</div><div class="text-slate-200">${s.desc}</div></div>`;
			UIElements.codex.status.appendChild(row);
		});

		UIElements.codex.hazards.innerHTML = "";
		HAZARDS.filter((x) => x.id !== "none").forEach((hz) => {
			const row = document.createElement("div");
			row.className = "flex gap-2 items-start";
			const tag = `<span class="text-[10px] text-${
				hz.kind === "boon" ? "emerald" : "red"
			}-300">${i18n.t(
				`codex.${hz.kind === "boon" ? "boon" : "hazard"}`
			)}</span>`;
			row.innerHTML = `<div class="mt-px">${hz.icon}</div><div><div class="font-bold text-slate-100">${hz.name} ${tag}</div><div class="text-slate-200">${hz.desc}</div></div>`;
			UIElements.codex.hazards.appendChild(row);
		});

		this.renderEnemyCodex();
	}

	renderEnemyCodex() {
		const el = UIElements.codex.enemy;
		if (!el) return;
		const meta = (ELEMENTS as any)[this.enemy.template.element] || {
			icon: "⚔️",
			get name() { return i18n.t("element.physical") },
		};
		const bossTag = i18n.t(
			this.level % 5 === 0 ? "label.boss" : "label.enemy"
		);
		el.innerHTML = `
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="font-bold text-slate-100">${bossTag}: ${
			this.enemy.template.name
		} <span class="opacity-80">${meta.icon}</span></div>
                            <div class="text-slate-300 mt-1">${
								this.enemy.template.desc || "-"
							}</div>
                        </div>
                        <div class="text-right text-slate-200">
                            <div>ATK: <b>${this.enemy.ATK}</b></div>
                            <div>HP: <b>${this.enemy.HP}/${
			this.enemy.MAX_HP
		}</b></div>
                            <div>DEF: <b>${this.enemy.DEF}</b></div>
                        </div>
                    </div>
                `;
	}

	openHelp(focusEnemy = false) {
		const modal = UIElements.modal.help;
		modal.classList.remove("hidden");
		this.renderCodex();
		if (focusEnemy) {
			setTimeout(() => {
				const block = UIElements.codex.enemy as HTMLElement;
				block?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}, 50);
		}
	}

	closeHelp() {
		UIElements.modal.help.classList.add("hidden");
	}

	openHazardInfo() {
		if (!this.hazard) return;
		const isBoon = this.hazard.kind === "boon";
		UIElements.hazard.icon.textContent = this.hazard.icon || "⚠️";
		UIElements.hazard.title.textContent = this.hazard.name;
		UIElements.hazard.desc.textContent = this.hazard.desc;

		UIElements.hazard.header.textContent = i18n.t(
			`label.${isBoon ? "boon" : "hazard"}`
		);
		UIElements.hazard.header.className = `text-lg font-black text-${
			isBoon ? "emerald" : "red"
		}-200 pixel-font`;

		this.paused = true;
		UIElements.hazard.modal.classList.remove("hidden");
		UIElements.hazard.continue.onclick = () => {
			UIElements.hazard.modal.classList.add("hidden");
			this.paused = false;
		};
	}

	// ------------------------------
	// Game flow
	// ------------------------------
	restart() {
		this.resetRun();
		Object.values(UIElements.modal).forEach((e) =>
			e.classList.add("hidden")
		);
		UIElements.shop.modal.classList.add("hidden");
		UIElements.hazard.modal.classList.add("hidden");

		UIElements.artifacts.innerHTML = "";
		UIElements.affinity.innerHTML = "";
		this.renderGrid();
		this.enemy = new Enemy(this.enemyContext);
		this.fillHand();
		this.updateUI();
		Logger.clear();
		Logger.log(i18n.t("logger.new_run"));
		soundManager.play("start");

		this.renderCodex();
	}

	rollHazard(_modWeight: number = 0) {
		if (!HAZARDS || HAZARDS.length === 0)
			return { id: "none", name: "None" };
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

	applyHazard(hazard: any) {
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

	pickTrackForTheme(theme: string) {
		const map = {
			"theme-magma": "magma",
			"theme-ice": "ice",
			"theme-storm": "storm",
			"theme-void": "void",
			"theme-forest": "forest",
			"theme-ocean": "ocean",
			"theme-desert": "desert",
			"theme-neon": "cyber",
			"theme-cosmos": "dream",
			"theme-crypt": "industrial",
			"theme-lab": "retro",
			"theme-blood": "ashen",
			"theme-ruins": "ruins",
			"theme-aurora": "aurora",
			"theme-arcade": "retro",
			"theme-ashen": "industrial",
			"theme-sakura": "sakura",
			"theme-abyss": "abyss",
			"theme-toxic": "glitch",
			"theme-tundra": "tundra",
			"theme-gilded": "gilded",
			"theme-dream": "lullaby",
		};
		return (map as any)[theme] || "deep";
	}

	resizeGrid(newSize: number, scale: string = "36px") {
		this.gridSize = newSize;
		document.documentElement.style.setProperty(
			"--grid-size",
			String(newSize)
		);
		document.documentElement.style.setProperty("--cell-size", scale);

		this.grid = Array.from({ length: newSize }, () =>
			Array.from({ length: newSize }, () => null)
		);
		this.renderGrid();
	}

	applyStartGridEffects() {
		// Per-fight soft cleanup: remove some filled cells to prevent permanent lockouts.
		for (let r = 0; r < this.gridSize; r++) {
			for (let c = 0; c < this.gridSize; c++) {
				const v = this.grid[r][c];
				if (v !== null && Math.random() > 0.68) {
					this.grid[r][c] = null;
					this.setCellClass(r, c, "cell");
				}
			}
		}

		if (this.hazardMods.mask) this.applyMask(this.hazardMods.mask);

		if (this.hazardMods.startRocks)
			this.spawnRocks(this.hazardMods.startRocks);
		if (this.hazardMods.startGarbage)
			this.spawnGarbage(this.hazardMods.startGarbage);
		if (this.hazardMods.startMines)
			this.spawnMines(this.hazardMods.startMines);

		if (this.hasArtifact("trowel")) {
			const removed = this.removeRandomSpecificCells(
				["ROCK", "GARBAGE"],
				2
			);
			if (removed > 0)
				Logger.log(i18n.t("artifact.trowel.use", { removed }));
		}
	}

	applyMask(type: string) {
		const setMask = (r: number, c: number) => {
			if (r < 0 || c < 0 || r >= this.gridSize || c >= this.gridSize) return;
			if (this.grid[r][c] === null) {
				this.grid[r][c] = "MASK"; // Special type: Clips shapes, conducts lines, permanent
				this.setCellClass(r, c, "cell rock maskrock");
			}
		};

		if (type === "tiny") {
			for (let i = 0; i < this.gridSize; i++) {
				setMask(0, i);
				setMask(this.gridSize - 1, i);
				setMask(i, 0);
				setMask(i, this.gridSize - 1);
			}
			return;
		}

		if (type === "shatter") {
			const target = 10 + Math.floor(Math.random() * 6);
			let tries = 0;
			let count = target;
			while (count > 0 && tries < 400) {
				tries++;
				const r = Math.floor(Math.random() * this.gridSize);
				const c = Math.floor(Math.random() * this.gridSize);
				if (this.grid[r][c] === null) {
					setMask(r, c);
					count--;
				}
			}
			return;
		}

		if (type === "diamond") {
			for (let r = 0; r < this.gridSize; r++)
				for (let c = 0; c < this.gridSize; c++) {
					const d = Math.abs(r - 3.5) + Math.abs(c - 3.5);
					if (d > 3.6) setMask(r, c);
				}
			return;
		}

		if (type === "checker") {
			for (let r = 0; r < this.gridSize; r++)
				for (let c = 0; c < this.gridSize; c++) {
					if ((r + c) % 2 === 1) setMask(r, c);
				}
			return;
		}

		if (type === "spiral") {
			// Fill with mask
			for (let r = 0; r < this.gridSize; r++)
				for (let c = 0; c < this.gridSize; c++) {
					this.grid[r][c] = "MASK";
					this.setCellClass(r, c, "cell rock maskrock");
				}

			const carve = (r: number, c: number) => {
				if (r < 0 || c < 0 || r >= this.gridSize || c >= this.gridSize) return;
				this.grid[r][c] = null;
				this.setCellClass(r, c, "cell");
			};

			let top = 0,
				left = 0,
				bottom = this.gridSize - 1,
				right = this.gridSize - 1;
			while (top <= bottom && left <= right) {
				for (let c = left; c <= right; c++) carve(top, c);
				top++;
				for (let r = top; r <= bottom; r++) carve(r, right);
				right--;
				if (top <= bottom) {
					for (let c = right; c >= left; c--) carve(bottom, c);
					bottom--;
				}
				if (left <= right) {
					for (let r = bottom; r >= top; r--) carve(r, left);
					left++;
				}
			}
			return;
		}
	}

	spawnRocks(count: number) {
		let tries = 0;
		while (count > 0 && tries < 400) {
			tries++;
			const r = Math.floor(Math.random() * this.gridSize);
			const c = Math.floor(Math.random() * this.gridSize);
			if (this.grid[r][c] === null) {
				this.grid[r][c] = "ROCK";
				this.setCellClass(r, c, "cell rock");
				count--;
			}
		}
	}

	spawnGarbage(count: number) {
		let tries = 0;
		while (count > 0 && tries < 500) {
			tries++;
			const r = Math.floor(Math.random() * this.gridSize);
			const c = Math.floor(Math.random() * this.gridSize);
			if (this.grid[r][c] === null) {
				this.grid[r][c] = "GARBAGE";
				this.setCellClass(r, c, "cell garbage");
				count--;
			}
		}
	}

	spawnMines(count: number) {
		let tries = 0;
		while (count > 0 && tries < 500) {
			tries++;
			const r = Math.floor(Math.random() * this.gridSize);
			const c = Math.floor(Math.random() * this.gridSize);
			if (this.grid[r][c] === null) {
				this.grid[r][c] = "MINE";
				this.setCellClass(r, c, "cell mine");
				count--;
			}
		}
	}

	removeRandomSpecificCells(allowedValues: any[], count: number) {
		const filled = [];
		for (let r = 0; r < this.gridSize; r++) {
			for (let c = 0; c < this.gridSize; c++) {
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

	removeRandomFilledCells(count: number) {
		const filled = [];
		for (let r = 0; r < this.gridSize; r++) {
			for (let c = 0; c < this.gridSize; c++) {
				const v = this.grid[r][c];
				if (v !== null && v !== "ROCK") filled.push([r, c]);
			}
		}
		for (let i = 0; i < count && filled.length > 0; i++) {
			const idx = Math.floor(Math.random() * filled.length);
			const [r, c] = filled.splice(idx, 1)[0];
			this.grid[r][c] = null;
			this.setCellClass(r, c, "cell");
		}
	}

	// ------------------------------
	// Grid render
	// ------------------------------

	renderGrid() {
		UIElements.grid.innerHTML = "";
		for (let i = 0; i < this.gridSize * this.gridSize; i++) {
			const cell = document.createElement("div");
			cell.className = "cell";
			cell.dataset.index = String(i);
			UIElements.grid.appendChild(cell);
		}
	}

	setCellClass(r: number, c: number, cls: string) {
		const idx = r * this.gridSize + c;
		const el = UIElements.grid.children[idx];
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

	checkCanFit(shape: any, clipMode: boolean) {
		const layout = shape.layout;
		const rows = layout.length;
		const cols = layout[0].length;
		const rStart = clipMode ? -rows + 1 : 0;
		const rEnd = clipMode ? this.gridSize - 1 : this.gridSize - rows;
		const cStart = clipMode ? -cols + 1 : 0;
		const cEnd = clipMode ? this.gridSize - 1 : this.gridSize - cols;
		for (let r = rStart; r <= rEnd; r++) {
			for (let c = cStart; c <= cEnd; c++) {
				if (this.isValidPosition(r, c, layout)) return true;
			}
		}
		return false;
	}

	fillHand() {
		UIElements.hand.innerHTML = "";
		this.hand = [];
		this.lockedSlots = new Set();
		this.medicThisTurn = 0;

		if (this.hasArtifact("bulwark") && this.player.DEF === 0) {
			this.player.DEF += 8;
			Logger.log(i18n.t("artifact.bulwark.use"));
		}

		const size = this.getHandSize();
		const clipMode = !!this.hazardMods.mask;
		let validShapesCache: any[] = [];

		const COLORS = [
			"bg-cyan-500",
			"bg-purple-500",
			"bg-rose-500",
			"bg-amber-500",
			"bg-emerald-500",
			"bg-fuchsia-500",
			"bg-yellow-400",
			"bg-blue-300",
		];
		const trim = (matrix: number[][]) => {
			const rows = matrix.length,
				cols = matrix[0].length;
			let firstRow = -1,
				lastRow = -1,
				firstCol = -1,
				lastCol = -1;
			for (let r = 0; r < rows; r++)
				for (let c = 0; c < cols; c++)
					if (matrix[r][c] === 1) {
						if (firstRow === -1) firstRow = r;
						lastRow = r;
						if (firstCol === -1 || c < firstCol) firstCol = c;
						if (c > lastCol) lastCol = c;
					}
			if (firstRow === -1) return [[1]];
			return matrix
				.slice(firstRow, lastRow + 1)
				.map((row) => row.slice(firstCol, lastCol + 1));
		};

		const generateRandomLayout = () =>
			trim(
				Array.from({ length: 3 }, () =>
					Array.from({ length: 3 }, () =>
						Math.random() < 0.5 ? 1 : 0
					)
				)
			);

		const pickShape = () => {
			if (this.hazardMods.randomShape) {
				if (Math.random() < 0.75) {
					if (validShapesCache.length === 0) {
						validShapesCache = Array.from({ length: 20 })
							.map(() => ({
								name: "random",
								layout: generateRandomLayout(),
							}))
							.filter((s) => this.checkCanFit(s, clipMode));

						if (validShapesCache.length === 0) {
							validShapesCache = Array.from({ length: 5 }).map(
								() => ({
									name: "random",
									layout: generateRandomLayout(),
								})
							);
						}
					}

					const shape =
						validShapesCache[
							Math.floor(Math.random() * validShapesCache.length)
						];

					return {
						...shape,
						color: COLORS[
							Math.floor(Math.random() * COLORS.length)
						],
					};
				}

				return {
					name: "random",
					color: COLORS[Math.floor(Math.random() * COLORS.length)],
					layout: generateRandomLayout(),
				};
			}

			if (Math.random() < 0.75) {
				if (validShapesCache.length === 0) {
					validShapesCache = SHAPES.filter((s) =>
						this.checkCanFit(s, clipMode)
					);

					if (validShapesCache.length === 0)
						validShapesCache = [...SHAPES];
				}

				return validShapesCache[
					Math.floor(Math.random() * validShapesCache.length)
				];
			}

			return SHAPES[Math.floor(Math.random() * SHAPES.length)];
		};

		for (let i = 0; i < size; i++) {
			const shapeData = pickShape();
			this.createHandBlock({ ...shapeData }, i);
		}

		if (this.freezeNextHand > 0) {
			const toLock = Math.min(this.freezeNextHand, size);
			const indices = [...Array(size).keys()]
				.sort(() => Math.random() - 0.5)
				.slice(0, toLock);
			indices.forEach((i) => this.lockedSlots.add(i));
			this.freezeNextHand = Math.max(0, this.freezeNextHand - 1);
		}

		this.updateHandLocks();
		this.updateUI();
	}

	updateHandLocks() {
		this.hand.forEach((b, idx) => {
			if (!b) return;
			if (this.lockedSlots.has(idx)) {
				b.domElement.classList.add("frozen");
				b.domElement.title = i18n.t("label.frozen");
			}
		});
	}

	createHandBlock(shapeData: any, index: number) {
		const rootStyles = getComputedStyle(document.documentElement);
		const cellSize = parseFloat(rootStyles.getPropertyValue("--cell-size"));
		const container = document.createElement("div");
		container.className =
			"block-container cursor-grab active:cursor-grabbing p-2 transition-transform hover:scale-105";

		const miniGrid = document.createElement("div");
		miniGrid.className = "mini-grid";
		miniGrid.style.gridTemplateColumns = `repeat(${
			shapeData.layout[0].length
		}, ${cellSize}px)`;
		miniGrid.style.gridTemplateRows = `repeat(${shapeData.layout.length}, ${
			cellSize
		}px)`;

		shapeData.layout.forEach((row: number[]) => {
			row.forEach((cell: number) => {
				const div = document.createElement("div");
				if (cell) div.className = `mini-cell ${shapeData.color}`;
				miniGrid.appendChild(div);
			});
		});

		container.appendChild(miniGrid);
		UIElements.hand.appendChild(container);

		const blockObj = {
			...shapeData,
			handIndex: index,
			domElement: container,
		};
		this.hand[index] = blockObj;

		const startDrag = (e: any) => {
			e.preventDefault();
			if (this.paused) return;
			if (this.player.HP <= 0) return;

			soundManager.play("pickup");
			this.startDrag(blockObj, e);
		};

		container.addEventListener("mousedown", startDrag);
		container.addEventListener("touchstart", startDrag);
	}

	startDrag(block: any, e: any) {
		this.draggedBlock = block;
		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches
			? e.touches[0].clientY + this.offsetY
			: e.clientY + this.offsetY;

		const ghost = block.domElement.cloneNode(true) as HTMLElement;
		ghost.classList.add("drag-ghost");
		ghost.id = "drag-ghost";
		document.body.appendChild(ghost);

		ghost.style.left = `${clientX}px`;
		ghost.style.top = `${clientY}px`;
		block.domElement.style.opacity = "0";
	}

	handleDragMove(e: any) {
		if (!this.draggedBlock) return;
		if (this.paused) return;
		e.preventDefault();

		const clientX = e.touches ? e.touches[0].clientX : e.clientX;
		const clientY = e.touches
			? e.touches[0].clientY + this.offsetY
			: e.clientY + this.offsetY;

		const ghost = document.querySelector("#drag-ghost") as HTMLElement;
		if (!ghost) return 
        ghost.style.left = `${clientX}px`;
        ghost.style.top = `${clientY}px`;

        const { row, col } = this.getGridPosFromPoint(
			clientX,
			clientY,
			this.draggedBlock.layout
		);
        ghost.style.opacity = this.isValidPosition(row, col, this.draggedBlock.layout) ? "1" : "0.7"
	}

	handleDragEnd(e: any) {
		if (!this.draggedBlock) return;
		const ghost = document.getElementById("drag-ghost");
		if (ghost) ghost.remove();

		const clientX = e.changedTouches
			? e.changedTouches[0].clientX
			: e.clientX;
		const clientY = e.changedTouches
			? e.changedTouches[0].clientY + this.offsetY
			: e.clientY + this.offsetY;

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
			this.draggedBlock.domElement.remove();
			this.hand[this.draggedBlock.handIndex] = null;
			this.checkHandEmpty();
		} else {
			this.draggedBlock.domElement.style.opacity = "1";
			soundManager.play("invalid");
		}

		this.draggedBlock = null;
	}

	// In masked fights we allow "clipping": cells that fall outside the grid are ignored.
	// This makes placement on strange-shaped arenas feel fair.
	isValidPosition(r: number, c: number, layout: number[][]) {
		const clip = !!this.hazardMods.mask;
		let anyPlaced = false;

		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[0].length; j++) {
				if (layout[i][j] !== 1) continue;
				const rr = r + i;
				const cc = c + j;

				if (rr < 0 || cc < 0 || rr >= this.gridSize || cc >= this.gridSize) {
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

    placeBlock(r: number, c: number, block: any) {
        // ---------- Fast exits & caches ----------
        const layout = block.layout;
        const color = block.color;
        const grid = this.grid;
        const gridSize = this.gridSize;
        const gridChildren = UIElements.grid.children;
        const hazardMods = this.hazardMods;
        const clip = !!hazardMods.mask;

        let cellsPlaced = 0;
        const placedCells: HTMLElement[] = [];

        // Cache artifacts (VERY important for mobile)
        const has = {
            fortify: this.hasArtifact("fortify"),
            surgeon: this.hasArtifact("surgeon"),
            flame: this.hasArtifact("flame"),
            venom: this.hasArtifact("venom"),
            focus: this.hasArtifact("focus"),
            crusher: this.hasArtifact("crusher"),
            gemcutter: this.hasArtifact("gemcutter"),
            gambler: this.hasArtifact("gambler"),
            thunder: this.hasArtifact("thunder"),
        };

        // ---------- Grid placement (NO DOM writes yet) ----------
        for (let i = 0; i < layout.length; i++) {
            for (let j = 0; j < layout[0].length; j++) {
                if (layout[i][j] !== 1) continue;

                const rr = r + i;
                const cc = c + j;

                if (rr < 0 || cc < 0 || rr >= gridSize || cc >= gridSize) continue;
                if (clip && grid[rr][cc] === "MASK") continue;
                if (grid[rr][cc] !== null) continue;

                grid[rr][cc] = color;
                placedCells.push(gridChildren[rr * gridSize + cc] as HTMLElement);
                cellsPlaced++;
            }
        }

        // Nothing placed → nothing else to do
        if (cellsPlaced === 0) return;

        // ---------- Apply DOM updates in one batch ----------
        for (const cell of placedCells) {
            cell.className = `cell filled ${color}`;
            cell.classList.add("pop"); // CSS animation (GPU friendly)
        }

        soundManager.play("place");

        // ---------- Hazard: HP per cell ----------
        if (hazardMods.hpCostPerCell > 0) {
            const cost = cellsPlaced * hazardMods.hpCostPerCell;
            this.player.HP -= cost;
            this.damageTakenThisFight += cost;

            Logger.log(i18n.t("damage.spikes", { cost }));
            this.spawnFloatingText(cost, UIElements.player.hp_bar, "#ef4444");
            soundManager.play("damage");

            if (this.player.HP == 0) {
                this.loseGame();
                return;
            }
        }

        // ---------- Artifacts: immediate effects ----------
        if (has.fortify) this.player.DEF += cellsPlaced;

        if (has.surgeon && this.medicThisTurn < 8) {
            const heal = Math.min(1, 8 - this.medicThisTurn);
            this.medicThisTurn += heal;
            this.player.HP += heal;
        }

        if (has.flame) this.enemy.status.add("burn", 1);
        if (has.venom && cellsPlaced >= 3)
            this.enemy.status.add("poison", 2);

        // ---------- Damage calculation ----------
        let placeDamage = cellsPlaced;

        if (has.focus && cellsPlaced === 1) placeDamage += 6;
        if (has.crusher) placeDamage += this.clearsThisFight;
        if (has.gemcutter) placeDamage += this.placeBonusThisFight;

        placeDamage += this.overchargeThisFight || 0;

        if (has.gambler && Math.random() < 0.25) {
            placeDamage *= 2;
            Logger.log(i18n.t("artifact.gambler.use"));
            this.spawnFloatingText("JACKPOT!", UIElements.enemy.sprite, "#fbbf24");
        }

        this.damageEnemy(placeDamage, false);

        // ---------- Thunder artifact ----------
        if (has.thunder) {
            this.blocksPlaced++;
            if (this.blocksPlaced % 3 === 0) {
                this.enemy.status.add("shock", 1);
                this.damageEnemy(10, true);

                Logger.log(i18n.t("artifact.thunder.use"));
                this.spawnFloatingText("ZAP!", UIElements.enemy.sprite, "#facc15");
            }
        }

        // ---------- Defer heavy UI work ----------
        requestAnimationFrame(() => {
            this.checkLines();
            this.updateUI();
        });
    }

	// ------------------------------
	// Lines
	// ------------------------------
	checkLines() {
		let rowsToClear = [];
		let colsToClear = [];

		for (let r = 0; r < this.gridSize; r++) {
			if (this.grid[r].every((val) => this.cellIsFilled(val)))
				rowsToClear.push(r);
		}

		for (let c = 0; c < this.gridSize; c++) {
			let full = true;
			for (let r = 0; r < this.gridSize; r++) {
				if (!this.cellIsFilled(this.grid[r][c])) full = false;
			}
			if (full) colsToClear.push(c);
		}

		const linesCleared = rowsToClear.length + colsToClear.length;
		if (linesCleared > 0) {
			this.performClear(rowsToClear, colsToClear, linesCleared);
		}
	}

	async performClear(rows: number[], cols: number[], count: number) {
		soundManager.play("lines");
		this.clearsThisFight += count;

		let damage = count * 20 * (count > 1 ? 1.5 : 1);
		if (this.hasArtifact("sniper") && count === 1) damage += 12;
		if (this.hasArtifact("combo") && count >= 2) damage += 10;

		let shieldGain = count * 5;
		if (this.hasArtifact("battery")) shieldGain += count * 3;
		this.player.DEF += shieldGain;

		if (this.hasArtifact("vampire")) {
			this.player.HP += count * 2;
			Logger.log(i18n.t("artifact.vampire.use", { count: count * 2 }));
			this.spawnFloatingText("HEAL", UIElements.player.hp_bar, "#22c55e");
		}

		if (this.hasArtifact("goldlines")) {
			const gg = count * 2;
			this.player.GOLD += gg;
			Logger.log(i18n.t("artifact.vampire.use", { gold: gg }));
		}

		if (this.hasArtifact("frost")) this.enemy.status.add("chill", 2);
		if (this.hasArtifact("stormrune")) this.enemy.status.add("shock", 2);
		if (this.hasArtifact("gemcutter")) this.placeBonusThisFight += count;

		if (this.hasArtifact("prism")) {
			const picks = ["fire", "ice", "storm", "poison"];
			const el = picks[this.prismCounter % picks.length];
			this.prismCounter++;
			if (el === "fire") {
				this.enemy.status.add("burn", 3);
				this.spawnFloatingText(
					"🔥",
					UIElements.enemy.sprite,
					"#fb7185"
				);
			}
			if (el === "ice") {
				this.enemy.status.add("chill", 2);
				this.spawnFloatingText(
					"❄️",
					UIElements.enemy.sprite,
					"#67e8f9"
				);
			}
			if (el === "storm") {
				this.enemy.status.add("shock", 2);
				this.spawnFloatingText(
					"⚡",
					UIElements.enemy.sprite,
					"#facc15"
				);
			}
			if (el === "poison") {
				this.enemy.status.add("poison", 3);
				this.spawnFloatingText(
					"☠️",
					UIElements.enemy.sprite,
					"#22c55e"
				);
			}
		}

		const cellsToClear = new Set<number>();
		rows.forEach((r) => {
			for (let c = 0; c < this.gridSize; c++)
				cellsToClear.add(r * this.gridSize + c);
		});
		cols.forEach((c) => {
			for (let r = 0; r < this.gridSize; r++)
				cellsToClear.add(r * this.gridSize + c);
		});

		cellsToClear.forEach((idx) =>
			UIElements.grid.children[idx].classList.add("line-clear")
		);
		await new Promise((r) => setTimeout(r, 280));

		cellsToClear.forEach((idx) => {
			const r = Math.floor(idx / this.gridSize);
			const c = idx % this.gridSize;
			const val = this.grid[r][c];
			if (val === "ROCK" || val === "MASK") {
				UIElements.grid.children[idx].classList.remove("line-clear");
				UIElements.grid.children[idx].animate(
					[
						{ filter: "brightness(1.5)" },
						{ filter: "brightness(1)" },
					],
					{ duration: 300 }
				);
			} else {
				if (val === "MINE") {
					this.damageEnemy(30, true); //!!
					Logger.log(i18n.t("damage.mine"));
					this.spawnFloatingText(
						"BOOM!",
						UIElements.enemy.sprite,
						"#ef4444"
					);
					soundManager.play("crit");
				}
				this.grid[r][c] = null;
				UIElements.grid.children[idx].className = "cell";
			}
		});

		if (this.hasArtifact("magnet")) this.removeRandomFilledCells(1);

		this.damageEnemy(Math.floor(damage), true);
	}

	// ------------------------------
	// Damage + statuses
	// ------------------------------
	tickStatusesBeforeEnemyActs() {
		// Enemy DOT
		let dotDmg = 0;
		let corrosionArmor = 0;

		if (this.enemy.status.get("burn") > 0) {
			const mult = this.hasArtifact("alchemist") ? 1.5 : 1;
			dotDmg += Math.ceil(this.enemy.status.get("burn") * 1 * mult);
			this.enemy.status.decay("burn");
		}
		if (this.enemy.status.get("poison") > 0) {
			const mult = this.hasArtifact("alchemist") ? 1.5 : 1;
			const p = Math.ceil(
				Math.max(1, Math.floor(this.enemy.status.get("poison") / 2)) * mult
			);
			dotDmg += p;
			if (this.hasArtifact("corrosive") && this.enemy.DEF > 0) {
				corrosionArmor = Math.min(this.enemy.DEF, 1);
			}
			this.enemy.status.decay("poison");
		}

		if (dotDmg > 0) {
			this.damageEnemy(dotDmg, false, true);
			this.spawnFloatingText(dotDmg, UIElements.enemy.sprite, "#22c55e");
			if (corrosionArmor > 0) {
				this.enemy.DEF -= corrosionArmor;
				this.spawnFloatingText(
					"-DEF",
					UIElements.enemy.sprite,
					"#22c55e"
				);
			}
		}

		// Artifact: cinder
		if (this.hasArtifact("cinder") && this.enemy.status.get("burn") > 0) {
			this.damageEnemy(3, false, true);
			this.spawnFloatingText(3, UIElements.enemy.sprite, "#fb7185");
		}

		// Player DOT
		if (this.player.status.get("burn") > 0) {
			const burn = this.player.status.get("burn");
			this.player.HP -= burn;
			this.damageTakenThisFight += burn;
			this.spawnFloatingText(burn, UIElements.player.hp_bar, "#fb7185");
			this.player.status.decay("burn");
		}
		if (this.player.status.get("poison") > 0) {
			const p = Math.max(1, Math.floor(this.player.status.get("poison") / 2));
			this.player.HP -= p;
			this.damageTakenThisFight += p;
			this.spawnFloatingText(p, UIElements.player.hp_bar, "#22c55e");
			this.player.status.decay("poison");
		}

		if (this.player.HP == 0) {
			if (this.hasArtifact("phoenix") && !this.revived) {
				this.player.HP = Math.floor(this.player.MAX_HP / 2);
				this.revived = true;
				Logger.log(i18n.t("artifact.phoenix.use"));
				this.spawnFloatingText(
					"PHOENIX!",
					UIElements.player.hp_bar,
					"#f97316"
				);
				soundManager.play("win");
			} else {
				this.loseGame();
			}
		}
	}

	damageEnemy(amount: number, isCrit = false, isDot = false) {
		if (this.enemy.HP <= 0) return;

		// Weak debuff on player reduces damage
		if (this.player.status.get("weak") > 0) amount = Math.floor(amount * 0.75);

		// Hazard global mult
		amount = Math.floor(amount * (this.hazardMods.damageMult || 1));
		if (this.hazardMods.glassMultiplier)
			amount = Math.floor(amount * this.hazardMods.glassMultiplier);

		// Glass Cannon
		if (this.hasArtifact("glass_cannon")) {
			amount = Math.ceil(amount * 1.5);
		}

		// Lifesteal boon
		if (this.hazardMods.lifesteal && amount > 0) {
			this.player.HP += this.hazardMods.lifesteal;
		}

		// Rage
		if (this.hasArtifact("rage") && this.player.HP / this.player.MAX_HP < 0.3) {
			amount = Math.ceil(amount * 1.5);
			isCrit = true;
		}

		// Executioner
		if (
			this.hasArtifact("executioner") &&
			this.enemy.HP / this.enemy.MAX_HP < 0.4
		) {
			amount = Math.ceil(amount * 1.3);
		}

		// Shock increases next hit then clears
		if (!isDot && this.enemy.status.get("shock") > 0) {
			const mult = 1 + 0.25 * this.enemy.status.get("shock");
			amount = Math.ceil(amount * mult);
			this.enemy.status.decay("shock", -1);
			isCrit = true;
		}

		// Enemy shield
		if (this.enemy.DEF > 0) {
			if (this.enemy.DEF >= amount) {
				this.enemy.DEF -= amount;
				amount = 0;
				this.spawnFloatingText(
					"BLOCK",
					UIElements.enemy.sprite,
					"#60a5fa"
				);
			} else {
				amount -= this.enemy.DEF;
			}
		}

		this.lastHitWasCrit = isCrit && amount > 0;

		if (amount > 0) {
			this.enemy.HP -= amount;
			if (isCrit) soundManager.play("crit");
			else soundManager.play("hit");

			this.spawnFloatingText(
				amount,
				UIElements.enemy.sprite,
				isCrit ? "#fde047" : "#ffffff"
			);
			UIElements.enemy.sprite.classList.add("shake");
			setTimeout(
				() => UIElements.enemy.sprite.classList.remove("shake"),
				450
			);

			if (isCrit) {
				UIElements.feedback.classList.remove("hidden");
				UIElements.feedback.classList.add("animate-bounce");
				setTimeout(
					() => UIElements.feedback.classList.add("hidden"),
					900
				);

				// Overcharge artifact
				if (this.hasArtifact("overcharge"))
					this.overchargeThisFight += 1;
			}
		}

		if (this.enemy.HP <= 0) {
			this.enemy.HP = 0;
			setTimeout(() => this.winLevel(), 450);
		}

		// Score & gold
		let scoreGain = Math.max(0, amount);
		if (this.hasArtifact("midas")) scoreGain = Math.floor(scoreGain * 1.5);
		this.score += scoreGain;

		let goldGain = Math.max(0, Math.floor(amount / 10));
		if (isCrit) goldGain += 1;
		if (this.hasArtifact("midas")) goldGain = Math.ceil(goldGain * 1.15);
		if (this.hasArtifact("brilliance") && isCrit && amount > 0)
			goldGain += 2;

		if (this.hazardMods.noGold) goldGain = 0;
		if (this.hazardMods.doubleGold) goldGain *= 2;

		this.player.GOLD += goldGain;

		this.updateUI();
	}

	spawnFloatingText(
		text: string | number,
		target: HTMLElement,
		color: string
	) {
		if (!target || !target.getBoundingClientRect) return;
		const rect = target.getBoundingClientRect();
		const el = document.createElement("div");
		el.innerText =
			typeof text === "number" ? `-${Math.floor(text)}` : String(text);
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
				if (this.player.HP > 0 && this.enemy.HP > 0) this.fillHand();
			}, 420);
		}
	}

	discardHand() {
		if (this.paused) return;
		if (this.player.HP <= 0 || this.enemy.HP <= 0) return;

		this.discardsThisFight++;

		Logger.log(i18n.t("button.next_turn"));
		soundManager.play("invalid");

		// Recycle artifact
		if (this.hasArtifact("recycle")) {
			this.removeRandomFilledCells(2);
			Logger.log(i18n.t("artifact.recycle.use"));
		}

		UIElements.hand.innerHTML = "";
		this.hand = this.hand.map(() => null);

		setTimeout(() => {
			this.enemyTurn();
			if (this.player.HP > 0 && this.enemy.HP > 0) this.fillHand();
			this.updateUI();
		}, 250);
	}

	enemyTurn() {
		if (this.enemy.HP <= 0) return;
		if (this.paused) return;

		// Tick DOTs and statuses
		this.tickStatusesBeforeEnemyActs();
		if (this.player.HP <= 0 || this.enemy.HP <= 0) return;

		// Time warp
		if (this.hasArtifact("warp") && Math.random() < 0.15) {
			Logger.log(i18n.t("artifact.warp.use"));
			this.spawnFloatingText(
				"WARP!",
				UIElements.player.hp_bar,
				"#a78bfa"
			);
			soundManager.play("clear");
			this.updateUI();
			return;
		}

		// Chill effect: slow/skip enemy
		let effectiveAtk = this.enemy.ATK;
		if (this.enemy.status.get("chill") > 0) {
			const slow = Math.min(0.6, 0.15 * this.enemy.status.get("chill"));
			effectiveAtk = Math.max(1, Math.floor(effectiveAtk * (1 - slow)));
			if (this.enemy.status.get("chill") >= 3 && Math.random() < 0.22) {
				Logger.log(i18n.t("logger.enemy_frozen"));
				this.spawnFloatingText(
					"FROZEN!",
					UIElements.enemy.sprite,
					"#67e8f9"
				);
				soundManager.play("clear");
				this.enemy.status.decay("chill", 2);
				this.updateUI();
				return;
			}
			this.enemy.status.decay("chill");
		}

		// Enemy ability
			this.enemy.ability(this);

		let dmg = effectiveAtk;

		// Spiked shield reflect
		if (this.hasArtifact("spikes") && this.player.DEF > 0) {
			this.damageEnemy(Math.min(this.player.DEF, 30), false);
			this.spawnFloatingText(
				"REFLECT",
				UIElements.enemy.sprite,
				"#fb923c"
			);
		}

		// Player shock increases incoming
		if (this.player.status.get("shock") > 0) {
			dmg = Math.ceil(dmg * (1 + 0.25 * this.player.status.get("shock")));
			this.player.status.decay("shock", -1);
		}

		// Shield absorb
		let absorbedFully = false;
		if (this.player.DEF > 0) {
			if (this.player.DEF >= dmg) {
				this.player.DEF -= dmg;
				dmg = 0;
				absorbedFully = true;
			} else {
				dmg -= this.player.DEF;
				this.player.DEF = 0;
			}
		}

		if (dmg > 0) {
			this.player.HP -= dmg;
			this.damageTakenThisFight += dmg;
			Logger.log(i18n.t("damage.enemy", { dmg }));
			soundManager.play("damage");
			document.body.classList.add("shake");
			setTimeout(() => document.body.classList.remove("shake"), 420);

			if (this.hasArtifact("thorns")) {
				this.damageEnemy(5, false);
				Logger.log(i18n.t("artifact.thorns.use"));
			}

			if (this.hasArtifact("gold_tooth")) {
				this.player.GOLD += 1;
				this.spawnFloatingText(
					"+1G",
					UIElements.player.hp_bar,
					"#fbbf24"
				);
			}

			this.spawnFloatingText(dmg, UIElements.player.hp_bar, "#ef4444");

			// Elemental on-hit from enemy element
			const el = this.enemy.template.element;
			if (el === "fire") this.player.status.add("burn", 1);
			if (el === "ice") this.player.status.add("weak", 1);
			if (el === "poison") this.player.status.add("poison", 1);
			if (el === "storm") this.player.status.add("shock", 1);
		} else {
			Logger.log(i18n.t("logger.absorb"));
			if (absorbedFully && this.hasArtifact("mirrorplate")) {
				this.damageEnemy(6, false);
				Logger.log(i18n.t("artifact.mirrorplate.use"));
				this.spawnFloatingText(
					"MIRROR",
					UIElements.enemy.sprite,
					"#a5b4fc"
				);
			}
		}

		// Scavenger
		if (this.hasArtifact("scavenger") && Math.random() < 0.2) {
			this.removeRandomFilledCells(1);
			Logger.log(i18n.t("artifact.scavenger.use"));
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
				const idx = indices[Math.floor(Math.random() * indices.length)];
				const item = this.hand[idx];
				if (item) {
					const el = item.domElement;
					el.style.opacity = "0";
					setTimeout(() => el.remove(), 200);
					this.hand[idx] = null;
					Logger.log(i18n.t("hazard.random_discard.action"));
					this.checkHandEmpty();
				}
			}
		}

		if (this.player.HP <= 0) {
			if (this.hasArtifact("phoenix") && !this.revived) {
				this.player.HP = Math.floor(this.player.MAX_HP / 2);
				this.revived = true;
				Logger.log(i18n.t("artifact.phoenix.use"));
				this.spawnFloatingText(
					"PHOENIX!",
					UIElements.player.hp_bar,
					"#f97316"
				);
				soundManager.play("win");
			} else {
				this.loseGame();
			}
		}

		this.updateUI();
	}

	nextLevel() {
		this.level++;
		UIElements.modal.victory.classList.add("hidden");

		// Cleanup if too full
		for (let r = 0; r < this.gridSize; r++) {
			for (let c = 0; c < this.gridSize; c++) {
				if (
					this.grid[r][c] &&
					this.grid[r][c] !== "ROCK" &&
					Math.random() > 0.72
				) {
					this.grid[r][c] = null;
					this.setCellClass(r, c, "cell");
				}
			}
		}

		this.enemy = new Enemy(this.enemyContext);

        const isBossFloor = this.level % 5 === 0;
		UIElements.enemy.label.textContent = i18n.t(`label.${isBossFloor ? "boss" : "enemy"}`)

		document.body.className = `h-screen w-screen flex flex-col items-center justify-between p-2 select-none ${this.enemy.template.theme}`;

		// music theme
		if (this.enemy.template.trackId) {
			soundManager.setTrack(this.enemy.template.trackId);
		} else {
			const track = this.pickTrackForTheme(this.enemy.template.theme);
			if (Math.random() < 0.15) {
				const ids = Object.keys(soundManager.tracks);
				soundManager.setTrack(
					ids[Math.floor(Math.random() * ids.length)]
				);
			} else {
				soundManager.setTrack(track);
			}
		}
        
		this.medicThisTurn = 0;
		this.clearsThisFight = 0;
		this.placeBonusThisFight = 0;
		this.discardsThisFight = 0;
		this.lastHitWasCrit = false;
		this.damageTakenThisFight = 0;
		this.overchargeThisFight = 0;

		// Start shield
		if (this.hasArtifact("crystal")) this.player.DEF += 20;

		// Heal after battle
		if (this.hasArtifact("regen")) this.player.HP += 5;

		// Start enemy chill if glacier
		if (this.hasArtifact("glacier")) this.enemy.status.add("chill", 2);

		// Halo: cleanse 1 negative
        if (this.hasArtifact("halo")) {
            const activeStatuses = this.player.status.activeEntries();
            if (activeStatuses.length > 0) {
                const status =
                activeStatuses[Math.floor(Math.random() * activeStatuses.length)];
                this.player.status.decay(status[0]);
                Logger.log(i18n.t("artifact.halo.use"));
            }
        }

		// Visual
		UIElements.enemy.sprite.className = `enemy-sprite hover-anim rounded-xl flex justify-center items-center mb-2 ${this.enemy.template.style}`;
		UIElements.enemy.sprite.classList.remove("shake");

		// Hazard/boon
		const hazard = this.rollHazard();
		this.applyHazard(hazard);

		// Apply hazard effects on grid
		this.applyStartGridEffects();
		if (
			this.hazardMods.gridSize &&
			this.hazardMods.gridSize !== this.gridSize
		) {
			this.resizeGrid(this.hazardMods.gridSize, this.hazardMods.cellSize);
			Logger.log(
				i18n.t("boon.this.gridSize", { size: this.hazardMods.gridSize })
			);
		}

		// Grid cleanser artifact
		if (this.hasArtifact("cleanser")) this.removeRandomFilledCells(3);

		// Boon starts
		if (this.hazardMods.startShield) {
			this.player.DEF += this.hazardMods.startShield;
			Logger.log(
				i18n.t("boon.start_shield", {
					shield: this.hazardMods.startShield,
				})
			);
		}
		if (this.hazardMods.startHeal) {
			this.player.HP += this.hazardMods.startHeal;
			Logger.log(
				i18n.t("boon.start_heal", { heal: this.hazardMods.startHeal })
			);
		}
		if (this.hazardMods.startGold) {
			this.player.GOLD += this.hazardMods.startGold;
			Logger.log(
				i18n.t("boon.start_heal", { gold: this.hazardMods.startGold })
			);
		}
		if (this.hazardMods.startClean) {
			this.removeRandomFilledCells(this.hazardMods.startClean);
			Logger.log(
				i18n.t("boon.start_clean", {
					clean: this.hazardMods.startClean,
				})
			);
		}
		if (this.hazardMods.startEnemyChill) {
			this.enemy.status.add("chill", this.hazardMods.startEnemyChill);
		}
        
		Logger.log(
			i18n.t(`logger.${isBossFloor ? "boss" : "enemy"}`, {
				name: this.enemy.template.name,
			})
		);
        
		this.renderEnemyCodex();
		this.showHazardIfNeeded();
		this.fillHand();
		this.updateUI();
	}

	async winLevel() {
		soundManager.play("win");

		const isBoss = this.level % 5 === 0;
		let bonus = 14 + Math.floor(this.level * 2);
		if (isBoss) bonus += 25;
		if (this.hasArtifact("luckycoin")) bonus += 10;
		if (this.hasArtifact("payday")) bonus += 5;

		if (this.hazardMods.noGold) bonus = 0;
		if (this.hazardMods.doubleGold) bonus *= 2;

		this.player.GOLD += bonus;
		Logger.log(i18n.t("logger.win", { bonus }));

		// Antidote
		if (this.hasArtifact("antidote")) {
            let reduced = 0;
            const activeStatuses = this.player.status.activeEntries();
            if (activeStatuses.length > 0) {
                activeStatuses.forEach(s => {
                    this.player.status.decay(s[0]);
                    reduced++;
                })
            }
			if (reduced > 0) Logger.log(i18n.t("artifact.antidote.use"));
		}

		// Decide shop
		if (this.shop.rollShop()) {
			Logger.log(i18n.t("shop.roll"));
			await this.shop.openShop();
		}
		UIElements.modal.victory.classList.remove("hidden");
		await this.rewards.generateRewards();
		this.nextLevel();

		this.updateUI();
	}

	loseGame() {
		soundManager.play("lose");
		UIElements.final_score.innerText = i18n.t("game_over.score", {
			score: this.score,
		});
		UIElements.final_depth.innerText = i18n.t("game_over.level", {
			level: this.level,
		});
		UIElements.modal.game_over.classList.remove("hidden");
	}

	updateUI() {
		UI.updateUI(this);
	}
}
