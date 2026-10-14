import { http, HttpResponse, delay } from 'msw';

export type NetworkScenario = 'success' | 'slow' | 'error_500' | 'timeout' | 'empty';

export interface ScoreEntry {
  id: string;
  matchId?: string; // Chave de idempotência
  player: string;
  score: number;
  date: string;
  isCurrentUser?: boolean;
}

export interface MatchHistoryEntry {
  id: string;
  matchId?: string; // Chave de idempotência
  date: string;
  points: number;
  duration: string;
  result: 'TIME UP' | 'DEFEATED';
}

export const DEFAULT_FIXTURE_SCORES: ScoreEntry[] = [
  { id: 'fix-1', player: 'Blackbeard', score: 28, date: '14 Oct · 14:20', isCurrentUser: false },
  { id: 'fix-2', player: 'Anne Bonny', score: 22, date: '14 Oct · 13:45', isCurrentUser: false },
  { id: 'fix-3', player: 'Calico Jack', score: 18, date: '14 Oct · 12:10', isCurrentUser: false },
  { id: 'fix-4', player: 'Henry Morgan', score: 14, date: '14 Oct · 11:30', isCurrentUser: false },
  { id: 'fix-5', player: 'Bartholomew', score: 10, date: '14 Oct · 10:15', isCurrentUser: false },
  { id: 'fix-6', player: 'Mary Read', score: 8, date: '14 Oct · 09:40', isCurrentUser: false },
  { id: 'fix-7', player: 'Captain Hook', score: 5, date: '14 Oct · 08:05', isCurrentUser: false },
];

// Gerenciamento do Cenário de Rede Ativo
export const getActiveScenario = (): NetworkScenario => {
  return (localStorage.getItem('pirate_network_scenario') as NetworkScenario) || 'success';
};

export const setActiveScenario = (scenario: NetworkScenario) => {
  localStorage.setItem('pirate_network_scenario', scenario);
};

export const resetNetworkStorage = () => {
  localStorage.setItem('pirate_battle_scores', JSON.stringify(DEFAULT_FIXTURE_SCORES));
  localStorage.setItem('pirate_battle_history', JSON.stringify([]));
  setActiveScenario('success');
};

const getScores = (): ScoreEntry[] => {
  const data = localStorage.getItem('pirate_battle_scores');
  if (!data) {
    localStorage.setItem('pirate_battle_scores', JSON.stringify(DEFAULT_FIXTURE_SCORES));
    return [...DEFAULT_FIXTURE_SCORES];
  }
  return JSON.parse(data);
};

const saveScore = (score: ScoreEntry) => {
  const scores = getScores();
  scores.push(score);
  localStorage.setItem('pirate_battle_scores', JSON.stringify(scores));
};

