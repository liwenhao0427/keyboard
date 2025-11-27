import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameEngine } from './services/GameEngine';
import { AmmoBay } from './components/AmmoBay';
import { HUD } from './components/HUD';
import { Shop } from './components/Shop';
import { LevelUpModal } from './components/LevelUpModal';
import { ChestOpenModal } from './components/ChestOpenModal';
import { GamePhase, ItemUpgrade, AmmoItem } from './types';
import { INITIAL_STATS, WAVE_CONFIG } from './constants';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Use Zustand Store
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

  // --- Game State (Local UI state) ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.COMBAT);
  const [currentWave, setCurrentWave] = useState(1);
  const [waveTime, setWaveTime] = useState(30);
  const [pendingLevelUps, setPendingLevelUps] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showChest, setShowChest] = useState(false);

  // --- Engine Logic Callbacks ---

  const handleDamage = (amount: number) => {
    takeDamage(amount);
    if (useGameStore.getState().stats.hp <= 0) {
       setIsGameOver(true);
       engineRef.current?.stop();
    }
  };

  const handleGainLoot = (xp: number, gold: number) => {
      const { levels } = gainLoot(xp, gold);
      if (levels > 0) {
          setPendingLevelUps(prev => prev + levels);
      }
  };

  const handleWaveEnd = () => {
      // End of wave harvest
      const currentStats = useGameStore.getState().stats;
      gainLoot(0, currentStats.harvesting); // Gold gain
      updateStats({ hp: currentStats.maxHp }); // Full Heal
      
      engineRef.current?.stop();
      if (pendingLevelUps > 0) {
          setPhase(GamePhase.LEVEL_UP);
      } else {
          setPhase(GamePhase.SHOP);
      }
  };

  const handleLootGoblinKill = () => {
      engineRef.current?.stop();
      setShowChest(true);
  };

  const handleRestart = () => {
      // 1. Reset Store
      restartGame();
      
      // 2. Reset Local State
      setPhase(GamePhase.COMBAT);
      setCurrentWave(1);
      setWaveTime(30);
      setPendingLevelUps(0);
      setIsGameOver(false);
      setShowChest(false);

      // 3. Reset Engine
      engineRef.current?.cleanup();
      if (canvasRef.current) {
        // Re-instantiate engine to ensure clean slate
        engineRef.current = new GameEngine(
            canvasRef.current,
            INITIAL_STATS, // Use initial stats directly for engine init
            {
                onDamagePlayer: handleDamage,
                onGainLoot: handleGainLoot,
                onWaveEnd: handleWaveEnd,
                onLootGoblinKill: handleLootGoblinKill
            }
        );
        // Important: Re-sync the store data immediately after creation
        // The store reset happens slightly async or state update might pend, 
        // but we just reset it above.
        // We trigger a wave start.
        engineRef.current.updateAmmo(useGameStore.getState().ammoState);
        engineRef.current.startWave(20, 1);
      }
  };

  // --- Initialization ---

  useEffect(() => {
    initAmmo();
    
    if (!canvasRef.current) return;
    
    // Init Engine
    engineRef.current = new GameEngine(
        canvasRef.current,
        stats,
        {
            onDamagePlayer: handleDamage,
            onGainLoot: handleGainLoot,
            onWaveEnd: handleWaveEnd,
            onLootGoblinKill: handleLootGoblinKill
        }
    );
    
    // Start initial wave
    startWave(1);

    const handleMouseMove = (e: MouseEvent) => engineRef.current?.updateMouse(e.clientX, e.clientY);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        engineRef.current?.stop();
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- Sync Effects ---
  
  // Sync Store -> Engine
  useEffect(() => { engineRef.current?.updateAmmo(ammoState); }, [ammoState]);
  useEffect(() => { engineRef.current?.updateStats(stats); }, [stats]);

  // Handle Resize
  useLayoutEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const updateSize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        engineRef.current?.resize(clientWidth, clientHeight);
    };
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize(); 
    return () => observer.disconnect();
  }, []);

  // Pause check
  useEffect(() => {
    if (pendingLevelUps > 0 && phase === GamePhase.COMBAT) {
        setPhase(GamePhase.LEVEL_UP);
        engineRef.current?.stop();
    }
  }, [pendingLevelUps, phase]);

  // Timer
  useEffect(() => {
      if (phase === GamePhase.COMBAT && !isGameOver) {
          const interval = setInterval(() => {
              setWaveTime(prev => Math.max(0, prev - 1));
          }, 1000);
          return () => clearInterval(interval);
      }
  }, [phase, isGameOver]);

  // --- Actions ---

  const startWave = (waveNum: number) => {
      const config = WAVE_CONFIG.find(w => w.wave === waveNum) || WAVE_CONFIG[WAVE_CONFIG.length - 1];
      const duration = config ? config.duration : 60;
      setWaveTime(duration);
      setPhase(GamePhase.COMBAT);
      setCurrentWave(waveNum);
      engineRef.current?.startWave(duration, waveNum);
  };

  const handleLevelUpSelect = (upgrade: any) => {
      // Apply upgrades
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
              engineRef.current?.start();
          } else {
              setPhase(GamePhase.SHOP);
          }
      }
  };

  const handleShopNext = () => {
      startWave(currentWave + 1);
  };

  const handleBuyWeapon = (weapon: AmmoItem) => {
      addAmmo(weapon);
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
      
      {/* LEFT: 25% Ammo Dock - Always Visible. High Z-Index to stay above Shop */}
      <div className="w-1/4 h-full border-r border-white/10 z-[60]">
          <AmmoBay />
      </div>

      {/* RIGHT: 75% Dynamic Area */}
      <div className="w-3/4 h-full relative" ref={containerRef}>
          <canvas 
            ref={canvasRef}
            className={`w-full h-full block cursor-none ${phase !== GamePhase.COMBAT ? 'filter blur-md brightness-50' : ''}`} 
          />
          
          {phase === GamePhase.COMBAT && <HUD stats={stats} waveTime={waveTime} currentWave={currentWave} />}

          {/* Level Up & Shop now inside the game area container */}
          {phase === GamePhase.LEVEL_UP && (
            <div className="absolute inset-0 z-50">
                <LevelUpModal level={stats.level} onSelect={handleLevelUpSelect} />
            </div>
          )}

          {phase === GamePhase.SHOP && (
            <div className="absolute inset-0 z-50">
                <Shop 
                    stats={stats} 
                    currentWave={currentWave}
                    onBuyWeapon={handleBuyWeapon} 
                    onBuyItem={handleBuyItem} 
                    onNextWave={handleShopNext} 
                    updateGold={(amt) => updateStats({ gold: stats.gold + amt })}
                />
            </div>
          )}
      </div>

      {/* GLOBAL OVERLAYS */}
      
      {showChest && (
         <div className="absolute inset-0 z-[100]">
            <ChestOpenModal rewards={[]} onComplete={() => { setShowChest(false); engineRef.current?.start(); }} /> 
         </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-red-950/90 z-[100] flex flex-col items-center justify-center">
            <h1 className="text-8xl font-black text-red-500 mb-4">YOU DIED</h1>
            <p className="text-2xl mb-8">Wave Reached: {currentWave}</p>
            <button onClick={handleRestart} className="px-8 py-3 bg-white text-black font-bold rounded">
                RESTART
            </button>
        </div>
      )}

    </div>
  );
}