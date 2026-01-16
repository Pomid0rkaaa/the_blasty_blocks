export class Context {
    game: any;
    constructor(game: any) {
        this.game = game;
    }

    get gold() { return this.game.gold; }
    set gold(v) { this.game.gold = v; }

    get maxHp() { return this.game.maxHp }
    set maxHp(v) { this.game.maxHp = v; }

    get shield() { return this.game.shield }
    set shield(v) { this.game.shield = v; }

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
        this.game.healPlayer(n);
    }

    removeRandomFilledCells(n: number) {
        this.game.removeRandomFilledCells(n);
    }

    updateUI() {
        this.game.updateUI();
    }
}
