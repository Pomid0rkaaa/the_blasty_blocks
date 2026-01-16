import type { Game } from "./Game";

export class PlayerContext {
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    get difficulty() { return this.game.difficulty }
}