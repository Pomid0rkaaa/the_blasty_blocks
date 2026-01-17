import { Game } from "./Game";
import { soundManager } from "./SoundManager";
import { Logger } from "./Logger";
import i18n from "./I18n";
import "./helpers";

const lang = i18n.getPreferredLanguage();
i18n.load(lang);

const select = document.getElementById("i18n-btn") as HTMLSelectElement | null;

if (select) {
	select.value = lang;
	select.addEventListener("change", () => {
		if (!i18n.load(select.value, true)) {
			select.value = i18n.lang;
		}
	});
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