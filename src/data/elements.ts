import type { ElementDef } from "../types";

export const ELEMENTS: Record<string, ElementDef> = {
    fire: {
        id: "fire",
        name: "Огонь",
        icon: "🔥",
        color: "#fb7185",
    },
    ice: { id: "ice", name: "Лёд", icon: "❄️", color: "#67e8f9" },
    storm: {
        id: "storm",
        name: "Гроза",
        icon: "⚡",
        color: "#facc15",
    },
    poison: {
        id: "poison",
        name: "Яд",
        icon: "☠️",
        color: "#22c55e",
    },
    void: {
        id: "void",
        name: "Пустота",
        icon: "🟣",
        color: "#a78bfa",
    },
    earth: {
        id: "earth",
        name: "Земля",
        icon: "🪨",
        color: "#d6d3d1",
    },
    light: {
        id: "light",
        name: "Свет",
        icon: "✨",
        color: "#fde68a",
    },
};
