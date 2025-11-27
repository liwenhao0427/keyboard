

import { PlayerStats, Rarity, AmmoItem, AmmoType, ItemUpgrade } from './types';

export const CANVAS_WIDTH = 1200; 
export const CANVAS_HEIGHT = 1200;

export const ROW_COUNT = 5; // 5 Rows like a phone home screen
export const GRID_TOP_OFFSET = 140; // Height of the top HUD/Header area where no gameplay happens
export const ROW_HEIGHT = (CANVAS_HEIGHT - GRID_TOP_OFFSET) / ROW_COUNT;

export const INITIAL_STATS: PlayerStats = {
  hp: 20,
  maxHp: 20,
  hpRegen: 0,
  lifeSteal: 0,
  armor: 0,
  dodge: 0,
  speed: 100, // %
  
  damagePercent: 0,
  attackSpeed: 0,
  critChance: 0.05, // 5%
  critDamage: 1.5, // 1.5x
  range: 0,

  luck: 0,
  harvesting: 10, // Initial harvesting
  engineering: 0,

  meleeDmg: 0,
  rangedDmg: 0,
  elementalDmg: 0,

  xp: 0,
  maxXp: 5,
  level: 1,
  gold: 0, // Initial gold
};

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#94a3b8', // Slate 400
  RARE: '#3b82f6',   // Blue 500
  EPIC: '#a855f7',   // Purple 500
  LEGENDARY: '#ef4444' // Red 500
};

export const BACKGROUND_SLANG = [
  "急了", "破防", "典", "乐", "崩", "赢", "孝", "润", "寄", "6", "蚌埠", "小丑", "红温", "下头"
];

export const AMMO_TYPE_MAP: Record<string, string> = {
  [AmmoType.LINEAR]: '直射',
  [AmmoType.HOMING]: '追踪',
  [AmmoType.PIERCE]: '贯穿',
  [AmmoType.ENGINEERING]: '工程',
  [AmmoType.ELEMENTAL]: '元素',
};

export const KEYWORD_DEFINITIONS: Record<string, string> = {
  "直射": "沿直线飞行的弹药",
  "追踪": "自动追踪最近敌人的弹药",
  "贯穿": "可以穿透多个敌人的弹药",
  "工程": "生成能够自动攻击的建筑",
  "元素": "造成特殊元素效果",
  "速度": "弹药的飞行速度",
  "持续": "弹药存在的最大时间",
  "击退": "将敌人向后推开的距离",
};

export const AVAILABLE_UPGRADES = [
    { label: "最大生命", detail: "+5 Max HP", stats: { maxHp: 5 }, value: 1 },
    { label: "生命再生", detail: "+1 HP/5s", stats: { hpRegen: 1 }, value: 1 },
    { label: "生命窃取", detail: "+1% Lifesteal", stats: { lifeSteal: 0.01 }, value: 1 },
    { label: "伤害", detail: "+5% Damage", stats: { damagePercent: 5 }, value: 1 },
    { label: "攻击速度", detail: "+5% Atk Speed", stats: { attackSpeed: 5 }, value: 1 },
    { label: "暴击率", detail: "+3% Crit Chance", stats: { critChance: 0.03 }, value: 1 },
    { label: "工程学", detail: "+5 Engineering", stats: { engineering: 5 }, value: 1 },
    { label: "范围", detail: "+15 Range", stats: { range: 15 }, value: 1 },
    { label: "护甲", detail: "+1 Armor", stats: { armor: 1 }, value: 1 },
    { label: "闪避", detail: "+3% Dodge", stats: { dodge: 0.03 }, value: 1 },
    { label: "速度", detail: "+3% Speed", stats: { speed: 3 }, value: 1 },
    { label: "幸运", detail: "+10 Luck", stats: { luck: 10 }, value: 1 },
    { label: "收获", detail: "+5 Harvesting", stats: { harvesting: 5 }, value: 1 },
];

