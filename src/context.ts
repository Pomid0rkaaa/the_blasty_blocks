import type { Game } from "./game";

export class Context {
    private game: Game;
    constructor(game: Game) {
        this.game = game;
    }

    get gold() { return this.game.player.GOLD; }
    set gold(v) { this.game.player.GOLD = v; }

    get maxHp() { return this.game.player.MAX_HP }
    set maxHp(v) { this.game.player.MAX_HP = v; }

    get shield() { return this.game.player.DEF }
    set shield(v) { this.game.player.DEF = v; }

    hasArtifact(id: string) {
        return this.game.hasArtifact(id);
    }

    artifactPrice(a: any) {
        return this.game.artifactPrice(a);
    }

    addArtifact(a: any) {
        this.game.addArtifact(a);
    }

    healPlayer(n: number) {
        this.game.player.HP += n;
    }

    removeRandomFilledCells(n: number) {
        this.game.removeRandomFilledCells(n);
    }

    updateUI() {
        this.game.updateUI();
    }
}
