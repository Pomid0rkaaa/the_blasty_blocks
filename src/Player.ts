import { StatusContainer, PLAYER_STATUSES } from "./StatusContainer";
import type { EntityContext } from "./EntityContext";
import type { PlayerStatus } from "./types";

export class Player {
    private ctx: EntityContext;
	private hp: number;
	private max_hp: number = 100;
	private gold: number = 0;
	private def: number = 0;
    
    public readonly status: StatusContainer<PlayerStatus>;

    constructor(ctx: EntityContext) {
        this.ctx = ctx;
		if (this.ctx.difficulty === "EASY") this.max_hp = 120;
		if (this.ctx.difficulty === "HARD") this.max_hp = 80;
        this.hp = this.max_hp;
        this.status = new StatusContainer<PlayerStatus>(PLAYER_STATUSES);
    }
    
    public get GOLD(): number { return this.gold }
    public get DEF(): number { return this.def }
    public get HP(): number { return this.hp }
    public get MAX_HP(): number { return this.max_hp }

    public set GOLD(amount: number) { this.gold = Math.max(0, amount) }
    public set DEF(amount: number) { this.def = Math.max(0, amount) }
    public set HP(amount: number) { this.hp = Math.clamp(0, amount, this.max_hp); }
    public set MAX_HP(amount: number) {
        this.max_hp = Math.max(0, amount)
        this.hp = Math.min(this.hp, this.max_hp)
    }
}
