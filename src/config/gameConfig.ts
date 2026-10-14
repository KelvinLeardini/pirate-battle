export interface GameConfig {
  sessionTime: number;
  spawnInterval: number;
  arena: { width: number; height: number };
  player: {
    speed: number;
    rotationSpeed: number;
    maxHealth: number;
    frontCooldown: number;
    sideCooldown: number;
  };
  enemies: {
    chaser: { speed: number; health: number; damage: number };
    shooter: { speed: number; health: number; attackRange: number; cooldown: number };
  };
}

export const defaultConfig: GameConfig = {
  sessionTime: 60,
  spawnInterval: 2000,
  arena: {width: 1280, height: 720},
  player: {
    speed: 4,
    rotationSpeed: 0.05,
    maxHealth: 100,
    frontCooldown: 300,
    sideCooldown: 800,
  },
  enemies: {
    chaser: { speed: 2.0, health: 30, damage: 25 },
    shooter: { speed: 0.75, health: 20, attackRange: 250, cooldown: 1200 },
  },
};