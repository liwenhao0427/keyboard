

import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { AmmoBayState, PlayerStats, AmmoItem, ItemUpgrade } from '../types';
import { INITIAL_STATS, ROW_COUNT, WEAPON_POOL } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

interface InventorySlice {
  ammoState: AmmoBayState;
  initAmmo: () => void;
  moveAmmo: (activeId: string, overId: string) => void;
  addAmmo: (item: AmmoItem) => void;
}

interface PlayerSlice {
  stats: PlayerStats;
  updateStats: (updates: Partial<PlayerStats>) => void;
  takeDamage: (amount: number) => void;
  gainLoot: (xp: number, gold: number) => { leveledUp: boolean, levels: number };
  restartGame: () => void;
}

interface GameStore extends InventorySlice, PlayerSlice {}

// --- Slices ---

export const useGameStore = create<GameStore>((set, get) => ({
  // --- Inventory Slice ---
  ammoState: {},
  
  initAmmo: () => {
    const rows: AmmoBayState = {};
    const rangedWeapon = WEAPON_POOL.find(w => w.weaponClass === 'RANGED') || WEAPON_POOL[0];
    
    for (let i = 0; i < ROW_COUNT; i++) {
        rows[`row-${i}`] = [];
        // Starter weapon
        rows[`row-${i}`].push({ ...rangedWeapon, id: uuidv4() } as AmmoItem);
    }
    set({ ammoState: rows });
  },

  addAmmo: (item: AmmoItem) => {
    set((state) => {
        const newState = { ...state.ammoState };
        // Simple heuristic: Add to row with fewest items
        let bestRow = 'row-0';
        let minLen = Infinity;
        Object.keys(newState).forEach(k => {
            if (newState[k].length < minLen) {
                minLen = newState[k].length;
                bestRow = k;
            }
        });
        newState[bestRow] = [...newState[bestRow], item];
        return { ammoState: newState };
    });
  },

  moveAmmo: (activeId: string, overId: string) => {
    set((state) => {
        const prev = state.ammoState;
        
        // Find containers
        const findContainer = (id: string) => {
            if (id in prev) return id;
            return Object.keys(prev).find((key) =>
              prev[key].find((item) => item.id === id)
            );
        };

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return { ammoState: prev };

        // Moving between containers
        if (activeContainer !== overContainer) {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((i) => i.id === activeId);
            const overIndex = (overId in prev) 
                ? overItems.length + 1 
                : overItems.findIndex((i) => i.id === overId);
            
            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                 // Calculate if below or above is handled by UI, but here we just insert
                 newIndex = overIndex >= 0 ? overIndex : overItems.length + 1;
            }

            return {
                ammoState: {
                    ...prev,
                    [activeContainer]: [...prev[activeContainer].filter((item) => item.id !== activeId)],
                    [overContainer]: [
                        ...prev[overContainer].slice(0, newIndex),
                        activeItems[activeIndex],
                        ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                    ],
                }
            };
        }
        
        // Moving within same container
        if (activeContainer === overContainer) {
            const activeIndex = prev[activeContainer].findIndex((i) => i.id === activeId);
            const overIndex = prev[activeContainer].findIndex((i) => i.id === overId);
            
            if (activeIndex !== overIndex) {
                return {
                    ammoState: {
                        ...prev,
                        [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                    }
                };
            }
        }

        return { ammoState: prev };
    });
  },

  // --- Player Slice ---
  stats: INITIAL_STATS,

  updateStats: (updates) => set((state) => ({ 
      stats: { ...state.stats, ...updates } 
  })),

  takeDamage: (amount) => set((state) => {
      if (amount < 0) {
          // Heal
          return { stats: { ...state.stats, hp: Math.min(state.stats.maxHp, state.stats.hp - amount) } };
      }
      return { stats: { ...state.stats, hp: state.stats.hp - amount } };
  }),

  gainLoot: (xp, gold) => {
      let result = { leveledUp: false, levels: 0 };
      set((state) => {
          // Apply XP modifier
          const xpWithBonus = xp * (1 + state.stats.xpGain);
          let newXp = state.stats.xp + xpWithBonus;
          
          // Sync economy (Gold) with XP gain (including bonus)
          // Also add raw gold drop
          let newGold = state.stats.gold + gold + xpWithBonus;
          
          let newLevel = state.stats.level;
          let newMaxXp = state.stats.maxXp;
          let levelsGained = 0;

          while (newXp >= newMaxXp) {
              newXp -= newMaxXp;
              newLevel++;
              newMaxXp = Math.floor(newMaxXp * 1.5);
              levelsGained++;
          }
          
          if (levelsGained > 0) result = { leveledUp: true, levels: levelsGained };
          
          return { 
              stats: { 
                  ...state.stats, 
                  xp: newXp, 
                  gold: newGold, 
                  level: newLevel, 
                  maxXp: newMaxXp 
              } 
          };
      });
      return result;
  },

  restartGame: () => {
      set({ stats: INITIAL_STATS });
      get().initAmmo();
  }
}));