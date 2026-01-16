import type { Artifact, Reward } from "./types";
import { ARTIFACTS } from "./data/artifacts";
import { soundManager } from "./SoundManager";
import { REWARDS } from "./data/rewards";
import i18n from "./I18n";

export class Rewards {
	ctx: any;
	constructor(ctx: any) {
		this.ctx = ctx;
	}

	generateRewards() {
		return new Promise((resolve) => {
			const container = document.getElementById("reward-container");
			if (!container) return;

			container.innerHTML = "";
			const choices: (Reward | ({ type: "artifact" } & Artifact))[] = [];
			const heal = REWARDS.find((obj) => obj.id === "heal");
			if (heal) choices.push(heal);
			const r = REWARDS.filter((e) => e.id !== "heal" && e.id !== "full");
			choices.push(r[Math.floor(Math.random() * r.length)]);

			const available = ARTIFACTS.filter(
				(a) => !this.ctx.hasArtifact(a.id)
			);
			if (available.length > 0) {
				const bag: Artifact[] = [];
				available.forEach((a) => {
					const rr = a.rarity || 2;
					const w = rr === 1 ? 5 : rr === 2 ? 3 : 1;
					for (let i = 0; i < w; i++) bag.push(a);
				});
				const art = bag[Math.floor(Math.random() * bag.length)];
				choices.push({ type: "artifact", ...art });
			} else {
				const full = REWARDS.find((obj) => obj.id === "full");
				if (full) choices.push(full);
			}

			choices.forEach((choice) => {
				const card = document.createElement("div");
				card.className =
					"flex-1 bg-slate-800/80 p-4 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-700 hover:border-white hover:scale-[1.03] transition-all flex flex-col items-center gap-2";

				const price =
					choice.type === "artifact"
						? ` <span class="text-[10px] text-slate-400">${i18n.t(
								"reward_modal.rarity",
								{ rarity: choice.rarity || 2 }
						    )}</span>`
						: "";
				card.innerHTML = `
                    <div class="text-3xl">${choice.icon}</div>
                    <div class="font-bold text-yellow-300 text-center">${choice.name}${price}</div>
                    <div class="text-xs text-slate-200 text-center">${choice.desc}</div>
                `;
				card.onclick = () => {
					this.selectReward(choice);
					resolve(null);
				};
				container.appendChild(card);
			});
		});
	}

	selectReward(reward: any) {
		if (reward.type === "stat")
			switch (reward.id) {
				case "heal":
					this.ctx.healPlayer(30);
					break;
				case "maxhp":
					this.ctx.maxHp += 10;
					this.ctx.healPlayer(10);
					break;
				case "full":
					this.ctx.healPlayer(1000);
					break;
				case "shield":
					this.ctx.shield += 20;
					break;
				case "gold":
					this.ctx.gold += 40;
			}
		else if (reward.type === "artifact") this.ctx.addArtifact(reward);

		soundManager.play("place");
	}
}
