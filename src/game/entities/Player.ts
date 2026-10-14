import * as PIXI from 'pixi.js';
import type { InputManager } from '../systems/InputManager';
import type { GameConfig } from '../../config/gameConfig';
import type { ProjectileManager } from '../systems/ProjectileManager';
import { playSound } from '../../utils/audio';

export class Player {
  public container: PIXI.Container;
  private sprite?: PIXI.Sprite;
  private fireSprite?: PIXI.Sprite;
  private healthBar: PIXI.Graphics;
  public health: number;
  public maxHealth: number;
  private config: GameConfig['player'];
  
  private lastFrontShot: number = 0;
  private lastSideShot: number = 0;

  constructor(x: number, y: number, config: GameConfig['player']) {
    this.config = config;
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    this.health = config.maxHealth;
    this.maxHealth = config.maxHealth;

    this.healthBar = new PIXI.Graphics();
    this.container.addChild(this.healthBar);
  }

  public async init(): Promise<void> {
    try {
      // Carrega o navio pirata com a caveira Jolly Roger
      const texture = await PIXI.Assets.load('/assets/images/retina/ships/ship_2.png');
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.scale.set(0.55);
      this.sprite.rotation = -Math.PI / 2;
      this.container.addChildAt(this.sprite, 0);

      // Carrega o efeito visual de fogo para deterioração do navio
      const fireTex = await PIXI.Assets.load<PIXI.Texture>('/assets/images/retina/effects/fire_1.png');
      this.fireSprite = new PIXI.Sprite(fireTex);
      this.fireSprite.anchor.set(0.5, 0.5);
      this.fireSprite.scale.set(0.4);
      this.fireSprite.y = 8; // Popa do navio
      this.fireSprite.visible = false;
      this.container.addChild(this.fireSprite);
    } catch (e) {
      console.error('Erro ao carregar sprites do Player:', e);
    }
  }

  public update(ticker: PIXI.Ticker, input: InputManager, projManager: ProjectileManager, bounds: { width: number; height: number }) {
    const delta = ticker.deltaTime;
    const now = performance.now();

    // Rotação da embarcação
    if (input.isRotateLeft) this.container.rotation -= this.config.rotationSpeed * delta;
    if (input.isRotateRight) this.container.rotation += this.config.rotationSpeed * delta;

    // Propulsão à vela
    if (input.isForward) {
      this.container.x += Math.cos(this.container.rotation) * this.config.speed * delta;
      this.container.y += Math.sin(this.container.rotation) * this.config.speed * delta;
    }

    // Limites de navegação na arena
    const margin = 28;
    this.container.x = Math.max(margin, Math.min(bounds.width - margin, this.container.x));
    this.container.y = Math.max(margin, Math.min(bounds.height - margin, this.container.y));

    const shipAngle = this.container.rotation;

    // Disparo Frontal (Canhão de Proa)
    if (input.isShootFront && now - this.lastFrontShot > this.config.frontCooldown) {
      const spawnX = this.container.x + Math.cos(shipAngle) * 32;
      const spawnY = this.container.y + Math.sin(shipAngle) * 32;
      projManager.spawn(spawnX, spawnY, shipAngle, 10, 25, 0xfde047, 'player');
      this.lastFrontShot = now;
      playSound('cannon_fire_1', 0.5);
    }

    // Disparo de Bombordo (Canhões da Esquerda)
    if (input.isShootLeft && now - this.lastSideShot > this.config.sideCooldown) {
      this.shootSide(projManager, shipAngle, shipAngle - Math.PI / 2);
      this.lastSideShot = now;
      playSound('cannon_broadside', 0.5);
    }

    // Disparo de Boreste (Canhões da Direita)
    if (input.isShootRight && now - this.lastSideShot > this.config.sideCooldown) {
      this.shootSide(projManager, shipAngle, shipAngle + Math.PI / 2);
      this.lastSideShot = now;
      playSound('cannon_broadside', 0.5);
    }

    this.drawHealthBar();
  }

  private shootSide(projManager: ProjectileManager, shipAngle: number, directionAngle: number) {
    const deckOffsets = [-16, 0, 16];
    const hullSideDistance = 14;

    for (const offset of deckOffsets) {
      const spawnX = this.container.x + Math.cos(shipAngle) * offset + Math.cos(directionAngle) * hullSideDistance;
      const spawnY = this.container.y + Math.sin(shipAngle) * offset + Math.sin(directionAngle) * hullSideDistance;
      projManager.spawn(spawnX, spawnY, directionAngle, 8, 15, 0xf97316, 'player');
    }
  }

  private drawHealthBar() {
    this.healthBar.clear();
    this.healthBar.rotation = -this.container.rotation; 
    
    const percent = Math.max(0, this.health / this.maxHealth);
    const barWidth = 36;
    const barHeight = 4;
    const barY = -36;

    this.healthBar.rect(-barWidth / 2, barY, barWidth, barHeight).fill(0xef4444);
    this.healthBar.rect(-barWidth / 2, barY, barWidth * percent, barHeight).fill(0x22c55e);

    // Deterioração visual: navio pega fogo quando a vida fica crítica (<= 40%)
    if (this.fireSprite) {
      this.fireSprite.visible = this.health <= this.maxHealth * 0.4;
    }
  }

  public destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.fireSprite) {
      this.fireSprite.destroy();
    }
    this.container.destroy({ children: true });
  }
}