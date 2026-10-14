import * as PIXI from 'pixi.js';

export class Island {
  public container: PIXI.Container;
  private graphics: PIXI.Graphics;
  public radius: number = 80; // Tamanho da ilha

  constructor(x: number, y: number) {
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;

    // Desenha a ilha (círculo verde musgo)
    this.graphics = new PIXI.Graphics();
    this.graphics.circle(0, 0, this.radius);
    this.graphics.fill(0x22c55e); // Verde
    this.graphics.stroke({ width: 4, color: 0x166534 }); // Borda verde escura
    
    this.container.addChild(this.graphics);
  }
}