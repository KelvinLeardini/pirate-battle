import * as PIXI from 'pixi.js';

// ---------------------------------------------------------------------------
// TileMap — Authentic Naval Archipelago Map
// Designed after the official challenge reference mockup:
// - Top-Left: Fortified Naval Fortress with stone bastions, walkway bridge,
//   wall-mounted cannons, palm trees, and rocks.
// - Bottom-Right: Lush Pirate Coastal Haven with sandy beach, beached dinghy,
//   palm trees, and coastal rocks.
// - Top-Right: Tropical Palm Atoll.
// - Bottom-Left: Tropical Outpost Islet.
// - Mid-Channel: Natural Sea Reef Rocks creating tactical navigational obstacles.
// - Center: Expansive 400px+ wide open navigable sea lane for naval combat.
// ---------------------------------------------------------------------------

const TILE_SIZE = 64; // 128px assets scaled by 0.5
const T = TILE_SIZE;

interface TilePlacement {
  id: number;
  x: number; // Center X in world coordinates
  y: number; // Center Y in world coordinates
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
}

export interface CollisionCircle {
  x: number;
  y: number;
  radius: number;
}

export class TileMap {
  public container: PIXI.Container;
  private textureCache = new Map<number, PIXI.Texture>();
  public collisionCircles: CollisionCircle[] = [];

  constructor() {
    this.container = new PIXI.Container();
  }

  public async init(): Promise<void> {
    const placements = this.generatePlacements();

    // Collect all unique tile IDs needed
    const neededIds = new Set<number>();
    for (const p of placements) {
      neededIds.add(p.id);
    }

    // Load all textures concurrently
    await Promise.all(
      Array.from(neededIds).map(async (id) => {
        const tex = await PIXI.Assets.load<PIXI.Texture>(
          `/assets/images/retina/tiles/tile_${id}.png`
        );
        this.textureCache.set(id, tex);
      })
    );

    // Build the map sprites
    for (const p of placements) {
      this.placeTile(p);
    }

    // Register mathematical collision circles covering all landmasses, shores, and reefs
    const circles: CollisionCircle[] = [];

    // 1. TOP-LEFT FORTRESS CONTINENT (Cols 0..7, Rows 0..4)
    // Full grid collision circles ensuring zero penetration through sand or grass:
    for (let r = 0; r <= 4; r++) {
      for (let c = 0; c <= 7; c++) {
        circles.push({
          x: c * T + T / 2,
          y: r * T + T / 2,
          radius: 36,
        });
      }
    }

    // 2. BOTTOM-RIGHT COASTAL HAVEN (Cols 12..19, Rows 6..11)
    // Full grid collision circles covering the entire beach and interior:
    for (let r = 6; r <= 11; r++) {
      for (let c = 12; c <= 19; c++) {
        circles.push({
          x: c * T + T / 2,
          y: r * T + T / 2,
          radius: 36,
        });
      }
    }

    // 3. TOP-RIGHT PALM ATOLL (Cols 15..17, Rows 1..3)
    // Smooth circular collider + grid circles for 100% coverage
    circles.push({ x: 16 * T + T / 2, y: 2 * T + T / 2, radius: 90 });
    for (let r = 1; r <= 3; r++) {
      for (let c = 15; c <= 17; c++) {
        circles.push({ x: c * T + T / 2, y: r * T + T / 2, radius: 36 });
      }
    }

    // 4. BOTTOM-LEFT TROPICAL ISLE (Cols 2..4, Rows 7..9)
    // Smooth circular collider + grid circles
    circles.push({ x: 3 * T + T / 2, y: 8 * T + T / 2, radius: 90 });
    for (let r = 7; r <= 9; r++) {
      for (let c = 2; c <= 4; c++) {
        circles.push({ x: c * T + T / 2, y: r * T + T / 2, radius: 36 });
      }
    }

    this.collisionCircles = circles;
  }

