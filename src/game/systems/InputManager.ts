export type TouchAction =
  | 'forward'
  | 'rotateLeft'
  | 'rotateRight'
  | 'shootFront'
  | 'shootLeft'
  | 'shootRight';

export class InputManager {
  private keys: Set<string> = new Set();
  private touchActions: Set<TouchAction> = new Set();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    this.keys.add(e.key.toLowerCase());
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  // Método público para a UI de touch acionar as ações
  public setTouchAction(action: TouchAction, isActive: boolean) {
    if (isActive) {
      this.touchActions.add(action);
    } else {
      this.touchActions.delete(action);
    }
  }

  // Movimento para frente: W, Seta Cima OU Botão Touch
  public get isForward(): boolean {
    return this.keys.has('w') || this.keys.has('arrowup') || this.touchActions.has('forward');
  }

  // Rotação esquerda: A, Seta Esquerda OU Botão Touch
  public get isRotateLeft(): boolean {
    return this.keys.has('a') || this.keys.has('arrowleft') || this.touchActions.has('rotateLeft');
  }

  // Rotação direita: D, Seta Direita OU Botão Touch
  public get isRotateRight(): boolean {
    return this.keys.has('d') || this.keys.has('arrowright') || this.touchActions.has('rotateRight');
  }

  // Disparo Frontal: Espaço OU Botão Touch
  public get isShootFront(): boolean {
    return this.keys.has(' ') || this.touchActions.has('shootFront');
  }

  // Disparo Esquerdo: J, Q OU Botão Touch
  public get isShootLeft(): boolean {
    return this.keys.has('j') || this.keys.has('q') || this.touchActions.has('shootLeft');
  }

  // Disparo Direito: K, E OU Botão Touch
  public get isShootRight(): boolean {
    return this.keys.has('k') || this.keys.has('e') || this.touchActions.has('shootRight');
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.keys.clear();
    this.touchActions.clear();
  }
}