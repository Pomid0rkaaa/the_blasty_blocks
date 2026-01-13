import { ARTIFACTS } from './data/artifacts';
import { soundManager } from './soundManager';
import { Logger } from './logger';
import { UIElements } from './ui';
import i18n from './i18n';

export class Shop {
    ctx: any;
    constructor(ctx: any) {
        this.ctx = ctx;
    }

    openShop() {
        return new Promise((resolve) => {
            UIElements.shop.container.innerHTML = '';

            const stock = this.generateShopStock().map((it) => ({
                ...it,
                sold: false,
            }));
            const uiCards: { item: (typeof stock)[0]; btn: HTMLButtonElement }[] = [];

            const refresh = () => {
                UIElements.shop.gold.textContent = this.ctx.gold;
                uiCards.forEach(({ item, btn }) => {
                    if (item.sold) {
                        btn.textContent = 'КУПЛЕНО';
                        btn.className =
                            'mt-2 px-3 py-2 rounded font-bold bg-slate-700 text-slate-300 cursor-not-allowed';
                        btn.disabled = true;
                        return;
                    }
                    const afford = this.ctx.gold >= item.price;
                    btn.disabled = !afford;
                    btn.textContent = afford ? 'КУПИТЬ' : 'НЕ ХВАТАЕТ';
                    btn.className = `mt-2 px-3 py-2 rounded font-bold ${afford
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        }`;
                });
            };

            stock.forEach((item) => {
                const card = document.createElement('div');
                card.className =
                    'bg-slate-800/80 p-4 rounded-lg border border-slate-600 flex flex-col gap-2';

                card.innerHTML = `
                    <div class="flex items-start justify-between gap-2">
                        <div class="text-3xl">${item.icon}</div>
                        <div class="text-right">
                            <div class="text-[10px] text-slate-400 tracking-widest">ЦЕНА</div>
                            <div class="text-lg font-black text-amber-200 pixel-font">${item.price}</div>
                        </div>
                    </div>
                    <div class="font-bold text-yellow-300">${item.name}</div>
                    <div class="text-xs text-slate-200">${item.desc}</div>
                    <button class="mt-2 px-3 py-2 rounded font-bold">КУПИТЬ</button>
                `;

                const btn = card.querySelector('button');
                if (btn) uiCards.push({ item, btn });

                if (btn) btn.onclick = () => {
                    if (item.sold) return;
                    if (this.ctx.gold < item.price) {
                        soundManager.play('invalid');
                        refresh();
                        return;
                    }
                    const ok = this.buyShopItem(item);
                    if (!ok) {
                        soundManager.play('invalid');
                        refresh();
                        return;
                    }
                    item.sold = true;
                    this.ctx.unlockAchievement('shopper');
                    refresh();
                };

                UIElements.shop.container.appendChild(card);
            });

            UIElements.shop.skip_button.onclick = () => {
                UIElements.shop.modal.classList.add('hidden');
                resolve(null);
            }

            refresh();
            UIElements.shop.modal.classList.remove('hidden');
        })
    }

    generateShopStock() {
        const stock: any[] = [];

        stock.push({
            type: 'stat',
            id: 'heal',
            name: 'Аптечка',
            desc: '+25 HP',
            icon: '🧃',
            price: this.ctx.hasArtifact('coupon') ? 32 : 40,
            apply: () => this.ctx.healPlayer(25),
        });
        stock.push({
            type: 'stat',
            id: 'shield',
            name: 'Пластина',
            desc: '+25 щита',
            icon: '🛡️',
            price: this.ctx.hasArtifact('coupon') ? 36 : 45,
            apply: () => {
                this.ctx.shield += 25;
            },
        });
        stock.push({
            type: 'stat',
            id: 'clean',
            name: 'Сапёр',
            desc: 'Убрать 5 случайных клеток (кроме дыр)',
            icon: '🧽',
            price: this.ctx.hasArtifact('coupon') ? 44 : 55,
            apply: () => this.ctx.removeRandomFilledCells(5),
        });

        const available = ARTIFACTS.filter(
            (a) => !this.ctx.hasArtifact(a.id)
        );
        if (available.length > 0) {
            const bag: any[] = [];
            available.forEach((a) => {
                const r = a.rarity ?? 2;
                const w = r === 1 ? 5 : r === 2 ? 3 : 1;
                for (let i = 0; i < w; i++) bag.push(a);
            });
            const pick =
                bag[Math.floor(Math.random() * bag.length)];
            stock.push({
                type: 'artifact',
                ...pick,
                price: this.ctx.artifactPrice(pick),
                apply: () => this.ctx.addArtifact(pick),
            });
        } else {
            stock.push({
                type: 'stat',
                id: 'gold',
                name: 'Сундучок',
                desc: '+60 золота',
                icon: '🧰',
                price: this.ctx.hasArtifact('coupon') ? 52 : 65,
                apply: () => {
                    this.ctx.gold += 60;
                },
            });
        }

        return stock.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    buyShopItem(item: any) {
        if (this.ctx.gold < item.price) return false;
        this.ctx.gold -= item.price;
        if (item.apply) item.apply();
        soundManager.play('place');
        this.ctx.updateUI();
        Logger.log(i18n.t('shop.buy', { item: item.name }));
        return true;
    }

    rollShop() {
        const base = this.ctx.hasArtifact('map') ? 0.35 : 0.22;
        return Math.random() < base;
    }
}
