import * as PIXI from 'pixi.js';

export class Background {
  public container: PIXI.Container;
  private tilingSprite?: PIXI.TilingSprite;

  constructor() {
    this.container = new PIXI.Container();
  }

  public async init(width: number, height: number): Promise<void> {
    try {
      // 1. Carrega a textura de água dos tiles Kenney
      const texture = await PIXI.Assets.load('/assets/images/retina/tiles/tile_73.png');

      // 2. Cria o TilingSprite cobrindo toda a arena
      this.tilingSprite = new PIXI.TilingSprite({
        texture: texture,
        width: width,
        height: height,
      });

      this.container.addChild(this.tilingSprite);
    } catch (e) {
      console.error("Erro fatal ao carregar o fundo de água:", e);
    }
  }

  // Animação sutil de correnteza marítima
  public update(delta: number) {
    if (this.tilingSprite) {
      this.tilingSprite.tilePosition.x -= 0.3 * delta;
      this.tilingSprite.tilePosition.y -= 0.15 * delta;
    }
  }

  public destroy() {
    // Atenção: NÃO passamos { texture: true } para preservar o cache do PIXI.Assets
    if (this.tilingSprite) {
      this.tilingSprite.destroy();
    }
    this.container.destroy({ children: true });
  }
}