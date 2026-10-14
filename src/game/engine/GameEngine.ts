import * as PIXI from 'pixi.js';
import { defaultConfig, type GameConfig } from '../../config/gameConfig';
import { InputManager } from '../systems/InputManager';
import { Player } from '../entities/Player';
import { ProjectileManager } from '../systems/ProjectileManager';
import { EnemyManager } from '../systems/EnemyManager';
import { TileMap } from '../entities/TileMap';
import { Collision } from '../systems/Collision';
import { Background } from '../entities/Background';
import { EffectManager } from '../systems/EffectManager';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export class GameEngine {
  public app: PIXI.Application;
  private isInitialized = false;
  public inputManager!: InputManager;
  private projManager!: ProjectileManager;
  private enemyManager!: EnemyManager;
  private player!: Player;
  private tileMap!: TileMap;
  public config: GameConfig = { ...defaultConfig };
  private background!: Background;
  
  public gameState: GameState = 'MENU';
  public isGameOver: boolean = false;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedDuration: number = 0;
  private effectManager!: EffectManager;
  
  // Callbacks para sincronizar com a UI React
  public onHUDUpdate?: (score: number, health: number, maxHealth: number, timeLeft: number, isGameOver: boolean) => void;
  public onGameOver?: (score: number, reason: 'TIME UP' | 'DEFEATED', durationSec: number) => void;
  private initPromise: Promise<void> | null = null;
  private lastHUDUpdate: number = 0;

  private isDestroyed = false;

  constructor() {
    this.app = new PIXI.Application();
  }

  public get isReady(): boolean {
    return this.isInitialized;
  }

  public async init(container: HTMLDivElement): Promise<void> {
    if (this.isInitialized || this.initPromise) return this.initPromise ?? Promise.resolve();

    this.initPromise = (async () => {
      await this.app.init({
        width: this.config.arena.width,
        height: this.config.arena.height,
        backgroundColor: 0x1e293b, 
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (this.isDestroyed) {
        try {
          this.app.destroy(true, { children: true });
        } catch {
          // ignore
        }
        return;
      }

      // Estilização para garantir que o canvas fique perfeitamente responsivo e centralizado
      this.app.canvas.style.display = 'block';
      this.app.canvas.style.width = '100%';
      this.app.canvas.style.height = '100%';
      this.app.canvas.style.objectFit = 'contain';

      // Garante que o container tenha apenas um único canvas
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(this.app.canvas);

      this.effectManager = new EffectManager();
      await this.effectManager.init();

      this.inputManager = new InputManager();
      this.projManager = new ProjectileManager();
      this.enemyManager = new EnemyManager(this.config);
      await this.enemyManager.init();

      // 1. Inicializa o fundo do oceano na camada 0
      this.background = new Background();
      await this.background.init(this.config.arena.width, this.config.arena.height);
      this.app.stage.addChild(this.background.container);

      // 2. TileMap: ilhas com tiles — acima do fundo, abaixo dos navios
      this.tileMap = new TileMap();
      await this.tileMap.init();
      this.app.stage.addChild(this.tileMap.container);

      const centerX = this.app.screen.width / 2;
      const centerY = this.app.screen.height / 2;

      this.player = new Player(centerX - 150, centerY, this.config.player);
      await this.player.init();

      this.app.stage.addChild(this.enemyManager.container);
      this.app.stage.addChild(this.projManager.container);
      this.app.stage.addChild(this.player.container);
      this.app.stage.addChild(this.effectManager.container);

      // No menu principal inicial, mantemos as entidades de combate ocultas
      this.setBattleEntitiesVisible(false);

      this.app.ticker.add((ticker) => {
        // 1. O fundo do mar permanece animado em qualquer estado (Menu, Pausa, Jogo)
        this.background.update(ticker.deltaTime);

        // 2. Se não estiver no modo de batalha ativo, interrompe a física e timers
        if (this.gameState !== 'PLAYING') return;

        const bounds = { width: this.app.screen.width, height: this.app.screen.height };
        
        this.player.update(ticker, this.inputManager, this.projManager, bounds);
        
        // 📚 Colisão: Jogador vs TODAS as ilhas (2 passes de relaxamento para quinas e praias perfeitas)
        for (let pass = 0; pass < 2; pass++) {
          for (const circle of this.tileMap.collisionCircles) {
            if (Collision.checkCircle(this.player.container, circle, 24, circle.radius)) {
              const dx = this.player.container.x - circle.x;
              const dy = this.player.container.y - circle.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const minDist = circle.radius + 26;
              if (dist < minDist) {
                const angle = dist > 0.001 ? Math.atan2(dy, dx) : 0;
                this.player.container.x = circle.x + Math.cos(angle) * minDist;
                this.player.container.y = circle.y + Math.sin(angle) * minDist;
              }
            }
          }
        }

        this.projManager.update(ticker, bounds);
        this.effectManager.update(ticker.deltaMS);
        this.enemyManager.update(ticker, this.player, this.projManager, this.tileMap.collisionCircles, bounds, this.effectManager);

        this.checkGameOver();
        
        // Sincronização throttled com o React (250ms)
        const now = performance.now();
        if (now - this.lastHUDUpdate > 250) {
          const activeDuration = (now - this.startTime - this.totalPausedDuration) / 1000;
          const timeLeft = Math.max(0, this.config.sessionTime - activeDuration);
          
          this.onHUDUpdate?.(this.enemyManager.score, this.player.health, this.player.maxHealth, timeLeft, this.isGameOver);
          this.lastHUDUpdate = now;
        }
      });

      this.isInitialized = true;
    })();

    return this.initPromise;
  }

  public async startGame(newConfig?: Partial<GameConfig>): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    }

    // Limpa projéteis e inimigos anteriores
    if (this.projManager?.projectiles) {
      this.projManager.projectiles.forEach((p) => p.destroy());
      this.projManager.projectiles = [];
    }

    if (this.enemyManager?.enemies) {
      this.enemyManager.enemies.forEach((e) => e.destroy());
      this.enemyManager.enemies = [];
      this.enemyManager.score = 0;
    }

    // Reseta posição e vida do jogador
    if (this.player) {
      const centerX = this.app.screen.width / 2;
      const centerY = this.app.screen.height / 2;
      this.player.container.x = centerX - 150;
      this.player.container.y = centerY;
      this.player.container.rotation = 0;
      this.player.health = this.player.maxHealth;
    }

    this.setBattleEntitiesVisible(true);

    this.startTime = performance.now();
    this.totalPausedDuration = 0;
    this.isGameOver = false;
    this.gameState = 'PLAYING';

    this.onHUDUpdate?.(0, this.player?.health ?? 100, this.player?.maxHealth ?? 100, this.config.sessionTime, false);
  }

  public pause(): void {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      this.pauseStartTime = performance.now();
    }
  }

  public resume(): void {
    if (this.gameState === 'PAUSED') {
      this.totalPausedDuration += performance.now() - this.pauseStartTime;
      this.gameState = 'PLAYING';
    }
  }

  public stopGame(): void {
    this.gameState = 'MENU';
    this.setBattleEntitiesVisible(false);
  }

  private setBattleEntitiesVisible(visible: boolean) {
    if (this.player) this.player.container.visible = visible;
    if (this.enemyManager) this.enemyManager.container.visible = visible;
    if (this.projManager) this.projManager.container.visible = visible;
  }

  private checkGameOver() {
    const activeDuration = (performance.now() - this.startTime - this.totalPausedDuration) / 1000;
    const isDefeated = this.player.health <= 0;
    const isTimeUp = activeDuration >= this.config.sessionTime;

    if (isDefeated || isTimeUp) {
      this.isGameOver = true;
      this.gameState = 'GAME_OVER';
      const reason: 'TIME UP' | 'DEFEATED' = isDefeated ? 'DEFEATED' : 'TIME UP';
      
      this.onHUDUpdate?.(this.enemyManager.score, Math.max(0, this.player.health), this.player.maxHealth, 0, true);
      this.onGameOver?.(this.enemyManager.score, reason, Math.min(activeDuration, this.config.sessionTime));
    }
  }

  public destroy(): void {
    this.isDestroyed = true;
    try {
      if (this.app?.canvas && this.app.canvas.parentNode) {
        this.app.canvas.parentNode.removeChild(this.app.canvas);
      }
    } catch {
      // ignore
    }
    if (this.inputManager) this.inputManager.destroy();
    if (this.projManager) this.projManager.destroy();
    if (this.enemyManager) this.enemyManager.destroy();
    if (this.tileMap) this.tileMap.destroy();
    if (this.background) this.background.destroy();
    if (this.player) this.player.destroy();
    if (this.effectManager) this.effectManager.destroy();
    try {
      this.app?.destroy(true, { children: true });
    } catch {
      // Ignore destruction errors during rapid remounting
    }
    this.isInitialized = false;
  }
}