// --- Weapon Data (Brotato Tier 1 Based) ---
export const WEAPON_POOL: Partial<AmmoItem>[] = [
  // MELEE
  { name: "重拳", emoji: '👊', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 8, cooldown: 0.76, range: 400, speed: 1200, knockback: 45, rarity: 'COMMON', price: 10, description: "高击退效果" },
  { name: "树枝", emoji: '🥢', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 8, cooldown: 1.25, range: 400, speed: 1200, knockback: 30, rarity: 'COMMON', price: 10, description: "普通的树枝" },
  { name: "石头", emoji: '🪨', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 20, cooldown: 1.74, range: 400, speed: 1000, knockback: 30, rarity: 'COMMON', price: 10, description: "攻速慢，伤害高" },
  { name: "匕首", emoji: '🔪', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 6, cooldown: 1.01, range: 350, speed: 1500, knockback: 20, rarity: 'COMMON', price: 15, description: "高暴击倍率" },
  { name: "长剑", emoji: '🗡️', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 5, cooldown: 1.01, range: 350, speed: 1500, knockback: 15, rarity: 'COMMON', price: 12, description: "暴击击杀概率掉落金币" },
  { name: "海神戟", emoji: '🔱', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 15, cooldown: 1.34, range: 600, speed: 1100, knockback: 30, rarity: 'COMMON', price: 20, description: "攻击范围大幅增加" },
  { name: "盾牌", emoji: '🛡️', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 10, cooldown: 1.17, range: 300, speed: 1000, knockback: 60, rarity: 'COMMON', price: 15, description: "伤害随【护甲】属性提升" },
  { name: "仙人掌", emoji: '🌵', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 10, cooldown: 1.67, range: 350, speed: 1000, knockback: 30, rarity: 'COMMON', price: 20, description: "攻击时向周围发射尖刺" },
  { name: "剪刀", emoji: '✂️', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 5, cooldown: 1.01, range: 300, speed: 1200, knockback: 15, rarity: 'COMMON', price: 15, description: "医疗武器：自带微量吸血" },
  { name: "肉块", emoji: '🥩', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 6, cooldown: 1.01, range: 300, speed: 1200, knockback: 15, rarity: 'COMMON', price: 15, description: "拾取回血道具时回复量 +1" },
  { name: "幽灵斧", emoji: '👻', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 12, cooldown: 1.74, range: 400, speed: 1000, knockback: 30, rarity: 'COMMON', price: 20, description: "击杀增加本局伤害" },
  { name: "魔杖", emoji: '✨', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 6, cooldown: 1.25, range: 400, speed: 1200, knockback: 15, rarity: 'COMMON', price: 12, description: "击杀增加本局攻速" },
  { name: "巴掌", emoji: '✋', type: AmmoType.LINEAR, weaponClass: 'MELEE', damage: 1, cooldown: 1.01, range: 250, speed: 1200, knockback: 60, rarity: 'COMMON', price: 10, description: "装备时 +3 收获" },

  // RANGED
  { name: "手枪", emoji: '🔫', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 12, cooldown: 1.20, range: 1000, speed: 1300, knockback: 15, rarity: 'COMMON', price: 10, description: "贯穿 1 个敌人" },
  { name: "笔", emoji: '🖊️', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 3, cooldown: 0.17, range: 800, speed: 1500, knockback: 0, rarity: 'COMMON', price: 20, description: "极高射速" },
  { name: "霰弹", emoji: '💥', type: AmmoType.PIERCE, weaponClass: 'RANGED', damage: 3, cooldown: 1.37, range: 700, speed: 1200, knockback: 25, rarity: 'COMMON', pierce: 2, price: 20, description: "发射多枚弹头，贯穿敌人" },
  { name: "回旋镖", emoji: '🪃', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 10, cooldown: 1.22, range: 750, speed: 1100, knockback: 15, rarity: 'COMMON', price: 15, description: "子弹会在敌人间弹射" },
  { name: "手里剑", emoji: '✴️', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 6, cooldown: 0.87, range: 800, speed: 1400, knockback: 0, rarity: 'COMMON', price: 12, description: "暴击时子弹弹射" },
  { name: "弓箭", emoji: '🏹', type: AmmoType.PIERCE, weaponClass: 'RANGED', damage: 8, cooldown: 1.13, range: 900, speed: 1500, knockback: 24, rarity: 'COMMON', pierce: 1, price: 18, description: "暴击时贯穿敌人" },
  { name: "爆竹", emoji: '🧨', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 5, cooldown: 1.30, range: 800, speed: 1100, knockback: 0, rarity: 'COMMON', price: 15, description: "50% 几率造成爆炸" },
  { name: "激光", emoji: '🔦', type: AmmoType.PIERCE, weaponClass: 'RANGED', damage: 30, cooldown: 2.15, range: 1000, speed: 2000, knockback: 0, rarity: 'COMMON', price: 15, description: "高伤害，极长冷却" },
  { name: "注射器", emoji: '💉', type: AmmoType.LINEAR, weaponClass: 'RANGED', damage: 10, cooldown: 0.95, range: 700, speed: 1200, knockback: 0, rarity: 'COMMON', price: 15, description: "医疗：攻击具有高吸血效率" },

  // MAGIC
  { name: "蜡烛", emoji: '🕯️', type: AmmoType.HOMING, weaponClass: 'MAGIC', damage: 1, cooldown: 1.08, range: 600, speed: 800, knockback: 0, rarity: 'COMMON', price: 12, description: "使敌人燃烧" },
  { name: "闪电", emoji: '⚡', type: AmmoType.HOMING, weaponClass: 'MAGIC', damage: 3, cooldown: 1.01, range: 600, speed: 1500, knockback: 5, rarity: 'COMMON', price: 15, description: "命中时生成闪电" },
  { name: "法杖", emoji: '🪄', type: AmmoType.HOMING, weaponClass: 'MAGIC', damage: 1, cooldown: 0.87, range: 700, speed: 900, knockback: 10, rarity: 'COMMON', price: 15, description: "发射魔法飞弹" },
  { name: "泰瑟枪", emoji: '🔌', type: AmmoType.HOMING, weaponClass: 'MAGIC', damage: 5, cooldown: 0.95, range: 400, speed: 1000, knockback: 0, rarity: 'COMMON', price: 15, description: "使周围敌人减速" },
  { name: "喷火器", emoji: '🔥', type: AmmoType.ELEMENTAL, weaponClass: 'MAGIC', damage: 1, cooldown: 0.12, range: 500, speed: 1200, knockback: 0, rarity: 'EPIC', price: 56, description: "穿透并燃烧敌人" },
  { name: "骷髅", emoji: '💀', type: AmmoType.HOMING, weaponClass: 'MAGIC', damage: 10, cooldown: 1.03, range: 600, speed: 700, knockback: 2, rarity: 'COMMON', price: 15, description: "击杀增加最大生命值" },

  // ENGINEERING
  { name: "扳手", emoji: '🔧', type: AmmoType.ENGINEERING, weaponClass: 'ENGINEERING', damage: 12, cooldown: 1.74, range: 0, speed: 800, knockback: 0, rarity: 'COMMON', structureType: 'TURRET', price: 20, description: "生成炮台" },
  { name: "螺丝刀", emoji: '🪛', type: AmmoType.ENGINEERING, weaponClass: 'ENGINEERING', damage: 8, cooldown: 1.08, range: 0, speed: 800, knockback: 0, rarity: 'COMMON', structureType: 'MINE', price: 10, description: "生成地雷" },
];

