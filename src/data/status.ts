import i18n from "../i18n";
import type { StatusDef } from "../types";

export const STATUS: Record<string, StatusDef> = {
    burn: {
        icon: "🔥",
        color: "#fb7185",
        get name() { return i18n.t("status.burn") },
        get desc() { return i18n.t("status.burn.desc") },
    },
    poison: {
        icon: "☠️",
        color: "#22c55e",
        get name() { return i18n.t("status.poison") },
        get desc() { return i18n.t("status.poison.desc") },
    },
    shock: {
        icon: "⚡",
        color: "#facc15",
        get name() { return i18n.t("status.shock") },
        get desc() { return i18n.t("status.shock.desc") },
    },
    chill: {
        icon: "❄️",
        color: "#67e8f9",
        get name() { return i18n.t("status.chill") },
        get desc() { return i18n.t("status.chill.desc") },
    },
    weak: {
        icon: "🧊",
        color: "#60a5fa",
        get name() { return i18n.t("status.weak") },
        get desc() { return i18n.t("status.weak.desc") },
    },
};
