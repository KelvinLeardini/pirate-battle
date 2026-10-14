import * as PIXI from 'pixi.js';
import { playSound } from '../../utils/audio';

interface ActiveExplosion {
  sprite: PIXI.Sprite;
  currentFrame: number;
  elapsedTime: number;
  frameDuration: number;
}

export class EffectManager {
  public container: PIXI.Container;
  private explosionTextures: PIXI.Texture[] = [];
  private activeExplosions: ActiveExplosion[] = [];

  constructor() {
    this.container = new PIXI.Container();
  }

  public async init(): Promise<void> {
    const [exp1, exp2, exp3] = await Promise.all([
      PIXI.Assets.load<PIXI.Texture>('/assets/images/retina/effects/explosion_1.png'),
      PIXI.Assets.load<PIXI.Texture>('/assets/images/retina/effects/explosion_2.png'),
      PIXI.Assets.load<PIXI.Texture>('/assets/images/retina/effects/explosion_3.png'),
    ]);
    this.explosionTextures = [exp1, exp2, exp3];
  }

  // Spawna uma explosão animada na posição (x, y)
  public spawnExplosion(x: number, y: number, scale: number = 0.8): void {
    if (this.explosionTextures.length === 0) return;

    const sprite = new PIXI.Sprite(this.explosionTextures[0]);
    sprite.anchor.set(0.5, 0.5);
    sprite.x = x;
    sprite.y = y;
    sprite.scale.set(scale);

    this.container.addChild(sprite);

    this.activeExplosions.push({
      sprite,
      currentFrame: 0,
      elapsedTime: 0,
      frameDuration: 80, // 80ms por frame (duração total: 240ms)
    });

    // Toca som de explosão de navio
    const soundName = Math.random() > 0.5 ? 'ship_explosion_1' : 'ship_explosion_2';
    playSound(soundName, 0.6);
  }

  public update(deltaMS: number): void {
    for (let i = this.activeExplosions.length - 1; i >= 0; i--) {
      const exp = this.activeExplosions[i];
      exp.elapsedTime += deltaMS;

      if (exp.elapsedTime >= exp.frameDuration) {
        exp.elapsedTime = 0;
        exp.currentFrame++;

        if (exp.currentFrame < this.explosionTextures.length) {
          exp.sprite.texture = this.explosionTextures[exp.currentFrame];
        } else {
          // Fim da animação: remove o sprite do container e da lista
          this.container.removeChild(exp.sprite);
          exp.sprite.destroy();
          this.activeExplosions.splice(i, 1);
        }
      }
    }
  }

  public destroy(): void {
    for (const exp of this.activeExplosions) {
      exp.sprite.destroy();
    }
    this.activeExplosions = [];
    this.container.destroy({ children: true });
  }
}