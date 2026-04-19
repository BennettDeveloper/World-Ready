const USERS_KEY = 'wr_users';
const SESSION_KEY = 'wr_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function register({ username, password, name, email }) {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already taken.' };
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered.' };
  }
  const user = {
    id: Date.now().toString(),
    username,
    password,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const session = { userId: user.id, username: user.username, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

export function login({ username, password }) {
  const users = getUsers();
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return { success: false, error: 'Invalid username or password.' };
  const session = { userId: user.id, username: user.username, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getSession();
}

const DEMO_USER = {
  id: 'demo-001',
  username: 'demo',
  password: 'demo',
  name: 'Demo User',
  email: 'demo@worldready.app',
  createdAt: '2026-04-01T00:00:00.000Z',
};

const DEMO_HISTORY = [
  { id: 'd1', region: 'tokyo',   role: 'Software Engineer',   company: 'Tanaka Innovations', difficulty: 'hard',   overall: 91, scores: [88,90,94,91,91], date: '2026-04-15T09:00:00Z', messages: [], answers: [] },
  { id: 'd2', region: 'london',  role: 'Product Manager',     company: '',                   difficulty: 'medium', overall: 84, scores: [82,86,85,84,84], date: '2026-04-12T14:00:00Z', messages: [], answers: [] },
  { id: 'd3', region: 'newyork', role: 'Software Engineer',   company: 'Rivera Group',       difficulty: 'hard',   overall: 78, scores: [75,80,79,78,78], date: '2026-04-10T11:00:00Z', messages: [], answers: [] },
  { id: 'd4', region: 'paris',   role: 'UX Designer',         company: '',                   difficulty: 'medium', overall: 87, scores: [89,85,88,87,87], date: '2026-04-08T16:00:00Z', messages: [], answers: [] },
  { id: 'd5', region: 'dubai',   role: 'Business Analyst',    company: 'Emirates Capital',   difficulty: 'medium', overall: 82, scores: [80,83,84,82,82], date: '2026-04-05T10:00:00Z', messages: [], answers: [] },
];

export function loginDemo() {
  const users = getUsers();
  if (!users.find(u => u.id === DEMO_USER.id)) {
    users.push(DEMO_USER);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  // Seed history if not already present
  const histKey = `wr_history_${DEMO_USER.id}`;
  if (!localStorage.getItem(histKey)) {
    localStorage.setItem(histKey, JSON.stringify(DEMO_HISTORY));
  }
  const session = { userId: DEMO_USER.id, username: DEMO_USER.username, name: DEMO_USER.name, email: DEMO_USER.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

export function resetPassword(username, email, newPassword) {
  const users = getUsers();
  const idx = users.findIndex(
    u => u.username.toLowerCase() === username.toLowerCase() &&
         u.email.toLowerCase() === email.toLowerCase()
  );
  if (idx === -1) return { success: false, error: 'No account found with that username and email.' };
  users[idx].password = newPassword;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { success: true };
}