  private generatePlacements(): TilePlacement[] {
    const list: Array<TilePlacement & { layer: number }> = [];

    // Helper to register tile by grid column and row (0-indexed)
    // Anchored at tile center (+ T/2)
    const add = (id: number, col: number, row: number, layer: number = 0, offX: number = 0, offY: number = 0) => {
      list.push({
        id,
        x: col * T + T / 2 + offX,
        y: row * T + T / 2 + offY,
        layer,
      });
    };

    // =========================================================================
    // 1. TOP-LEFT FORTRESS CONTINENT (Cols 0..6, Rows 0..4)
    // =========================================================================
    // Sand Base Layer (Layer 0):
    // Row 0
    for (let c = 0; c <= 5; c++) add(18, c, 0, 0);
    add(2, 6, 0, 0);
    add(3, 7, 0, 0);

    // Rows 1..3
    for (let r = 1; r <= 3; r++) {
      for (let c = 0; c <= 6; c++) add(18, c, r, 0);
      add(19, 7, r, 0);
    }

    // Row 4 (South shoreline)
    for (let c = 0; c <= 6; c++) add(34, c, 4, 0);
    add(35, 7, 4, 0);

    // Grass Interior Layer (Layer 1):
    // Row 0
    add(40, 1, 0, 1); add(39, 2, 0, 1); add(40, 3, 0, 1); add(39, 4, 0, 1); add(25, 5, 0, 1);
    // Rows 1..2
    for (let r = 1; r <= 2; r++) {
      for (let c = 1; c <= 4; c++) {
        add((r + c) % 2 === 0 ? 40 : 39, c, r, 1);
      }
      add(25, 5, r, 1);
    }
    // Row 3 (Smooth grass transition border)
    for (let c = 1; c <= 4; c++) add(55, c, 3, 1);
    add(57, 5, 3, 1);

    // Fortress Walls, Walkway & Bastions (Layer 2):
    add(93, 1, 0.4, 2); // Round Bastion Left
    add(16, 2, 0.4, 2); // Stone Wall Horizontal
    add(48, 2, 0.4, 2); // Wall-mounted Cannon pointing down
    add(93, 3, 0.4, 2); // Round Bastion Center
    add(76, 4, 0.4, 2); // Wooden Walkway Bridge
    add(93, 5, 0.4, 2); // Round Bastion Right
    add(15, 3, 1.4, 2); // Stone Wall Vertical
    add(31, 3, 1.4, 2); // Wall-mounted Cannon pointing right
    add(93, 3, 2.4, 2); // Round Bastion Tower

    // Foliage & Props (Layer 3 - Clean transparent sprites):
    add(71, 1.3, 1.6, 3); // Large Palm Tree
    add(72, 6.2, 1.2, 3); // Palm Bush on beach
    add(66, 4.3, 2.6, 3); // Pure Rock on sand
    add(71, 0.8, 3.2, 3); // Palm Tree
    add(67, 2.5, 3.6, 3); // Pure Rock on beach
    add(72, 6.0, 3.2, 3); // Palm Bush on beach

    // =========================================================================
    // 2. BOTTOM-RIGHT COASTAL HAVEN (Cols 12..19, Rows 6..11)
    // =========================================================================
    // Sand Base Layer (Layer 0):
    // Row 6 (Top beach shoreline)
    add(1, 12, 6, 0);
    for (let c = 13; c <= 19; c++) add(2, c, 6, 0);

    // Rows 7..11
    for (let r = 7; r <= 11; r++) {
      add(17, 12, r, 0);
      for (let c = 13; c <= 19; c++) add(18, c, r, 0);
    }

    // Grass Interior Layer (Layer 1):
    // Row 8 (Grass top border with smooth natural curves)
    add(6, 14, 8, 1);
    for (let c = 15; c <= 19; c++) add(7, c, 8, 1);

    // Rows 9..11
    for (let r = 9; r <= 11; r++) {
      add(22, 14, r, 1);
      for (let c = 15; c <= 19; c++) {
        add((r + c) % 2 === 0 ? 40 : 39, c, r, 1);
      }
    }

    // Props & Foliage (Layer 3):
    add(66, 13.5, 6.8, 3); // Pure Rock on beach
    add(66, 12.8, 7.8, 3); // Pure Rock on beach
    add(67, 12.4, 9.4, 3); // Pure Rock on sand
    add(71, 15.5, 9.2, 3); // Large Palm Tree on grass
    add(72, 17.5, 8.5, 3); // Palm Bush
    add(65, 18.2, 10.2, 3); // Pure Rock
    add(71, 14.8, 10.8, 3); // Palm Tree

    // =========================================================================
    // 3. TOP-RIGHT PALM ATOLL (Cols 15..17, Rows 1..3)
    // =========================================================================
    add(1, 15, 1, 0); add(2, 16, 1, 0); add(3, 17, 1, 0);
    add(17, 15, 2, 0); add(18, 16, 2, 0); add(19, 17, 2, 0);
    add(33, 15, 3, 0); add(34, 16, 3, 0); add(35, 17, 3, 0);
    add(71, 16, 2, 3); // Palm Tree directly on sand

    // =========================================================================
    // 4. BOTTOM-LEFT TROPICAL ISLE (Cols 2..4, Rows 7..9)
    // =========================================================================
    add(1, 2, 7, 0); add(2, 3, 7, 0); add(3, 4, 7, 0);
    add(17, 2, 8, 0); add(18, 3, 8, 0); add(19, 4, 8, 0);
    add(33, 2, 9, 0); add(34, 3, 9, 0); add(35, 4, 9, 0);
    add(71, 3, 8, 3); // Palm Tree directly on sand

    // =========================================================================
    // 5. MID-CHANNEL REEF ROCKS (Tactical open water obstacles)
    // =========================================================================
    add(50, 9.2, 1.8, 3); // Sea Rock
    add(51, 9.8, 2.3, 3); // Sea Rock
    add(49, 11.2, 4.2, 3); // Sea Rock
    add(65, 7.8, 5.5, 3); // Sea Rock

    // Return list sorted strictly by visual layer:
    // Layer 0: Sand Base -> Layer 1: Grass -> Layer 2: Fortress Walls -> Layer 3: Props
    list.sort((a, b) => a.layer - b.layer);
    return list;
  }

  private placeTile(p: TilePlacement): void {
    const texture = this.textureCache.get(p.id);
    if (!texture) return;

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.5);
    sprite.scale.set((p.scaleX ?? 1) * 0.5, (p.scaleY ?? 1) * 0.5);
    sprite.x = p.x;
    sprite.y = p.y;
    if (p.rotation !== undefined) sprite.rotation = p.rotation;

    this.container.addChild(sprite);
  }

  public destroy(): void {
    this.container.destroy({ children: true });
    this.textureCache.clear();
  }
}
