import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { GameEngine } from '../game/engine/GameEngine';
import { MainMenu } from './menus/MainMenu';
import { OptionsMenu } from './menus/OptionsMenu';
import { PauseMenu } from './menus/PauseMenu';
import { CaptainsLogModal } from './menus/CaptainsLogModal';
import { GameOverModal } from './menus/GameOverModal';
import { RoundButton } from './ui/RoundButton';
import { playSound } from '../utils/audio';
import { TouchControls } from './ui/TouchControls';
import { NetworkSimulator } from './ui/NetworkSimulator';

type ActiveMenu = 'MAIN_MENU' | 'PLAYING' | 'PAUSED' | 'OPTIONS' | 'CAPTAINS_LOG' | 'GAME_OVER';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const queryClient = useQueryClient();

  // Estados de Interface e Menus
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('MAIN_MENU');
  const [optionsReturnMenu, setOptionsReturnMenu] = useState<'MAIN_MENU' | 'PAUSED'>('MAIN_MENU');
  const [logInitialTab, setLogInitialTab] = useState<'RANKING' | 'HISTORY'>('RANKING');

  // Configurações do Jogo (Iniciando com os valores exatos dos mockups: 120s e 3s)
  // 🟢 Como deve ficar:
  const [sessionTime, setSessionTime] = useState<number>(() => {
  const saved = localStorage.getItem('pirate_session_time');
  const val = saved ? Number(saved) : 120;
  // Valida os limites para evitar valores corrompidos
  return Math.min(180, Math.max(60, isNaN(val) ? 120 : val));
});

