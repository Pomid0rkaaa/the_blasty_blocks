export const ENEMIES = [
    // Regular
    {
        id: "slime",
        kind: "enemy",
        name: "Слизень",
        theme: "theme-forest",
        style: "boss-slime",
        element: "poison",
        hpMod: 0.9,
        atkMod: 0.85,
        desc: "Иногда регенит.",
        ability: (g) => {
            if (Math.random() < 0.25) {
                g.healEnemy(8);
                g.log("Слизень регенит +8");
                g.spawnFloatingText(
                    "REGEN",
                    g.ui.enemySprite,
                    "#22c55e"
                );
            }
        },
    },
    {
        id: "magma",
        kind: "enemy",
        name: "Огненный рыцарь",
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 0.85,
        atkMod: 1.25,
        desc: "Плавит щит героя.",
        ability: (g) => {
            if (g.shield > 0) {
                g.shield = Math.floor(g.shield * 0.6);
                g.log("Огонь плавит щит");
                g.spawnFloatingText(
                    "MELT",
                    g.ui.playerHpBar,
                    "#fb7185"
                );
            }
        },
    },
    {
        id: "void",
        kind: "enemy",
        name: "Кастер пустоты",
        theme: "theme-void",
        style: "boss-void",
        element: "void",
        hpMod: 0.95,
        atkMod: 1.05,
        desc: "Понемногу высасывает жизнь.",
        ability: (g) => {
            g.hp -= 2;
            g.damageTakenThisFight += 2;
            g.log("Пустота: -2 HP");
            g.spawnFloatingText(2, g.ui.playerHpBar, "#a78bfa");
        },
    },
    {
        id: "ice",
        kind: "enemy",
        name: "Ледяной голем",
        theme: "theme-ice",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.25,
        atkMod: 0.8,
        desc: "Наращивает броню.",
        ability: (g) => {
            g.enemyShield += 6;
            g.log("Голем: +6 ARM");
            g.spawnFloatingText(
                "+6 ARM",
                g.ui.enemySprite,
                "#67e8f9"
            );
        },
    },
    {
        id: "storm",
        kind: "enemy",
        name: "Грозовой идол",
        theme: "theme-storm",
        style: "boss-storm",
        element: "storm",
        hpMod: 0.95,
        atkMod: 1.1,
        desc: "Иногда накладывает шок.",
        ability: (g) => {
            if (Math.random() < 0.35) {
                g.addStatus("player", "shock", 1);
                g.log("Шок!");
                g.spawnFloatingText(
                    "SHOCK",
                    g.ui.playerHpBar,
                    "#facc15"
                );
            }
        },
    },
    {
        id: "sand",
        kind: "enemy",
        name: "Песчаный зверь",
        theme: "theme-desert",
        style: "boss-sand",
        element: "earth",
        hpMod: 1.05,
        atkMod: 0.95,
        desc: "Засыпает сетку камнями.",
        ability: (g) => {
            if (Math.random() < 0.35) {
                g.spawnRocks(2);
                g.log("Песок: +2 камня");
                g.spawnFloatingText(
                    "SAND!",
                    g.ui.enemySprite,
                    "#fbbf24"
                );
            }
        },
    },
    {
        id: "robot",
        kind: "enemy",
        name: "Стальной дрон",
        theme: "theme-ocean",
        style: "boss-robot",
        element: "storm",
        hpMod: 0.9,
        atkMod: 1.15,
        desc: "Генерирует щит.",
        ability: (g) => {
            g.enemyShield += 5;
            g.log("Дрон: +5 ARM");
        },
    },
    {
        id: "fungus",
        kind: "enemy",
        name: "Грибной король",
        theme: "theme-crypt",
        style: "boss-fungus",
        element: "poison",
        hpMod: 1.1,
        atkMod: 0.9,
        desc: "Ядовитые споры.",
        ability: (g) => {
            if (Math.random() < 0.3) {
                g.addStatus("player", "poison", 2);
                g.log("Споры: яд");
                g.spawnFloatingText(
                    "SPORES",
                    g.ui.playerHpBar,
                    "#22c55e"
                );
            }
        },
    },

    // Extra enemies
    {
        id: "scarab",
        kind: "enemy",
        name: "Скарабей",
        theme: "theme-desert",
        style: "boss-scarab",
        element: "earth",
        hpMod: 0.95,
        atkMod: 1.05,
        desc: "Зарывается в песок: броня и камни.",
        ability: (g) => {
            if (Math.random() < 0.45) {
                g.enemyShield += 4;
                g.spawnRocks(1);
                g.log("Скарабей: +4 ARM и камень");
            }
        },
    },
    {
        id: "siren",
        kind: "enemy",
        name: "Сирена",
        theme: "theme-ocean",
        style: "boss-void",
        element: "ice",
        hpMod: 0.92,
        atkMod: 1.0,
        desc: "Замораживает руку.",
        ability: (g) => {
            if (Math.random() < 0.35) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                g.log("Сирена: заморозка руки");
                g.spawnFloatingText(
                    "FREEZE",
                    g.ui.enemySprite,
                    "#67e8f9"
                );
            }
        },
    },
    {
        id: "pyro",
        kind: "enemy",
        name: "Пиромант",
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 0.92,
        atkMod: 1.0,
        desc: "Поджигает героя.",
        ability: (g) => {
            if (Math.random() < 0.4) {
                g.addStatus("player", "burn", 2);
                g.log("Пиромант: горение");
                g.spawnFloatingText(
                    "BURN",
                    g.ui.playerHpBar,
                    "#fb7185"
                );
            }
        },
    },
    {
        id: "mechanist",
        kind: "enemy",
        name: "Механист",
        theme: "theme-lab",
        style: "boss-robot",
        element: "storm",
        hpMod: 1.0,
        atkMod: 0.95,
        desc: "Ставит панели мусора и броню.",
        ability: (g) => {
            if (Math.random() < 0.28) {
                g.spawnGarbage(2);
                g.enemyShield += 3;
                g.log("Механист: мусор + броня");
            }
        },
    },
    {
        id: "wisp",
        kind: "enemy",
        name: "Светляк пустоты",
        theme: "theme-cosmos",
        style: "boss-wisp",
        element: "void",
        hpMod: 0.8,
        atkMod: 1.0,
        desc: "Сбивает с толку: Слабость/Шок.",
        ability: (g) => {
            if (Math.random() < 0.45) {
                g.addStatus("player", "weak", 1);
                g.log("Светляк: слабость");
                g.spawnFloatingText(
                    "WEAK",
                    g.ui.playerHpBar,
                    "#60a5fa"
                );
            } else if (Math.random() < 0.35) {
                g.addStatus("player", "shock", 1);
                g.log("Светляк: шок");
                g.spawnFloatingText(
                    "SHOCK",
                    g.ui.playerHpBar,
                    "#facc15"
                );
            }
        },
    },
    {
        id: "brute",
        kind: "enemy",
        name: "Бугай",
        theme: "theme-blood",
        style: "boss-brute",
        element: "earth",
        hpMod: 1.15,
        atkMod: 1.05,
        desc: "Грубой силой ломает сетку.",
        ability: (g) => {
            if (Math.random() < 0.3) {
                g.spawnGarbage(3);
                g.log("Бугай: +3 мусора");
                g.spawnFloatingText(
                    "TRASH",
                    g.ui.enemySprite,
                    "#cbd5e1"
                );
            }
        },
    },
    {
        id: "cultist",
        kind: "enemy",
        name: "Культист",
        theme: "theme-crypt",
        style: "boss-cultist",
        element: "void",
        hpMod: 0.95,
        atkMod: 0.9,
        desc: "С каждым ходом усиливается.",
        ability: (g) => {
            g.enemyAttack = Math.ceil(g.enemyAttack * 1.06);
            g.log("Культист усиливается");
            g.spawnFloatingText(
                "CHANT",
                g.ui.enemySprite,
                "#a78bfa"
            );
        },
    },
    {
        id: "wardenling",
        kind: "enemy",
        name: "Страж-бот",
        theme: "theme-lab",
        style: "boss-warden",
        element: "storm",
        hpMod: 0.9,
        atkMod: 1.0,
        desc: "Питается щитом: превращает щит героя в броню.",
        ability: (g) => {
            if (Math.random() < 0.35 && g.shield > 0) {
                const take = Math.min(8, g.shield);
                g.shield -= take;
                g.enemyShield += take;
                g.log(`Страж: украл ${take} щита`);
                g.spawnFloatingText(
                    "-SHD",
                    g.ui.playerHpBar,
                    "#60a5fa"
                );
            }
        },
    },

    // New enemies (more unique)
    {
        id: "assassin",
        kind: "enemy",
        name: "Теневой убийца",
        theme: "theme-abyss",
        style: "boss-void",
        element: "void",
        hpMod: 0.78,
        atkMod: 1.35,
        desc: "Высокий урон, но хрупкий. Иногда накладывает слабость.",
        ability: (g) => {
            if (Math.random() < 0.35) {
                g.addStatus("player", "weak", 1);
                g.log("Убийца: слабость");
            }
        },
    },
    {
        id: "bloom",
        kind: "enemy",
        name: "Ядовитый цветок",
        theme: "theme-toxic",
        style: "boss-fungus",
        element: "poison",
        hpMod: 0.95,
        atkMod: 0.9,
        desc: "Травит и “цветёт”: больше яда со временем.",
        ability: (g) => {
            g.addStatus("player", "poison", 1);
            if (Math.random() < 0.25)
                g.addStatus("player", "poison", 1);
            g.log("Цветок: яд");
        },
    },
    {
        id: "mason",
        kind: "enemy",
        name: "Каменный мастер",
        theme: "theme-ruins",
        style: "boss-colossus",
        element: "earth",
        hpMod: 1.1,
        atkMod: 0.9,
        desc: "Поднимает камни и броню.",
        ability: (g) => {
            if (Math.random() < 0.5) {
                g.spawnRocks(2);
                g.enemyShield += 3;
                g.log("Мастер: камни + броня");
            }
        },
    },
    {
        id: "seer",
        kind: "enemy",
        name: "Провидец",
        theme: "theme-dream",
        style: "boss-oracle",
        element: "void",
        hpMod: 0.9,
        atkMod: 0.95,
        desc: "Искажает: снимает щит и даёт шок.",
        ability: (g) => {
            if (Math.random() < 0.35 && g.shield > 0) {
                const cut = Math.min(10, g.shield);
                g.shield -= cut;
                g.log("Провидец: -щит");
            }
            if (Math.random() < 0.3) {
                g.addStatus("player", "shock", 1);
                g.log("Провидец: шок");
            }
        },
    },
    {
        id: "paladin",
        kind: "enemy",
        name: "Светлый страж",
        theme: "theme-gilded",
        style: "boss-priest",
        element: "light",
        hpMod: 1.0,
        atkMod: 0.95,
        desc: "Периодически лечится/ставит броню.",
        ability: (g) => {
            if (Math.random() < 0.35) {
                g.enemyShield += 6;
                g.healEnemy(6);
                g.log("Страж света: +ARM и лечение");
            }
        },
    },
    {
        id: "frostling",
        kind: "enemy",
        name: "Ледышка",
        theme: "theme-tundra",
        style: "boss-ice",
        element: "ice",
        hpMod: 0.85,
        atkMod: 0.95,
        desc: "Часто замораживает руку.",
        ability: (g) => {
            if (Math.random() < 0.55) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                g.log("Ледышка: заморозка руки");
            }
        },
    },

    // Boss-tier (every 5 floors)
    {
        id: "necro",
        kind: "boss",
        name: "Некромант",
        theme: "theme-neon",
        style: "boss-necro",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.05,
        desc: "Проклинает клетки (камни).",
        ability: (g) => {
            if (Math.random() < 0.5) {
                g.spawnRocks(3);
                g.log("Некромант: проклятье (+3 камня)");
                g.spawnFloatingText(
                    "CURSE",
                    g.ui.enemySprite,
                    "#a78bfa"
                );
            }
        },
    },
    {
        id: "tempest",
        kind: "boss",
        name: "Властелин бури",
        theme: "theme-storm",
        style: "boss-storm",
        element: "storm",
        hpMod: 1.25,
        atkMod: 1.2,
        desc: "Шокирует и усиливается.",
        ability: (g) => {
            g.enemyAttack = Math.floor(g.enemyAttack * 1.05);
            g.addStatus("player", "shock", 1);
            g.log("Буря усиливается");
        },
    },
    {
        id: "wyrm",
        kind: "boss",
        name: "Пламенный червь",
        theme: "theme-magma",
        style: "boss-magma",
        element: "fire",
        hpMod: 1.2,
        atkMod: 1.25,
        desc: "Поджигает героя.",
        ability: (g) => {
            g.addStatus("player", "burn", 2);
            g.log("Червь: горение");
            g.spawnFloatingText(
                "BURN",
                g.ui.playerHpBar,
                "#fb7185"
            );
        },
    },
    {
        id: "archon",
        kind: "boss",
        name: "Архон льда",
        theme: "theme-ice",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.45,
        atkMod: 0.95,
        desc: "Замораживает руку сильнее.",
        ability: (g) => {
            g.freezeNextHand = Math.min(2, g.freezeNextHand + 1);
            g.log("Архон: заморозка руки");
            g.spawnFloatingText(
                "FREEZE",
                g.ui.enemySprite,
                "#67e8f9"
            );
        },
    },
    {
        id: "hydra",
        kind: "boss",
        name: "Гидра",
        theme: "theme-forest",
        style: "boss-hydra",
        element: "poison",
        hpMod: 1.35,
        atkMod: 1.05,
        desc: "Споры и регенерация.",
        ability: (g) => {
            if (Math.random() < 0.5) {
                g.addStatus("player", "poison", 2);
                g.log("Гидра: яд");
            }
            if (Math.random() < 0.35) {
                g.healEnemy(10);
                g.log("Гидра: реген +10");
            }
        },
    },
    {
        id: "colossus",
        kind: "boss",
        name: "Колосс",
        theme: "theme-desert",
        style: "boss-colossus",
        element: "earth",
        hpMod: 1.65,
        atkMod: 0.95,
        desc: "Засоряет поле и держит броню.",
        ability: (g) => {
            g.enemyShield += 8;
            if (Math.random() < 0.4) g.spawnRocks(2);
            g.log("Колосс: броня/камни");
        },
    },
    {
        id: "lich",
        kind: "boss",
        name: "Лич",
        theme: "theme-void",
        style: "boss-lich",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.15,
        desc: "Проклятие: мусор и слабость.",
        ability: (g) => {
            g.spawnGarbage(3);
            if (Math.random() < 0.5)
                g.addStatus("player", "weak", 1);
            g.log("Лич: проклятие");
        },
    },
    {
        id: "kraken",
        kind: "boss",
        name: "Кракен",
        theme: "theme-ocean",
        style: "boss-kraken",
        element: "ice",
        hpMod: 1.55,
        atkMod: 1.0,
        desc: "Тянет на дно: провалы и заморозка.",
        ability: (g) => {
            if (Math.random() < 0.5) {
                g.spawnRocks(1);
                g.log("Кракен: провал");
            }
            if (Math.random() < 0.35) {
                g.freezeNextHand = Math.min(
                    2,
                    g.freezeNextHand + 1
                );
                g.log("Кракен: заморозка руки");
            }
        },
    },
    {
        id: "dragon",
        kind: "boss",
        name: "Дракон",
        theme: "theme-magma",
        style: "boss-dragon",
        element: "fire",
        hpMod: 1.55,
        atkMod: 1.1,
        desc: "Жар и пепел: горение и мусор.",
        ability: (g) => {
            g.addStatus("player", "burn", 2);
            if (Math.random() < 0.45) g.spawnGarbage(2);
            g.log("Дракон: пламя");
        },
    },
    {
        id: "mirror",
        kind: "boss",
        name: "Зеркальный дух",
        theme: "theme-cosmos",
        style: "boss-mirror",
        element: "void",
        hpMod: 1.35,
        atkMod: 1.05,
        desc: "Искажает: слабость и броня.",
        ability: (g) => {
            if (Math.random() < 0.5) {
                g.addStatus("player", "weak", 1);
                g.log("Зеркало: слабость");
            }
            g.enemyShield += 6;
        },
    },
    {
        id: "warden",
        kind: "boss",
        name: "Главный страж",
        theme: "theme-lab",
        style: "boss-warden",
        element: "storm",
        hpMod: 1.6,
        atkMod: 1.0,
        desc: "Панели и броня: мусор + армор.",
        ability: (g) => {
            g.enemyShield += 10;
            if (Math.random() < 0.5) g.spawnGarbage(3);
            g.log("Страж: укрепление");
        },
    },

    // New bosses
    {
        id: "oracle",
        kind: "boss",
        name: "Оракул",
        theme: "theme-dream",
        style: "boss-oracle",
        element: "void",
        hpMod: 1.45,
        atkMod: 1.05,
        desc: "Меняет правила: усиливает слабость и шок.",
        ability: (g) => {
            if (Math.random() < 0.55) {
                g.addStatus("player", "weak", 1);
                g.addStatus("player", "shock", 1);
                g.log("Оракул: слабость+шок");
            }
        },
    },
    {
        id: "toxicqueen",
        kind: "boss",
        name: "Ядовитая королева",
        theme: "theme-toxic",
        style: "boss-fungus",
        element: "poison",
        hpMod: 1.55,
        atkMod: 1.0,
        desc: "Засоряет и травит.",
        ability: (g) => {
            g.addStatus("player", "poison", 2);
            if (Math.random() < 0.55) g.spawnGarbage(2);
            g.log("Королева: яд/мусор");
        },
    },
    {
        id: "behemoth",
        kind: "boss",
        name: "Бегемот руин",
        theme: "theme-ruins",
        style: "boss-brute",
        element: "earth",
        hpMod: 1.8,
        atkMod: 0.95,
        desc: "Огромный. Давит камнями и бронёй.",
        ability: (g) => {
            g.spawnRocks(3);
            g.enemyShield += 6;
            g.log("Бегемот: камни + ARM");
        },
    },
    {
        id: "sunpriest",
        kind: "boss",
        name: "Жрец света",
        theme: "theme-gilded",
        style: "boss-priest",
        element: "light",
        hpMod: 1.4,
        atkMod: 1.0,
        desc: "Лечит себя и ставит броню, но слабее бьёт.",
        ability: (g) => {
            g.healEnemy(14);
            g.enemyShield += 8;
            g.log("Жрец: лечение + ARM");
        },
    },
    {
        id: "frostwyrm",
        kind: "boss",
        name: "Ледяной змей",
        theme: "theme-tundra",
        style: "boss-ice",
        element: "ice",
        hpMod: 1.55,
        atkMod: 1.05,
        desc: "Сильно замораживает руку.",
        ability: (g) => {
            g.freezeNextHand = Math.min(2, g.freezeNextHand + 2);
            g.log("Змей: сильная заморозка");
        },
    },

    // New Enemies
    {
        id: "vampire_bat",
        kind: "enemy",
        name: "Вампир",
        theme: "theme-blood",
        style: "boss-void",
        element: "void",
        hpMod: 0.9,
        atkMod: 1.1,
        desc: "Крадет HP при атаке.",
        ability: (g) => {
            g.log(
                "Вампир готовится к укусу"
            ); /* Effect handled in enemyTurn logic check */
        },
    },
    {
        id: "golem_sentry",
        kind: "enemy",
        name: "Часовой",
        theme: "theme-ruins",
        style: "boss-robot",
        element: "earth",
        hpMod: 1.3,
        atkMod: 0.8,
        desc: "Каждый ход +4 Брони.",
        ability: (g) => {
            g.enemyShield += 4;
            g.log("Часовой: +4 ARM");
        },
    },
    {
        id: "chaos_imp",
        kind: "enemy",
        name: "Бес хаоса",
        theme: "theme-magma",
        style: "boss-imp",
        element: "fire",
        hpMod: 0.8,
        atkMod: 1.0,
        desc: "Случайный эффект каждый ход.",
        ability: (g) => {
            const r = Math.random();
            if (r < 0.33) {
                g.addStatus("player", "burn", 1);
                g.log("Бес: горение");
            } else if (r < 0.66) {
                g.spawnGarbage(1);
                g.log("Бес: мусор");
            } else {
                g.enemyShield += 3;
                g.log("Бес: броня");
            }
        },
    },
    {
        id: "mimic",
        kind: "enemy",
        name: "Мимик",
        theme: "theme-gilded",
        style: "boss-chest",
        element: "earth",
        hpMod: 1.2,
        atkMod: 1.4,
        desc: "Притворялся сундуком. Бьет больно.",
        ability: (g) => {
            if (Math.random() < 0.2) {
                g.gold = Math.max(0, g.gold - 5);
                g.log("Мимик украл золото!");
            }
        },
    },
    {
        id: "void_whale",
        kind: "enemy",
        name: "Кит пустоты",
        theme: "theme-cosmos",
        style: "boss-whale",
        element: "void",
        hpMod: 1.8,
        atkMod: 0.8,
        desc: "Огромное здоровье.",
        ability: (g) => {
            if (Math.random() < 0.4) {
                g.addStatus("player", "weak", 2);
                g.log("Кит: слабость");
            }
        },
    },

    // New Bosses
    {
        id: "demon_lord",
        kind: "boss",
        name: "Демон-Лорд",
        theme: "theme-blood",
        style: "boss-demon",
        element: "fire",
        hpMod: 1.7,
        atkMod: 1.3,
        desc: "Призывает адское пламя (Горение + Урон).",
        ability: (g) => {
            g.addStatus("player", "burn", 3);
            g.hp -= 3;
            g.log("Лорд: Адское пламя");
        },
    },
    {
        id: "quantum_core",
        kind: "boss",
        name: "Квантовое Ядро",
        theme: "theme-lab",
        style: "boss-core",
        element: "storm",
        hpMod: 1.5,
        atkMod: 1.1,
        desc: "Манипулирует временем (Шок + Пропуск хода?).",
        ability: (g) => {
            g.addStatus("player", "shock", 2);
            if (Math.random() < 0.2) {
                g.discardsThisFight++;
                g.log("Ядро: сбой реальности (потеря сброса)");
            }
        },
    },
    {
        id: "ancient_tree",
        kind: "boss",
        name: "Древень",
        theme: "theme-forest",
        style: "boss-tree",
        element: "earth",
        hpMod: 2.0,
        atkMod: 0.9,
        desc: "Регенерирует и ставит корни (камни).",
        ability: (g) => {
            g.healEnemy(15);
            g.spawnRocks(2);
            g.log("Древень: корни и рост");
        },
    },
];