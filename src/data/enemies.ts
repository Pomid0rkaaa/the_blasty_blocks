import { Logger } from "../Logger.js";
import { UIElements } from "../UI.js";
import i18n from "../I18n.js";

import type { IEnemy } from "../types";
import type { Game } from "../Game.js";

export const ENEMIES: IEnemy[] = [
    // Regular
    {
        id: "slime",
        kind: "enemy",
        get name() { return i18n.t("enemy.slime") },
        get desc() { return i18n.t("enemy.slime.desc") },
        theme: "theme-forest",
        style: "boss-slime",
        element: "poison",
        hpMod: 0.9,
        atkMod: 0.85,
        trackId: "toxic",
        ability: (g: Game) => {
            if (Math.random() < 0.25) {
                g.enemy.HP += 8;
                Logger.log(i18n.t("enemy.slime.ability"));
                g.spawnFloatingText(
                    "REGEN",
                    UIElements.enemy.sprite,
                    "#22c55e"
                );
            }
        },
    },
    {
        id: "magma",
        kind: "enemy",
        get name() { return i18n.t("enemy.magma") },
        get desc() { return i18n.t("enemy.magma.desc") },
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 0.85,
        atkMod: 1.25,
        trackId: "magma",
        ability: (g: Game) => {
            if (g.player.DEF > 0) {
                g.player.DEF = Math.floor(g.player.DEF * 0.6);
                Logger.log(i18n.t("enemy.magma.ability"));
                g.spawnFloatingText(
                    "MELT",
                    UIElements.player.hp_bar,
                    "#fb7185"
                );
            }
        },
    },
    {
        id: "void",
        kind: "enemy",
        get name() { return i18n.t("enemy.void") },
        get desc() { return i18n.t("enemy.void.desc") },
        theme: "theme-void",
        style: "boss-void",
        element: "void",
        hpMod: 0.95,
        atkMod: 1.05,
        trackId: "void",
        ability: (g: Game) => {
            g.player.HP -= 2;
            g.damageTakenThisFight += 2;
            Logger.log(i18n.t("enemy.void.ability"));
            g.spawnFloatingText(2, UIElements.player.hp_bar, "#a78bfa");
        },
    },
    {
        id: "ice",
        kind: "enemy",
        get name() { return i18n.t("enemy.ice") },
        get desc() { return i18n.t("enemy.ice.desc") },
        theme: "theme-ice",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.25,
        atkMod: 0.8,
        trackId: "ice",
        ability: (g: Game) => {
            g.enemy.DEF += 6;
            Logger.log(i18n.t("enemy.ice.ability"));
            g.spawnFloatingText(
                "+6 DEF",
                UIElements.enemy.sprite,
                "#67e8f9"
            );
        },
    },
    {
        id: "storm",
        kind: "enemy",
        get name() { return i18n.t("enemy.storm") },
        get desc() { return i18n.t("enemy.storm.desc") },
        theme: "theme-storm",
        style: "boss-storm",
        element: "storm",
        hpMod: 0.95,
        atkMod: 1.1,
        trackId: "storm",
        ability: (g: Game) => {
            if (Math.random() < 0.35) {
                g.player.status.add("shock", 1);
                Logger.log(i18n.t("enemy.storm.ability"));
                g.spawnFloatingText(
                    "SHOCK",
                    UIElements.player.hp_bar,
                    "#facc15"
                );
            }
        },
    },
    {
        id: "sand",
        kind: "enemy",
        get name() { return i18n.t("enemy.sand") },
        get desc() { return i18n.t("enemy.sand.desc") },
        theme: "theme-desert",
        style: "boss-sand",
        element: "earth",
        hpMod: 1.05,
        atkMod: 0.95,
        ability: (g: Game) => {
            if (Math.random() < 0.35) {
                g.spawnRandom(2, "ROCK");
                Logger.log(i18n.t("enemy.sand.ability"));
                g.spawnFloatingText(
                    "SAND!",
                    UIElements.enemy.sprite,
                    "#fbbf24"
                );
            }
        },
    },
    {
        id: "robot",
        kind: "enemy",
        get name() { return i18n.t("enemy.robot") },
        get desc() { return i18n.t("enemy.robot.desc") },
        theme: "theme-ocean",
        style: "boss-robot",
        element: "storm",
        hpMod: 0.9,
        atkMod: 1.15,
        ability: (g: Game) => {
            g.enemy.DEF += 5;
            Logger.log(i18n.t("enemy.robot.ability"));
        },
    },
    {
        id: "fungus",
        kind: "enemy",
        get name() { return i18n.t("enemy.fungus") },
        get desc() { return i18n.t("enemy.fungus.desc") },
        theme: "theme-crypt",
        style: "boss-fungus",
        element: "poison",
        hpMod: 1.1,
        atkMod: 0.9,
        ability: (g: Game) => {
            if (Math.random() < 0.3) {
                g.player.status.add("poison", 2);
                Logger.log(i18n.t("enemy.fungus.ability"));
                g.spawnFloatingText(
                    "SPORES",
                    UIElements.player.hp_bar,
                    "#22c55e"
                );
            }
        },
    },

    // Extra enemies
    {
        id: "scarab",
        kind: "enemy",
        get name() { return i18n.t("enemy.scarab") },
        get desc() { return i18n.t("enemy.scarab.desc") },
        theme: "theme-desert",
        style: "boss-scarab",
        element: "earth",
        hpMod: 0.95,
        atkMod: 1.05,
        ability: (g: Game) => {
            if (Math.random() < 0.45) {
                g.enemy.DEF += 4;
                g.spawnRandom(1, "ROCK");
                Logger.log(i18n.t("enemy.scarab.ability"));
            }
        },
    },
    {
        id: "siren",
        kind: "enemy",
        get name() { return i18n.t("enemy.siren") },
        get desc() { return i18n.t("enemy.siren.desc") },
        theme: "theme-ocean",
        style: "boss-void",
        element: "ice",
        hpMod: 0.92,
        atkMod: 1.0,
        ability: (g: Game) => {
            if (Math.random() < 0.35) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                Logger.log(i18n.t("enemy.siren.ability"));
                g.spawnFloatingText(
                    "FREEZE",
                    UIElements.enemy.sprite,
                    "#67e8f9"
                );
            }
        },
    },
    {
        id: "pyro",
        kind: "enemy",
        get name() { return i18n.t("enemy.pyro") },
        get desc() { return i18n.t("enemy.pyro.desc") },
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 0.92,
        atkMod: 1.0,
        ability: (g: Game) => {
            if (Math.random() < 0.4) {
                g.player.status.add("burn", 2);
                Logger.log(i18n.t("enemy.pyro.ability"));
                g.spawnFloatingText(
                    "BURN",
                    UIElements.player.hp_bar,
                    "#fb7185"
                );
            }
        },
    },
    {
        id: "mechanist",
        kind: "enemy",
        get name() { return i18n.t("enemy.mechanist") },
        get desc() { return i18n.t("enemy.mechanist.desc") },
        theme: "theme-lab",
        style: "boss-robot",
        element: "storm",
        hpMod: 1.0,
        atkMod: 0.95,
        ability: (g: Game) => {
            if (Math.random() < 0.28) {
                g.spawnRandom(2, "GARBAGE");
                g.enemy.DEF += 3;
                Logger.log(i18n.t("enemy.mechanist.ability"));
            }
        },
    },
    {
        id: "wisp",
        kind: "enemy",
        get name() { return i18n.t("enemy.wisp") },
        get desc() { return i18n.t("enemy.wisp.desc") },
        theme: "theme-cosmos",
        style: "boss-wisp",
        element: "void",
        hpMod: 0.8,
        atkMod: 1.0,
        ability: (g: Game) => {
            if (Math.random() < 0.45) {
                g.player.status.add("weak", 1);
                Logger.log(i18n.t("enemy.wisp.ability.weak"));
                g.spawnFloatingText(
                    "WEAK",
                    UIElements.player.hp_bar,
                    "#60a5fa"
                );
            } else if (Math.random() < 0.35) {
                g.player.status.add("shock", 1);
                Logger.log(i18n.t("enemy.wisp.ability.shock"));
                g.spawnFloatingText(
                    "SHOCK",
                    UIElements.player.hp_bar,
                    "#facc15"
                );
            }
        },
    },
    {
        id: "brute",
        kind: "enemy",
        get name() { return i18n.t("enemy.brute") },
        get desc() { return i18n.t("enemy.brute.desc") },
        theme: "theme-blood",
        style: "boss-brute",
        element: "earth",
        hpMod: 1.15,
        atkMod: 1.05,
        ability: (g: Game) => {
            if (Math.random() < 0.3) {
                g.spawnRandom(3, "GARBAGE");
                Logger.log(i18n.t("enemy.brute.ability"));
                g.spawnFloatingText(
                    "TRASH",
                    UIElements.enemy.sprite,
                    "#cbd5e1"
                );
            }
        },
    },
    {
        id: "cultist",
        kind: "enemy",
        get name() { return i18n.t("enemy.cultist") },
        get desc() { return i18n.t("enemy.cultist.desc") },
        theme: "theme-crypt",
        style: "boss-cultist",
        element: "void",
        hpMod: 0.95,
        atkMod: 0.9,
        ability: (g: Game) => {
            g.enemy.ATK = Math.ceil(g.enemy.ATK * 1.06);
            Logger.log(i18n.t("enemy.cultist.ability"));
            g.spawnFloatingText(
                "CHANT",
                UIElements.enemy.sprite,
                "#a78bfa"
            );
        },
    },
    {
        id: "wardenling",
        kind: "enemy",
        get name() { return i18n.t("enemy.wardenling") },
        get desc() { return i18n.t("enemy.wardenling.desc") },
        theme: "theme-lab",
        style: "boss-warden",
        element: "storm",
        hpMod: 0.9,
        atkMod: 1.0,
        ability: (g: Game) => {
            if (Math.random() < 0.35 && g.player.DEF > 0) {
                const take = Math.min(8, g.player.DEF);
                g.player.DEF -= take;
                g.enemy.DEF += take;
                Logger.log(i18n.t("enemy.wardenling.ability", {take}));
                g.spawnFloatingText(
                    "-SHD",
                    UIElements.player.hp_bar,
                    "#60a5fa"
                );
            }
        },
    },

    // New enemies (more unique)
    {
        id: "assassin",
        kind: "enemy",
        get name() { return i18n.t("enemy.assassin") },
        get desc() { return i18n.t("enemy.assassin.desc") },
        theme: "theme-abyss",
        style: "boss-void",
        element: "void",
        hpMod: 0.78,
        atkMod: 1.35,
        ability: (g: Game) => {
            if (Math.random() < 0.35) {
                g.player.status.add("weak", 1);
                Logger.log(i18n.t("enemy.assassin.ability"));
            }
        },
    },
    {
        id: "bloom",
        kind: "enemy",
        get name() { return i18n.t("enemy.bloom") },
        get desc() { return i18n.t("enemy.bloom.desc") },
        theme: "theme-toxic",
        style: "boss-fungus",
        element: "poison",
        hpMod: 0.95,
        atkMod: 0.9,
        ability: (g: Game) => {
            g.player.status.add("poison", 1);
            if (Math.random() < 0.25)
                g.player.status.add("poison", 1);
            Logger.log(i18n.t("enemy.bloom.ability"));
        },
    },
    {
        id: "mason",
        kind: "enemy",
        get name() { return i18n.t("enemy.mason") },
        get desc() { return i18n.t("enemy.mason.desc") },
        theme: "theme-ruins",
        style: "boss-colossus",
        element: "earth",
        hpMod: 1.1,
        atkMod: 0.9,
        ability: (g: Game) => {
            if (Math.random() < 0.5) {
                g.spawnRandom(2, "ROCK");
                g.enemy.DEF += 3;
                Logger.log(i18n.t("enemy.mason.ability"));
            }
        },
    },
    {
        id: "seer",
        kind: "enemy",
        get name() { return i18n.t("enemy.seer") },
        get desc() { return i18n.t("enemy.seer.desc") },
        theme: "theme-dream",
        style: "boss-oracle",
        element: "void",
        hpMod: 0.9,
        atkMod: 0.95,
        ability: (g: Game) => {
            if (Math.random() < 0.35 && g.player.DEF > 0) {
                const cut = Math.min(10, g.player.DEF);
                g.player.DEF -= cut;
                Logger.log(i18n.t("enemy.seer.ability.shield"));
            }
            if (Math.random() < 0.3) {
                g.player.status.add("shock", 1);
                Logger.log(i18n.t("enemy.seer.ability.shock"));
            }
        },
    },
    {
        id: "paladin",
        kind: "enemy",
        get name() { return i18n.t("enemy.paladin") },
        get desc() { return i18n.t("enemy.paladin.desc") },
        theme: "theme-gilded",
        style: "boss-priest",
        element: "light",
        hpMod: 1.0,
        atkMod: 0.95,
        ability: (g: Game) => {
            if (Math.random() < 0.35) {
                g.enemy.DEF += 6;
                g.enemy.HP += 6;
                Logger.log(i18n.t("enemy.paladin.ability"));
            }
        },
    },
    {
        id: "frostling",
        kind: "enemy",
        get name() { return i18n.t("enemy.frostling") },
        get desc() { return i18n.t("enemy.frostling.desc") },
        theme: "theme-tundra",
        style: "boss-ice",
        element: "ice",
        hpMod: 0.85,
        atkMod: 0.95,
        ability: (g: Game) => {
            if (Math.random() < 0.55) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                Logger.log(i18n.t("enemy.frostling.ability"));
            }
        },
    },

    // Boss-tier (every 5 floors)
    {
        id: "necro",
        kind: "boss",
        get name() { return i18n.t("enemy.necro") },
        get desc() { return i18n.t("enemy.necro.desc") },
        theme: "theme-neon",
        style: "boss-necro",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.05,
        ability: (g: Game) => {
            if (Math.random() < 0.5) {
                g.spawnRandom(3, "ROCK");
                Logger.log(i18n.t("enemy.necro.ability"));
                g.spawnFloatingText(
                    "CURSE",
                    UIElements.enemy.sprite,
                    "#a78bfa"
                );
            }
        },
    },
    {
        id: "tempest",
        kind: "boss",
        get name() { return i18n.t("enemy.tempest") },
        get desc() { return i18n.t("enemy.tempest.desc") },
        theme: "theme-storm",
        style: "boss-storm",
        element: "storm",
        hpMod: 1.25,
        atkMod: 1.2,
        ability: (g: Game) => {
            g.enemy.ATK = Math.floor(g.enemy.ATK * 1.05);
            g.player.status.add("shock", 1);
            Logger.log(i18n.t("enemy.tempest.ability"));
        },
    },
    {
        id: "wyrm",
        kind: "boss",
        get name() { return i18n.t("enemy.wyrm") },
        get desc() { return i18n.t("enemy.wyrm.desc") },
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 1.2,
        atkMod: 1.25,
        ability: (g: Game) => {
            g.player.status.add("burn", 2);
            Logger.log(i18n.t("enemy.wyrm.ability"));
            g.spawnFloatingText(
                "BURN",
                UIElements.player.hp_bar,
                "#fb7185"
            );
        },
    },
    {
        id: "archon",
        kind: "boss",
        get name() { return i18n.t("enemy.archon") },
        get desc() { return i18n.t("enemy.archon.desc") },
        theme: "theme-ice",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.45,
        atkMod: 0.95,
        ability: (g: Game) => {
            g.freezeNextHand = Math.min(2, g.freezeNextHand + 1);
            Logger.log(i18n.t("enemy.archon.ability"));
            g.spawnFloatingText(
                "FREEZE",
                UIElements.enemy.sprite,
                "#67e8f9"
            );
        },
    },
    {
        id: "hydra",
        kind: "boss",
        get name() { return i18n.t("enemy.hydra") },
        get desc() { return i18n.t("enemy.hydra.desc") },
        theme: "theme-forest",
        style: "boss-hydra",
        element: "poison",
        hpMod: 1.35,
        atkMod: 1.05,
        ability: (g: Game) => {
            if (Math.random() < 0.5) {
                g.player.status.add("poison", 2);
                Logger.log(i18n.t("enemy.hydra.ability.poison"));
            }
            if (Math.random() < 0.35) {
                g.enemy.HP += 10;
                Logger.log(i18n.t("enemy.hydra.ability.regen"));
            }
        },
    },
    {
        id: "colossus",
        kind: "boss",
        get name() { return i18n.t("enemy.colossus") },
        get desc() { return i18n.t("enemy.colossus.desc") },
        theme: "theme-desert",
        style: "boss-colossus",
        element: "earth",
        hpMod: 1.65,
        atkMod: 0.95,
        ability: (g: Game) => {
            g.enemy.DEF += 8;
            if (Math.random() < 0.4) g.spawnRandom(2, "ROCK");
            Logger.log(i18n.t("enemy.colossus.ability"));
        },
    },
    {
        id: "lich",
        kind: "boss",
        get name() { return i18n.t("enemy.lich") },
        get desc() { return i18n.t("enemy.lich.desc") },
        theme: "theme-void",
        style: "boss-lich",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.15,
        ability: (g: Game) => {
            g.spawnRandom(3, "GARBAGE");
            if (Math.random() < 0.5)
                g.player.status.add("weak", 1);
            Logger.log(i18n.t("enemy.lich.ability"));
        },
    },
    {
        id: "kraken",
        kind: "boss",
        get name() { return i18n.t("enemy.kraken") },
        get desc() { return i18n.t("enemy.kraken.desc") },
        theme: "theme-ocean",
        style: "boss-kraken",
        element: "ice",
        hpMod: 1.55,
        atkMod: 1.0,
        trackId: "boss_ice",
        ability: (g: Game) => {
            if (Math.random() < 0.5) {
                g.spawnRandom(1, "ROCK");
                Logger.log(i18n.t("enemy.kraken.ability.rocks"));
            }
            if (Math.random() < 0.35) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                Logger.log(i18n.t("enemy.kraken.ability.freeze"));
            }
        },
    },
    {
        id: "dragon",
        kind: "boss",
        get name() { return i18n.t("enemy.dragon") },
        get desc() { return i18n.t("enemy.dragon.desc") },
        theme: "theme-magma",
        style: "boss-dragon",
        element: "fire",
        hpMod: 1.55,
        atkMod: 1.1,
        trackId: "boss_fire",
        ability: (g: Game) => {
            g.player.status.add("burn", 2);
            if (Math.random() < 0.45) g.spawnRandom(2, "GARBAGE");
            Logger.log(i18n.t("enemy.dragon.ability"));
        },
    },
    {
        id: "mirror",
        kind: "boss",
        get name() { return i18n.t("enemy.mirror") },
        get desc() { return i18n.t("enemy.mirror.desc") },
        theme: "theme-cosmos",
        style: "boss-mirror",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.05,
        trackId: "boss_void",
        ability: (g: Game) => {
            if (Math.random() < 0.5) {
                g.player.status.add("weak", 1);
                Logger.log(i18n.t("enemy.mirror.ability"));
            }
            g.enemy.DEF += 6;
        },
    },
    {
        id: "warden",
        kind: "boss",
        get name() { return i18n.t("enemy.warden") },
        get desc() { return i18n.t("enemy.warden.desc") },
        theme: "theme-lab",
        style: "boss-warden",
        element: "storm",
        hpMod: 1.6,
        atkMod: 1.0,
        trackId: "boss_storm",
        ability: (g: Game) => {
            g.enemy.DEF += 10;
            if (Math.random() < 0.5) g.spawnRandom(3, "GARBAGE");
            Logger.log(i18n.t("enemy.warden.ability"));
        },
    },

    // New bosses
    {
        id: "oracle",
        kind: "boss",
        get name() { return i18n.t("enemy.oracle") },
        get desc() { return i18n.t("enemy.oracle.desc") },
        theme: "theme-dream",
        style: "boss-oracle",
        element: "void",
        hpMod: 1.45,
        atkMod: 1.05,
        trackId: "boss_void",
        ability: (g: Game) => {
            if (Math.random() < 0.55) {
                g.player.status.add("weak", 1);
                g.player.status.add("shock", 1);
                Logger.log(i18n.t("enemy.oracle.ability"));
            }
        },
    },
    {
        id: "toxicqueen",
        kind: "boss",
        get name() { return i18n.t("enemy.toxicqueen") },
        get desc() { return i18n.t("enemy.toxicqueen.desc") },
        theme: "theme-toxic",
        style: "boss-fungus",
        element: "poison",
        hpMod: 1.55,
        atkMod: 1.0,
        trackId: "boss_poison",
        ability: (g: Game) => {
            g.player.status.add("poison", 2);
            if (Math.random() < 0.55) g.spawnRandom(2, "GARBAGE");
            Logger.log(i18n.t("enemy.toxicqueen.ability"));
        },
    },
    {
        id: "behemoth",
        kind: "boss",
        get name() { return i18n.t("enemy.behemoth") },
        get desc() { return i18n.t("enemy.behemoth.desc") },
        theme: "theme-ruins",
        style: "boss-brute",
        element: "earth",
        hpMod: 1.8,
        atkMod: 0.95,
        trackId: "boss_earth",
        ability: (g: Game) => {
            g.spawnRandom(3, "ROCK");
            g.enemy.DEF += 6;
            Logger.log(i18n.t("enemy.behemoth.ability"));
        },
    },
    {
        id: "sunpriest",
        kind: "boss",
        get name() { return i18n.t("enemy.sunpriest") },
        get desc() { return i18n.t("enemy.sunpriest.desc") },
        theme: "theme-gilded",
        style: "boss-priest",
        element: "light",
        hpMod: 1.4,
        atkMod: 1.0,
        trackId: "boss_fire",
        ability: (g: Game) => {
            g.enemy.HP += 14;
            g.enemy.DEF += 8;
            Logger.log(i18n.t("enemy.sunpriest.ability"));
        },
    },
    {
        id: "frostwyrm",
        kind: "boss",
        get name() { return i18n.t("enemy.frostwyrm") },
        get desc() { return i18n.t("enemy.frostwyrm.desc") },
        theme: "theme-tundra",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.55,
        atkMod: 1.05,
        trackId: "boss_ice",
        ability: (g: Game) => {
            g.freezeNextHand = Math.min(2, g.freezeNextHand + 2);
            Logger.log(i18n.t("enemy.frostwyrm.ability"));
        },
    },

    // New Enemies
    {
        id: "vampire_bat",
        kind: "enemy",
        get name() { return i18n.t("enemy.vampire_bat") },
        get desc() { return i18n.t("enemy.vampire_bat.desc") },
        theme: "theme-blood",
        style: "boss-void",
        element: "void",
        hpMod: 0.9,
        atkMod: 1.1,
        ability: () => {
            Logger.log(
                i18n.t("enemy.vampire_bat.ability")
            ); /* TODO: Add logic */
        },
    },
    {
        id: "golem_sentry",
        kind: "enemy",
        get name() { return i18n.t("enemy.golem_sentry") },
        get desc() { return i18n.t("enemy.golem_sentry.desc") },
        theme: "theme-ruins",
        style: "boss-robot",
        element: "earth",
        hpMod: 1.3,
        atkMod: 0.8,
        ability: (g: Game) => {
            g.enemy.DEF += 4;
            Logger.log(i18n.t("enemy.golem_sentry.ability"));
        },
    },
    {
        id: "chaos_imp",
        kind: "enemy",
        get name() { return i18n.t("enemy.chaos_imp") },
        get desc() { return i18n.t("enemy.chaos_imp.desc") },
        theme: "theme-magma",
        style: "boss-imp",
        element: "fire",
        hpMod: 0.8,
        atkMod: 1.0,
        ability: (g: Game) => {
            const r = Math.random();
            if (r < 0.33) {
                g.player.status.add("burn", 1);
                Logger.log(i18n.t("enemy.chaos_imp.ability.burn"));
            } else if (r < 0.66) {
                g.spawnRandom(1, "GARBAGE");
                Logger.log(i18n.t("enemy.chaos_imp.ability.garbage"));
            } else {
                g.enemy.DEF += 3;
                Logger.log(i18n.t("enemy.chaos_imp.ability.shield"));
            }
        },
    },
    {
        id: "mimic",
        kind: "enemy",
        get name() { return i18n.t("enemy.mimic") },
        get desc() { return i18n.t("enemy.mimic.desc") },
        theme: "theme-gilded",
        style: "boss-chest",
        element: "earth",
        hpMod: 1.2,
        atkMod: 1.4,
        ability: (g: Game) => {
            if (Math.random() < 0.2) {
                g.player.GOLD = Math.max(0, g.player.GOLD - 5);
                Logger.log(i18n.t("enemy.mimic.ability"));
            }
        },
    },
    {
        id: "void_whale",
        kind: "enemy",
        get name() { return i18n.t("enemy.void_whale") },
        get desc() { return i18n.t("enemy.void_whale.desc") },
        theme: "theme-cosmos",
        style: "boss-whale",
        element: "void",
        hpMod: 1.8,
        atkMod: 0.8,
        trackId: "ethereal",
        ability: (g: Game) => {
            if (Math.random() < 0.4) {
                g.player.status.add("weak", 2);
                Logger.log(i18n.t("enemy.void_whale.ability"));
            }
        },
    },

    // New Bosses
    {
        id: "demon_lord",
        kind: "boss",
        get name() { return i18n.t("enemy.demon_lord") },
        get desc() { return i18n.t("enemy.demon_lord.desc") },
        theme: "theme-blood",
        style: "boss-demon",
        element: "fire",
        hpMod: 1.7,
        atkMod: 1.3,
        trackId: "boss_fire",
        ability: (g: Game) => {
            g.player.status.add("burn", 3);
            g.player.HP -= 3;
            Logger.log(i18n.t("enemy.demon_lord.ability"));
        },
    },
    {
        id: "quantum_core",
        kind: "boss",
        get name() { return i18n.t("enemy.quantum_core") },
        get desc() { return i18n.t("enemy.quantum_core.desc") },
        theme: "theme-lab",
        style: "boss-core",
        element: "storm",
        hpMod: 1.5,
        atkMod: 1.1,
        trackId: "boss_storm",
        ability: (g: Game) => {
            g.player.status.add("shock", 2);
            if (Math.random() < 0.2) {
                g.discardsThisFight++;
                Logger.log(i18n.t("enemy.quantum_core.ability"));
            }
        },
    },
    {
        id: "ancient_tree",
        kind: "boss",
        get name() { return i18n.t("enemy.ancient_tree") },
        get desc() { return i18n.t("enemy.ancient_tree.desc") },
        theme: "theme-forest",
        style: "boss-tree",
        element: "earth",
        hpMod: 2.0,
        atkMod: 0.9,
        trackId: "boss_earth",
        ability: (g: Game) => {
            g.enemy.HP += 15;
            g.spawnRandom(2, "ROCK");
            Logger.log(i18n.t("enemy.ancient_tree.ability"));
        },
    },
];
