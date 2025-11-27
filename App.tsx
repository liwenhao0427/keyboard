import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AmmoBay } from './components/AmmoBay';
import { HUD } from './components/HUD';
import { Shop } from './components/Shop';
import { LevelUpModal } from './components/LevelUpModal';
import { ChestOpenModal } from './components/ChestOpenModal';
import { GameCanvas } from './components/GameCanvas';
import { GameOverScreen } from './components/GameOverScreen';
import { GamePhase, ItemUpgrade, AmmoItem } from './types';
import { WAVE_CONFIG } from './constants';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const { 
    ammoState, 
    stats, 
    updateStats, 
    takeDamage, 
    gainLoot, 
    initAmmo,
    addAmmo,
    restartGame
  } = useGameStore();

  // --- Local Game State ---
  // gameKey is used to force a full re-mount of the Canvas/Engine on restart
  const [gameKey, setGameKey] = useState(0); 
  const [phase, setPhase] = useState<GamePhase>(GamePhase.COMBAT);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveTime, setWaveTime] = useState(30);
  const [pendingLevelUps, setPendingLevelUps] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showChest, setShowChest] = useState(false);

  // --- Actions & Callbacks ---

  useEffect(() => {
    initAmmo();
    startWave(1);
  }, []);

  const startWave = (waveNum: number) => {
    const config = WAVE_CONFIG.find(w => w.wave === waveNum) || WAVE_CONFIG[WAVE_CONFIG.length - 1];
    const duration = config ? config.duration : 60;
    setWaveTime(duration);
    setCurrentWave(waveNum);
    setPhase(GamePhase.COMBAT);
  };

  const handleDamage = (amount: number) => {
    takeDamage(amount);
    // Check death immediately against the store's latest value (or calculate locally to be safe)
    if (useGameStore.getState().stats.hp <= 0) {
       setPhase(GamePhase.SHOP); // Effectively pauses engine
       setIsGameOver(true);
    }
  };

  const handleGainLoot = (xp: number, gold: number) => {
      const { levels } = gainLoot(xp, gold);
      if (levels > 0) setPendingLevelUps(prev => prev + levels);
  };

  const handleWaveEnd = () => {
      const currentStats = useGameStore.getState().stats;
      gainLoot(0, currentStats.harvesting); // End of wave harvesting
      updateStats({ hp: currentStats.maxHp }); // Full Heal
      
      if (pendingLevelUps > 0) {
          setPhase(GamePhase.LEVEL_UP);
      } else {
          setPhase(GamePhase.SHOP);
      }
  };

  const handleLootGoblinKill = () => {
      // Pause engine by switching phase temporarily or just overlaying
      // We keep phase COMBAT but show chest, Engine handles 'stop' internally if we wanted, 
      // but here we just show overlay. Ideally engine pauses.
      setPhase(GamePhase.SHOP); // Hack to pause engine update loop via prop
      setShowChest(true);
  };

  const handleChestClosed = () => {
      setShowChest(false);
      setPhase(GamePhase.COMBAT); // Resume
  };

  const handleRestart = () => {
      restartGame();
      setPhase(GamePhase.COMBAT);
      setCurrentWave(1);
      setWaveTime(30);
      setPendingLevelUps(0);
      setIsGameOver(false);
      setShowChest(false);
      // Force Canvas remount
      setGameKey(prev => prev + 1);
      // Slight delay to ensure clean state before starting wave logic if needed, 
      // but initAmmo and startWave(1) inside GameCanvas mount will handle it.
      startWave(1);
  };

  // --- Logic Hooks ---

  // Pause check for Level Up
  useEffect(() => {
    if (pendingLevelUps > 0 && phase === GamePhase.COMBAT && !showChest) {
        setPhase(GamePhase.LEVEL_UP);
    }
  }, [pendingLevelUps, phase, showChest]);

  // UI Timer
  useEffect(() => {
      if (phase === GamePhase.COMBAT && !isGameOver && !showChest) {
          const interval = setInterval(() => {
              setWaveTime(prev => Math.max(0, prev - 1));
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [phase, isGameOver, showChest]);

  // --- Shop & Level Up Handlers ---

  const handleLevelUpSelect = (upgrade: any) => {
      const current = useGameStore.getState().stats;
      const updates: any = {};
      Object.keys(upgrade.stats).forEach(key => {
          updates[key] = (current as any)[key] + upgrade.stats[key];
      });
      updateStats(updates);

      if (pendingLevelUps > 1) {
          setPendingLevelUps(p => p - 1);
      } else {
          setPendingLevelUps(0);
          if (waveTime > 0) {
              setPhase(GamePhase.COMBAT);
          } else {
              setPhase(GamePhase.SHOP);
          }
      }
  };

  const handleBuyItem = (item: ItemUpgrade) => {
      const current = useGameStore.getState().stats;
      const updates: any = {};
      Object.keys(item.stats).forEach(key => {
          updates[key] = (current as any)[key] + (item.stats as any)[key];
      });
      updateStats(updates);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans select-none bg-slate-950 text-white">
      
      {/* LEFT: Ammo Dock */}
      <div className="w-1/4 h-full border-r border-white/10 z-[60]">
          <AmmoBay />
      </div>

      {/* RIGHT: Game Area */}
      <div className="w-3/4 h-full relative">
          
          {/* Layer 1: The Game Engine Canvas */}
          {/* Key forces remount on restart */}
          <GameCanvas 
            key={gameKey} 
            stats={stats}
            ammoState={ammoState}
            phase={phase}
            currentWave={currentWave}
            waveDuration={waveTime} // Pass current time for resume logic if strictly needed, but duration usually for start
            onDamagePlayer={handleDamage}
            onGainLoot={handleGainLoot}
            onWaveEnd={handleWaveEnd}
            onLootGoblinKill={handleLootGoblinKill}
          />

          {/* Layer 2: HUD */}
          {phase === GamePhase.COMBAT && !isGameOver && (
            <HUD stats={stats} waveTime={waveTime} currentWave={currentWave} />
          )}

          {/* Layer 3: Interstitials */}
          {phase === GamePhase.LEVEL_UP && (
            <div className="absolute inset-0 z-50">
                <LevelUpModal level={stats.level} onSelect={handleLevelUpSelect} />
            </div>
          )}

          {phase === GamePhase.SHOP && !isGameOver && !showChest && (
            <div className="absolute inset-0 z-50">
                <Shop 
                    stats={stats} 
                    currentWave={currentWave}
                    onBuyWeapon={addAmmo} 
                    onBuyItem={handleBuyItem} 
                    onNextWave={() => startWave(currentWave + 1)} 
                    updateGold={(amt) => updateStats({ gold: stats.gold + amt })}
                />
            </div>
          )}

          {/* Layer 4: Global Overlays */}
          {showChest && (
             <div className="absolute inset-0 z-[100]">
                <ChestOpenModal rewards={[]} onComplete={handleChestClosed} /> 
             </div>
          )}

          {isGameOver && (
            <GameOverScreen currentWave={currentWave} onRestart={handleRestart} />
          )}
      </div>
    </div>
  );
}