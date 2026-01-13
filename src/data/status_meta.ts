import type { StatusDef } from "../types";

export const STATUS_META: Record<string, StatusDef> = {
    burn: {
        icon: "🔥",
        color: "#fb7185",
        name: "Горение",
        desc: "Наносит урон каждый ход и постепенно уменьшается.",
    },
    poison: {
        icon: "☠️",
        color: "#22c55e",
        name: "Яд",
        desc: "Наносит урон каждый ход (сильнее при больших стаках) и уменьшается.",
    },
    shock: {
        icon: "⚡",
        color: "#facc15",
        name: "Шок",
        desc: "Усиливает следующий удар (или входящий урон по герою), затем сбрасывается.",
    },
    chill: {
        icon: "❄️",
        color: "#67e8f9",
        name: "Озноб",
        desc: "Снижает атаку врага; при больших стаках иногда замораживает ход.",
    },
    weak: {
        icon: "🧊",
        color: "#60a5fa",
        name: "Слабость",
        desc: "Снижает твой урон (включая урон от установки и линий).",
    },
};