// --- Item Data (Brotato Based) ---
export const ITEM_POOL: ItemUpgrade[] = [
    // COMMON (Tier 1)
    { name: "外星舌头", description: "拾取范围 +30%", rarity: 'COMMON', stats: { /* pickupRange: 0.3 */ } }, // Pickup Range logic not fully impl, skipping stat for now or adding dummy
    { name: "外星蠕虫", description: "+2 生命再生, +3 最大生命, 消耗品回复量 -1", rarity: 'COMMON', stats: { hpRegen: 2, maxHp: 3 } },
    { name: "小象", description: "拾取材料时 10% 概率造成伤害", rarity: 'COMMON', stats: {} },
    { name: "小壁虎", description: "+15% 概率吸附材料, -1% 窃取", rarity: 'COMMON', stats: { lifeSteal: -0.01 } },
    { name: "袋子", description: "捡箱子获额外材料, -1% 速度", rarity: 'COMMON', stats: { speed: -1 } },
    { name: "蝙蝠", description: "+2% 生命窃取, -2 收获", rarity: 'COMMON', stats: { lifeSteal: 0.02, harvesting: -2 } },
    { name: "无檐便帽", description: "+4% 速度, -6 范围", rarity: 'COMMON', stats: { speed: 4, range: -6 } },
    { name: "开水", description: "+2 元素伤害, -1 最大生命", rarity: 'COMMON', stats: { elementalDmg: 2, maxHp: -1 } },
    { name: "书", description: "+1 工程学", rarity: 'COMMON', stats: { engineering: 1 } },
    { name: "拳击手套", description: "+3 击退", rarity: 'COMMON', stats: {} }, // Knockback stat on player not fully impl, affects logic if added
    { name: "破嘴", description: "+5 最大生命, -1 再生", rarity: 'COMMON', stats: { maxHp: 5, hpRegen: -1 } },
    { name: "蝴蝶", description: "+2% 窃取, -1 元素", rarity: 'COMMON', stats: { lifeSteal: 0.02, elementalDmg: -1 } },
    { name: "蛋糕", description: "+3 最大生命, -1% 伤害", rarity: 'COMMON', stats: { maxHp: 3, damagePercent: -1 } },
    { name: "咖啡", description: "+10% 攻速, -2% 伤害", rarity: 'COMMON', stats: { attackSpeed: 10, damagePercent: -2 } },
    { name: "优惠券", description: "商店价格 -5%", rarity: 'COMMON', stats: {} }, // Shop logic needs update for this
    { name: "赛博球", description: "25% 概率击杀造成伤害", rarity: 'COMMON', stats: {} },
    { name: "炸药", description: "+15% 爆炸伤害", rarity: 'COMMON', stats: {} },
    { name: "化肥", description: "+8 收获, -1 近战", rarity: 'COMMON', stats: { harvesting: 8, meleeDmg: -1 } },
    { name: "温柔外星人", description: "+5% 伤害, +2 生命, 敌数量+5%", rarity: 'COMMON', stats: { damagePercent: 5, maxHp: 2 } },
    { name: "眼镜", description: "+20 范围", rarity: 'COMMON', stats: { range: 20 } },
    { name: "头盔", description: "+1 护甲, -2% 速度", rarity: 'COMMON', stats: { armor: 1, speed: -2 } },
    { name: "针剂", description: "+7% 伤害, -2 最大生命", rarity: 'COMMON', stats: { damagePercent: 7, maxHp: -2 } },
    { name: "柠檬水", description: "消耗品回血量 +1", rarity: 'COMMON', stats: {} },
    { name: "树", description: "生成更多的树", rarity: 'COMMON', stats: {} },
    { name: "炮台", description: "生成一个炮台", rarity: 'COMMON', stats: { engineering: 0 } }, // Dummy stat to trigger structure spawn logic if implemented

    // RARE (Tier 2)
    { name: "酸", description: "+8 最大生命, -4% 闪避", rarity: 'RARE', stats: { maxHp: 8, dodge: -0.04 } },
    { name: "外星眼", description: "周期性发射外星眼", rarity: 'RARE', stats: {} },
    { name: "旗帜", description: "+20 范围, +10% 攻速, -2% 窃取", rarity: 'RARE', stats: { range: 20, attackSpeed: 10, lifeSteal: -0.02 } },
    { name: "黑带", description: "+15% 经验, +3 近战, -8 幸运", rarity: 'RARE', stats: { meleeDmg: 3, luck: -8 } }, // xpGain not in stats yet
    { name: "眼罩", description: "+5% 暴击, +5% 闪避, -15 范围", rarity: 'RARE', stats: { critChance: 0.05, dodge: 0.05, range: -15 } },
    { name: "篝火", description: "+2 元素, +2 再生, -2% 速度", rarity: 'RARE', stats: { elementalDmg: 2, hpRegen: 2, speed: -2 } },
    { name: "齿轮", description: "+4 工程学, -4% 伤害", rarity: 'RARE', stats: { engineering: 4, damagePercent: -4 } },
    { name: "危险兔子", description: "商店免费刷新 +1", rarity: 'RARE', stats: {} },
    { name: "燃料箱", description: "+4 元素, 降低近战/远程", rarity: 'RARE', stats: { elementalDmg: 4, meleeDmg: -1, rangedDmg: -1 } },
    { name: "皮背心", description: "+2 护甲, +6% 闪避, -3 生命", rarity: 'RARE', stats: { armor: 2, dodge: 0.06, maxHp: -3 } },
    { name: "精通", description: "+6 近战, -3 远程", rarity: 'RARE', stats: { meleeDmg: 6, rangedDmg: -3 } },
    { name: "奖牌", description: "+3 血/伤/速, +1 甲, -4% 暴击", rarity: 'RARE', stats: { maxHp: 3, damagePercent: 3, speed: 3, armor: 1, critChance: -0.04 } },
    { name: "导弹", description: "+10% 伤害, -6% 攻速", rarity: 'RARE', stats: { damagePercent: 10, attackSpeed: -6 } },
    { name: "存钱罐", description: "波次开始获得 20% 存款利息", rarity: 'RARE', stats: {} },
    { name: "回收机", description: "回收收益 +35%", rarity: 'RARE', stats: {} },
    { name: "瞄准镜", description: "+2 远程, +25 范围, -7% 攻速", rarity: 'RARE', stats: { rangedDmg: 2, range: 25, attackSpeed: -7 } },
    { name: "墨镜", description: "+10% 暴击, -1 护甲", rarity: 'RARE', stats: { critChance: 0.10, armor: -1 } },
    { name: "独轮车", description: "+16 收获, -1 护甲", rarity: 'RARE', stats: { harvesting: 16, armor: -1 } },
    { name: "白旗", description: "+5 收获, 敌人数量 -5%", rarity: 'RARE', stats: { harvesting: 5 } },

    // EPIC (Tier 3)
    { name: "合金", description: "全属性提升, -6% 闪避", rarity: 'EPIC', stats: { meleeDmg: 3, rangedDmg: 3, engineering: 3, critChance: 0.05, dodge: -0.06 } },
    { name: "发电机", description: "速度转化为伤害, -5% 伤害", rarity: 'EPIC', stats: { damagePercent: -5 } },
    { name: "三叶草", description: "+20 幸运, +6% 闪避, -2% 窃取", rarity: 'EPIC', stats: { luck: 20, dodge: 0.06, lifeSteal: -0.02 } },
    { name: "王冠", description: "收获指数增长 +8%", rarity: 'EPIC', stats: {} },
    { name: "玻璃大炮", description: "+25% 伤害, -3 护甲", rarity: 'EPIC', stats: { damagePercent: 25, armor: -3 } },
    { name: "手铐", description: "全伤害 +8, 生命锁定", rarity: 'EPIC', stats: { meleeDmg: 8, rangedDmg: 8, elementalDmg: 8 } },
    { name: "狩猎战利品", description: "暴击击杀掉落金币", rarity: 'EPIC', stats: {} },
    { name: "幸运护符", description: "+30 幸运, 降低近战/远程", rarity: 'EPIC', stats: { luck: 30, meleeDmg: -2, rangedDmg: -1 } },
    { name: "猛犸象", description: "+15 近战, +2 再生, -8% 伤害", rarity: 'LEGENDARY', stats: { meleeDmg: 15, hpRegen: 2, damagePercent: -8, speed: -3 } }, // Promoted for consistency

    // LEGENDARY (Tier 4)
    { name: "铁砧", description: "商店随机升级武器, 或 +2 护甲", rarity: 'LEGENDARY', stats: {} },
    { name: "粗壮手臂", description: "+10 近战, +5 远程, -2 护甲", rarity: 'LEGENDARY', stats: { meleeDmg: 10, rangedDmg: 5, armor: -2, speed: -5 } },
    { name: "披风", description: "+20% 闪避, +5% 窃取, 降低全伤害", rarity: 'LEGENDARY', stats: { dodge: 0.20, lifeSteal: 0.05, meleeDmg: -2, rangedDmg: -2, elementalDmg: -2 } },
    { name: "外骨骼", description: "+5 甲/工/速/暴, -2 再生/窃取", rarity: 'LEGENDARY', stats: { armor: 5, critChance: 0.05, engineering: 5, speed: 5, hpRegen: -2, lifeSteal: -0.02 } },
    { name: "爆炸弹", description: "+60% 爆炸伤害, -15% 伤害", rarity: 'LEGENDARY', stats: { damagePercent: -15 } },
    { name: "专注", description: "+30% 伤害, 武器种类越多攻速越慢", rarity: 'LEGENDARY', stats: { damagePercent: 30 } },
    { name: "侏儒", description: "+10 近战, +5 元素, -20 范围", rarity: 'LEGENDARY', stats: { meleeDmg: 10, elementalDmg: 5, range: -20 } },
    { name: "喷气背包", description: "+15% 速度, +10% 闪避, -6 血", rarity: 'LEGENDARY', stats: { speed: 15, dodge: 0.10, maxHp: -6, armor: -2 } },
    { name: "急救包", description: "+10 再生, -10 幸运", rarity: 'LEGENDARY', stats: { hpRegen: 10, luck: -10 } },
    { name: "土豆", description: "全属性小幅提升", rarity: 'LEGENDARY', stats: { maxHp: 3, hpRegen: 1, lifeSteal: 0.01, damagePercent: 3, speed: 3, dodge: 0.03, armor: 1, luck: 5 } },
    { name: "跳弹", description: "子弹弹射 +1, -35% 伤害", rarity: 'LEGENDARY', stats: { damagePercent: -35 } },
    { name: "蜘蛛", description: "武器种类越多攻速越快", rarity: 'LEGENDARY', stats: { damagePercent: 12, dodge: -0.06, harvesting: -8 } },
];

