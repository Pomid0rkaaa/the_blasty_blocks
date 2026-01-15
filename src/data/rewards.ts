import type { Reward } from "../types";
import i18n from "../i18n";

export const REWARDS: Reward[] = [
    {
        type: "stat",
        id: "heal",
        get name() { return i18n.t("reward.heal") },
        get desc() { return i18n.t("reward.heal.desc") },
        icon: "❤️",
    },
    {
        type: "stat",
        id: "maxhp",
        get name() { return i18n.t("reward.maxhp") },
        get desc() { return i18n.t("reward.maxhp.desc") },
        icon: "💪",
    },
    {
        type: "stat",
        id: "shield",
        get name() { return i18n.t("reward.shield") },
        get desc() { return i18n.t("reward.shield.desc") },
        icon: "🛡️",
    },
    {
        type: "stat",
        id: "gold",
        get name() { return i18n.t("reward.gold") },
        get desc() { return i18n.t("reward.gold.desc") },
        icon: "🪙",
    },
    {
        type: "stat",
        id: "full",
        get name() { return i18n.t("reward.full") },
        get desc() { return i18n.t("reward.full.desc") },
        icon: "💖",
    },
]
