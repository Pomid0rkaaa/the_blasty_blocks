import type { Reward } from "../types";

export const REWARDS: Reward[] = [
    {
        type: "stat",
        id: "heal",
        name: "Зелье",
        desc: "+30 HP",
        icon: "❤️",
    },
    {
        type: "stat",
        id: "maxhp",
        name: "Выносливость",
        desc: "+10 Max HP",
        icon: "💪",
    },
    {
        type: "stat",
        id: "shield",
        name: "Броня",
        desc: "+20 щита",
        icon: "🛡️",
    },
    {
        type: "stat",
        id: "gold",
        name: "Кошель",
        desc: "+40 золота",
        icon: "🪙",
    },
    {
        type: "stat",
        id: "full",
        name: "Полный отдых",
        desc: "Полное лечение",
        icon: "💖",
    },
]
