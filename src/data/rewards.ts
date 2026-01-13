import type { Reward } from "../types";
import i18n from "../i18n";

export const REWARDS: Reward[] = [
    {
        type: "stat",
        id: "heal",
        name: i18n.t("reward.heal"),
        desc: i18n.t("reward.heal.desc"),
        icon: "❤️",
    },
    {
        type: "stat",
        id: "maxhp",
        name: i18n.t("reward.maxhp"),
        desc: i18n.t("reward.maxhp.desc"),
        icon: "💪",
    },
    {
        type: "stat",
        id: "shield",
        name: i18n.t("reward.shield"),
        desc: i18n.t("reward.shield.desc"),
        icon: "🛡️",
    },
    {
        type: "stat",
        id: "gold",
        name: i18n.t("reward.gold"),
        desc: i18n.t("reward.gold.desc"),
        icon: "🪙",
    },
    {
        type: "stat",
        id: "full",
        name: i18n.t("reward.full"),
        desc: i18n.t("reward.full.desc"),
        icon: "💖",
    },
]
