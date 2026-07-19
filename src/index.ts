import { Game } from "./game";
import { soundManager } from "./soundManager";
import { Logger } from "./logger";
import i18n from "./i18n";
import "./helpers";

const lang = i18n.getPreferredLanguage();
i18n.load(lang);

const langSelect = document.getElementById("i18n-btn") as HTMLSelectElement | null;

if (langSelect) {
	langSelect.value = lang;
	langSelect.addEventListener("change", () => {
		if (!i18n.load(langSelect.value, true)) {
			langSelect.value = i18n.lang;
		}
	});
}

const skinSelect = document.getElementById("skin-btn") as HTMLSelectElement | null;

if (skinSelect) {
	const skin = localStorage.getItem("skin");
	if (skin) skinSelect.value = skin;
	else {
		localStorage.setItem("skin", "default");
	}
	setSkin(skin);
	skinSelect.addEventListener("change", (e) => {
		localStorage.setItem("skin", e.target.value);
		setSkin(e.target.value);
	});
}

function setSkin(skin) {
	switch (skinSelect.value) {
		case "default": document.documentElement.style.removeProperty("--cell-skin"); break;
		case "forest":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 4px, transparent 4px 10px), repeating-linear-gradient(45deg, rgba(0,0,0,.12) 0 3px, transparent 3px 11px)");
			break;
		case "volcano":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(45deg, rgba(0,0,0,.28) 0 4px, transparent 4px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,.22) 0 3px, transparent 3px 13px)");
			break;
		case "ice":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 2px, transparent 2px 8px), repeating-linear-gradient(0deg, rgba(255,255,255,.1) 0 2px, transparent 2px 10px)");
			break;
		case "space":
			document.documentElement.style.setProperty("--cell-skin",
				"radial-gradient(circle at 20% 25%, rgba(255,255,255,.5) 0 1.3px, transparent 1.6px), radial-gradient(circle at 65% 60%, rgba(255,255,255,.4) 0 1.1px, transparent 1.4px), radial-gradient(circle at 80% 20%, rgba(255,255,255,.35) 0 1px, transparent 1.3px), radial-gradient(circle at 40% 85%, rgba(255,255,255,.3) 0 1px, transparent 1.3px)");
			break;
		case "desert":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(15deg, rgba(255,255,255,.13) 0 5px, transparent 5px 14px), repeating-linear-gradient(-10deg, rgba(0,0,0,.08) 0 4px, transparent 4px 16px)");
			break;
		case "ocean":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.16) 0 2px, transparent 2px 8px)");
			break;
		case "storm":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(70deg, rgba(255,255,255,.15) 0 2px, transparent 2px 6px), repeating-linear-gradient(-70deg, rgba(255,255,255,.1) 0 2px, transparent 2px 10px)");
			break;
		case "crystal":
			document.documentElement.style.setProperty("--cell-skin",
				"conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,.2), rgba(255,255,255,.02) 25%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.02) 75%, rgba(255,255,255,.2))");
			break;
		case "neon":
			document.documentElement.style.setProperty("--cell-skin",
				"repeating-linear-gradient(0deg, rgba(255,255,255,.14) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,0,220,.08) 0 2px, transparent 2px 6px)");
			break;
	}
}

const game = new Game();

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
	}
});

document.addEventListener("mouseover", (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	if (target?.closest("button")) {
		soundManager.play("hover");
	}
});
