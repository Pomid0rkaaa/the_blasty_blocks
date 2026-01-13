import i18n from "../i18n";
import type { StatusDef } from "../types";

export const STATUS: Record<string, StatusDef> = {
    burn: {
        icon: "🔥",
        color: "#fb7185",
        name: i18n.t("status.burn"),
        desc: i18n.t("status.burn.desc"),
    },
    poison: {
        icon: "☠️",
        color: "#22c55e",
        name: i18n.t("status.poison"),
        desc: i18n.t("status.poison.desc"),
    },
    shock: {
        icon: "⚡",
        color: "#facc15",
        name: i18n.t("status.shock"),
        desc: i18n.t("status.shock.desc"),
    },
    chill: {
        icon: "❄️",
        color: "#67e8f9",
        name: i18n.t("status.chill"),
        desc: i18n.t("status.chill.desc"),
    },
    weak: {
        icon: "🧊",
        color: "#60a5fa",
        name: i18n.t("status.weak"),
        desc: i18n.t("status.weak.desc"),
    },
};
