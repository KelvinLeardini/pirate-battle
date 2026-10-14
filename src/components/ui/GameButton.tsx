import React, { useState } from 'react';
import { playSound } from '../../utils/audio';

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const GameButton: React.FC<GameButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundImage = () => {
    if (variant === 'primary') {
      if (disabled) return '/assets/images/retina/ui/menu/button_primary_disabled.png';
      if (isPressed) return '/assets/images/retina/ui/menu/button_primary_pressed.png';
      if (isHovered) return '/assets/images/retina/ui/menu/button_primary_hover.png';
      return '/assets/images/retina/ui/menu/button_primary_normal.png';
    } else {
      if (isPressed) return '/assets/images/retina/ui/menu/button_secondary_pressed.png';
      return '/assets/images/retina/ui/menu/button_secondary_normal.png';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-40 h-11 text-xs md:text-sm';
      case 'lg':
        return 'w-64 h-16 text-xl';
      case 'md':
      default:
        return 'w-56 h-14 text-base md:text-lg';
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') {
      return disabled
        ? 'text-amber-900/40'
        : 'text-[#3c1f06] font-black drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]';
    }
    return 'text-[#fef08a] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]';
  };

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsHovered(true);
      playSound('ui_hover', 0.25);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    if (!disabled) setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    playSound('ui_click', 0.45);
    onClick?.(e);
  };

  return (
    <button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      }}
      className={`relative inline-flex items-center justify-center uppercase tracking-wider transition-transform duration-75 select-none cursor-pointer disabled:cursor-not-allowed ${
        isPressed ? 'scale-95' : isHovered ? 'scale-[1.02]' : 'scale-100'
      } ${getSizeClasses()} ${getTextColor()} ${className}`}
    >
      <span className="relative -top-0.5 pointer-events-none">{children}</span>
    </button>
  );
};

