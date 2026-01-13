import { BlockGame } from "./game";
import { soundManager } from "./soundManager";
import { ACHIEVEMENTS } from "./data/achievements";
import { ARTIFACTS } from "./data/artifacts";
import { ELEMENTS } from "./data/elements";
import { ENEMIES } from "./data/enemies";
import { HAZARDS } from "./data/hazards";
import { SHAPES } from "./data/shapes";
import { STATUS } from "./data/status";
import { Logger } from "./logger";
import i18n from "./i18n";

declare global {
	interface Window {
		game: BlockGame;
		soundManager: any;
		Logger: typeof Logger;
		data: any;
	}
	interface Array<T> {
		choose<K extends keyof T>(
			criteria: Partial<Record<K, T[K]>>
		): T | undefined;
		chooseAll<K extends keyof T>(criteria: Partial<Record<K, T[K]>>): T[];
	}
}

Array.prototype.chooseAll = function <T, K extends keyof T>(
	criteria: Partial<Record<K, T[K]>>
): T[] {
	return this.filter((item) =>
		Object.entries(criteria).every(
			([key, value]) => item[key as K] === value
		)
	);
};

Array.prototype.choose = function <T, K extends keyof T>(
	criteria: Partial<Record<K, T[K]>>
): T | undefined {
	const matches = (this as T[]).chooseAll(criteria); // cast `this` so TS knows it has chooseAll
	if (matches.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * matches.length);
	return matches[randomIndex];
};

const game = new BlockGame();
i18n.updateDOM();

const savedLang = localStorage.getItem("lang") || i18n.lang;
if (savedLang && savedLang !== i18n.lang) i18n.load(savedLang);
const i18nBtn = document.getElementById("i18n-btn") as HTMLSelectElement;
if (i18nBtn) i18nBtn.value = savedLang;

if (i18nBtn) {
	i18nBtn.addEventListener("change", (e: Event) => {
		const target = e.target as HTMLSelectElement;
		const newLang = target.value;
		const success = i18n.load(newLang);
		if (success) {
			localStorage.setItem("lang", newLang);
		} else {
			alert(`Language "${newLang}" not available`);
			target.value = i18n.lang;
		}
	});
}

function toggleMuteFromPanel() {
	soundManager.toggle();

	const btn = document.getElementById("mute-btn");
	if (!btn) return;

	btn.textContent = soundManager.muted ? "UNMUTE" : "MUTE";
}

document.addEventListener("click", (event: Event) => {
	const target = event.target as HTMLElement;
	if (!target) return;
	const btn = target.closest("button");
	if (!btn) return;

	soundManager.play("click");

	switch (btn.id) {
		case "volume-btn":
			document.body.classList.toggle("show-volume");
			break;
		case "help-btn":
			game.openHelp();
			break;
		case "log-btn":
			Logger.open();
			break;
		case "ach-btn":
			game.openAchievements();
			break;
		case "mute-btn":
			toggleMuteFromPanel();
			break;
		case "discard-btn":
			game.discardHand();
			break;
		case "startGame-easy":
			game.startGame("EASY");
			break;
		case "startGame-normal":
			game.startGame("NORMAL");
			break;
		case "startGame-hard":
			game.startGame("HARD");
			break;
		case "new-game-btn":
			game.showDifficultyModal();
			break;
		case "close-help-btn":
			game.closeHelp();
			break;
		case "clear-log-btn":
			Logger.clear();
			break;
		case "close-log-btn":
			Logger.close();
			break;
		case "reset-achievements-btn":
			game.resetAchievements();
			break;
		case "close-achievements-btn":
			game.closeAchievements();
			break;
	}
});

document.addEventListener("mouseover", (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	if (target?.closest("button")) {
		soundManager.play("hover");
	}
});

// Game manipulation from DevTools
window.game = game;
window.soundManager = soundManager;
window.Logger = Logger;

window.data = {
	ACHIEVEMENTS,
	ARTIFACTS,
	ELEMENTS,
	ENEMIES,
	HAZARDS,
	SHAPES,
	STATUS,
};
