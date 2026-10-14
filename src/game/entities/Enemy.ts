import * as PIXI from 'pixi.js';
import type { GameConfig } from '../../config/gameConfig';
import type { Player } from './Player';
import type { ProjectileManager } from '../systems/ProjectileManager';

export type EnemyType = 'chaser' | 'shooter';

export class Enemy {
  public container: PIXI.Container;
  private sprite: PIXI.Sprite;
  private healthBar: PIXI.Graphics;
  public health: number;
  public maxHealth: number;
  public damage: number;
  public speed: number;
  public isDead: boolean = false;
  public type: EnemyType;
  
  public attackRange: number = 0;
  public cooldown: number = 0;
  private lastShotTime: number = 0;

  constructor(x: number, y: number, type: EnemyType, config: GameConfig['enemies'], texture: PIXI.Texture) {
    this.type = type;
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    // Instancia o sprite com a textura pré-carregada
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5, 0.5);

    // Ajusta a rotação interna para a proa alinhar ao ângulo 0 (Eixo +X)
    this.sprite.rotation = -Math.PI / 2;

    this.healthBar = new PIXI.Graphics();

    if (type === 'chaser') {
      this.speed = config.chaser.speed;
      this.maxHealth = config.chaser.health;
      this.damage = config.chaser.damage;
      // Navio vermelho mais ágil e compacto
      this.sprite.scale.set(0.45);
    } else {
      this.speed = config.shooter.speed;
      this.maxHealth = config.shooter.health;
      this.damage = 15; 
      this.attackRange = config.shooter.attackRange;
      this.cooldown = config.shooter.cooldown;
      // Fragata armada mais robusta
      this.sprite.scale.set(0.55);
    }
    
    this.health = this.maxHealth;
    
    this.container.addChild(this.sprite);
    this.container.addChild(this.healthBar);
  }

  public update(delta: number, player: Player, projManager: ProjectileManager) {
    const dx = player.container.x - this.container.x;
    const dy = player.container.y - this.container.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Aponta a embarcação em direção ao jogador
    this.container.rotation = angle;

    if (this.type === 'chaser') {
      // Persegue e avança diretamente contra o jogador para abalroar
      this.container.x += Math.cos(angle) * this.speed * delta;
      this.container.y += Math.sin(angle) * this.speed * delta;
    } else if (this.type === 'shooter') {
      if (distance > this.attackRange) {
        // Aproxima-se até o alcance máximo dos seus canhões
        this.container.x += Math.cos(angle) * this.speed * delta;
        this.container.y += Math.sin(angle) * this.speed * delta;
      } else {
        // Mantém distância e dispara periodicamente
        const now = performance.now();
        if (now - this.lastShotTime > this.cooldown) {
          // Dispara a bola de canhão a partir da proa do navio inimigo
          const spawnX = this.container.x + Math.cos(angle) * 28;
          const spawnY = this.container.y + Math.sin(angle) * 28;
          projManager.spawn(spawnX, spawnY, angle, 6, this.damage, 0xa855f7, 'enemy');
          this.lastShotTime = now;
        }
      }
    }

    this.drawHealthBar();
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) this.isDead = true;
  }

  private drawHealthBar() {
    this.healthBar.clear();
    // Neutraliza a rotação para manter a barra horizontal acima do mastro
    this.healthBar.rotation = -this.container.rotation; 
    
    const percent = Math.max(0, this.health / this.maxHealth);
    const barWidth = 30;
    const barHeight = 4;
    const barY = -32;

    this.healthBar.rect(-barWidth / 2, barY, barWidth, barHeight).fill(0x333333);
    this.healthBar.rect(-barWidth / 2, barY, barWidth * percent, barHeight).fill(0xfacc15); // Amarelo para inimigos
  }

  public destroy() {
    this.sprite.destroy();
    this.container.destroy({ children: true });
  }
}