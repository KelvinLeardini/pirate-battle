import React from 'react';

interface MenuPanelProps {
  children: React.ReactNode;
  className?: string;
  size?: 'normal' | 'wide';
}

export const MenuPanel: React.FC<MenuPanelProps> = ({ children, className = '', size = 'normal' }) => {
  return (
    <div
      style={{
        borderStyle: 'solid',
        borderWidth: '24px',
        borderImageSource: "url('/assets/images/retina/ui/menu/panel_menu.png')",
        borderImageSlice: '110 110 110 110 fill',
        borderImageRepeat: 'stretch',
      }}
      className={`relative drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] flex flex-col items-center select-none ${
        size === 'wide' ? 'w-full max-w-4xl p-6 md:p-8' : 'w-full max-w-md p-6'
      } ${className}`}
    >
      {children}
    </div>
  );
};

