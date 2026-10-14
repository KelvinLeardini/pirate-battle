import * as PIXI from 'pixi.js';
import { Projectile } from '../entities/Projectile';

export class ProjectileManager {
  public container: PIXI.Container;
  public projectiles: Projectile[] = [];

  constructor() {
    this.container = new PIXI.Container();
  }

  public spawn(x: number, y: number, rotation: number, speed: number, damage: number, color: number = 0xffff00, owner: 'player' | 'enemy' = 'player') {
    const proj = new Projectile(x, y, rotation, speed, damage, color, owner);
    this.projectiles.push(proj);
    this.container.addChild(proj.container);
  }

  public update(ticker: PIXI.Ticker, bounds: { width: number; height: number }) {
    const delta = ticker.deltaTime;
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(delta, bounds);

      if (proj.isDead) {
        proj.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  public destroy() {
    this.projectiles.forEach(p => p.destroy());
    this.projectiles = [];
    this.container.destroy({ children: true });
  }
}