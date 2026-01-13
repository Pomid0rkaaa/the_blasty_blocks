import type { ElementDef } from "../types";
import i18n from "../i18n";

export const ELEMENTS: Record<string, ElementDef> = {
	fire: {
		id: "fire",
		name: i18n.t("element.fire"),
		icon: "🔥",
		color: "#fb7185",
	},
	ice: {
		id: "ice",
		name: i18n.t("element.ice"),
		icon: "❄️",
		color: "#67e8f9",
	},
	storm: {
		id: "storm",
		name: i18n.t("element.storm"),
		icon: "⚡",
		color: "#facc15",
	},
	poison: {
		id: "poison",
		name: i18n.t("element.poison"),
		icon: "☠️",
		color: "#22c55e",
	},
	void: {
		id: "void",
		name: i18n.t("element.void"),
		icon: "🟣",
		color: "#a78bfa",
	},
	earth: {
		id: "earth",
		name: i18n.t("element.earth"),
		icon: "🪨",
		color: "#d6d3d1",
	},
	light: {
		id: "light",
		name: i18n.t("element.ligth"),
		icon: "✨",
		color: "#fde68a",
	},
};
