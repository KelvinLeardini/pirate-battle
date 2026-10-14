import React from 'react';
import { MenuPanel } from '../ui/MenuPanel';
import { GameButton } from '../ui/GameButton';

interface MainMenuProps {
  onPlay: () => void;
  onOptions: () => void;
  onRanking: () => void;
  onHistory: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onOptions,
  onRanking,
  onHistory,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center z-40 p-4">
      <MenuPanel size="normal" className="gap-2">
        {/* Banner do Título */}
        <img
          src="/assets/images/retina/ui/menu/title_pirate_battle.png"
          alt="Pirate Battle"
          className="w-80 max-w-full drop-shadow-lg mb-1"
        />

        {/* Subtítulo Estilizado */}
        <p className="text-[11px] font-bold text-amber-200/90 tracking-[0.25em] uppercase mb-4 drop-shadow">
          Set Sail. Take Command.
        </p>

        {/* Botões Principais de Ação */}
        <div className="flex flex-col gap-3 w-full items-center">
          <GameButton variant="primary" size="lg" onClick={onPlay}>
            Play
          </GameButton>
          <GameButton variant="primary" size="lg" onClick={onOptions}>
            Options
          </GameButton>
        </div>

        {/* Ícone Central do Navio Pirata e Instruções de Controle */}
        <div className="my-1.5 flex flex-col items-center w-full">
          <img
            src="/assets/images/retina/ships/ship_2.png"
            alt="Pirate Flagship"
            className="w-6 h-10 object-contain drop-shadow-md transform rotate-180 mb-2"
          />

          {/* Card Temático de Controles (Exigência do Edital - Seções 2 e 3) */}
          <div className="px-3.5 py-2 bg-slate-900/85 rounded-xl border border-slate-700/80 w-full max-w-xs flex flex-col items-center shadow-inner">
            <p className="text-[10px] font-black tracking-widest text-amber-300 uppercase mb-1.5 font-mono">
              Ship Controls
            </p>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[11px] text-slate-300 w-full">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-amber-200 shadow-xs">W</kbd>
                <span className="text-[10px] font-medium text-slate-300">Sail Ahead</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-amber-200 shadow-xs">A / D</kbd>
                <span className="text-[10px] font-medium text-slate-300">Turn Rudder</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-amber-200 shadow-xs">Space</kbd>
                <span className="text-[10px] font-medium text-slate-300">Front Cannon</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[10px] font-mono font-bold text-amber-200 shadow-xs">Q / E</kbd>
                <span className="text-[10px] font-medium text-slate-300">Broadsides</span>
              </div>
            </div>
            <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <kbd className="px-1 py-0.2 bg-slate-800/90 border border-slate-700 rounded text-[9px] font-mono text-amber-200/90">Esc</kbd>
              <span>/</span>
              <kbd className="px-1 py-0.2 bg-slate-800/90 border border-slate-700 rounded text-[9px] font-mono text-amber-200/90">P</kbd>
              <span className="text-[9px]">Pause Game</span>
            </div>
          </div>
        </div>

        {/* Botões Secundários: Ranking e Histórico */}
        <div className="flex gap-4 mt-2">
          <GameButton variant="secondary" size="sm" onClick={onRanking}>
            Ranking
          </GameButton>
          <GameButton variant="secondary" size="sm" onClick={onHistory}>
            Match History
          </GameButton>
        </div>
      </MenuPanel>
    </div>
  );
};

