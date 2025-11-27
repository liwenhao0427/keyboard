

export enum AmmoType {
  LINEAR = 'LINEAR',
  HOMING = 'HOMING',
  PIERCE = 'PIERCE',
  ENGINEERING = 'ENGINEERING', // Spawns structures
  ELEMENTAL = 'ELEMENTAL',     // Ignores armor, DOT (simplified to high dmg for now)
}

export type WeaponClass = 'MELEE' | 'RANGED' | 'MAGIC' | 'ENGINEERING';

export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface AmmoItem {
  id: string;
  name: string; // Added name field
  emoji: string;
  type: AmmoType;
  weaponClass: WeaponClass;
  damage: number; // Base damage
  cooldown: number; // Base cooldown (seconds)
  range: number; // Base range
  speed: number; // Projectile speed (px/sec)
  knockback: number; // Knockback force
  pierce?: number;
  duration?: number; // Projectile duration (Magic)
  rarity: Rarity;
  price: number; // For shop
  structureType?: 'TURRET' | 'MINE' | 'ARROW'; // For Engineering
  description?: string; // Custom description for shop
}

// The "Brotato" Stat Block
export interface PlayerStats {
  // Survival
  hp: number;
  maxHp: number;
  hpRegen: number; // HP per wave/sec? Let's do per 5 sec
  lifeSteal: number; // % chance to heal 1 HP on hit
  armor: number; // % dmg reduction formula
  dodge: number; // % chance to ignore hit
  speed: number; // Move speed (cursor trail speed)

  // Offense
  damagePercent: number; // Global % dmg increase
  attackSpeed: number; // % attack speed increase
  critChance: number; // %
  critDamage: number; // Multiplier (default 1.5x)
  range: number; // Added to base weapon range

  // Utility
  luck: number; // Affects shop rarity & loot drops
  harvesting: number; // Gold/XP gain at end of wave
  engineering: number; // Scaler for engineering structures

  // Class Specific (Flat Bonuses)
  meleeDmg: number;
  rangedDmg: number;
  elementalDmg: number;
  
  // Economy
  xp: number;
  maxXp: number;
  level: number;
  gold: number;
}

export enum GamePhase {
  COMBAT = 'COMBAT',
  LEVEL_UP = 'LEVEL_UP',
  SHOP = 'SHOP',
}

export interface ShopItem {
  id: string;
  type: 'WEAPON' | 'ITEM';
  data: AmmoItem | ItemUpgrade;
  price: number;
  locked: boolean;
  bought: boolean;
}

export interface ItemUpgrade {
  name: string;
  description: string;
  rarity: Rarity;
  stats: Partial<PlayerStats>;
}

export type AmmoBayState = Record<string, AmmoItem[]>;

// --- Engine Entity Types ---

export interface Entity {
  id: number;
  x: number;
  y: number;
  radius: number;
  markedForDeletion: boolean;
}

export interface Enemy extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  emoji: string;
  type: 'NORMAL' | 'ELITE' | 'BOSS' | 'LOOT_GOBLIN';
  xpValue: number;
  goldValue: number;
  damage: number;
  hitFlashTime: number; // For visual white flash on hit
  stunTimer: number; // Time remaining stunned
}

export interface Projectile extends Entity {
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  damage: number;
  emoji: string;
  type: AmmoType;
  weaponClass: WeaponClass;
  pierce: number;
  life: number;
  maxLife: number; // Used for duration in MAGIC
  sourceId: string;
  crit: boolean;
  hitList: number[]; // IDs of enemies already hit (for Melee/Pierce)
  knockback: number;
}

export interface Structure extends Entity {
  type: 'TURRET' | 'MINE' | 'ARROW';
  state: 'BLUEPRINT' | 'BUILT';
  progress: number;
  maxProgress: number;
  cooldown: number;
  maxCooldown: number;
  damage: number;
  range: number;
  life: number;
  maxLife: number; // To track healing
}

export interface LootDrop extends Entity {
  type: 'XP_GOLD' | 'BOX';
  xp: number;
  gold: number;
  magnetized: boolean;
  age?: number; // Time since spawn
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  velocity: { x: number; y: number };
  scale: number;
}