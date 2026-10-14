// 📚 Por que não usar PIXI.Container?
// Antes usávamos PIXI.Container como tipo aqui, mas agora alguns objetos
// de colisão são plain data objects {x, y, radius} sem nenhum sprite.
// Definir um tipo estrutural mínimo é a abordagem TypeScript idiomática —
// qualquer objeto com .x e .y satisfaz essa interface automaticamente.
interface HasPosition { x: number; y: number; }

export class Collision {
  // Retorna true se a distância entre os centros for menor que a soma dos raios
  public static checkCircle(obj1: HasPosition, obj2: HasPosition, radius1: number, radius2: number): boolean {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const totalR = radius1 + radius2;
    // Broadphase rápida
    if (Math.abs(dx) > totalR || Math.abs(dy) > totalR) return false;
    return (dx * dx + dy * dy) < (totalR * totalR);
  }
}