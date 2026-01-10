export class Context {
    constructor(game) {
        this.game = game;
    }

    get gold() { return this.game.gold; }
    set gold(v) { this.game.gold = v; }

    get maxHp() { return this.game.maxHp }
    set maxHp(v) { this.game.maxHp = v; }

    get shield() { return this.game.shield }
    set shield(v) { this.game.shield = v; }

    hasArtifact(id) {
        return this.game.hasArtifact(id);
    }

    artifactPrice(a) {
        return this.game.artifactPrice(a);
    }

    addArtifact(a) {
        this.game.addArtifact(a);
    }

    healPlayer(n) {
        this.game.healPlayer(n);
    }

    removeRandomFilledCells(n) {
        this.game.removeRandomFilledCells(n);
    }

    unlockAchievement(id) {
        this.game.unlockAchievement(id);
    }

    updateUI() {
        this.game.updateUI();
    }
}