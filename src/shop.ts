import { SHOP_ITEMS } from "./data/shopItems";
import { ARTIFACTS } from "./data/artifacts";
import { soundManager } from "./SoundManager";
import { Logger } from "./Logger";
import { UIElements } from "./UI";
import i18n from "./I18n";

export class Shop {
	ctx: any;

	constructor(ctx: any) {
		this.ctx = ctx;
	}

	openShop() {
		return new Promise((resolve) => {
			UIElements.shop.container.innerHTML = "";

			const stock = this.generateShopStock().map((it) => ({
				...it,
				sold: false,
			}));

			const uiCards: {
				item: (typeof stock)[0];
				btn: HTMLButtonElement;
			}[] = [];

			const refresh = () => {
				UIElements.shop.gold.textContent = this.ctx.gold;
				uiCards.forEach(({ item, btn }) => {
					if (item.sold) {
						btn.textContent = i18n.t("shop.button.purchased");
						btn.className =
							"mt-2 px-3 py-2 rounded font-bold bg-slate-700 text-slate-300 cursor-not-allowed";
						btn.disabled = true;
						return;
					}

					const afford = this.ctx.gold >= item.price;
					btn.disabled = !afford;
					btn.textContent = i18n.t(`shop.button.${afford ? "purchased" : "not_enough"}`);
					btn.className = `mt-2 px-3 py-2 rounded font-bold ${
						afford
							? "bg-white text-black hover:bg-gray-200"
							: "bg-slate-700 text-slate-300 cursor-not-allowed"
					}`;
				});
			};

			stock.forEach((item) => {
				const card = document.createElement("div");
				card.className =
					"bg-slate-800/80 p-4 rounded-lg border border-slate-600 flex flex-col gap-2";

				card.innerHTML = `
					<div class="flex items-start justify-between gap-2">
						<div class="text-3xl">${item.icon}</div>
						<div class="text-right">
							<div class="text-[10px] text-slate-400 tracking-widest">${i18n.t("label.price")}</div>
							<div class="text-lg font-black text-amber-200 pixel-font">${item.price}</div>
						</div>
					</div>
					<div class="font-bold text-yellow-300">${item.name}</div>
					<div class="text-xs text-slate-200">${item.desc}</div>
					<button class="mt-2 px-3 py-2 rounded font-bold">${i18n.t("shop.button.buy")}}</button>
				`;

				const btn = card.querySelector("button")!;
				uiCards.push({ item, btn });

				btn.onclick = () => {
					if (item.sold) return;
					if (this.ctx.gold < item.price) {
						soundManager.play("invalid");
						refresh();
						return;
					}

					if (!this.buyShopItem(item)) {
						soundManager.play("invalid");
						refresh();
						return;
					}

					item.sold = true;
					refresh();
				};

				UIElements.shop.container.appendChild(card);
			});

			UIElements.shop.skip_button.onclick = () => {
				UIElements.shop.modal.classList.add("hidden");
				resolve(null);
			};

			refresh();
			UIElements.shop.modal.classList.remove("hidden");
		});
	}

	generateShopStock() {
		const coupon = this.ctx.hasArtifact("coupon");
		const stock: any[] = [];

		// normal items
		for (const item of SHOP_ITEMS) {
			if (item.available && !item.available(this.ctx)) continue;

			stock.push({
				...item,
				price: item.price(coupon),
				apply: () => item.apply(this.ctx),
			});
		}

		// artifact roll
		const availableArtifacts = ARTIFACTS.filter(
			(a) => !this.ctx.hasArtifact(a.id)
		);

		if (availableArtifacts.length > 0) {
			const bag: any[] = [];
			for (const a of availableArtifacts) {
				const r = a.rarity ?? 2;
				const w = r === 1 ? 5 : r === 2 ? 3 : 1;
				for (let i = 0; i < w; i++) bag.push(a);
			}

			const pick = bag[Math.floor(Math.random() * bag.length)];
			stock.push({
				type: "artifact",
				...pick,
				price: this.ctx.artifactPrice(pick),
				apply: () => this.ctx.addArtifact(pick),
			});
		}

		return stock.sort(() => Math.random() - 0.5).slice(0, 3);
	}

	buyShopItem(item: any) {
		if (this.ctx.gold < item.price) return false;

		this.ctx.gold -= item.price;
		item.apply?.();

		soundManager.play("place");
		this.ctx.updateUI();
		Logger.log(i18n.t("shop.buy", { item: item.name }));

		return true;
	}

	rollShop() {
		const base = this.ctx.hasArtifact("map") ? 0.35 : 0.22;
		return Math.random() < base;
	}
}
