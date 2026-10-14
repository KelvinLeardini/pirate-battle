import * as PIXI from 'pixi.js';
import { Enemy, type EnemyType } from '../entities/Enemy';
import type { GameConfig } from '../../config/gameConfig';
import type { Player } from '../entities/Player';
import type { ProjectileManager } from './ProjectileManager';
import { Collision } from './Collision';
import type { EffectManager } from './EffectManager';

// 📚 CollisionCircle: apenas dados de posição + raio.
// Não precisamos de um objeto Island completo aqui — o EnemyManager só
// precisa saber ONDE a ilha está e qual é o seu raio para repelir inimigos.
// Isso é o princípio de "depender da abstração mínima necessária".
interface CollisionCircle { x: number; y: number; radius: number; }

export class EnemyManager {
  public container: PIXI.Container;
  public enemies: Enemy[] = [];
  private config: GameConfig['enemies'];
  private lastSpawnTime: number = 0;
  private spawnInterval: number;
  public score: number = 0;
  private chaserTexture!: PIXI.Texture;
  private shooterTexture!: PIXI.Texture;
  private fireTexture!: PIXI.Texture;

  constructor(config: GameConfig) {
    this.config = config.enemies;
    this.spawnInterval = config.spawnInterval;
    this.container = new PIXI.Container();
  }

  public async init(): Promise<void> {
    const [chaserTex, shooterTex, fireTex] = await Promise.all([
      PIXI.Assets.load('/assets/images/retina/ships/ship_3.png'),
      PIXI.Assets.load('/assets/images/retina/ships/ship_21.png'),
      PIXI.Assets.load('/assets/images/retina/effects/fire_1.png'),
    ]);
    this.chaserTexture = chaserTex;
    this.shooterTexture = shooterTex;
    this.fireTexture = fireTex;
  }

    public update(ticker: PIXI.Ticker, player: Player, projManager: ProjectileManager, islands: CollisionCircle[], bounds: { width: number; height: number }, effectManager: EffectManager) {
    const delta = ticker.deltaTime;
    const now = performance.now();

    if (now - this.lastSpawnTime > this.spawnInterval) {
      this.spawnEnemy(bounds);
      this.lastSpawnTime = now;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta, player, projManager);

      // 1. Colisão: Inimigo vs TODAS as ilhas (repele o navio inimigo da areia)
      for (const island of islands) {
        if (Collision.checkCircle(enemy.container, island, 16, island.radius)) {
          const dx = enemy.container.x - island.x;
          const dy = enemy.container.y - island.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = island.radius + 18;
          if (dist < minDist) {
            const angle = dist > 0.001 ? Math.atan2(dy, dx) : 0;
            enemy.container.x = island.x + Math.cos(angle) * minDist;
            enemy.container.y = island.y + Math.sin(angle) * minDist;
          }
        }
      }

      // 2. Colisão: Bala do Jogador vs Inimigo
      for (let j = projManager.projectiles.length - 1; j >= 0; j--) {
        const proj = projManager.projectiles[j];
        if (proj.owner === 'player' && Collision.checkCircle(enemy.container, proj.container, 15, 4)) {
          enemy.takeDamage(proj.damage);
          proj.isDead = true;
        }
      }

      // 3. Colisão: Inimigo vs Jogador (Dano de abalroamento)
      if (Collision.checkCircle(enemy.container, player.container, 15, 15)) {
        player.health -= enemy.damage;
        enemy.isDead = true;
      }

      // 4. Morte do Inimigo
      if (enemy.isDead) {
        effectManager.spawnExplosion(enemy.container.x, enemy.container.y);
        if (enemy.health <= 0) {
          this.score += 1;
        }
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // 5. Colisão de Balas: contra Ilhas e contra o Jogador
    for (let j = projManager.projectiles.length - 1; j >= 0; j--) {
      const proj = projManager.projectiles[j];
      
      // Checa se a bala bateu em QUALQUER uma das ilhas
      let hitIsland = false;
      for (const island of islands) {
        if (Collision.checkCircle(proj.container, island, 4, island.radius)) {
          proj.isDead = true;
          hitIsland = true;
          break;
        }
      }
      if (hitIsland) continue;

      // Se for tiro inimigo, verifica se atingiu o jogador
      if (proj.owner === 'enemy' && Collision.checkCircle(player.container, proj.container, 15, 4)) {
        player.health -= proj.damage;
        proj.isDead = true;
      }
    }
  }

  private spawnEnemy(bounds: { width: number; height: number }) {
    let x, y;
    if (Math.random() > 0.5) {
      x = Math.random() > 0.5 ? -30 : bounds.width + 30;
      y = Math.random() * bounds.height;
    } else {
      x = Math.random() * bounds.width;
      y = Math.random() > 0.5 ? -30 : bounds.height + 30;
    }

    const type: EnemyType = Math.random() > 0.5 ? 'chaser' : 'shooter';
    const texture = type === 'chaser' ? this.chaserTexture : this.shooterTexture;
    const enemy = new Enemy(x, y, type, this.config, texture, this.fireTexture);
    
    this.enemies.push(enemy);
    this.container.addChild(enemy.container);
  }

  public destroy() {
    this.enemies.forEach(e => e.destroy());
    this.enemies = [];
    this.container.destroy({ children: true });
  }
}