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

// Gerenciamento do Cenário de Rede Ativo
export const getActiveScenario = (): NetworkScenario => {
  return (localStorage.getItem('pirate_network_scenario') as NetworkScenario) || 'success';
};

export const setActiveScenario = (scenario: NetworkScenario) => {
  localStorage.setItem('pirate_network_scenario', scenario);
};

export const resetNetworkStorage = () => {
  localStorage.setItem('pirate_battle_scores', JSON.stringify([]));
  localStorage.setItem('pirate_battle_history', JSON.stringify([]));
  setActiveScenario('success');
};

const getScores = (): ScoreEntry[] => {
  const data = localStorage.getItem('pirate_battle_scores');
  if (!data) {
    localStorage.setItem('pirate_battle_scores', JSON.stringify([]));
    return [];
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
    scores.sort((a, b) => b.score - a.score);
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