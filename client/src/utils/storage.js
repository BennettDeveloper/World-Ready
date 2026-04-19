const historyKey = id => `wr_history_${id}`;
const LEADERBOARD_KEY = 'wr_leaderboard';
const PENDING_KEY = 'wr_pending_session';

export function saveSession(userId, sessionData) {
  const key = historyKey(userId);
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  history.unshift({ ...sessionData, id: Date.now().toString(), date: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(history.slice(0, 20)));
}

export function getHistory(userId) {
  return JSON.parse(localStorage.getItem(historyKey(userId)) || '[]');
}

export function submitToLeaderboard(entry) {
  const board = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
  board.push({ ...entry, id: Date.now().toString(), date: new Date().toISOString() });
  board.sort((a, b) => b.overall - a.overall);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 100)));
}

export function getLeaderboard() {
  return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
}

export function setPendingSession(config) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(config));
}

export function getPendingSession() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearPendingSession() {
  localStorage.removeItem(PENDING_KEY);
}
