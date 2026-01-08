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