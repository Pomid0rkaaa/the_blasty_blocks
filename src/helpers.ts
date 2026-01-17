declare global {
	interface Array<T> {
		choose<K extends keyof T>(
			criteria: Partial<Record<K, T[K]>>,
		): T | undefined;
		chooseAll<K extends keyof T>(criteria: Partial<Record<K, T[K]>>): T[];
	}
	interface Math {
        /**clamps value between [min, max] */
		clamp(min: number, value: number, max: number): number;
        /**randInt(max, min?) -> integer in [min, max)*/
		randInt(max: number, min?: number): number;
	}
}

Array.prototype.chooseAll = function <T, K extends keyof T>(
	criteria: Partial<Record<K, T[K]>>,
): T[] {
	return this.filter((item) =>
		Object.entries(criteria).every(
			([key, value]) => item[key as K] === value,
		),
	);
};
Array.prototype.choose = function <T, K extends keyof T>(
	criteria: Partial<Record<K, T[K]>>,
): T | undefined {
	const matches = (this as T[]).chooseAll(criteria);
	if (matches.length === 0) return undefined;
	const randomIndex = Math.floor(Math.random() * matches.length);
	return matches[randomIndex];
};

Math.clamp = function (min: number, value: number, max: number): number {
	return Math.max(min, Math.min(value, max));
};
Math.randInt = function (max: number, min: number = 0): number {
	if (max <= min) throw new Error(`Math.randInt: max (${max}) must be > min (${min})`);
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};
