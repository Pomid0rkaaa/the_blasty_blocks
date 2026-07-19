import { ENEMIES } from "./data/enemies";
import { StatusContainer, ENEMY_STATUSES } from "./statusContainer";
import type { EntityContext } from "./entityContext";
import type { EnemyStatus, IEnemy } from "./types";

export class Enemy {
	private ctx: EntityContext;

	private hp = 10;
	private max_hp = 10;
	private def = 0;
	private atk = 1;

	public readonly template: IEnemy;
	public readonly status: StatusContainer<EnemyStatus>;

	constructor(ctx: EntityContext) {
		this.ctx = ctx;

		const { template, status } = this.spawn();
		this.template = template;
		this.status = status;
	}

	public get HP() { return this.hp; }
	public get MAX_HP() { return this.max_hp; }
	public get DEF() { return this.def; }
	public get ATK() { return this.atk; }
	public get ability() { return this.template.ability; }
    
	public set HP(amount: number) { this.hp = Math.max(0, Math.min(amount, this.max_hp)); }
	public set DEF(amount: number) { this.def = Math.max(0, amount); }
	public set ATK(amount: number) { this.atk = Math.max(0, amount); }

	private chooseEnemyTemplate(): IEnemy {
		const isBossFloor = this.ctx.level % 5 === 0;
		const pool = ENEMIES.chooseAll({
			kind: isBossFloor ? "boss" : "enemy",
		});
		return pool[Math.floor(Math.random() * pool.length)];
	}

	private spawn(): {
		template: IEnemy;
		status: StatusContainer<EnemyStatus>;
	} {
		const template = this.chooseEnemyTemplate();

		const base_hp = 105 * (1 + this.ctx.level * 0.22);
		const base_atk = 8 + this.ctx.level * 1.6;

		let diffHpMult = 1;
		let diffAtkMult = 1;

		if (this.ctx.difficulty === "EASY") {
			diffHpMult = 0.8;
			diffAtkMult = 0.8;
		}

		if (this.ctx.difficulty === "HARD") {
			diffHpMult = 1.25;
			diffAtkMult = 1.25;
		}

		if (this.ctx.hazardMods.enemyBuff) {
			diffHpMult *= this.ctx.hazardMods.enemyBuff;
			diffAtkMult *= this.ctx.hazardMods.enemyBuff;
		}

		this.max_hp = Math.floor(base_hp * template.hpMod * diffHpMult);
		this.hp = this.max_hp;
		this.def = 0;
		this.atk = Math.max(
			4,
			Math.floor(base_atk * template.atkMod * diffAtkMult)
		);

		return {
			template,
			status: new StatusContainer<EnemyStatus>(ENEMY_STATUSES),
		};
	}
}
