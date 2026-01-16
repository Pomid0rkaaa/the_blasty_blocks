export const PLAYER_STATUSES = ["burn", "poison", "shock", "weak"] as const;

export const ENEMY_STATUSES = ["burn", "poison", "shock", "chill"] as const;

export class StatusContainer<TStatus extends string> {
	private table: Record<TStatus, number>;

	constructor(initial: readonly TStatus[]) {
		this.table = Object.fromEntries(initial.map((s) => [s, 0])) as Record<
			TStatus,
			number
		>;
	}

	get(type: TStatus) {
		return this.table[type];
	}

	add(type: TStatus, stacks: number) {
		this.table[type] = Math.min(99, this.table[type] + stacks);
	}

	decay(type: TStatus, amount = 1) {
        if (amount <= 0 ) this.table[type] = 0;
        else this.table[type] = Math.max(0, this.table[type] - amount);
	}

	has(type: TStatus) {
		return this.table[type] > 0;
	}

	entries(): [TStatus, number][] {
    return Object.entries(this.table) as [TStatus, number][];
  }

    activeEntries(): [TStatus, number][] {
        return this.entries().filter(([, v]) => v > 0);
    }
}