export const ENEMY_DATA: Record<string, any> = {
  tree: {
    id: "tree",
    name: "树",
    emoji: "🌲",
    type: 3, // SPECIAL
    baseHp: 10,
    hpPerWave: 5,
    speed: 0,
    damage: 0,
    materials: 3,
    desc: "掉落果实或材料"
  },
  baby_alien: {
    id: "baby_alien",
    name: "外星幼崽",
    emoji: "👾",
    type: 0,
    baseHp: 32,
    hpPerWave: 2,
    speed: 250,
    damage: 10,
    materials: 1,
    desc: "普通近战敌人"
  },
  chaser: {
    id: "chaser",
    name: "追逐者",
    emoji: "🐛",
    type: 0,
    baseHp: 11,
    hpPerWave: 3,
    speed: 380,
    damage: 10,
    materials: 1,
    desc: "快速且成群出现"
  },
  spitter: {
    id: "spitter",
    name: "喷吐者",
    emoji: "🐡",
    type: 0,
    baseHp: 8,
    hpPerWave: 1,
    speed: 200,
    damage: 10,
    materials: 1,
    isRanged: true,
    range: 400,
    projectileSpeed: 300,
    desc: "远程发射子弹"
  },
  charger: {
    id: "charger",
    name: "冲锋者",
    emoji: "🐗",
    type: 0,
    baseHp: 40,
    hpPerWave: 2.5,
    speed: 400,
    damage: 10,
    materials: 1,
    desc: "会发起冲锋攻击"
  },
  bruiser: {
    id: "bruiser",
    name: "壮汉",
    emoji: "🦍",
    type: 0,
    baseHp: 20,
    hpPerWave: 11,
    speed: 300,
    damage: 20,
    materials: 3,
    desc: "血量较高"
  },
  fly: {
    id: "fly",
    name: "苍蝇",
    emoji: "🪰",
    type: 0,
    baseHp: 15,
    hpPerWave: 4,
    speed: 350,
    damage: 10,
    materials: 1,
    desc: "被击中时可能会分裂子弹"
  },
  helmet_alien: {
    id: "helmet_alien",
    name: "头盔外星人",
    emoji: "💂",
    type: 0,
    baseHp: 8,
    hpPerWave: 3,
    speed: 250,
    damage: 11,
    materials: 1,
    armor: 2,
    desc: "拥有少量护甲"
  },
  
  // SPECIAL
  looter: {
    id: "looter",
    name: "寻宝哥",
    emoji: "💰",
    type: 3, // SPECIAL
    baseHp: 50,
    hpPerWave: 25,
    speed: 350,
    damage: 0,
    materials: 8,
    behavior: "flee",
    desc: "击杀掉落宝箱，会逃跑！"
  },

  // ELITES
  rhino: {
    id: "rhino",
    name: "犀牛",
    emoji: "🦏",
    type: 1, // ELITE
    baseHp: 1750,
    hpPerWave: 250,
    speed: 150,
    damage: 15,
    materials: 50,
    desc: "精英：周期性冲锋并发射弹幕"
  },
  monk: {
    id: "monk",
    name: "武僧",
    emoji: "🧘",
    type: 1, // ELITE
    baseHp: 1700,
    hpPerWave: 350,
    speed: 150,
    damage: 15,
    materials: 50,
    desc: "精英：生成触手和大量子弹"
  },

  // BOSS
  boss_predator: {
    id: "boss_predator",
    name: "掠食者",
    emoji: "☠️",
    type: 2, // BOSS
    baseHp: 29900,
    hpPerWave: 0,
    speed: 300,
    damage: 30,
    materials: 100,
    desc: "最终BOSS：冲刺并释放环形弹幕"
  }
};

