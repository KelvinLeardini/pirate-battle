import React, { useState } from 'react';
import { MenuPanel } from '../ui/MenuPanel';
import { GameButton } from '../ui/GameButton';

interface GameOverModalProps {
  score: number;
  reason: 'TIME UP' | 'DEFEATED';
  durationSeconds: number;
  onSaveScore: (playerName: string) => void;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  isSaving: boolean;
  hasSaved: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  reason,
  durationSeconds,
  onSaveScore,
  onPlayAgain,
  onMainMenu,
  isSaving,
  hasSaved,
  isError,
}) => {
  const [name, setName] = useState('Captain Jack');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveScore(name.trim());
  };

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.floor(durationSeconds % 60);
  const durationStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
      <MenuPanel size="normal" className="py-7 px-6">
        <h2
          className={`text-4xl font-black tracking-wider uppercase mb-1 drop-shadow-lg ${
            reason === 'TIME UP' ? 'text-amber-400' : 'text-red-500'
          }`}
        >
          {reason === 'TIME UP' ? 'Battle Finished!' : 'Ship Sunk!'}
        </h2>

        <p className="text-xs text-slate-300 font-medium mb-4">
          Duration: {durationStr} · Result: {reason}
        </p>

        {/* Placar */}
        <div className="bg-[#121f2d]/80 border border-slate-700/60 rounded-xl px-6 py-3 text-center mb-5 w-full">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Final Score
          </p>
          <p className="text-4xl font-black text-amber-300 font-mono drop-shadow">
            {score} <span className="text-sm font-sans text-amber-200/80">pts</span>
          </p>
        </div>

        {/* Registro no Ranking com tratamento de Erro/Offline */}
        {!hasSaved ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 mb-6">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Enter Captain Name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={15}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 bg-[#0f1722] border border-slate-600 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-amber-950 font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                {isSaving ? 'Saving...' : isError ? 'Retry' : 'Save'}
              </button>
            </div>
            {isError && (
              <p className="text-[10px] text-red-400 font-bold mt-1">
                ⚠️ Network error. Score was saved offline and can be retried!
              </p>
            )}
          </form>
        ) : (
          <div className="mb-6 py-2 px-4 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
            Score recorded in Captain's Log!
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-col gap-3 w-full items-center">
          <GameButton variant="primary" size="lg" onClick={onPlayAgain}>
            Play Again
          </GameButton>
          <GameButton variant="secondary" size="md" onClick={onMainMenu} className="w-56 h-12">
            Main Menu
          </GameButton>
        </div>
      </MenuPanel>
    </div>
  );
};

