import React, { useState } from 'react';
import { playSound } from '../../utils/audio';

interface RoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc: string;
  iconAlt?: string;
  size?: number; // em pixels, padrão 44px
}

export const RoundButton: React.FC<RoundButtonProps> = ({
  iconSrc,
  iconAlt = 'button icon',
  size = 44,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundImage = () => {
    if (isPressed) return '/assets/images/retina/ui/controls/button_round_pressed.png';
    if (isHovered) return '/assets/images/retina/ui/controls/button_round_hover.png';
    return '/assets/images/retina/ui/controls/button_round_normal.png';
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
      playSound('ui_hover', 0.2);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    playSound('ui_click', 0.4);
    onClick?.(e);
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
      className={`relative inline-flex items-center justify-center p-0 transition-transform duration-75 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
        isPressed ? 'scale-90' : isHovered ? 'scale-105' : 'scale-100'
      } ${className}`}
    >
      <img
        src={iconSrc}
        alt={iconAlt}
        style={{ width: `${size * 0.6}px`, height: `${size * 0.6}px` }}
        className="pointer-events-none drop-shadow"
      />
    </button>
  );
};