export const WAVE_CONFIG = [
  { wave: 1, duration: 20, interval: 2.0, enemies: ["baby_alien"] },
  { wave: 2, duration: 25, interval: 1.8, enemies: ["baby_alien", "tree"] },
  { wave: 3, duration: 30, interval: 1.6, enemies: ["baby_alien", "chaser"] },
  { wave: 4, duration: 35, interval: 1.5, enemies: ["baby_alien", "chaser", "spitter"] },
  { wave: 5, duration: 40, interval: 1.4, enemies: ["chaser", "spitter", "fly"] },
  { wave: 6, duration: 45, interval: 1.3, enemies: ["chaser", "charger", "fly"] },
  { wave: 7, duration: 50, interval: 1.2, enemies: ["charger", "fly", "bruiser"] },
  { wave: 8, duration: 55, interval: 1.1, enemies: ["charger", "bruiser", "helmet_alien"] },
  { wave: 9, duration: 60, interval: 1.0, enemies: ["bruiser", "helmet_alien", "spitter"] },
  { wave: 10, duration: 60, interval: 0.9, enemies: ["bruiser", "helmet_alien", "chaser"] }, 
  { wave: 11, duration: 60, interval: 0.8, enemies: ["chaser", "spitter", "rhino"] },
  { wave: 12, duration: 60, interval: 0.8, enemies: ["baby_alien", "bruiser"] },
  { wave: 13, duration: 60, interval: 0.7, enemies: ["helmet_alien", "charger"] },
  { wave: 14, duration: 60, interval: 0.7, enemies: ["spitter", "fly", "monk"] },
  { wave: 15, duration: 60, interval: 0.6, enemies: ["chaser", "bruiser"] },
  { wave: 16, duration: 60, interval: 0.6, enemies: ["helmet_alien", "charger"] },
  { wave: 17, duration: 60, interval: 0.5, enemies: ["fly", "bruiser"] },
  { wave: 18, duration: 60, interval: 0.5, enemies: ["chaser", "spitter"] },
  { wave: 19, duration: 60, interval: 0.4, enemies: ["helmet_alien", "charger", "bruiser"] },
  { wave: 20, duration: 90, interval: 2.0, enemies: ["boss_predator", "chaser"] } 
];