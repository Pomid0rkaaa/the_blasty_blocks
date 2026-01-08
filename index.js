import { BlockGame } from './js/game.js';
import { soundManager } from './js/soundManager.js';

const game = new BlockGame();
function toggleMuteFromPanel() {
    soundManager.toggle();

    const btn = document.getElementById("mute-btn");
    if (!btn) return;

    btn.textContent = soundManager.muted ? "UNMUTE" : "MUTE";
}

window.game = game;
window.toggleMuteFromPanel = toggleMuteFromPanel;

document.addEventListener("click", (event) => {
    switch (event.target.id) {
        case "volume-btn":
            document.body.classList.toggle('show-volume')
            break;
        case "help-btn":
            game.openHelp();
            break;
        case "log-btn":
            game.openLog();
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
        case "close-help":
            game.closeHelp();
            break;
        case "clear-log-btn":
            game.clearLog();
            break;
        case "close-log-btn":
            game.closeLog();
            break;
        case "reset-achievements-btn":
            game.resetAchievements();
            break;
        case "close-achievements-btn":
            game.closeAchievements();
            break;
    }
});