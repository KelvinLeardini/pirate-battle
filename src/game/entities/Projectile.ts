import * as PIXI from 'pixi.js';

export class Projectile {
  public container: PIXI.Container;
  private graphics: PIXI.Graphics;
  public damage: number;
  public speed: number;
  public isDead: boolean = false;
  public owner: 'player' | 'enemy';

  // O padrão do owner é 'player' para não precisarmos alterar o código do Navio
  constructor(x: number, y: number, rotation: number, speed: number, damage: number, color: number, owner: 'player' | 'enemy' = 'player') {
    this.speed = speed;
    this.damage = damage;
    this.owner = owner;
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    this.container.rotation = rotation;

    this.graphics = new PIXI.Graphics();
    this.graphics.circle(0, 0, 4);
    this.graphics.fill(color);
    this.container.addChild(this.graphics);
  }

  public update(delta: number, bounds: { width: number; height: number }) {
    this.container.x += Math.cos(this.container.rotation) * this.speed * delta;
    this.container.y += Math.sin(this.container.rotation) * this.speed * delta;

    if (
      this.container.x < 0 || this.container.x > bounds.width ||
      this.container.y < 0 || this.container.y > bounds.height
    ) {
      this.isDead = true;
    }
  }

  public destroy() {
    this.container.destroy({ children: true });
  }
}