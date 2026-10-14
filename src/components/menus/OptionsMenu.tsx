import React from 'react';
import { MenuPanel } from '../ui/MenuPanel';
import { GameButton } from '../ui/GameButton';
import { RoundButton } from '../ui/RoundButton';

interface OptionsMenuProps {
  sessionTime: number;
  spawnTime: number; // em segundos
  onSessionTimeChange: (newTime: number) => void;
  onSpawnTimeChange: (newSpawn: number) => void;
  onBack: () => void;
  backLabel?: string;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  sessionTime,
  spawnTime,
  onSessionTimeChange,
  onSpawnTimeChange,
  onBack,
  backLabel = 'Main Menu',
}) => {
  // Ajustes de tempo de sessão (mínimo 30s, máximo 300s, passos de 30s)
  // 🟢 Como deve ficar:
  const handleDecSession = () => {
    onSessionTimeChange(Math.max(60, sessionTime - 30));
  };
  const handleIncSession = () => {
    onSessionTimeChange(Math.min(180, sessionTime + 30));
  };

  // Ajustes de spawn de inimigos (mínimo 1s, máximo 5s, passos de 1s)
  const handleDecSpawn = () => {
    onSpawnTimeChange(Math.max(1, spawnTime - 1));
  };
  const handleIncSpawn = () => {
    onSpawnTimeChange(Math.min(5, spawnTime + 1));
  };

  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <MenuPanel size="normal" className="py-8 px-6">
        <h2 className="text-3xl font-black text-[#fef08a] tracking-wider uppercase mb-8 drop-shadow-md">
          Options
        </h2>

        {/* Configuração: Tempo de Sessão */}
        <div className="flex flex-col items-center mb-6 w-full">
          <p className="text-xs font-bold text-slate-300 tracking-wider mb-2">
            Game session time
          </p>
          <div className="flex items-center gap-4">
            <RoundButton
              iconSrc="/assets/images/retina/ui/controls/icon_minus.png"
              iconAlt="Diminuir tempo"
              onClick={handleDecSession}
              disabled={sessionTime <= 60}
            />
            <span className="text-2xl font-black text-amber-300 w-24 text-center font-mono drop-shadow">
              {sessionTime} s
            </span>
            <RoundButton
              iconSrc="/assets/images/retina/ui/controls/icon_plus.png"
              iconAlt="Aumentar tempo"
              onClick={handleIncSession}
              disabled={sessionTime >= 180}
            />
          </div>
        </div>

        {/* Configuração: Intervalo de Spawn de Inimigos */}
        <div className="flex flex-col items-center mb-10 w-full">
          <p className="text-xs font-bold text-slate-300 tracking-wider mb-2">
            Enemy spawn time
          </p>
          <div className="flex items-center gap-4">
            <RoundButton
              iconSrc="/assets/images/retina/ui/controls/icon_minus.png"
              iconAlt="Diminuir spawn"
              onClick={handleDecSpawn}
              disabled={spawnTime <= 1}
            />
            <span className="text-2xl font-black text-amber-300 w-24 text-center font-mono drop-shadow">
              {spawnTime} s
            </span>
            <RoundButton
              iconSrc="/assets/images/retina/ui/controls/icon_plus.png"
              iconAlt="Aumentar spawn"
              onClick={handleIncSpawn}
              disabled={spawnTime >= 5}
            />
          </div>
        </div>

        {/* Botão de Retorno */}
        <GameButton variant="primary" size="lg" onClick={onBack}>
          {backLabel}
        </GameButton>
      </MenuPanel>
    </div>
  );
};