const getHistory = (): MatchHistoryEntry[] => {
  const data = localStorage.getItem('pirate_battle_history');
  if (!data) {
    localStorage.setItem('pirate_battle_history', JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
};

const saveHistory = (match: MatchHistoryEntry) => {
  const history = getHistory();
  history.unshift(match);
  localStorage.setItem('pirate_battle_history', JSON.stringify(history));
};

// Helper para aplicar o comportamento do cenário de rede configurado
async function applyScenarioBehavior() {
  const scenario = getActiveScenario();

  if (scenario === 'slow') {
    await delay(2000); // Simula 2s de lentidão
  } else if (scenario === 'timeout') {
    await delay(5000); // Simula timeout de 5s
    throw new Error('Connection timeout');
  } else if (scenario === 'error_500') {
    await delay(300);
    throw new HttpResponse(JSON.stringify({ message: 'Internal Server Error (Simulated)' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const handlers = [
  // 1. GET /api/scores (Ranking com suporte a vazio, lentidão e erro)
  http.get('/api/scores', async () => {
    await applyScenarioBehavior();

    if (getActiveScenario() === 'empty') {
      return HttpResponse.json([]);
    }

    const scores = getScores();
    scores.sort((a, b) => b.score - a.score || a.player.localeCompare(b.player));
    return HttpResponse.json(scores);
  }),

  // 2. POST /api/scores (Salvar recorde com IDEMPOTÊNCIA)
  http.post('/api/scores', async ({ request }) => {
    await applyScenarioBehavior();

    const body = (await request.json()) as Omit<ScoreEntry, 'id'>;
    const scores = getScores();

    // IDEMPOTÊNCIA: Se já existir um registro com esse matchId, recupera sem duplicar
    if (body.matchId) {
      const existing = scores.find((s) => s.matchId === body.matchId);
      if (existing) {
        return HttpResponse.json(existing, { status: 200 });
      }
    }

    const newScore: ScoreEntry = {
      id: crypto.randomUUID(),
      matchId: body.matchId,
      player: body.player || 'Captain Jack',
      score: body.score,
      date: body.date || new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' ·'),
      isCurrentUser: true,
    };

    saveScore(newScore);
    return HttpResponse.json(newScore, { status: 201 });
  }),

  // 3. GET /api/history (Histórico com suporte a cenários)
  http.get('/api/history', async () => {
    await applyScenarioBehavior();

    if (getActiveScenario() === 'empty') {
      return HttpResponse.json([]);
    }

    const history = getHistory();
    return HttpResponse.json(history);
  }),

  // 4. POST /api/history (Registrar partida com IDEMPOTÊNCIA)
  http.post('/api/history', async ({ request }) => {
    await applyScenarioBehavior();

    const body = (await request.json()) as Omit<MatchHistoryEntry, 'id'>;
    const history = getHistory();

    // IDEMPOTÊNCIA: Evita duplicar se já foi registrado
    if (body.matchId) {
      const existing = history.find((h) => h.matchId === body.matchId);
      if (existing) {
        return HttpResponse.json(existing, { status: 200 });
      }
    }

    const newEntry: MatchHistoryEntry = {
      id: crypto.randomUUID(),
      matchId: body.matchId,
      date: body.date || new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' ·'),
      points: body.points,
      duration: body.duration,
      result: body.result,
    };

    saveHistory(newEntry);
    return HttpResponse.json(newEntry, { status: 201 });
  }),
];

import axios from 'axios';

// Resiliência de Camada Dupla: Fallback instantâneo caso o Service Worker demore a registrar no primeiro acesso
export const setupAxiosFallback = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const url = error.config?.url;
      const method = error.config?.method?.toLowerCase();

      if (url && (url.includes('/api/scores') || url.includes('/api/history'))) {
        if (error.response?.status === 404 || !error.response) {
          const scenario = getActiveScenario();
          if (scenario === 'error_500') {
            return Promise.reject(error);
          }
          if (scenario === 'timeout') {
            await delay(5000);
            return Promise.reject(new Error('Connection timeout'));
          }
          if (scenario === 'slow') {
            await delay(2000);
          }

          // GET /api/scores
          if (url.includes('/api/scores') && method === 'get') {
            if (scenario === 'empty') return { data: [], status: 200, statusText: 'OK', headers: {}, config: error.config };
            const scores = getScores();
            scores.sort((a, b) => b.score - a.score || a.player.localeCompare(b.player));
            return { data: scores, status: 200, statusText: 'OK', headers: {}, config: error.config };
          }

          // POST /api/scores
          if (url.includes('/api/scores') && method === 'post') {
            const body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : error.config?.data;
            const scores = getScores();
            if (body?.matchId) {
              const existing = scores.find((s) => s.matchId === body.matchId);
              if (existing) return { data: existing, status: 200, statusText: 'OK', headers: {}, config: error.config };
            }
            const newScore: ScoreEntry = {
              id: crypto.randomUUID(),
              matchId: body?.matchId,
              player: body?.player || 'Captain Jack',
              score: body?.score ?? 0,
              date: body?.date || new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' ·'),
              isCurrentUser: true,
            };
            saveScore(newScore);
            return { data: newScore, status: 201, statusText: 'Created', headers: {}, config: error.config };
          }

          // GET /api/history
          if (url.includes('/api/history') && method === 'get') {
            if (scenario === 'empty') return { data: [], status: 200, statusText: 'OK', headers: {}, config: error.config };
            const history = getHistory();
            return { data: history, status: 200, statusText: 'OK', headers: {}, config: error.config };
          }

          // POST /api/history
          if (url.includes('/api/history') && method === 'post') {
            const body = typeof error.config?.data === 'string' ? JSON.parse(error.config.data) : error.config?.data;
            const history = getHistory();
            if (body?.matchId) {
              const existing = history.find((h) => h.matchId === body.matchId);
              if (existing) return { data: existing, status: 200, statusText: 'OK', headers: {}, config: error.config };
            }
            const newEntry: MatchHistoryEntry = {
              id: crypto.randomUUID(),
              matchId: body?.matchId,
              date: body?.date || new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', ' ·'),
              points: body?.points ?? 0,
              duration: body?.duration || '00:00',
              result: body?.result || 'TIME UP',
            };
            saveHistory(newEntry);
            return { data: newEntry, status: 201, statusText: 'Created', headers: {}, config: error.config };
          }
        }
      }

      return Promise.reject(error);
    }
  );
};