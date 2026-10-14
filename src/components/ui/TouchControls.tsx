import React, { useState, useEffect } from 'react';
import type { TouchAction } from '../../game/systems/InputManager';

interface TouchControlsProps {
  onAction: (action: TouchAction, active: boolean) => void;
}

interface TouchButtonProps {
  action: TouchAction;
  iconSrc: string;
  label: string;
  onAction: (action: TouchAction, active: boolean) => void;
  size?: number;
}

const TouchButton: React.FC<TouchButtonProps> = ({ action, iconSrc, label, onAction, size = 60 }) => {
  const [pressed, setPressed] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setPressed(true);
    onAction(action, true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setPressed(false);
    onAction(action, false);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative flex items-center justify-center select-none touch-none transition-transform active:scale-95 ${
        pressed ? 'brightness-90 scale-95' : 'brightness-100'
      }`}
      style={{ width: size, height: size }}
    >
      <img
        src={
          pressed
            ? '/assets/images/retina/ui/controls/button_round_pressed.png'
            : '/assets/images/retina/ui/controls/button_round_normal.png'
        }
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-md"
      />
      <img
        src={iconSrc}
        alt={label}
        className="relative z-10 w-7 h-7 object-contain pointer-events-none drop-shadow"
      />
    </button>
  );
};

export const TouchControls: React.FC<TouchControlsProps> = ({ onAction }) => {
  const [isTouch, setIsTouch] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Detecta se é celular, tablet ou emulador mobile do navegador e se a altura é compacta
  useEffect(() => {
    const updateLayout = () => {
      const hasTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouch(hasTouch);
      setIsCompact(window.innerHeight < 500);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Se estiver em PC com mouse/teclado, não renderiza absolutamente nada!
  if (!isTouch) return null;

  const mainSize = isCompact ? 48 : 62;
  const subSize = isCompact ? 40 : 54;

  return (
    <div className="absolute inset-x-0 bottom-1 sm:bottom-3 px-2 sm:px-6 flex justify-between items-end pointer-events-none z-30 select-none">
      {/* Controles de Navegação (Mão Esquerda) */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 pointer-events-auto bg-slate-950/40 p-1 sm:p-2 rounded-2xl backdrop-blur-xs border border-white/10">
        <TouchButton
          action="forward"
          iconSrc="/assets/images/retina/ui/controls/icon_forward.png"
          label="Avançar"
          onAction={onAction}
          size={mainSize}
        />
        <div className="flex gap-2 sm:gap-3">
          <TouchButton
            action="rotateLeft"
            iconSrc="/assets/images/retina/ui/controls/icon_turn_left.png"
            label="Girar Esquerda"
            onAction={onAction}
            size={subSize}
          />
          <TouchButton
            action="rotateRight"
            iconSrc="/assets/images/retina/ui/controls/icon_turn_right.png"
            label="Girar Direita"
            onAction={onAction}
            size={subSize}
          />
        </div>
      </div>

      {/* Controles de Disparo (Mão Direita) */}
      <div className="flex flex-col items-center gap-1 sm:gap-2 pointer-events-auto bg-slate-950/40 p-1 sm:p-2 rounded-2xl backdrop-blur-xs border border-white/10">
        <TouchButton
          action="shootFront"
          iconSrc="/assets/images/retina/ui/controls/icon_fire_front.png"
          label="Canhão Frontal"
          onAction={onAction}
          size={mainSize}
        />
        <div className="flex gap-2 sm:gap-3">
          <TouchButton
            action="shootLeft"
            iconSrc="/assets/images/retina/ui/controls/icon_fire_left.png"
            label="Canhões Bombordo"
            onAction={onAction}
            size={subSize}
          />
          <TouchButton
            action="shootRight"
            iconSrc="/assets/images/retina/ui/controls/icon_fire_right.png"
            label="Canhões Boreste"
            onAction={onAction}
            size={subSize}
          />
        </div>
      </div>
    </div>
  );
};