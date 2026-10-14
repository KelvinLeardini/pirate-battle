import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MenuPanel } from '../ui/MenuPanel';
import { GameButton } from '../ui/GameButton';
import { RoundButton } from '../ui/RoundButton';
import type { ScoreEntry, MatchHistoryEntry } from '../../mocks/handlers';

interface CaptainsLogModalProps {
  initialTab?: 'RANKING' | 'HISTORY';
  sessionTime: number;
  spawnTime: number;
  onClose: () => void;
}

export const CaptainsLogModal: React.FC<CaptainsLogModalProps> = ({
  initialTab = 'RANKING',
  sessionTime,
  spawnTime,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'RANKING' | 'HISTORY'>(initialTab);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const {
    data: scores = [],
    isLoading: isLoadingScores,
    isError: isErrorScores,
    refetch: refetchScores,
  } = useQuery<ScoreEntry[]>({
    queryKey: ['scores'],
    queryFn: async () => {
      const res = await axios.get<ScoreEntry[]>('/api/scores');
      return res.data;
    },
    retry: 1,
  });

  const {
    data: history = [],
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    refetch: refetchHistory,
  } = useQuery<MatchHistoryEntry[]>({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await axios.get<MatchHistoryEntry[]>('/api/history');
      return res.data;
    },
    retry: 1,
  });

  const currentList = activeTab === 'RANKING' ? scores : history;
  const totalPages = Math.max(1, Math.ceil(currentList.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedItems = currentList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTabChange = (tab: 'RANKING' | 'HISTORY') => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <MenuPanel size="wide" className="py-3 sm:py-7 px-3 sm:px-8 max-w-3xl">
        {/* Título Principal */}
        <h2 className="text-3xl font-black text-[#fef08a] tracking-wider uppercase mb-3 drop-shadow-md">
          Captain's Log
        </h2>

        {/* Barra de Abas (Tabs) */}
        <div className="flex gap-3 mb-2">
          <GameButton
            variant={activeTab === 'RANKING' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleTabChange('RANKING')}
            className="w-36 h-10 text-xs"
          >
            Ranking
          </GameButton>
          <GameButton
            variant={activeTab === 'HISTORY' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleTabChange('HISTORY')}
            className="w-40 h-10 text-xs"
          >
            Match History
          </GameButton>
        </div>

        {/* Subtítulo Dinâmico */}
        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">
          {activeTab === 'RANKING'
            ? `${sessionTime} Second Battles · ${spawnTime} Second Spawn Interval`
            : 'Your Recent Battles'}
        </p>

        {/* Tabela de Dados */}
        <div className="w-full flex flex-col gap-1.5 min-h-68">
          {activeTab === 'RANKING' ? (
            <>
              {/* Cabeçalho da Tabela de Ranking */}
              <div className="flex justify-between text-[11px] font-black text-slate-400 tracking-wider px-4 py-1 uppercase">
                <span className="w-12">Rank</span>
                <span className="flex-1">Captain</span>
                <span className="w-20 text-center">Points</span>
                <span className="w-32 text-right">Played</span>
              </div>

              {isLoadingScores ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-mono">Loading ranking from logbook...</p>
                </div>
              ) : isErrorScores ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <p className="text-red-400 font-bold text-sm mb-1">Failed to load ranking</p>
                  <p className="text-xs text-slate-400 mb-3">Network error or server unavailable.</p>
                  <button
                    type="button"
                    onClick={() => refetchScores()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : pagedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <p className="text-3xl mb-2">🏴‍☠️</p>
                  <p className="text-amber-200 font-bold text-sm mb-1">No Captains on the Board</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Complete your first battle and save your captain's name to claim the top spot!
                  </p>
                </div>
              ) : (
                pagedItems.map((entry, idx) => {
                  const globalRank = startIndex + idx + 1;
                  const isTop1 = globalRank === 1;
                  const isUser = (entry as ScoreEntry).isCurrentUser;

                  return (
                    <div
                      key={(entry as ScoreEntry).id}
                      className={`flex items-center px-4 py-2.5 rounded-lg border transition-all ${
                        isUser
                          ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-[#152332]/70 border-slate-700/50'
                      }`}
                    >
                      <span className="w-12 font-mono font-bold text-slate-300 text-sm">
                        {String(globalRank).padStart(2, '0')}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        {isTop1 && <span className="text-amber-400 text-sm">⭐</span>}
                        <span
                          className={`font-bold text-sm ${
                            isUser ? 'text-amber-200' : 'text-slate-100'
                          }`}
                        >
                          {(entry as ScoreEntry).player}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-600/50 text-amber-300 border border-amber-400/30">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="w-20 text-center font-black text-amber-300 text-base font-mono">
                        {(entry as ScoreEntry).score}
                      </span>
                      <span className="w-32 text-right font-mono text-xs text-slate-400">
                        {(entry as ScoreEntry).date}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <>
              {/* Cabeçalho da Tabela de Match History */}
              <div className="flex justify-between text-[11px] font-black text-slate-400 tracking-wider px-4 py-1 uppercase">
                <span className="w-36">Date</span>
                <span className="w-20 text-center">Points</span>
                <span className="w-24 text-center">Duration</span>
                <span className="w-28 text-right">Result</span>
              </div>

              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-mono">Loading battle records...</p>
                </div>
              ) : isErrorHistory ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <p className="text-red-400 font-bold text-sm mb-1">Failed to load match history</p>
                  <p className="text-xs text-slate-400 mb-3">Network connection interrupted.</p>
                  <button
                    type="button"
                    onClick={() => refetchHistory()}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              ) : pagedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <p className="text-3xl mb-2">📜</p>
                  <p className="text-amber-200 font-bold text-sm mb-1">No Battle History Recorded</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Play your first match to record scores, battle duration and combat results.
                  </p>
                </div>
              ) : (
                pagedItems.map((entry) => {
                  const match = entry as MatchHistoryEntry;
                  const isTimeUp = match.result === 'TIME UP';

                  return (
                    <div
                      key={match.id}
                      className="flex items-center px-4 py-2.5 rounded-lg border bg-[#152332]/70 border-slate-700/50"
                    >
                      <span className="w-36 font-mono text-xs text-slate-300">
                        {match.date}
                      </span>
                      <span className="w-20 text-center font-black text-amber-300 text-base font-mono">
                        {match.points}
                      </span>
                      <span className="w-24 text-center font-mono text-xs text-slate-300">
                        {match.duration}
                      </span>
                      <span
                        className={`w-28 text-right font-bold text-xs tracking-wider ${
                          isTimeUp ? 'text-amber-300' : 'text-red-400'
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Barra de Paginação */}
        <div className="flex items-center gap-3 my-4">
          <RoundButton
            iconSrc="/assets/images/retina/ui/controls/icon_turn_left.png"
            iconAlt="Página anterior"
            size={36}
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
          <span className="text-xs font-bold text-slate-300 tracking-widest font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <RoundButton
            iconSrc="/assets/images/retina/ui/controls/icon_turn_right.png"
            iconAlt="Próxima página"
            size={36}
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>

        {/* Botão de Retorno */}
        <GameButton variant="primary" size="md" onClick={onClose} className="w-52 h-13">
          Main Menu
        </GameButton>
      </MenuPanel>
    </div>
  );
};