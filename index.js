import { BlockGame } from './js/game.js';
import { soundManager } from './js/soundManager.js';
import { ACHIEVEMENTS } from './js/data/achievements.js';
import { ARTIFACTS } from './js/data/artifacts.js';
import { ELEMENTS } from './js/data/elements.js';
import { ENEMIES } from './js/data/enemies.js';
import { HAZARDS } from './js/data/hazards.js';
import { SHAPES } from './js/data/shapes.js';
import { STATUS_META } from './js/data/status_meta.js';
import { Logger } from './js/logger.js'
import i18n from './js/i18n.js';

await i18n.load(i18n.lang);
const game = new BlockGame();
function toggleMuteFromPanel() {
    soundManager.toggle();

    const btn = document.getElementById("mute-btn");
    if (!btn) return;

    btn.textContent = soundManager.muted ? "UNMUTE" : "MUTE";
}

document.addEventListener("click", (event) => {
    const btn = event.target.closest("button");
    if (!btn) return;

    switch (btn.id) {
        case "volume-btn":
            document.body.classList.toggle('show-volume')
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
            game.startGame(0);
            break;
        case "startGame-normal":
            game.startGame(1);
            break;
        case "startGame-hard":
            game.startGame(2);
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
    STATUS_META,
}