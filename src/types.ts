export interface ElementDef {
	id: string;
	name: string;
	icon: string;
	color: string;
}

export type Difficulty = "EASY" | "NORMAL" | "HARD";

export interface HazardMods {
	damageMult?: number;
	startRocks?: number;
	hpCostPerCell?: number;
	startGarbage?: number;
	gridSize?: number;
	cellSize?: string;
	randomShape?: boolean;
	mask?: string;
	startShield?: number;
	tempHandPlus?: number;
	startClean?: number;
	startEnemyChill?: number;
	startGold?: number;
	startMines?: number;
	randomDiscard?: boolean;
	noGold?: boolean;
	enemyBuff?: number;
	lifesteal?: number;
	glassMultiplier?: number;
	doubleGold?: boolean;
}

export interface Hazard {
	id: string;
	kind: "none" | "hazard" | "boon" | "boss";
	weight: number;
	icon: string;
	name: string;
	desc: string;
	mods?: HazardMods;
}

export interface Reward {
	type: "stat" | "artifact";
	id: string;
	name: string;
	desc: string;
	icon: string;
	rarity?: number; // Only for artifacts usually, but logical to have optional
}

export interface StatusDef {
	icon: string;
	color: string;
	name: string;
	desc: string;
}

export interface Track {
	name: string;
	tempo: number;
	prog: number[][];
	arp: (number | null)[];
	bassType: OscillatorType | "random";
	leadType: OscillatorType | "random";
	lead2Type: OscillatorType | "random";
	padType?: OscillatorType | "random";
	drums?: string; // e.g. "k.s.k..s"
}

export interface Artifact {
	id: string;
	name: string;
	desc: string;
	icon: string;
	color: string;
	rarity: number;
}

export interface Shape {
	name: string;
	color: string;
	layout: number[][];
	element?: string;
	id?: string;
}

export interface GridCell {
	color: string;
	element: string;
	id?: string;
	x?: number; // sometimes used?
	y?: number;
	locked?: boolean; // logic in game.ts
	// Add other properties as discovered
	// For now, based on usage:
	// element, color are main ones.
}

export interface HandShape extends Shape {
	handIndex: number; // index in hand
	domElement: HTMLElement;
}

export interface Enemy {
	id: string;
	kind: "enemy" | "boss";
	name: string;
	theme: string;
	style: string;
	element: string;
	hpMod: number;
	atkMod: number;
	desc: string;
	trackId?: string;
	// We use 'any' here to avoid circular dependency with BlockGame for now,
	// or we can import type BlockGame in the consuming file.
	ability: (g: any) => void;
}
