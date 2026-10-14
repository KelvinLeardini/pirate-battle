import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getActiveScenario,
  setActiveScenario,
  resetNetworkStorage,
  type NetworkScenario,
} from '../../mocks/handlers';

export const NetworkSimulator: React.FC = () => {
  const [scenario, setScenario] = useState<NetworkScenario>(getActiveScenario());
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleScenarioChange = (newScenario: NetworkScenario) => {
    setScenario(newScenario);
    setActiveScenario(newScenario);
    // Invalida o cache para testar a resposta do novo cenário imediatamente
    queryClient.invalidateQueries();
  };

  const handleReset = () => {
    resetNetworkStorage();
    setScenario('success');
    queryClient.invalidateQueries();
  };

  return (
    <div className="fixed bottom-3 left-4 z-50 select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded-lg border border-slate-700/80 text-[11px] font-mono shadow-md backdrop-blur-xs transition cursor-pointer"
        >
          <span>🌐 MSW:</span>
          <span className="font-bold text-amber-400 capitalize">{scenario}</span>
        </button>
      ) : (
        <div className="absolute bottom-8 left-0 bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs font-sans text-slate-200 min-w-56">
          <div className="flex justify-between items-center mb-2.5 border-b border-slate-800 pb-1.5">
            <span className="font-bold tracking-wider text-amber-400 text-[11px] uppercase font-mono">
              Network Simulator
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white px-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            {[
              { id: 'success', label: '🟢 Success (Normal)' },
              { id: 'slow', label: '🟡 Slow Network (2s)' },
              { id: 'error_500', label: '🔴 Server Error (HTTP 500)' },
              { id: 'timeout', label: '⏱️ Network Timeout' },
              { id: 'empty', label: '📭 Empty Lists' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScenarioChange(item.id as NetworkScenario)}
                className={`text-left px-2 py-1 rounded text-[11px] transition cursor-pointer ${
                  scenario === item.id
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="w-full text-center py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 text-red-200 text-[10px] font-bold rounded uppercase tracking-wider transition cursor-pointer"
          >
            Reset Fixtures & State
          </button>
        </div>
      )}
    </div>
  );
};