import i18n from "../I18n";
import { ARTIFACTS } from "./artifacts";

export type ShopItemType = "stat" | "artifact";

export interface ShopItem {
	type: ShopItemType;
	id: string;
	name: string;
	desc: string;
	icon: string;
	price: (coupon: boolean) => number;
	apply: (ctx: any) => void;

	// optional condition
	available?: (ctx: any) => boolean;
}

export const BASE_SHOP_ITEMS: ShopItem[] = [
	{
		type: "stat",
		id: "heal",
		get name() { return i18n.t("shop_item.heal") },
        get desc() { return i18n.t("shop_item.heal.desc") },
		icon: "🧃",
		price: (coupon) => (coupon ? 32 : 40),
		apply: (ctx) => ctx.healPlayer(25),
	},
	{
		type: "stat",
		id: "shield",
		get name() { return i18n.t("shop_item.shield") },
        get desc() { return i18n.t("shop_item.shield.desc") },
		icon: "🛡️",
		price: (coupon) => (coupon ? 36 : 45),
		apply: (ctx) => {
			ctx.shield += 25;
		},
	},
	{
		type: "stat",
		id: "clean",
		get name() { return i18n.t("shop_item.clean") },
        get desc() { return i18n.t("shop_item.clean.desc") },
		icon: "🧽",
		price: (coupon) => (coupon ? 44 : 55),
		apply: (ctx) => ctx.removeRandomFilledCells(5),
	},
];

export const FALLBACK_SHOP_ITEMS: ShopItem[] = [
	{
		type: "stat",
		id: "gold",
		get name() { return i18n.t("shop_item.gold") },
        get desc() { return i18n.t("shop_item.gold.desc") },
		icon: "🧰",
		price: (coupon) => (coupon ? 52 : 65),
		apply: (ctx) => {
			ctx.gold += 60;
		},
		available: (ctx) =>
			ARTIFACTS.every((a) => ctx.hasArtifact(a.id)),
	},
];

export const SHOP_ITEMS: ShopItem[] = [
	...BASE_SHOP_ITEMS,
	...FALLBACK_SHOP_ITEMS,
];
