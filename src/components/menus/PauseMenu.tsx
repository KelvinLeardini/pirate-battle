import React from 'react';
import { MenuPanel } from '../ui/MenuPanel';
import { GameButton } from '../ui/GameButton';

interface PauseMenuProps {
  onResume: () => void;
  onOptions: () => void;
  onMainMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onOptions,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <MenuPanel size="normal" className="py-8 px-6">
        <h2 className="text-3xl font-black text-[#fef08a] tracking-wider uppercase mb-1 drop-shadow-md">
          Paused
        </h2>

        <p className="text-xs text-slate-300 font-medium mb-3">
          Ready when you are.
        </p>

        {/* Lembrete de Controles ao Pausar */}
        <div className="mb-5 px-3 py-2 bg-slate-900/85 rounded-xl border border-slate-700/80 w-full max-w-xs text-center shadow-inner">
          <p className="text-[10px] font-black tracking-widest text-amber-300 uppercase mb-1 font-mono">
            Controls Reminder
          </p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 justify-center">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[9px] font-mono font-bold text-amber-200">W</kbd>
              <span>Sail Ahead</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[9px] font-mono font-bold text-amber-200">A / D</kbd>
              <span>Turn Rudder</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[9px] font-mono font-bold text-amber-200">Space</kbd>
              <span>Front Cannon</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[9px] font-mono font-bold text-amber-200">Q / E</kbd>
              <span>Broadsides</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full items-center">
          <GameButton variant="primary" size="lg" onClick={onResume}>
            Resume
          </GameButton>
          <GameButton variant="primary" size="lg" onClick={onOptions}>
            Options
          </GameButton>
          <GameButton variant="primary" size="lg" onClick={onMainMenu}>
            Main Menu
          </GameButton>
        </div>
      </MenuPanel>
    </div>
  );
};

