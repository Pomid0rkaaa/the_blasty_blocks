import { ARTIFACTS } from './data/artifacts.js';
import { soundManager } from './soundManager.js';
import { Logger } from './logger.js';
import { Rewards } from './rewards.js';
import i18n from './i18n.js';

export class Shop {
    constructor(game) {
        this.game = game;
        this.rewards = new Rewards(this);
    }

    openShopThenRewards() {
        this.game.shopOpen = true;
        const modal = document.getElementById('shop-modal');
        const container = document.getElementById('shop-container');
        const goldEl = document.getElementById('shop-gold');
        const skipBtn = document.getElementById('shop-skip');

        container.innerHTML = '';

        const stock = this.generateShopStock().map((it) => ({
            ...it,
            sold: false,
        }));
        const uiCards = [];

        const refresh = () => {
            goldEl.textContent = this.game.gold;
            uiCards.forEach(({ item, btn }) => {
                if (item.sold) {
                    btn.textContent = 'КУПЛЕНО';
                    btn.className =
                        'mt-2 px-3 py-2 rounded font-bold bg-slate-700 text-slate-300 cursor-not-allowed';
                    btn.disabled = true;
                    return;
                }
                const afford = this.game.gold >= item.price;
                btn.disabled = !afford;
                btn.textContent = afford ? 'КУПИТЬ' : 'НЕ ХВАТАЕТ';
                btn.className = `mt-2 px-3 py-2 rounded font-bold ${
                    afford
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
            uiCards.push({ item, btn });

            btn.onclick = () => {
                if (item.sold) return;
                if (this.game.gold < item.price) {
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
                this.game.unlockAchievement('shopper');
                refresh();
            };

            container.appendChild(card);
        });

        skipBtn.onclick = () => {
            modal.classList.add('hidden');
            this.game.shopOpen = false;
            this.game.rewards.generateRewards();
            document
                .getElementById('victory-modal')
                .classList.remove('hidden');
        };

        refresh();
        modal.classList.remove('hidden');
    }

    generateShopStock() {
        const stock = [];

        stock.push({
            type: 'stat',
            id: 'heal',
            name: 'Аптечка',
            desc: '+25 HP',
            icon: '🧃',
            price: this.game.hasArtifact('coupon') ? 32 : 40,
            apply: () => this.game.healPlayer(25),
        });
        stock.push({
            type: 'stat',
            id: 'shield',
            name: 'Пластина',
            desc: '+25 щита',
            icon: '🛡️',
            price: this.game.hasArtifact('coupon') ? 36 : 45,
            apply: () => {
                this.game.shield += 25;
            },
        });
        stock.push({
            type: 'stat',
            id: 'clean',
            name: 'Сапёр',
            desc: 'Убрать 5 случайных клеток (кроме дыр)',
            icon: '🧽',
            price: this.game.hasArtifact('coupon') ? 44 : 55,
            apply: () => this.game.removeRandomFilledCells(5),
        });

        const available = ARTIFACTS.filter(
            (a) => !this.game.hasArtifact(a.id)
        );
        if (available.length > 0) {
            const bag = [];
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
                price: this.game.artifactPrice(pick),
                apply: () => this.game.addArtifact(pick),
            });
        } else {
            stock.push({
                type: 'stat',
                id: 'gold',
                name: 'Сундучок',
                desc: '+60 золота',
                icon: '🧰',
                price: this.game.hasArtifact('coupon') ? 52 : 65,
                apply: () => {
                    this.game.gold += 60;
                },
            });
        }

        return stock.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    buyShopItem(item) {
        if (this.game.gold < item.price) return false;
        this.game.gold -= item.price;
        if (item.apply) item.apply();
        soundManager.play('place');
        this.game.updateUI();
        Logger.log(i18n.t('shop.buy', { item: item.name }));
        return true;
    }

    rollShop() {
        const base = this.game.hasArtifact('map') ? 0.35 : 0.22;
        return Math.random() < base;
    }
}