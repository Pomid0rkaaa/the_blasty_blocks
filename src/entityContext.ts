import type { Game } from "./game";
import type { Difficulty } from "./types";

export class EntityContext {
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    get level(): number { return this.game.level }
    get difficulty(): Difficulty { return this.game.difficulty }
    get hazardMods(): any { return this.game.hazardMods }
}
