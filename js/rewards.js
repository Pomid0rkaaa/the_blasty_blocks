import { ARTIFACTS } from './data/artifacts.js';
import { soundManager } from './soundManager.js';
import { Logger } from './logger.js';
import i18n from './i18n.js';


export class Rewards {
    constructor(ctx) {
        this.ctx = ctx;
    }

    generateRewards() {
        return new Promise((resolve) => {
            const container = document.getElementById("reward-container");

            container.innerHTML = "";
            const choices = [];

            // Всегда: одно исцеление
            choices.push({
                type: "stat",
                id: "heal",
                name: "Зелье",
                desc: "+30 HP",
                icon: "❤️",
            });

            // Одно улучшение
            const r = Math.random();
            if (r < 0.3)
                choices.push({
                    type: "stat",
                    id: "maxhp",
                    name: "Выносливость",
                    desc: "+10 Max HP",
                    icon: "💪",
                });
            else if (r < 0.6)
                choices.push({
                    type: "stat",
                    id: "shield",
                    name: "Броня",
                    desc: "+20 щита",
                    icon: "🛡️",
                });
            else
                choices.push({
                    type: "stat",
                    id: "gold",
                    name: "Кошель",
                    desc: "+40 золота",
                    icon: "🪙",
                });

            // Один артефакт
            const available = ARTIFACTS.filter(
                (a) => !this.ctx.hasArtifact(a.id)
            );
            if (available.length > 0) {
                const bag = [];
                available.forEach((a) => {
                    const rr = a.rarity || 2;
                    const w = rr === 1 ? 5 : rr === 2 ? 3 : 1;
                    for (let i = 0; i < w; i++) bag.push(a);
                });
                const art = bag[Math.floor(Math.random() * bag.length)];
                choices.push({ type: "artifact", ...art });
            } else {
                choices.push({
                    type: "stat",
                    id: "full",
                    name: "Полный отдых",
                    desc: "Полное лечение",
                    icon: "💖",
                });
            }

            choices.forEach((choice) => {
                const card = document.createElement("div");
                card.className =
                    "flex-1 bg-slate-800/80 p-4 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 hover:border-white hover:scale-[1.03] transition-all flex flex-col items-center gap-2";

                const price =
                    choice.type === "artifact"
                        ? ` <span class="text-[10px] text-slate-400">(редк. ${choice.rarity || 2})</span>`
                        : "";
                card.innerHTML = `
                    <div class="text-3xl">${choice.icon}</div>
                    <div class="font-bold text-yellow-300 text-center">${choice.name}${price}</div>
                    <div class="text-xs text-slate-200 text-center">${choice.desc}</div>
                `;
                card.onclick = () => { 
                    this.selectReward(choice);
                    resolve()
                }
                container.appendChild(card);
            });
        })
    }

    selectReward(reward) {
        if (reward.type === "stat") {
            if (reward.id === "heal") this.ctx.healPlayer(30);
            if (reward.id === "maxhp") {
                this.ctx.maxHp += 10;
                this.ctx.healPlayer(10);
            }
            if (reward.id === "full") this.ctx.healPlayer(1000);
            if (reward.id === "shield") this.ctx.shield += 20;
            if (reward.id === "gold") this.ctx.gold += 40;
        } else if (reward.type === "artifact") {
            this.ctx.addArtifact(reward);
        }

        soundManager.play("place");
    }
}