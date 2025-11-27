

import { AmmoItem, AmmoType, PlayerStats, AmmoBayState, WeaponClass, Enemy, Projectile, Structure, LootDrop, FloatingText } from '../types';
import { ROW_COUNT, BACKGROUND_SLANG, GRID_TOP_OFFSET, WAVE_CONFIG, ENEMY_DATA } from '../constants';

// --- The Engine ---

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number = 0;
  private lastTime: number = 0;
  public isRunning: boolean = false;

  // Layout Dimensions (Dynamic)
  public width: number;
  public height: number;
  public rowHeight: number;

  // Entities
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private structures: Structure[] = []; 
  private loot: LootDrop[] = [];
  private damageTexts: FloatingText[] = [];
  private bgTexts: { x: number; y: number; text: string; opacity: number; life: number }[] = [];
  
  // State
  private stats: PlayerStats;
  private ammoState: AmmoBayState = {};
  private mousePos: { x: number; y: number } = { x: 0, y: 0 };
  private snakeTrail: { x: number; y: number }[] = [];
  
  // Game Logic State
  private enemyIdCounter = 0;
  private waveTime = 0;
  private currentWave = 1;
  private isWaveActive = false;
  private spawnTimer = 0;
  
  // Firing State: Map itemId -> time until ready (seconds)
  private itemCooldowns: Map<string, number> = new Map();

  // Callbacks
  private callbacks: {
    onDamagePlayer: (amount: number) => void;
    onGainLoot: (xp: number, gold: number) => void;
    onWaveEnd: () => void;
    onLootGoblinKill: () => void;
  };

  constructor(
    canvas: HTMLCanvasElement, 
    stats: PlayerStats,
    callbacks: any
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.stats = stats;
    this.callbacks = callbacks;
    
    // Set dimensions based on current canvas capability
    this.width = canvas.width;
    this.height = canvas.height;
    this.rowHeight = (this.height - GRID_TOP_OFFSET) / ROW_COUNT;

    // Init BG Text
    for (let i = 0; i < 8; i++) this.spawnBgText();
  }

  public resize(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.rowHeight = (height - GRID_TOP_OFFSET) / ROW_COUNT;
  }

  public updateStats(newStats: PlayerStats) { this.stats = newStats; }
  public updateAmmo(newAmmo: AmmoBayState) { this.ammoState = newAmmo; }
  
  public updateMouse(x: number, y: number) {
    // Map client coordinates to canvas coordinates
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;
    const cx = (x - rect.left) * scaleX;
    const cy = (y - rect.top) * scaleY;
    
    this.mousePos = { x: cx, y: cy };
  }

  public startWave(duration: number, waveNum: number) {
    this.enemies = [];
    this.projectiles = [];
    this.loot = [];
    this.structures = [];
    this.waveTime = duration;
    this.currentWave = waveNum;
    this.isWaveActive = true;
    this.itemCooldowns.clear();
    this.spawnTimer = 0;
    this.start();
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
  }

  public cleanup() {
      this.stop();
      this.enemies = [];
      this.projectiles = [];
      this.loot = [];
      this.structures = [];
      this.itemCooldowns.clear();
      this.bgTexts = [];
  }

  // --- Core Loop ---

  private animate = (timestamp: number) => {
    if (!this.isRunning) return;
    const dt = (timestamp - this.lastTime) / 1000; 
    this.lastTime = timestamp;

    if (this.isWaveActive) {
        this.waveTime -= dt;
        if (this.waveTime <= 0) {
            this.isWaveActive = false;
            this.callbacks.onWaveEnd();
            this.enemies = []; 
        }
        this.spawnEnemies(dt);
    }

    this.updateSnakeTrail();
    this.updatePlayerWeapons(dt);
    this.updateStructures(dt);
    this.updateProjectiles(dt);
    this.updateEnemies(dt);
    this.updateLoot(dt);
    this.updateVisuals(dt);
    
    this.draw();
    
    this.animationId = requestAnimationFrame(this.animate);
  };

  // --- Logic Subsystems ---

  private updateSnakeTrail() {
    this.snakeTrail.push({ ...this.mousePos });
    const maxLen = 20 + (this.stats.speed / 10);
    if (this.snakeTrail.length > maxLen) {
        this.snakeTrail.shift();
    }
  }

  private spawnEnemies(dt: number) {
     const config = WAVE_CONFIG.find(w => w.wave === this.currentWave) || WAVE_CONFIG[WAVE_CONFIG.length - 1];
     
     this.spawnTimer -= dt;
     if (this.spawnTimer <= 0) {
         this.spawnTimer = config.interval;
         
         // Spawn Logic
         const enemyKey = config.enemies[Math.floor(Math.random() * config.enemies.length)];
         const data = ENEMY_DATA[enemyKey];
         
         if (data) {
             const row = Math.floor(Math.random() * ROW_COUNT);
             // Y Calculation: Account for TOP OFFSET
             const y = GRID_TOP_OFFSET + (row * this.rowHeight) + (this.rowHeight / 2);
             
             // Tree logic: spawn within field, others spawn off-screen
             let x = this.width + 50;
             if (data.id === 'tree') {
                 x = 300 + Math.random() * (this.width - 400);
             }

             this.enemyIdCounter++;
             
             // Map Type 0-3 to Enum string
             let typeStr: Enemy['type'] = 'NORMAL';
             if (data.type === 1) typeStr = 'ELITE';
             if (data.type === 2) typeStr = 'BOSS';
             if (data.type === 3 && data.id === 'looter') typeStr = 'LOOT_GOBLIN';

             // Map Speed for Looter (JSON positive speed, Engine needs neg or logic)
             // Engine logic: x -= speed * dt. So positive speed = move left.
             // Looter: behavior "flee" = move right. So speed should be negative.
             let speed = data.speed;
             if (data.behavior === 'flee') speed = -speed;
             
             // HP Scaling
             const hp = data.baseHp + (data.hpPerWave * this.currentWave);

             this.enemies.push({
                 id: this.enemyIdCounter, 
                 x, y, 
                 radius: typeStr === 'BOSS' ? 60 : (typeStr === 'ELITE' ? 40 : 30), 
                 markedForDeletion: false,
                 hp: hp, 
                 maxHp: hp, 
                 speed: speed,
                 emoji: data.emoji || '👾', 
                 type: typeStr,
                 xpValue: data.materials, 
                 goldValue: data.materials,
                 damage: data.damage,
                 hitFlashTime: 0,
                 stunTimer: 0
             });
         }
     }
  }

  private calculateDamage(weaponDmg: number, weaponClass: WeaponClass): { dmg: number, isCrit: boolean } {
      let flatBonus = 0;
      if (weaponClass === 'MELEE') flatBonus = this.stats.meleeDmg;
      if (weaponClass === 'RANGED') flatBonus = this.stats.rangedDmg;
      if (weaponClass === 'MAGIC') flatBonus = this.stats.elementalDmg; 
      if (weaponClass === 'ENGINEERING') flatBonus = this.stats.engineering;

      let finalDmg = weaponDmg + flatBonus;
      finalDmg *= (1 + this.stats.damagePercent / 100);

      const isCrit = Math.random() < this.stats.critChance;
      if (isCrit) {
          finalDmg *= this.stats.critDamage;
      }

      return { dmg: finalDmg, isCrit };
  }

  private updatePlayerWeapons(dt: number) {
    Object.entries(this.ammoState).forEach(([rowId, items]) => {
        if (items.length === 0) return;
        const rowIndex = parseInt(rowId.replace('row-', ''));
        
        // Firing Logic: Each item manages its own cooldown (PvZ Style)
        items.forEach((item) => {
             // Get current cooldown state
             let cooldown = this.itemCooldowns.get(item.id) || 0;
             if (cooldown > 0) {
                 cooldown -= dt;
                 this.itemCooldowns.set(item.id, Math.max(0, cooldown));
             } else {
                 // Ready to fire
                 this.fireWeapon(item, rowIndex);
                 // Calculate next cooldown: Base / (1 + Speed%)
                 const adjustedCooldown = item.cooldown / (1 + this.stats.attackSpeed / 100);
                 this.itemCooldowns.set(item.id, adjustedCooldown);
             }
        });
    });
  }

  private fireWeapon(item: AmmoItem, rowIndex: number) {
      // Y Calculation: Account for TOP OFFSET
      const y = GRID_TOP_OFFSET + (rowIndex * this.rowHeight) + (this.rowHeight / 2);
      const x = 100; // Firing line

      // --- ENGINEERING LOGIC ---
      if (item.weaponClass === 'ENGINEERING') {
          // 1. Find target: Construction Site OR Damaged Structure
          let target = this.structures.find(s => s.type === item.structureType && (s.state === 'BLUEPRINT' || s.life < s.maxLife));
          
          // 2. If no target, create a BLUEPRINT
          if (!target) {
              const targetX = 200 + Math.random() * (this.width - 300);
              // Constrain Y to play area
              const minY = GRID_TOP_OFFSET + 50;
              const maxY = this.height - 50;
              const targetY = minY + Math.random() * (maxY - minY);
              
              const newStruct: Structure = {
                  id: Math.random(), x: targetX, y: targetY, radius: 25, markedForDeletion: false,
                  type: item.structureType || 'TURRET',
                  state: 'BLUEPRINT',
                  progress: 0,
                  maxProgress: 100, // Arbitrary build requirement
                  cooldown: 0, maxCooldown: item.cooldown,
                  damage: item.damage, range: 300, 
                  life: 50, maxLife: 50
              };
              this.structures.push(newStruct);
              target = newStruct;
          }

          // 3. Fire a "Builder Projectile" at the target
          const angle = Math.atan2(target.y - y, target.x - x);
          this.projectiles.push({
              id: Math.random(), x, y, radius: 8,
              vx: Math.cos(angle) * item.speed, vy: Math.sin(angle) * item.speed,
              damage: item.damage, emoji: item.emoji, type: AmmoType.ENGINEERING, weaponClass: 'ENGINEERING',
              pierce: 0, life: 0, maxLife: 5, sourceId: 'builder', crit: false,
              markedForDeletion: false, hitList: [],
              startX: x, startY: y, knockback: 0
          });
          return;
      }

      // --- OTHER WEAPONS ---
      const { dmg, isCrit } = this.calculateDamage(item.damage, item.weaponClass);
      
      let vx = item.speed;
      let vy = 0;
      const maxLife = item.duration || 5;

      if (item.type === AmmoType.HOMING || item.weaponClass === 'MAGIC') {
          // Find initial target
          let target = null;
          let minDist = Infinity;
          this.enemies.forEach(e => {
              const d = (e.x - x)**2 + (e.y - y)**2;
              if (d < minDist) { minDist = d; target = e; }
          });
          
          if (!target) {
               // Pseudo-target mouse if no enemy
               const angle = Math.atan2(this.mousePos.y - y, this.mousePos.x - x);
               vx = Math.cos(angle) * item.speed;
               vy = Math.sin(angle) * item.speed;
          } else {
             const angle = Math.atan2(target.y - y, target.x - x);
             vx = Math.cos(angle) * item.speed;
             vy = Math.sin(angle) * item.speed;
          }
      }

      this.projectiles.push({
          id: Math.random(), x, y, radius: item.weaponClass === 'MELEE' ? 20 : 10,
          vx, vy, startX: x, startY: y,
          damage: dmg, emoji: item.emoji, type: item.type, weaponClass: item.weaponClass,
          pierce: item.pierce || 0,
          life: 0, maxLife: maxLife, 
          sourceId: 'player', crit: isCrit,
          markedForDeletion: false, hitList: [], 
          knockback: (item.knockback || 0) + this.stats.globalKnockback
      });
  }

  private updateStructures(dt: number) {
      this.structures.forEach(s => {
          if (s.state === 'BLUEPRINT') return; // Blueprints don't shoot

          s.life -= dt * 0.1; // Slow decay? Or just damage
          if (s.life <= 0) { s.markedForDeletion = true; return; }
          
          s.cooldown -= dt;
          if (s.cooldown <= 0) {
              const target = this.enemies.find(e => {
                  const d = (e.x - s.x)**2 + (e.y - s.y)**2;
                  return d < s.range**2;
              });

              if (target) {
                  s.cooldown = s.maxCooldown / (1 + this.stats.attackSpeed / 100);
                  const dmg = s.damage + this.stats.engineering;
                  const angle = Math.atan2(target.y - s.y, target.x - s.x);
                  
                  let emoji = '🔴';
                  if (s.type === 'TURRET') emoji = '🔹';
                  if (s.type === 'MINE') emoji = '💣';
                  
                  // Mines explode instead of shooting
                  if (s.type === 'MINE') {
                       // AOE Damage
                       this.enemies.forEach(e => {
                           if ((e.x - s.x)**2 + (e.y - s.y)**2 < (s.range/2)**2) {
                               e.hp -= dmg * 3;
                               this.damageTexts.push({x: e.x, y: e.y, text: "BOOM", color: 'orange', life: 0.5, velocity: {x:0,y:-50}, scale: 2});
                           }
                       });
                       s.markedForDeletion = true;
                  } else {
                      this.projectiles.push({
                          id: Math.random(), x: s.x, y: s.y, radius: 5,
                          vx: Math.cos(angle) * 400, vy: Math.sin(angle) * 400,
                          damage: dmg, emoji: emoji, type: AmmoType.HOMING, weaponClass: 'ENGINEERING',
                          pierce: 0, life: 0, maxLife: 2, sourceId: 'turret', crit: false,
                          markedForDeletion: false, hitList: [], startX: s.x, startY: s.y, knockback: 10
                      });
                  }
              }
          }
      });
      this.structures = this.structures.filter(s => !s.markedForDeletion);
  }

  private updateProjectiles(dt: number) {
      this.projectiles.forEach(p => {
          
          // --- MOVEMENT ---
          if (p.weaponClass === 'MAGIC') {
              // Homing Logic for Magic: Re-adjust velocity towards nearest enemy
              let target = null;
              let minDist = 1000**2;
              this.enemies.forEach(e => {
                  const d = (e.x - p.x)**2 + (e.y - p.y)**2;
                  if (d < minDist) { minDist = d; target = e; }
              });
              if (target) {
                  const angle = Math.atan2(target.y - p.y, target.x - p.x);
                  // Current speed magnitude
                  const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
                  // Interpolate velocity for smooth turning (optional, but hard set is easier for "Magic Missile" feel)
                  const turnRate = 5 * dt;
                  const targetVx = Math.cos(angle) * speed;
                  const targetVy = Math.sin(angle) * speed;
                  p.vx += (targetVx - p.vx) * turnRate;
                  p.vy += (targetVy - p.vy) * turnRate;
              }
          }
          
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;

          // --- LIFECYCLE ---
          if (p.weaponClass === 'MELEE') {
               const dist = Math.sqrt((p.x - p.startX)**2 + (p.y - p.startY)**2);
               // Melee disappears after range (which is now larger in constants.ts)
               // Also visual check if it goes too far
               if (dist > (this.stats.range + 150 + 400)) p.markedForDeletion = true; 
               if (p.x > this.width * 0.6) p.markedForDeletion = true; // Hard cap for "Left Half" visual
          } else if (p.weaponClass === 'MAGIC') {
               if (p.life > p.maxLife) p.markedForDeletion = true;
          } else {
               // Ranged / Engineering die off screen
               if (p.x > this.width + 100 || p.y < -100 || p.y > this.height + 100) p.markedForDeletion = true;
          }

          // --- COLLISION ---
          
          // ENGINEERING: Collide with Structures
          if (p.weaponClass === 'ENGINEERING') {
              for (const s of this.structures) {
                   const dx = p.x - s.x;
                   const dy = p.y - s.y;
                   if (dx*dx + dy*dy < (p.radius + s.radius)**2) {
                       if (s.state === 'BLUEPRINT') {
                           s.progress += p.damage + this.stats.engineering;
                           this.damageTexts.push({x: s.x, y: s.y, text: `+${Math.round(p.damage)}`, color: 'cyan', life: 0.5, velocity: {x:0, y:-20}, scale: 1});
                           if (s.progress >= s.maxProgress) {
                               s.state = 'BUILT';
                               s.life = s.maxLife;
                               this.damageTexts.push({x: s.x, y: s.y-20, text: "BUILT!", color: 'lime', life: 1, velocity: {x:0, y:-40}, scale: 1.5});
                           }
                       } else {
                           // Repair
                           s.life = Math.min(s.maxLife, s.life + p.damage);
                           this.damageTexts.push({x: s.x, y: s.y, text: "REPAIR", color: 'green', life: 0.5, velocity: {x:0, y:-20}, scale: 0.8});
                       }
                       p.markedForDeletion = true;
                       return; // Hit one structure per wrench
                   }
              }
              return; // Engineering bullets don't hit enemies
          }

          // MELEE / RANGED / MAGIC: Collide with Enemies
          for (const e of this.enemies) {
              if (e.markedForDeletion) continue;
              // Avoid hitting same enemy twice with MELEE/PIERCE (Hit List)
              if (p.hitList.includes(e.id)) continue;

              const dx = p.x - e.x;
              const dy = p.y - e.y;
              if (dx*dx + dy*dy < (p.radius + e.radius)**2) {
                  
                  // Register Hit
                  p.hitList.push(e.id);
                  e.hp -= p.damage;
                  
                  // Apply Knockback
                  if (p.knockback > 0) {
                      e.x += p.knockback;
                  }

                  // Visual Hit Feedback
                  e.hitFlashTime = 0.1;

                  if (Math.random() < this.stats.lifeSteal) this.callbacks.onDamagePlayer(-1);
                  
                  this.damageTexts.push({
                      x: e.x, y: e.y - 20, text: Math.round(p.damage).toString(),
                      color: p.crit ? '#ef4444' : 'white',
                      life: 0.5, velocity: {x:0, y: -50}, scale: p.crit ? 1.5 : 1
                  });

                  if (e.hp <= 0) {
                      e.markedForDeletion = true;
                      this.handleEnemyDeath(e);
                  }

                  // Pierce Logic
                  if (p.weaponClass === 'MELEE') {
                      // Melee penetrates infinitely until range expires
                  } else {
                      if (p.pierce > 0) {
                          p.pierce--;
                      } else {
                          p.markedForDeletion = true;
                      }
                  }
                  
                  // Optimization: If projectile dies, stop checking
                  if (p.markedForDeletion) break;
              }
          }
      });
      this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
  }

  private handleEnemyDeath(e: Enemy) {
      if (e.type === 'LOOT_GOBLIN') {
          this.callbacks.onLootGoblinKill();
      } else {
          this.loot.push({
              id: Math.random(), x: e.x, y: e.y, radius: 10, markedForDeletion: false,
              type: 'XP_GOLD', xp: e.xpValue, gold: e.goldValue, magnetized: true, age: 0
          });
      }
  }

  private updateEnemies(dt: number) {
      // Defense Line X position (Visual line is at 180)
      const DEFENSE_LINE_X = 180;

      this.enemies.forEach(e => {
          if (e.hitFlashTime > 0) e.hitFlashTime -= dt;

          if (e.type === 'LOOT_GOBLIN') {
              // Looter Logic: if behavior is 'flee', speed is negative (move right)
              // But ensure they don't get stuck or go too far
              e.x -= e.speed * dt; 
              if (e.x > this.width + 100) e.markedForDeletion = true; 
          } else {
              // Stun Logic
              if (e.stunTimer > 0) {
                  e.stunTimer -= dt;
              } else {
                  e.x -= e.speed * dt;
              }
              
              // Defense Line Logic
              if (e.x < DEFENSE_LINE_X) {
                  // Player takes damage (Low tier enemies deal min 1 dmg)
                  if (Math.random() < this.stats.dodge) {
                      this.damageTexts.push({x: 120, y: e.y, text: "MISS", color: '#3b82f6', life: 1, velocity: {x:0, y:-20}, scale: 1});
                  } else {
                      let dmgMult = 1;
                      if (this.stats.armor >= 0) dmgMult = 100 / (100 + this.stats.armor);
                      else dmgMult = 2 - (100 / (100 - this.stats.armor));
                      
                      const rawDmg = Math.max(1, e.damage);
                      const finalDmg = Math.max(1, Math.round(rawDmg * dmgMult));
                      
                      this.callbacks.onDamagePlayer(finalDmg);
                      this.damageTexts.push({x: 120, y: e.y, text: `-${finalDmg}`, color: 'red', life: 1, velocity: {x:0, y:-20}, scale: 1.5});
                  }

                  // Force Knockback & Stun regardless of hit/miss to prevent instant re-trigger
                  e.x += 100;
                  e.stunTimer = 0.5; // Short pause after hitting wall
              }
          }
      });
      this.enemies = this.enemies.filter(e => !e.markedForDeletion);
  }

  private updateLoot(dt: number) {
      // HUD Position (Approximate for the XP/HP panel in top left)
      // HUD is roughly at (250, 60) for the center of the bar area.
      const targetX = 250;
      const targetY = 60;
      
      const baseRange = 50;
      const pickupRange = baseRange * (1 + this.stats.pickupRange);
      
      this.loot.forEach(l => {
          l.age = (l.age || 0) + dt;

          if (l.age < 0.4) {
              // "Pop" phase: Drift slightly to show they dropped
              // We could simulate physics, but just waiting is fine for visual clarity
          } else {
              // Fly to HUD
              const dx = targetX - l.x;
              const dy = targetY - l.y;
              const distSq = dx*dx + dy*dy;
              const dist = Math.sqrt(distSq);

              // Accelerate towards HUD
              const speed = 2000; // Pixels per second

              if (dist < pickupRange) {
                  l.markedForDeletion = true;
                  this.callbacks.onGainLoot(l.xp, l.gold);
              } else {
                  l.x += (dx / dist) * speed * dt;
                  l.y += (dy / dist) * speed * dt;
              }
          }
      });
      this.loot = this.loot.filter(l => !l.markedForDeletion);
  }

  private updateVisuals(dt: number) {
      if (Math.random() < 0.01) this.spawnBgText();
      this.bgTexts.forEach(t => {
          t.life -= dt;
          if (t.life < 2) t.opacity = t.life / 2 * 0.2;
          else if (t.life > 8) t.opacity = (10 - t.life) / 2 * 0.2;
      });
      this.bgTexts = this.bgTexts.filter(t => t.life > 0);

      this.damageTexts.forEach(t => {
          t.x += t.velocity.x * dt;
          t.y += t.velocity.y * dt;
          t.velocity.y += 100 * dt; 
          t.life -= dt;
      });
      this.damageTexts = this.damageTexts.filter(t => t.life > 0);
  }

  private spawnBgText() {
      // Spawn BG Text anywhere, it's just visual fluff
      this.bgTexts.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          text: BACKGROUND_SLANG[Math.floor(Math.random() * BACKGROUND_SLANG.length)],
          opacity: 0,
          life: 10
      });
  }

  // --- Rendering ---

  private draw() {
      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw HUD Deadzone visually
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      this.ctx.fillRect(0, 0, this.width, GRID_TOP_OFFSET);
      
      // Draw Grid Lines (Rows)
      this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      for (let i = 0; i <= ROW_COUNT; i++) {
          const y = GRID_TOP_OFFSET + i * this.rowHeight;
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(this.width, y);
      }
      this.ctx.stroke();

      // BG Text
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.bgTexts.forEach(t => {
          this.ctx.font = 'bold 100px sans-serif';
          this.ctx.fillStyle = `rgba(255,255,255,${t.opacity})`;
          this.ctx.fillText(t.text, t.x, t.y);
      });

      // Limit Line
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.moveTo(180, GRID_TOP_OFFSET);
      this.ctx.lineTo(180, this.height);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Loot
      this.loot.forEach(l => {
          this.ctx.fillStyle = '#fbbf24';
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#fbbf24';
          this.ctx.beginPath();
          this.ctx.arc(l.x, l.y, l.radius, 0, Math.PI*2);
          this.ctx.fill();
          this.ctx.shadowBlur = 0;
      });

      // Structures
      this.structures.forEach(s => {
          if (s.state === 'BLUEPRINT') {
              this.ctx.globalAlpha = 0.5;
              this.ctx.font = '40px Arial';
              this.ctx.fillText('🚧', s.x, s.y);
              this.ctx.globalAlpha = 1.0;

              // Progress Bar
              const pct = s.progress / s.maxProgress;
              this.ctx.fillStyle = '#333';
              this.ctx.fillRect(s.x - 20, s.y + 25, 40, 5);
              this.ctx.fillStyle = '#0ea5e9';
              this.ctx.fillRect(s.x - 20, s.y + 25, 40 * pct, 5);
          } else {
              // BUILT
              let emoji = '🏯';
              if (s.type === 'TURRET') emoji = '🛡️';
              if (s.type === 'MINE') emoji = '💣';
              
              this.ctx.font = '40px Arial';
              this.ctx.fillText(emoji, s.x, s.y);
              
              // Range Indicator
              this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
              this.ctx.beginPath();
              this.ctx.arc(s.x, s.y, s.range, 0, Math.PI*2);
              this.ctx.stroke();

              // HP Bar
              const pct = s.life / s.maxLife;
              this.ctx.fillStyle = '#333';
              this.ctx.fillRect(s.x - 20, s.y + 25, 40, 5);
              this.ctx.fillStyle = '#22c55e';
              this.ctx.fillRect(s.x - 20, s.y + 25, 40 * pct, 5);
          }
      });

      // Enemies
      this.enemies.forEach(e => {
          this.ctx.save();
          
          if (e.hitFlashTime > 0) {
              this.ctx.globalAlpha = 0.6;
          }

          this.ctx.font = '48px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(e.emoji, e.x, e.y);

          this.ctx.restore();

          const hpPct = e.hp / e.maxHp;
          this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
          this.ctx.fillRect(e.x - 25, e.y - 40, 50, 6);
          this.ctx.fillStyle = e.type === 'LOOT_GOBLIN' ? '#fbbf24' : '#ef4444';
          this.ctx.fillRect(e.x - 25, e.y - 40, 50 * hpPct, 6);
      });

      // Projectiles
      this.projectiles.forEach(p => {
          this.ctx.font = '32px Arial';
          // Rotate projectile?
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          const angle = Math.atan2(p.vy, p.vx);
          this.ctx.rotate(angle);
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(p.emoji, 0, 0);
          this.ctx.restore();
      });

      // Floating Text
      this.damageTexts.forEach(t => {
          this.ctx.font = `bold ${30 * t.scale}px Arial`;
          this.ctx.fillStyle = t.color;
          this.ctx.fillText(t.text, t.x, t.y);
      });

      // Snake Trail
      this.ctx.fillStyle = '#fff';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = '#fff';
      this.snakeTrail.forEach((p, i) => {
          const size = (i / this.snakeTrail.length) * 20;
          this.ctx.fillRect(p.x - size/2, p.y - size/2, size, size);
      });
      this.ctx.shadowBlur = 0;
  }
}