const [spawnTime, setSpawnTime] = useState<number>(() => {
  const saved = localStorage.getItem('pirate_spawn_time');
  const val = saved ? Number(saved) : 3;
  return Math.min(5, Math.max(1, isNaN(val) ? 3 : val));
});

  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  // Detecta se é celular/tablet em orientação vertical (portrait)
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Persistência local das opções conforme exigência do edital
  useEffect(() => {
    localStorage.setItem('pirate_session_time', sessionTime.toString());
    localStorage.setItem('pirate_spawn_time', spawnTime.toString());
  }, [sessionTime, spawnTime]);

  // Estados do HUD
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(120);

  // Estados de Fim de Jogo
  const [gameOverReason, setGameOverReason] = useState<'TIME UP' | 'DEFEATED'>('TIME UP');
  const [gameOverDuration, setGameOverDuration] = useState(0);
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [currentMatchId, setCurrentMatchId] = useState<string>('');

  // Mutação para salvar Recorde
  const submitScore = useMutation({
    mutationFn: async (newScore: { matchId: string; player: string; score: number }) => {
      await axios.post('/api/scores', newScore);
    },
    onSuccess: () => {
      setHasSavedScore(true);
      localStorage.removeItem('pirate_pending_score'); // Limpa da fila se teve sucesso
      queryClient.invalidateQueries({ queryKey: ['scores'] });
    },
    onError: (_err, variables) => {
      // Falhou? Salva na fila pendente para não perder o recorde!
      localStorage.setItem('pirate_pending_score', JSON.stringify(variables));
    },
  });

  // Mutação para registrar no Histórico de Batalhas
  const submitHistory = useMutation({
    mutationFn: async (match: { matchId: string; points: number; duration: string; result: 'TIME UP' | 'DEFEATED' }) => {
      await axios.post('/api/history', match);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  // Reenvio automático de recordes pendentes quando a rede voltar ou ao abrir o jogo
  useEffect(() => {
    const retryPending = () => {
      const pending = localStorage.getItem('pirate_pending_score');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          submitScore.mutate(parsed);
        } catch {
          localStorage.removeItem('pirate_pending_score');
        }
      }
    };

    retryPending();
    window.addEventListener('online', retryPending);
    return () => window.removeEventListener('online', retryPending);
  }, []);

  // Handlers de Fluxo do Jogo
  const handlePlay = () => {
    const newId = crypto.randomUUID(); // Identificador único da partida
    setCurrentMatchId(newId);

    playSound('game_start', 0.5);
    setActiveMenu('PLAYING');
    engineRef.current?.startGame({
      sessionTime,
      spawnInterval: spawnTime * 1000,
    });
  };

  const handlePause = () => {
    playSound('game_pause', 0.4);
    engineRef.current?.pause();
    setActiveMenu('PAUSED');
  };

  const handleResume = () => {
    playSound('game_resume', 0.4);
    engineRef.current?.resume();
    setActiveMenu('PLAYING');
  };

  // Inicialização do Motor Gráfico PixiJS
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const engine = new GameEngine();
    engineRef.current = engine;
    let isCancelled = false;

    // Conecta atualização do HUD
    engine.onHUDUpdate = (newScore, newHealth, newMaxHealth, newTimeLeft) => {
      if (isCancelled) return;
      setScore(newScore);
      setHealth(newHealth);
      setMaxHealth(newMaxHealth);
      setTimeLeft(Math.ceil(newTimeLeft));
    };

    // Conecta evento de Game Over
    engine.onGameOver = (finalScore, reason, durationSec) => {
      if (isCancelled) return;
      setGameOverReason(reason);
      setGameOverDuration(durationSec);
      setActiveMenu('GAME_OVER');
      setHasSavedScore(false);

      playSound(reason === 'TIME UP' ? 'game_complete' : 'game_over', 0.5);

      // Registra automaticamente a batalha no histórico
      const m = Math.floor(durationSec / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      submitHistory.mutate({ matchId: currentMatchId, points: finalScore, duration: durationStr, result: reason });
    };

    engine.init(containerRef.current).then(() => {
      if (isCancelled) {
        engine.destroy();
      }
    });

    // Tecla de atalho para Pausa (ESC ou P)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        const cur = engineRef.current;
        if (!cur) return;
        if (cur.gameState === 'PLAYING') {
          handlePause();
        } else if (cur.gameState === 'PAUSED') {
          handleResume();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Pausa automática ao perder o foco da janela (Alt+Tab, clique fora)
    const handleBlur = () => {
      if (engineRef.current?.gameState === 'PLAYING') {
        handlePause();
      }
    };

    // Pausa automática ao ocultar a aba do navegador
    const handleVisibilityChange = () => {
      if (document.hidden && engineRef.current?.gameState === 'PLAYING') {
        handlePause();
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      engine.destroy();
      if (engineRef.current === engine) {
        engineRef.current = null;
      }
    };
  }, []);

  const handleOpenOptions = (from: 'MAIN_MENU' | 'PAUSED') => {
    setOptionsReturnMenu(from);
    setActiveMenu('OPTIONS');
  };

  const handleCloseOptions = () => {
    setActiveMenu(optionsReturnMenu);
  };

  const handleOpenCaptainsLog = (tab: 'RANKING' | 'HISTORY') => {
    setLogInitialTab(tab);
    setActiveMenu('CAPTAINS_LOG');
  };

  const handleBackToMainMenu = () => {
    engineRef.current?.stopGame();
    setActiveMenu('MAIN_MENU');
  };

  const handleSaveGameOverScore = (captainName: string) => {
    submitScore.mutate({ matchId: currentMatchId, player: captainName, score });
  };

  return (
    <div className="relative w-full h-screen h-dvh max-h-dvh overflow-hidden bg-slate-950 font-sans flex items-center justify-center select-none">
      {/* Simulador de Cenários de Rede MSW (oculto durante a partida para não obstruir controles de toque no mobile) */}
      {activeMenu !== 'PLAYING' && <NetworkSimulator />}

      {/* 🟢 MOLDURA DA ARENA (1280x720 proporção 16:9 que se ajusta à altura e largura disponíveis) */}
      <div className="relative aspect-[16/9] w-full max-w-[177.78dvh] max-h-dvh max-h-full flex items-center justify-center shadow-2xl border border-slate-900 overflow-hidden m-auto">
        {/* Canvas PixiJS 100% centralizado */}
        <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden" />

        {/* HUD da Partida (Compacto e responsivo para telas pequenas) */}
        {(activeMenu === 'PLAYING' || activeMenu === 'PAUSED') && (
          <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex justify-between items-start text-white pointer-events-none z-20">
            {/* Barra de Vida do Jogador */}
            <div className="bg-slate-900/80 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-slate-700/80 shadow-lg min-w-40 sm:min-w-56">
              <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs font-black tracking-wider text-amber-200 uppercase">HP Navio</span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300">
                  {Math.max(0, health)} / {maxHealth}
                </span>
              </div>
              <div className="w-full h-2.5 sm:h-3.5 bg-red-950/80 rounded-full overflow-hidden p-0.5 border border-red-900">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }}
                />
              </div>
            </div>

            {/* Tempo, Pontos e Botão de Pausa */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl border border-slate-700/80 text-center min-w-16 sm:min-w-24 shadow-lg">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempo</p>
                <p
                  className={`text-lg sm:text-2xl font-black font-mono ${
                    timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                  }`}
                >
                  {timeLeft}s
                </p>
              </div>

              <div className="bg-slate-900/80 backdrop-blur-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl border border-slate-700/80 text-center min-w-16 sm:min-w-24 shadow-lg">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                <p className="text-lg sm:text-2xl font-black font-mono text-amber-400">{score}</p>
              </div>

              <RoundButton
                iconSrc="/assets/images/retina/ui/controls/icon_pause.png"
                iconAlt="Pausar jogo"
                size={40}
                className="w-10 h-10 sm:w-12 sm:h-12"
                onClick={handlePause}
              />
            </div>
          </div>
        )}

        {/* Controles Virtuais de Toque (Mobile/Tablet) */}
        {activeMenu === 'PLAYING' && (
          <TouchControls
            onAction={(action, active) => {
              engineRef.current?.inputManager.setTouchAction(action, active);
            }}
          />
        )}
      </div>

      {/* Marca d'água discreta no canto inferior direito */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 opacity-60 pointer-events-none select-none z-30">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PIRATE BATTLE</span>
      </div>

      

      {/* Menus e Telas Sobrepostas */}
      {activeMenu === 'MAIN_MENU' && (
        <MainMenu
          onPlay={handlePlay}
          onOptions={() => handleOpenOptions('MAIN_MENU')}
          onRanking={() => handleOpenCaptainsLog('RANKING')}
          onHistory={() => handleOpenCaptainsLog('HISTORY')}
        />
      )}

      {activeMenu === 'OPTIONS' && (
        <OptionsMenu
          sessionTime={sessionTime}
          spawnTime={spawnTime}
          onSessionTimeChange={setSessionTime}
          onSpawnTimeChange={setSpawnTime}
          onBack={handleCloseOptions}
          backLabel={optionsReturnMenu === 'PAUSED' ? 'Back' : 'Main Menu'}
        />
      )}

      {activeMenu === 'PAUSED' && (
        <PauseMenu
          onResume={handleResume}
          onOptions={() => handleOpenOptions('PAUSED')}
          onMainMenu={handleBackToMainMenu}
        />
      )}

      {activeMenu === 'CAPTAINS_LOG' && (
        <CaptainsLogModal
          initialTab={logInitialTab}
          sessionTime={sessionTime}
          spawnTime={spawnTime}
          onClose={() => setActiveMenu('MAIN_MENU')}
        />
      )}

      {activeMenu === 'GAME_OVER' && (
        <GameOverModal
          score={score}
          reason={gameOverReason}
          durationSeconds={gameOverDuration}
          onSaveScore={handleSaveGameOverScore}
          onPlayAgain={handlePlay}
          onMainMenu={handleBackToMainMenu}
          isSaving={submitScore.isPending}
          hasSaved={hasSavedScore}
          isError={submitScore.isError}
          onRetry={() => handleSaveGameOverScore('Captain Jack')}
        />
      )}

      {/* Aviso de Orientação para Celular em Pé (Portrait) - Só monta no DOM quando for mobile vertical */}
      {isPortraitMobile && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 mb-4 text-4xl flex items-center justify-center bg-amber-500/10 rounded-full border border-amber-500/30 animate-pulse text-amber-300">
            🔄
          </div>
          <h3 className="text-xl font-black text-amber-300 uppercase tracking-widest mb-2 font-mono drop-shadow">
            Rotate Your Device
          </h3>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-sans">
            Pirate Battle requires <strong className="text-amber-200">Landscape mode</strong> for full visibility of the naval arena and touch controls.
          </p>
        </div>
      )}
    </div>
    
  );
};